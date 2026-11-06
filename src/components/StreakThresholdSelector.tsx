import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';
import { useTranslation } from '../hooks/useTranslation';

const POPULAR_THRESHOLDS = [0.5, 1, 1.5, 2];

export const StreakThresholdSelector: React.FC = () => {
  const { settings, setSettings } = useAppContext();
  const { t, lang } = useTranslation();
  const currentThreshold = settings.streakThresholdHours ?? 1;

  const formatHours = (val: number): string => {
    const h = lang === 'en' ? 'h' : 'год';
    const m = lang === 'en' ? 'm' : 'хв';
    if (val === 0.5) return `30 ${m}`;
    if (val % 1 === 0) return `${val} ${h}`;
    const whole = Math.floor(val);
    return `${whole} ${h} 30 ${m}`;
  };

  const updateThreshold = (val: number) => {
    const clamped = Math.min(10, Math.max(0.5, Number(val.toFixed(1))));
    setSettings((prev) => ({
      ...prev,
      streakThresholdHours: clamped,
    }));
  };

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <h2 className="settings-section__title">{t('settings.streakThreshold')}</h2>
      </div>

      <div className="time-selector-row">
        <div className="time-presets-list">
          {POPULAR_THRESHOLDS.map((hours) => (
            <button
              key={hours}
              type="button"
              className={`settings-pill ${
                currentThreshold === hours ? 'settings-pill--active' : ''
              }`}
              onClick={() => updateThreshold(hours)}
            >
              {formatHours(hours)}
            </button>
          ))}
        </div>

        <div className="time-stepper">
          <button
            type="button"
            className="time-stepper__btn"
            onClick={() => updateThreshold(currentThreshold - 0.5)}
            disabled={currentThreshold <= 0.5}
            aria-label="Decrease"
          >
            <Minus size={15} />
          </button>

          <span className="time-stepper__value">
            {formatHours(currentThreshold)}
          </span>

          <button
            type="button"
            className="time-stepper__btn"
            onClick={() => updateThreshold(currentThreshold + 0.5)}
            disabled={currentThreshold >= 10}
            aria-label="Increase"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreakThresholdSelector;