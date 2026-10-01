import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';

const POPULAR_GOALS = [2, 4, 6, 8];

function formatHours(val: number): string {
  if (val % 1 === 0) return `${val} год`;
  const whole = Math.floor(val);
  return `${whole} год 30 хв`;
}

export const DailyGoalSelector: React.FC = () => {
  const { settings, setSettings } = useAppContext();
  const currentGoal = settings.dailyGoalHours || 4;

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
        <h2 className="settings-section__title">Денна норма</h2>
      </div>

      <div className="time-selector-row">
        {/* Швидкі пресети */}
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
              {hours} год
            </button>
          ))}
        </div>

        {/* Точний степер із кроком 30 хв */}
        <div className="time-stepper">
          <button
            type="button"
            className="time-stepper__btn"
            onClick={() => updateGoal(currentGoal - 0.5)}
            disabled={currentGoal <= 1}
            aria-label="Зменшити норму на 30 хв"
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
            aria-label="Збільшити норму на 30 хв"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyGoalSelector;