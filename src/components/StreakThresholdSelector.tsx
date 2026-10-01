import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';

const POPULAR_THRESHOLDS = [0.5, 1, 1.5, 2];

function formatHours(val: number): string {
  if (val === 0.5) return '30 хв';
  if (val % 1 === 0) return `${val} год`;
  const whole = Math.floor(val);
  return `${whole} год 30 хв`;
}

export const StreakThresholdSelector: React.FC = () => {
  const { settings, setSettings } = useAppContext();
  const currentThreshold = settings.streakThresholdHours ?? 1;

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
        <h2 className="settings-section__title">Мінімум для вогника</h2>
      </div>

      <div className="time-selector-row">
        {/* Швидкі пресети */}
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

        {/* Точний степер із кроком 30 хв */}
        <div className="time-stepper">
          <button
            type="button"
            className="time-stepper__btn"
            onClick={() => updateThreshold(currentThreshold - 0.5)}
            disabled={currentThreshold <= 0.5}
            aria-label="Зменшити мінімум на 30 хв"
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
            aria-label="Збільшити мінімум на 30 хв"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StreakThresholdSelector;