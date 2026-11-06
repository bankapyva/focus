import React from 'react';
import { useAppContext } from '../contexts/useAppContext';
import { AreasManager } from '../components/AreasManager';
import { DailyGoalSelector } from '../components/DailyGoalSelector';
import { StreakThresholdSelector } from '../components/StreakThresholdSelector';
import { ThemeSelector } from '../components/ThemeSelector';
import { AccentSelector } from '../components/AccentSelector';
import { LanguageSelector } from '../components/LanguageSelector';
import { ResetDataCard } from '../components/ResetDataCard';
import { useTranslation } from '../hooks/useTranslation';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
  const { currentUser, handleLogout, setIsAuthModalOpen } = useAppContext();
  const { t } = useTranslation();

  return (
    <div className="page settings-page">
      <h1 className="settings-page__title">{t('nav.settings')}</h1>

      {/* Хмарна синхронізація */}
      <div className="settings-section">
        <div className="settings-section__header">
          <h2 className="settings-section__title">
            {currentUser ? `${t('settings.account')} (${currentUser})` : t('settings.cloudSync')}
          </h2>

          {currentUser ? (
            <button
              type="button"
              onClick={handleLogout}
              className="modal-btn modal-btn--secondary"
              style={{
                color: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.25)',
                padding: '6px 16px',
                fontSize: '13px',
              }}
            >
              {t('settings.logout')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="timer-hero__btn"
              style={{
                minWidth: 'auto',
                padding: '8px 20px',
                fontSize: '13px',
              }}
            >
              {t('settings.login')}
            </button>
          )}
        </div>
      </div>

      <AreasManager />
      <DailyGoalSelector />
      <StreakThresholdSelector />

      {/* Оформлення */}
      <div className="settings-section">
        <div className="settings-section__header">
          <h2 className="settings-section__title">{t('settings.appearance')}</h2>
        </div>

        <ThemeSelector />
        <AccentSelector />
        <LanguageSelector />
      </div>

      <ResetDataCard />
    </div>
  );
};

export default SettingsPage;