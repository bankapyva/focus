import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/useAppContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { PeriodSelector } from '../components/PeriodSelector';
import { ActivityCalendar, type CalendarView } from '../components/ActivityCalendar';
import { AreaDistributionCard } from '../components/AreaDistributionCard';
import { StatsOverview } from '../components/StatsOverview';
import { DayEditModal } from '../components/DayEditModal';
import {
  calculateStatistics,
  type StatsPeriod,
  type CustomDateRange,
} from '../utils/statistics';
import type { Session } from '../types/Session';
import './StatisticsPage.css';

const UKRAINIAN_MONTH_NAMES = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];

// Читання збереженого стану календаря при першому рендері
function getInitialCalendarView(): CalendarView {
  try {
    const savedMode = localStorage.getItem('focustime-cal-view-mode');
    const viewMode: 'year' | 'month' = savedMode ? JSON.parse(savedMode) : 'year';

    const savedYear = localStorage.getItem('focustime-cal-selected-year');
    const selectedYear: number = savedYear ? JSON.parse(savedYear) : new Date().getFullYear();

    const savedCursor = localStorage.getItem('focustime-cal-month-cursor');
    const monthCursor: { year: number; month: number } = savedCursor
      ? JSON.parse(savedCursor)
      : { year: new Date().getFullYear(), month: new Date().getMonth() };

    return {
      viewMode,
      year: viewMode === 'year' ? selectedYear : monthCursor.year,
      month: monthCursor.month,
    };
  } catch {
    return {
      viewMode: 'year',
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
    };
  }
}

export const StatisticsPage: React.FC = () => {
  const { sessions, setSessions, areas, settings } = useAppContext();

  // Зберігаємо вибір джерела (кнопки періоду чи календар)
  const [activeSource, setActiveSource] = useLocalStorage<'periodSelector' | 'calendar'>(
    'focustime-stats-active-source',
    'periodSelector'
  );

  const [period, setPeriod] = useLocalStorage<StatsPeriod>(
    'focustime-stats-period',
    '30d'
  );

  const [customRange, setCustomRange] = useLocalStorage<CustomDateRange | undefined>(
    'focustime-stats-custom-range',
    undefined
  );

  const [calendarView, setCalendarView] = useState<CalendarView>(getInitialCalendarView);
  const [editingDateStr, setEditingDateStr] = useState<string | null>(null);

  // Клік по кнопках у верхньому PeriodSelector
  const handlePeriodChange = (p: StatsPeriod, range?: CustomDateRange) => {
    setActiveSource('periodSelector');
    setPeriod(p);
    if (range) {
      setCustomRange(range);
    }
  };

  // Перемикання або гортання календаря
  const handleCalendarViewChange = (view: CalendarView) => {
    setCalendarView(view);
    setActiveSource('calendar');
  };

  // Розрахунок діапазону для передачі у статистику
  const effectiveRange = useMemo<CustomDateRange | undefined>(() => {
    if (activeSource === 'calendar' && calendarView) {
      if (calendarView.viewMode === 'month') {
        const y = calendarView.year;
        const m = calendarView.month; // 0–11
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        const mStr = String(m + 1).padStart(2, '0');
        return {
          startDate: `${y}-${mStr}-01`,
          endDate: `${y}-${mStr}-${String(daysInMonth).padStart(2, '0')}`,
        };
      } else {
        const y = calendarView.year;
        return {
          startDate: `${y}-01-01`,
          endDate: `${y}-12-31`,
        };
      }
    }

    if (activeSource === 'periodSelector' && period === 'custom') {
      return customRange;
    }

    return undefined;
  }, [activeSource, calendarView, period, customRange]);

  const effectivePeriod = useMemo<StatsPeriod>(() => {
    if (activeSource === 'calendar') {
      return 'custom';
    }
    return period;
  }, [activeSource, period]);

  // Розрахунок статистики з урахуванням індивідуального порогу годин для вогника
  const stats = useMemo(() => {
    return calculateStatistics(
      sessions,
      areas,
      effectivePeriod,
      effectiveRange,
      settings.streakThresholdHours ?? 1
    );
  }, [sessions, areas, effectivePeriod, effectiveRange, settings.streakThresholdHours]);

  // Підпис періоду в картці розподілу за сферами
  const periodLabel = useMemo(() => {
    if (activeSource === 'calendar' && calendarView) {
      if (calendarView.viewMode === 'month') {
        return `${UKRAINIAN_MONTH_NAMES[calendarView.month]} ${calendarView.year}`;
      }
      return `${calendarView.year} рік`;
    }

    if (period === '7d') return 'За 7 днів';
    if (period === '30d') return 'За 30 днів';
    if (period === 'custom' && customRange) {
      return `${customRange.startDate.slice(5).replace('-', '.')} – ${customRange.endDate.slice(5).replace('-', '.')}`;
    }
    return 'Весь час';
  }, [activeSource, calendarView, period, customRange]);

  // Збереження зміненого часу за день із модалки
  const handleSaveDayHours = (
    dateStr: string,
    updatedSecondsByArea: Record<string, number>
  ) => {
    setSessions((prev: Session[]) => {
      const filtered = prev.filter((s) => !s.startTime.startsWith(dateStr));
      const newDaySessions: Session[] = [];

      Object.entries(updatedSecondsByArea).forEach(([areaId, durationSeconds]) => {
        if (durationSeconds > 0) {
          const start = new Date(`${dateStr}T12:00:00`);
          const end = new Date(start.getTime() + durationSeconds * 1000);

          newDaySessions.push({
            id: crypto.randomUUID(),
            areaId,
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            duration: durationSeconds,
          });
        }
      });

      return [...filtered, ...newDaySessions];
    });
  };

  return (
    <div className="page stats-page">
      {/* Шапка з перемикачем періодів */}
      <header className="stats-page__header">
        <h1 className="stats-page__title">Статистика</h1>
        <PeriodSelector
          period={activeSource === 'periodSelector' ? period : ('' as StatsPeriod)}
          customRange={customRange}
          onChange={handlePeriodChange}
        />
      </header>

      {/* Календар активності */}
      <ActivityCalendar
        sessions={sessions}
        areas={areas}
        onDayClick={(dateStr) => setEditingDateStr(dateStr)}
        onViewChange={handleCalendarViewChange}
      />

      {/* Нижні блоки, синхронізовані з активним періодом */}
      <section className="stats-grid-2col">
        <AreaDistributionCard
          areaStats={stats.areaStats}
          totalSeconds={stats.totalSeconds}
          periodLabel={periodLabel}
        />

        <StatsOverview stats={stats} />
      </section>

      {/* Модальне вікно редагування */}
      {editingDateStr && (
        <DayEditModal
          dateStr={editingDateStr}
          areas={areas}
          sessions={sessions}
          onSave={handleSaveDayHours}
          onClose={() => setEditingDateStr(null)}
        />
      )}
    </div>
  );
};

export default StatisticsPage;