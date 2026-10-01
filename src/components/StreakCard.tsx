import React from 'react';
import { Flame } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';
import { useTimer } from '../hooks/useTimer';
import { calculateCurrentStreak, getDaysLabel } from '../utils/streaks';

export const StreakCard: React.FC = () => {
  const { sessions } = useAppContext();
  const { isActive, seconds, activeTimer } = useTimer();

  const streak = calculateCurrentStreak(
    sessions,
    isActive ? seconds : 0,
    activeTimer?.startTime
  );

  return (
    <div className="timer-metric-card">
      <div className="timer-metric-card__header">
        <Flame size={15} className="icon--flame" />
        <span>Поточна серія</span>
      </div>
      <div className="timer-metric-card__value">
        {streak} <span className="timer-metric-card__unit">{getDaysLabel(streak)}</span>
      </div>
      <div className="timer-metric-card__subtext">від 1 год</div>
    </div>
  );
};

export default StreakCard;