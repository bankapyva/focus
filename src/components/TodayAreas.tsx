import React from 'react';
import { Clock, Flame } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';
import { useTimer } from '../hooks/useTimer';
import { formatDuration } from '../utils/time';
import { calculateCurrentStreak } from '../utils/streaks';
import { useTranslation } from '../hooks/useTranslation';
import { getAreaName } from '../utils/areaHelper';
// ДОДАНО ІМПОРТ ТИПУ Area:
import type { Area } from '../types/Area';

export const TodayAreas: React.FC = () => {
  const { sessions, areas, settings } = useAppContext();
  const { isActive, seconds, activeTimer } = useTimer();
  const { t, lang } = useTranslation();

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
      } as Area & { seconds: number; percentage: number }; 
    })
    .filter((item) => item.seconds > 0)
    .sort((a, b) => b.seconds - a.seconds);

  return (
    <div className="timer-card-panel today-panel">
      <div className="timer-card-panel__header" style={{ marginBottom: '14px' }}>
        <div className="timer-card-panel__title-group">
          <Clock size={16} />
          <h2 className="timer-card-panel__title">{t('today.title')}</h2>
        </div>
      </div>

      <div className="today-panel__summary">
        <div className="today-panel__hours-val">
          {formatDuration(totalTodaySec, lang)}
        </div>

        <div
          className="today-streak-badge"
          title={t('today.streakTitle', { threshold: streakThreshold })}
        >
          <Flame size={14} className="icon--flame" />
          <span>{currentStreak}</span>
        </div>
      </div>

      <div
        className="today-panel__goal-track"
        title={t('today.goalTitle', { goal: goalHours, progress: goalProgress })}
      >
        <div
          className="today-panel__goal-fill"
          style={{ width: `${goalProgress}%` }}
        />
      </div>

      {areasDistribution.length === 0 ? (
        <div className="timer-card-panel__empty" style={{ minHeight: '120px' }}>
          {t('today.noSessions')}
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
                <span className="today-area-row__name">{getAreaName(item, lang)}</span>
              </div>

              <div className="today-area-row__stats">
                <span className="today-area-row__hours">
                  {formatDuration(item.seconds, lang)}
                </span>
                <span className="today-area-row__percent">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayAreas;