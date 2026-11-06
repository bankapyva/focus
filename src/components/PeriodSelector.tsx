import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import type { StatsPeriod, CustomDateRange } from '../utils/statistics';
import { DateRangeModal } from './DateRangeModal';
import { useTranslation } from '../hooks/useTranslation';

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
  const { t } = useTranslation();

  const getCustomLabel = () => {
    if (period === 'custom' && customRange) {
      const s = customRange.startDate.slice(5).replace('-', '.');
      const e = customRange.endDate.slice(5).replace('-', '.');
      return `${s} – ${e}`;
    }
    return t('stats.period.custom');
  };

  return (
    <>
      <div className="period-selector">
        <button
          type="button"
          className={`period-selector__btn ${period === '7d' ? 'period-selector__btn--active' : ''}`}
          onClick={() => onChange('7d')}
        >
          {t('stats.period.7d')}
        </button>

        <button
          type="button"
          className={`period-selector__btn ${period === '30d' ? 'period-selector__btn--active' : ''}`}
          onClick={() => onChange('30d')}
        >
          {t('stats.period.30d')}
        </button>

        <button
          type="button"
          className={`period-selector__btn ${period === 'all' ? 'period-selector__btn--active' : ''}`}
          onClick={() => onChange('all')}
        >
          {t('stats.period.all')}
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