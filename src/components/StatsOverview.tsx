import React from 'react';
import { Clock, Calendar, Star, Trophy, CalendarDays, Crown } from 'lucide-react';
import type { StatisticsOverview } from '../utils/statistics';
import { formatDuration } from '../utils/time';
import { getDaysLabel } from '../utils/streaks';

interface StatsOverviewProps {
  stats: StatisticsOverview;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <div className="stats-panel">
      <div className="stats-panel__header">
        <h2 className="stats-panel__title">Основна статистика</h2>
      </div>

      <div className="stats-overview-grid" key={stats.totalSeconds}>
        {/* 1. Всього часу */}
        <div className="stat-mini-card">
          <div className="stat-mini-card__header">
            <span className="stat-mini-card__icon">
              <Clock size={16} />
            </span>
            <span className="stat-mini-card__title">Всього часу</span>
          </div>
          <div className="stat-mini-card__content">
            <span className="stat-mini-card__value">
              {formatDuration(stats.totalSeconds)}
            </span>
          </div>
        </div>

        {/* 2. Середнє за день */}
        <div className="stat-mini-card">
          <div className="stat-mini-card__header">
            <span className="stat-mini-card__icon">
              <Calendar size={16} />
            </span>
            <span className="stat-mini-card__title">Середнє за день</span>
          </div>
          <div className="stat-mini-card__content">
            <span className="stat-mini-card__value">
              {formatDuration(stats.averageSecondsPerDay)}
            </span>
          </div>
        </div>

        {/* 3. Найкращий день */}
        <div className="stat-mini-card">
          <div className="stat-mini-card__header">
            <span className="stat-mini-card__icon stat-mini-card__icon--gold">
              <Star size={16} />
            </span>
            <span className="stat-mini-card__title">Найкращий день</span>
          </div>
          <div className="stat-mini-card__content">
            <span className="stat-mini-card__value">
              {stats.bestDay ? formatDuration(stats.bestDay.seconds) : '0 хв'}
            </span>
            {stats.bestDay && (
              <span className="stat-mini-card__subtext">
                {stats.bestDay.formattedDate}
              </span>
            )}
          </div>
        </div>

        {/* 4. Найкращий тиждень */}
        <div className="stat-mini-card">
          <div className="stat-mini-card__header">
            <span className="stat-mini-card__icon">
              <Trophy size={16} />
            </span>
            <span className="stat-mini-card__title">Найкращий тиждень</span>
          </div>
          <div className="stat-mini-card__content">
            <span className="stat-mini-card__value">
              {stats.bestWeek ? formatDuration(stats.bestWeek.seconds) : '0 хв'}
            </span>
            {stats.bestWeek && (
              <span className="stat-mini-card__subtext">
                {stats.bestWeek.formattedRange}
              </span>
            )}
          </div>
        </div>

        {/* 5. Найкращий місяць */}
        <div className="stat-mini-card">
          <div className="stat-mini-card__header">
            <span className="stat-mini-card__icon stat-mini-card__icon--gold">
              <CalendarDays size={16} />
            </span>
            <span className="stat-mini-card__title">Найкращий місяць</span>
          </div>
          <div className="stat-mini-card__content">
            <span className="stat-mini-card__value">
              {stats.bestMonth ? formatDuration(stats.bestMonth.seconds) : '0 хв'}
            </span>
            {stats.bestMonth && (
              <span className="stat-mini-card__subtext">
                {stats.bestMonth.monthLabel}
              </span>
            )}
          </div>
        </div>

        {/* 6. Рекордна серія за порогом streakThresholdHours */}
        <div className="stat-mini-card">
          <div className="stat-mini-card__header">
            <span className="stat-mini-card__icon stat-mini-card__icon--gold">
              <Crown size={16} />
            </span>
            <span className="stat-mini-card__title">Рекордна серія</span>
          </div>
          <div className="stat-mini-card__content">
            <span className="stat-mini-card__value">
              {stats.recordStreak}{' '}
              <span className="stat-mini-card__unit">
                {getDaysLabel(stats.recordStreak)}
              </span>
            </span>
            <span className="stat-mini-card__subtext">
              (≥ {stats.streakThresholdHours || 1} год)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;