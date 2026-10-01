import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { Session } from '../types/Session';
import type { Area } from '../types/Area';
import { toLocalDateString, formatDateUkrainian, formatDuration } from '../utils/time';

export interface CalendarView {
  viewMode: 'year' | 'month';
  year: number;
  month: number; // 0–11
}

interface ActivityCalendarProps {
  sessions: Session[];
  areas: Area[];
  onDayClick?: (dateStr: string) => void;
  onViewChange?: (view: CalendarView) => void;
}

interface DayData {
  date: Date;
  dateKey: string;
  dayNumber?: number;
  totalSeconds: number;
  areaBreakdown: { area: Area; seconds: number }[];
  isOutsideYear: boolean;
  isPadding?: boolean;
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

const UKRAINIAN_MONTH_NAMES = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];

const UKRAINIAN_MONTHS_SHORT = [
  'Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер',
  'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру',
];

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({
  sessions,
  areas,
  onDayClick,
  onViewChange,
}) => {
  // Збереження режиму та позицій у localStorage
  const [viewMode, setViewMode] = useLocalStorage<'year' | 'month'>(
    'focustime-cal-view-mode',
    'year'
  );

  const [selectedYear, setSelectedYear] = useLocalStorage<number>(
    'focustime-cal-selected-year',
    new Date().getFullYear()
  );

  const [monthCursor, setMonthCursor] = useLocalStorage<{
    year: number;
    month: number;
  }>('focustime-cal-month-cursor', {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });

  const [hoveredDay, setHoveredDay] = useState<{
    data: DayData;
    top: number;
    left: number;
    placeAbove: boolean;
  } | null>(null);

  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleToggleViewMode = (mode: 'year' | 'month') => {
    setViewMode(mode);
    onViewChange?.({
      viewMode: mode,
      year: mode === 'year' ? selectedYear : monthCursor.year,
      month: monthCursor.month,
    });
  };

  const handlePrevYear = () => {
    const nextY = selectedYear - 1;
    setSelectedYear(nextY);
    onViewChange?.({
      viewMode: 'year',
      year: nextY,
      month: monthCursor.month,
    });
  };

  const handleNextYear = () => {
    const nextY = selectedYear + 1;
    setSelectedYear(nextY);
    onViewChange?.({
      viewMode: 'year',
      year: nextY,
      month: monthCursor.month,
    });
  };

  const handlePrevMonth = () => {
    const next =
      monthCursor.month === 0
        ? { year: monthCursor.year - 1, month: 11 }
        : { year: monthCursor.year, month: monthCursor.month - 1 };

    setMonthCursor(next);
    onViewChange?.({
      viewMode: 'month',
      year: next.year,
      month: next.month,
    });
  };

  const handleNextMonth = () => {
    const next =
      monthCursor.month === 11
        ? { year: monthCursor.year + 1, month: 0 }
        : { year: monthCursor.year, month: monthCursor.month + 1 };

    setMonthCursor(next);
    onViewChange?.({
      viewMode: 'month',
      year: next.year,
      month: next.month,
    });
  };

  const getColorClass = (day: DayData) => {
    if (day.isOutsideYear || day.isPadding) return 'calendar-cell--empty';
    const hours = day.totalSeconds / 3600;
    if (hours === 0) return 'calendar-cell--0';
    if (hours < 2) return 'calendar-cell--under-2';
    if (hours < 4) return 'calendar-cell--2-to-4';
    if (hours < 6) return 'calendar-cell--4-to-6';
    return 'calendar-cell--over-6';
  };

  const handleMouseEnter = (day: DayData, element: HTMLElement) => {
    if (day.isOutsideYear || day.isPadding) return;

    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    const rect = element.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const placeAbove = spaceBelow < 120;

    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredDay({
        data: day,
        left: rect.left + rect.width / 2,
        top: placeAbove ? rect.top - 8 : rect.bottom + 8,
        placeAbove,
      });
    }, 40);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredDay(null);
  };

  const handleCellClick = (day: DayData) => {
    if (day.isOutsideYear || day.isPadding) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredDay(null);
    if (onDayClick) {
      onDayClick(day.dateKey);
    }
  };

  // ====================================================
  // 1. РІЧНИЙ КАЛЕНДАР (53 ТИЖНІ)
  // ====================================================
  const jan1 = new Date(selectedYear, 0, 1);
  const jan1DayOfWeek = (jan1.getDay() + 6) % 7;
  const calendarStartDate = new Date(selectedYear, 0, 1 - jan1DayOfWeek);

  const dec31 = new Date(selectedYear, 11, 31);
  const dec31DayOfWeek = (dec31.getDay() + 6) % 7;
  const calendarEndDate = new Date(selectedYear, 11, 31 + (6 - dec31DayOfWeek));

  const yearWeeks: DayData[][] = [];
  const iterDate = new Date(calendarStartDate);

  const monthStartColumns: { monthIndex: number; startCol: number; endCol: number }[] = [];
  let weekIndex = 0;
  let currentMonthIndex = -1;
  let currentMonthStartCol = 0;

  while (iterDate <= calendarEndDate) {
    const week: DayData[] = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const isOutsideYear = iterDate.getFullYear() !== selectedYear;
      const dateKey = toLocalDateString(iterDate);

      const daySessions = sessions.filter(
        (s) => toLocalDateString(new Date(s.startTime)) === dateKey
      );
      const totalSeconds = isOutsideYear
        ? 0
        : daySessions.reduce((acc, s) => acc + s.duration, 0);

      const areaBreakdown = isOutsideYear
        ? []
        : areas
            .map((area) => ({
              area,
              seconds: daySessions
                .filter((s) => s.areaId === area.id)
                .reduce((acc, s) => acc + s.duration, 0),
            }))
            .filter((item) => item.seconds > 0)
            .sort((a, b) => b.seconds - a.seconds);

      if (!isOutsideYear && iterDate.getMonth() !== currentMonthIndex) {
        if (currentMonthIndex !== -1) {
          monthStartColumns.push({
            monthIndex: currentMonthIndex,
            startCol: currentMonthStartCol,
            endCol: weekIndex,
          });
        }
        currentMonthIndex = iterDate.getMonth();
        currentMonthStartCol = weekIndex;
      }

      week.push({
        date: new Date(iterDate),
        dateKey,
        totalSeconds,
        areaBreakdown,
        isOutsideYear,
      });

      iterDate.setDate(iterDate.getDate() + 1);
    }

    yearWeeks.push(week);
    weekIndex++;
  }

  if (currentMonthIndex !== -1) {
    monthStartColumns.push({
      monthIndex: currentMonthIndex,
      startCol: currentMonthStartCol,
      endCol: weekIndex,
    });
  }

  // ====================================================
  // 2. МІСЯЧНИЙ КАЛЕНДАР (7 КОЛОНОК)
  // ====================================================
  const curYear = monthCursor.year;
  const curMonth = monthCursor.month;
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const firstMonthDay = new Date(curYear, curMonth, 1);
  const startPadding = (firstMonthDay.getDay() + 6) % 7;

  const monthCells: DayData[] = [];

  for (let p = 0; p < startPadding; p++) {
    monthCells.push({
      date: new Date(curYear, curMonth, 0),
      dateKey: `pad-start-${p}`,
      totalSeconds: 0,
      areaBreakdown: [],
      isOutsideYear: false,
      isPadding: true,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dObj = new Date(curYear, curMonth, d);
    const dateKey = toLocalDateString(dObj);

    const daySessions = sessions.filter(
      (s) => toLocalDateString(new Date(s.startTime)) === dateKey
    );
    const totalSeconds = daySessions.reduce((acc, s) => acc + s.duration, 0);

    const areaBreakdown = areas
      .map((area) => ({
        area,
        seconds: daySessions
          .filter((s) => s.areaId === area.id)
          .reduce((acc, s) => acc + s.duration, 0),
      }))
      .filter((item) => item.seconds > 0)
      .sort((a, b) => b.seconds - a.seconds);

    monthCells.push({
      date: dObj,
      dateKey,
      dayNumber: d,
      totalSeconds,
      areaBreakdown,
      isOutsideYear: false,
      isPadding: false,
    });
  }

  const endPadding = (7 - (monthCells.length % 7)) % 7;
  for (let p = 0; p < endPadding; p++) {
    monthCells.push({
      date: new Date(curYear, curMonth + 1, p + 1),
      dateKey: `pad-end-${p}`,
      totalSeconds: 0,
      areaBreakdown: [],
      isOutsideYear: false,
      isPadding: true,
    });
  }

  return (
    <div className="stats-panel calendar-card">
      <div className="calendar-card__header">
        <div className="calendar-card__title-row">
          <h2 className="stats-panel__title">Календар активності</h2>

          <div className="calendar-view-toggle">
            <button
              type="button"
              className={`calendar-view-toggle__btn ${viewMode === 'year' ? 'calendar-view-toggle__btn--active' : ''}`}
              onClick={() => handleToggleViewMode('year')}
            >
              Рік
            </button>
            <button
              type="button"
              className={`calendar-view-toggle__btn ${viewMode === 'month' ? 'calendar-view-toggle__btn--active' : ''}`}
              onClick={() => handleToggleViewMode('month')}
            >
              Місяць
            </button>
          </div>
        </div>

        <div className="calendar-card__controls">
          <div className="calendar-nav">
            {viewMode === 'year' ? (
              <>
                <button
                  type="button"
                  className="calendar-nav__btn"
                  onClick={handlePrevYear}
                  aria-label="Попередній рік"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="calendar-nav__label">{selectedYear}</span>
                <button
                  type="button"
                  className="calendar-nav__btn"
                  onClick={handleNextYear}
                  aria-label="Наступний рік"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="calendar-nav__btn"
                  onClick={handlePrevMonth}
                  aria-label="Попередній місяць"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="calendar-nav__label">
                  {UKRAINIAN_MONTH_NAMES[curMonth]} {curYear}
                </span>
                <button
                  type="button"
                  className="calendar-nav__btn"
                  onClick={handleNextMonth}
                  aria-label="Наступний місяць"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          <div className="calendar-legend">
            <div className="calendar-legend__item">
              <span className="calendar-legend__dot calendar-cell--0" />
              <span>0 год</span>
            </div>
            <div className="calendar-legend__item">
              <span className="calendar-legend__dot calendar-cell--under-2" />
              <span>&lt; 2 год</span>
            </div>
            <div className="calendar-legend__item">
              <span className="calendar-legend__dot calendar-cell--2-to-4" />
              <span>2–4 год</span>
            </div>
            <div className="calendar-legend__item">
              <span className="calendar-legend__dot calendar-cell--4-to-6" />
              <span>4–6 год</span>
            </div>
            <div className="calendar-legend__item">
              <span className="calendar-legend__dot calendar-cell--over-6" />
              <span>&gt; 6 год</span>
            </div>
            <div className="calendar-legend__item">
              <Sparkles size={11} style={{ color: '#fbbf24' }} />
              <span>8+ год</span>
            </div>
          </div>
        </div>
      </div>

      <div className="calendar-grid-wrapper">
        {viewMode === 'year' ? (
          <div key={curYear} className="year-calendar">
            <div
              className="year-calendar__months-grid"
              style={{ gridTemplateColumns: `repeat(${yearWeeks.length}, minmax(0, 1fr))` }}
            >
              {monthStartColumns.map((m) => (
                <div
                  key={m.monthIndex}
                  className="year-calendar__month-label"
                  style={{ gridColumn: `${m.startCol + 1} / span ${m.endCol - m.startCol}` }}
                >
                  {UKRAINIAN_MONTHS_SHORT[m.monthIndex]}
                </div>
              ))}
            </div>

            <div className="year-calendar__body">
              <div className="year-calendar__weekdays">
                {WEEKDAYS.map((w, idx) => (
                  <span key={idx} className="year-calendar__weekday-label">
                    {w}
                  </span>
                ))}
              </div>

              <div
                className="year-calendar__weeks"
                style={{ gridTemplateColumns: `repeat(${yearWeeks.length}, minmax(0, 1fr))` }}
              >
                {yearWeeks.map((week, wIdx) => (
                  <div key={wIdx} className="year-calendar__week-col">
                    {week.map((day) => {
                      const isSuperDay = !day.isOutsideYear && day.totalSeconds >= 28800;

                      return (
                        <div
                          key={day.dateKey}
                          className={`calendar-cell ${getColorClass(day)} ${
                            isSuperDay ? 'calendar-cell--super' : ''
                          }`}
                          style={{ cursor: !day.isOutsideYear ? 'pointer' : 'default' }}
                          onClick={() => handleCellClick(day)}
                          onMouseEnter={(e) => handleMouseEnter(day, e.currentTarget)}
                          onMouseLeave={handleMouseLeave}
                        >
                          {isSuperDay && (
                            <Sparkles size={7} className="cal-cell__super-sparkle" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="month-calendar">
            <div className="month-calendar__header">
              {WEEKDAYS.map((w) => (
                <div key={w} className="month-calendar__day-label">
                  {w}
                </div>
              ))}
            </div>

            <div key={`${curYear}-${curMonth}`} className="month-calendar__grid">
              {monthCells.map((day) => {
                if (day.isPadding) {
                  return (
                    <div
                      key={day.dateKey}
                      className="month-calendar__cell month-calendar__cell--padding"
                    />
                  );
                }

                const isSuperDay = day.totalSeconds >= 28800;

                return (
                  <div
                    key={day.dateKey}
                    className={`month-calendar__cell ${getColorClass(day)} ${
                      isSuperDay ? 'calendar-cell--super' : ''
                    }`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCellClick(day)}
                    onMouseEnter={(e) => handleMouseEnter(day, e.currentTarget)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="month-calendar__cell-top">
                      <span className="month-calendar__day-number">{day.dayNumber}</span>
                      {isSuperDay && (
                        <span className="super-day-badge" title="Рекордний день: 8+ годин фокусу!">
                          <Sparkles size={13} className="super-day-badge__icon" />
                        </span>
                      )}
                    </div>

                    {day.totalSeconds > 0 && (
                      <span className="month-calendar__day-hours">
                        {formatDuration(day.totalSeconds)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {hoveredDay && (
        <div
          className={`calendar-tooltip ${hoveredDay.placeAbove ? 'calendar-tooltip--above' : 'calendar-tooltip--below'}`}
          style={{
            left: `${hoveredDay.left}px`,
            top: `${hoveredDay.top}px`,
          }}
        >
          <div className="calendar-tooltip__title">
            <div className="calendar-tooltip__title-row">
              <span>
                {formatDateUkrainian(hoveredDay.data.date)} —{' '}
                <strong>{formatDuration(hoveredDay.data.totalSeconds)}</strong>
              </span>
              {hoveredDay.data.totalSeconds >= 28800 && (
                <span className="calendar-tooltip__super-badge">
                  <Sparkles size={11} /> 8+ год
                </span>
              )}
            </div>
          </div>

          {hoveredDay.data.areaBreakdown.length > 0 ? (
            <div className="calendar-tooltip__list">
              {hoveredDay.data.areaBreakdown.map(({ area, seconds }) => (
                <div key={area.id} className="calendar-tooltip__item">
                  <span
                    className="calendar-tooltip__dot"
                    style={{ backgroundColor: area.color }}
                  />
                  <span>{area.name}</span>
                  <span className="calendar-tooltip__hours">
                    {formatDuration(seconds)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="calendar-tooltip__empty">Сесій не було</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityCalendar;