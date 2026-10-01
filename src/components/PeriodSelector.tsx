import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import type { StatsPeriod, CustomDateRange } from '../utils/statistics';
import { DateRangeModal } from './DateRangeModal';

interface PeriodSelectorProps {
  period: StatsPeriod;
  customRange?: CustomDateRange;
  onChange: (period: StatsPeriod, range?: CustomDateRange) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  period,
  customRange,
  onChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Форматуємо підпис діапазону для кнопки
  const getCustomLabel = () => {
    if (period === 'custom' && customRange) {
      const s = customRange.startDate.slice(5).replace('-', '.');
      const e = customRange.endDate.slice(5).replace('-', '.');
      return `${s} – ${e}`;
    }
    return 'Вибір дати';
  };

  return (
    <>
      <div className="period-selector">
        <button
          type="button"
          className={`period-selector__btn ${period === '7d' ? 'period-selector__btn--active' : ''}`}
          onClick={() => onChange('7d')}
        >
          7 днів
        </button>

        <button
          type="button"
          className={`period-selector__btn ${period === '30d' ? 'period-selector__btn--active' : ''}`}
          onClick={() => onChange('30d')}
        >
          30 днів
        </button>

        <button
          type="button"
          className={`period-selector__btn ${period === 'all' ? 'period-selector__btn--active' : ''}`}
          onClick={() => onChange('all')}
        >
          Весь час
        </button>

        <button
          type="button"
          className={`period-selector__btn period-selector__btn--date ${
            period === 'custom' ? 'period-selector__btn--active' : ''
          }`}
          onClick={() => setIsModalOpen(true)}
        >
          <Calendar size={13} style={{ marginRight: '6px' }} />
          <span>{getCustomLabel()}</span>
        </button>
      </div>

      {isModalOpen && (
        <DateRangeModal
          initialRange={customRange}
          onApply={(range) => onChange('custom', range)}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default PeriodSelector;