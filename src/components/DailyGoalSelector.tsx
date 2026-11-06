import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';
import { useTranslation } from '../hooks/useTranslation';

const POPULAR_GOALS = [2, 4, 6, 8];

export const DailyGoalSelector: React.FC = () => {
  const { settings, setSettings } = useAppContext();
  const { t, lang } = useTranslation();
  const currentGoal = settings.dailyGoalHours || 4;

  const formatHours = (val: number): string => {
    const h = lang === 'en' ? 'h' : 'год';
    const m = lang === 'en' ? 'm' : 'хв';
    if (val % 1 === 0) return `${val} ${h}`;
    const whole = Math.floor(val);
    return `${whole} ${h} 30 ${m}`;
  };

  const updateGoal = (val: number) => {
    const clamped = Math.min(16, Math.max(1, Number(val.toFixed(1))));
    setSettings((prev) => ({
      ...prev,
      dailyGoalHours: clamped,
    }));
  };

  return (
    <div className="settings-section">
      <div className="settings-section__header">
        <h2 className="settings-section__title">{t('settings.dailyGoal')}</h2>
      </div>

      <div className="time-selector-row">
        <div className="time-presets-list">
          {POPULAR_GOALS.map((hours) => (
            <button
              key={hours}
              type="button"
              className={`settings-pill ${
                currentGoal === hours ? 'settings-pill--active' : ''
              }`}
              onClick={() => updateGoal(hours)}
            >
              {hours} {lang === 'en' ? 'h' : 'год'}
            </button>
          ))}
        </div>

        <div className="time-stepper">
          <button
            type="button"
            className="time-stepper__btn"
            onClick={() => updateGoal(currentGoal - 0.5)}
            disabled={currentGoal <= 1}
            aria-label="Decrease"
          >
            <Minus size={15} />
          </button>

          <span className="time-stepper__value">
            {formatHours(currentGoal)}
          </span>

          <button
            type="button"
            className="time-stepper__btn"
            onClick={() => updateGoal(currentGoal + 0.5)}
            disabled={currentGoal >= 16}
            aria-label="Increase"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyGoalSelector;