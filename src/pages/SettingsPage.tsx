import React from 'react';
import { useAppContext } from '../contexts/useAppContext';
import { AreasManager } from '../components/AreasManager';
import { DailyGoalSelector } from '../components/DailyGoalSelector';
import { StreakThresholdSelector } from '../components/StreakThresholdSelector';
import { ThemeSelector } from '../components/ThemeSelector';
import { AccentSelector } from '../components/AccentSelector';
import { ResetDataCard } from '../components/ResetDataCard';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
  const { currentUser, handleLogout, setIsAuthModalOpen } = useAppContext();

  return (
    <div className="page settings-page">
      <h1 className="settings-page__title">Налаштування</h1>

      {/* Хмарна синхронізація в стилістиці основних карток */}
      <div className="settings-section">
        <div className="settings-section__header">
          <h2 className="settings-section__title">
            {currentUser ? `Акаунт (${currentUser})` : 'Хмарна синхронізація'}
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
              Вийти
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
              Увійти
            </button>
          )}
        </div>
      </div>

      {/* Сфери діяльності */}
      <AreasManager />

      {/* Денна норма */}
      <DailyGoalSelector />

      {/* Мінімум для вогника */}
      <StreakThresholdSelector />

      {/* Оформлення */}
      <div className="settings-section">
        <div className="settings-section__header">
          <h2 className="settings-section__title">Оформлення</h2>
        </div>

        <ThemeSelector />
        <AccentSelector />
      </div>

      {/* Дані та небезпечна зона */}
      <ResetDataCard />
    </div>
  );
};

export default SettingsPage;