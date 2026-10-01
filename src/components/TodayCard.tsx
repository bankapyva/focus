import React from 'react';
import { Calendar } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';
import { useTimer } from '../hooks/useTimer';
import { formatHours } from '../utils/time';

export const TodayCard: React.FC = () => {
  const { sessions } = useAppContext();
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

  // Рахуємо завершені сесії за сьогодні
  const todayCompletedSeconds = sessions
    .filter((session) => isToday(session.startTime))
    .reduce((total, session) => total + session.duration, 0);

  // Якщо таймер зараз працює і запущений сьогодні — додаємо активні секунди наживо
  const activeSecondsToday =
    isActive && activeTimer && isToday(activeTimer.startTime) ? seconds : 0;

  const totalTodaySeconds = todayCompletedSeconds + activeSecondsToday;

  return (
    <div className="timer-metric-card">
      <div className="timer-metric-card__header">
        <Calendar size={15} />
        <span>Сьогодні</span>
      </div>
      <div className="timer-metric-card__value">
        {formatHours(totalTodaySeconds)}{' '}
        <span className="timer-metric-card__unit">год</span>
      </div>
      <div className="timer-metric-card__subtext">Час роботи</div>
    </div>
  );
};

export default TodayCard;