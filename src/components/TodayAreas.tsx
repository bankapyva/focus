import React from 'react';
import { Clock, Flame } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';
import { useTimer } from '../hooks/useTimer';
import { formatDuration } from '../utils/time';
import { calculateCurrentStreak } from '../utils/streaks';

export const TodayAreas: React.FC = () => {
  const { sessions, areas, settings } = useAppContext();
  const { isActive, seconds, activeTimer } = useTimer();

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const todaySessions = sessions.filter((s) => isToday(s.startTime));
  const completedTodaySec = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  const activeSec = isActive && activeTimer && isToday(activeTimer.startTime) ? seconds : 0;
  const totalTodaySec = completedTodaySec + activeSec;

  const goalHours = settings.dailyGoalHours || 4;
  const goalProgress = Math.min(100, Math.round((totalTodaySec / (goalHours * 3600)) * 100));

  const streakThreshold = settings.streakThresholdHours ?? 1;

  // Серія розраховується за порогом streakThresholdHours
  const currentStreak = calculateCurrentStreak(
    sessions,
    isActive ? seconds : 0,
    activeTimer?.startTime,
    streakThreshold
  );

  const areasDistribution = areas
    .map((area) => {
      const areaCompletedSec = todaySessions
        .filter((s) => s.areaId === area.id)
        .reduce((acc, s) => acc + s.duration, 0);

      const areaActiveSec =
        isActive && activeTimer?.areaId === area.id && isToday(activeTimer.startTime)
          ? seconds
          : 0;

      const areaTotalSec = areaCompletedSec + areaActiveSec;
      const percentage =
        totalTodaySec > 0 ? Math.round((areaTotalSec / totalTodaySec) * 100) : 0;

      return {
        ...area,
        seconds: areaTotalSec,
        percentage,
      };
    })
    .filter((item) => item.seconds > 0)
    .sort((a, b) => b.seconds - a.seconds);

  return (
    <div className="timer-card-panel today-panel">
      <div className="timer-card-panel__header" style={{ marginBottom: '14px' }}>
        <div className="timer-card-panel__title-group">
          <Clock size={16} />
          <h2 className="timer-card-panel__title">Сьогодні</h2>
        </div>
      </div>

      {/* Загальний час: наприклад "2 год 45 хв" */}
      <div className="today-panel__summary">
        <div className="today-panel__hours-val">
          {formatDuration(totalTodaySec)}
        </div>

        <div
          className="today-streak-badge"
          title={`Поточна серія (потрібно ≥ ${streakThreshold} год/день)`}
        >
          <Flame size={14} className="icon--flame" />
          <span>{currentStreak}</span>
        </div>
      </div>

      <div
        className="today-panel__goal-track"
        title={`Норма: ${goalHours} год (${goalProgress}%)`}
      >
        <div
          className="today-panel__goal-fill"
          style={{ width: `${goalProgress}%` }}
        />
      </div>

      {areasDistribution.length === 0 ? (
        <div className="timer-card-panel__empty" style={{ minHeight: '120px' }}>
          Сесій за сьогодні ще немає
        </div>
      ) : (
        <div className="today-areas-list">
          {areasDistribution.map((item) => (
            <div key={item.id} className="today-area-row">
              <div className="today-area-row__name-wrapper">
                <span
                  className="today-area-row__dot"
                  style={{ backgroundColor: item.color }}
                />
                <span className="today-area-row__name">{item.name}</span>
              </div>

              {/* Час сфери: наприклад "1 год 20 хв" або "40 хв" */}
              <span className="today-area-row__hours">
                {formatDuration(item.seconds)}
              </span>

              <div className="today-area-row__track">
                <div
                  className="today-area-row__fill"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>

              <span className="today-area-row__percent">{item.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayAreas;