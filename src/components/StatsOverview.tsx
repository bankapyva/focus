import React from 'react';
import { Clock, Calendar, Star, Trophy, CalendarDays, Crown } from 'lucide-react';
import type { StatisticsOverview } from '../utils/statistics';
import { formatDuration } from '../utils/time';
import { getDaysLabel } from '../utils/streaks';
import { useTranslation } from '../hooks/useTranslation';

interface StatsOverviewProps {
  stats: StatisticsOverview;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const { t, lang } = useTranslation();

  return (
    <div className="stats-panel">
      <div className="stats-panel__header">
        <h2 className="stats-panel__title">{t('stats.overview.title')}</h2>
      </div>

      <div className="stats-overview-grid" key={stats.totalSeconds}>
        <div className="stat-mini-card">
          <div className="stat-mini-card__header">
            <span className="stat-mini-card__icon">
              <Clock size={16} />
            </span>
            <span className="stat-mini-card__title">{t('stats.overview.total')}</span>
          </div>
          <div className="stat-mini-card__content">
            <span className="stat-mini-card__value">
              {formatDuration(stats.totalSeconds, lang)}
            </span>
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-mini-card__header">
            <span className="stat-mini-card__icon">
              <Calendar size={16} />
            </span>
            <span className="stat-mini-card__title">{t('stats.overview.avg')}</span>
          </div>
          <div className="stat-mini-card__content">
            <span className="stat-mini-card__value">
              {formatDuration(stats.averageSecondsPerDay, lang)}
            </span>
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-mini-card__header">
            <span className="stat-mini-card__icon stat-mini-card__icon--gold">
              <Star size={16} />
            </span>
            <span className="stat-mini-card__title">{t('stats.overview.bestDay')}</span>
          </div>
          <div className="stat-mini-card__content">
            <span className="stat-mini-card__value">
              {stats.bestDay ? formatDuration(stats.bestDay.seconds, lang) : (lang === 'en' ? '0 m' : '0 хв')}
            </span>
            {stats.bestDay && (
              <span className="stat-mini-card__subtext">
                {stats.bestDay.formattedDate}
              </span>
            )}
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-mini-card__header">
            <span className="stat-mini-card__icon">
              <Trophy size={16} />
            </span>
            <span className="stat-mini-card__title">{t('stats.overview.bestWeek')}</span>
          </div>
          <div className="stat-mini-card__content">
            <span className="stat-mini-card__value">
              {stats.bestWeek ? formatDuration(stats.bestWeek.seconds, lang) : (lang === 'en' ? '0 m' : '0 хв')}
            </span>
            {stats.bestWeek && (
              <span className="stat-mini-card__subtext">
                {stats.bestWeek.formattedRange}
              </span>
            )}
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-mini-card__header">
            <span className="stat-mini-card__icon stat-mini-card__icon--gold">
              <CalendarDays size={16} />
            </span>
            <span className="stat-mini-card__title">{t('stats.overview.bestMonth')}</span>
          </div>
          <div className="stat-mini-card__content">
            <span className="stat-mini-card__value">
              {stats.bestMonth ? formatDuration(stats.bestMonth.seconds, lang) : (lang === 'en' ? '0 m' : '0 хв')}
            </span>
            {stats.bestMonth && (
              <span className="stat-mini-card__subtext">
                {stats.bestMonth.monthLabel}
              </span>
            )}
          </div>
        </div>

        <div className="stat-mini-card">
          <div className="stat-mini-card__header">
            <span className="stat-mini-card__icon stat-mini-card__icon--gold">
              <Crown size={16} />
            </span>
            <span className="stat-mini-card__title">{t('stats.overview.recordStreak')}</span>
          </div>
          <div className="stat-mini-card__content">
            <span className="stat-mini-card__value">
              {stats.recordStreak}{' '}
              <span className="stat-mini-card__unit">
                {lang === 'en' ? (stats.recordStreak === 1 ? 'day' : 'days') : getDaysLabel(stats.recordStreak)}
              </span>
            </span>
            <span className="stat-mini-card__subtext">
              (≥ {stats.streakThresholdHours || 1} {lang === 'en' ? 'h' : 'год'})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;