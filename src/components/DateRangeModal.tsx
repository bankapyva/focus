import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CustomDateRange } from '../utils/statistics';
import { useTranslation } from '../hooks/useTranslation';

interface DateRangeModalProps {
  initialRange?: CustomDateRange;
  onApply: (range: CustomDateRange) => void;
  onClose: () => void;
}

const MONTH_NAMES_UK = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
];

const MONTH_NAMES_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DateRangeModal: React.FC<DateRangeModalProps> = ({
  initialRange,
  onApply,
  onClose,
}) => {
  const { t, lang } = useTranslation();
  const MONTH_NAMES = lang === 'en' ? MONTH_NAMES_EN : MONTH_NAMES_UK;
  const WEEKDAYS = lang === 'en' ? ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] : ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

  const todayStr = new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState<string>(
    initialRange?.startDate || todayStr
  );
  const [endDate, setEndDate] = useState<string>(
    initialRange?.endDate || todayStr
  );

  const initDate = new Date(startDate || todayStr);
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDayClick = (dayStr: string) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(dayStr);
      setEndDate('');
    } else {
      if (dayStr < startDate) {
        setEndDate(startDate);
        setStartDate(dayStr);
      } else {
        setEndDate(dayStr);
      }
    }
  };

  const handleApply = () => {
    if (!startDate) return;
    const end = endDate || startDate;
    onApply({
      startDate: startDate <= end ? startDate : end,
      endDate: startDate <= end ? end : startDate,
    });
    onClose();
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7; 

  const daysCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    daysCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysCells.push(formatted);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card date-range-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-card__header">
          <h3 className="modal-card__title">{t('stats.customDate.title')}</h3>
          <button
            type="button"
            className="modal-card__close-btn"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="date-inputs-row">
          <div className="date-input-group">
            <label>{t('stats.customDate.from')}</label>
            <input
              type="date"
              className="date-text-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="date-input-group">
            <label>{t('stats.customDate.to')}</label>
            <input
              type="date"
              className="date-text-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="range-calendar">
          <div className="range-calendar__nav">
            <button type="button" onClick={handlePrevMonth} className="range-nav-btn">
              <ChevronLeft size={16} />
            </button>
            <span className="range-nav-title">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button type="button" onClick={handleNextMonth} className="range-nav-btn">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="range-calendar__weekdays">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="range-calendar__grid">
            {daysCells.map((dayStr, idx) => {
              if (!dayStr) {
                return <div key={`empty-${idx}`} className="range-day--empty" />;
              }

              const isStart = dayStr === startDate;
              const isEnd = dayStr === endDate;
              const inRange =
                startDate && endDate && dayStr > startDate && dayStr < endDate;
              const dayNum = parseInt(dayStr.split('-')[2], 10);

              let classes = 'range-day';
              if (isStart) classes += ' range-day--start';
              if (isEnd) classes += ' range-day--end';
              if (inRange) classes += ' range-day--in-range';

              return (
                <button
                  key={dayStr}
                  type="button"
                  className={classes}
                  onClick={() => handleDayClick(dayStr)}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>
        </div>

        <div className="modal-card__actions" style={{ justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="modal-btn modal-btn--secondary"
            onClick={onClose}
          >
            {t('modal.cancel')}
          </button>
          <button
            type="button"
            className="modal-btn modal-btn--primary"
            onClick={handleApply}
            disabled={!startDate}
          >
            {t('stats.customDate.apply')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateRangeModal;