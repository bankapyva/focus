import React from 'react';
import { AreasManager } from '../components/AreasManager';
import { DailyGoalSelector } from '../components/DailyGoalSelector';
import { StreakThresholdSelector } from '../components/StreakThresholdSelector';
import { ThemeSelector } from '../components/ThemeSelector';
import { AccentSelector } from '../components/AccentSelector';
import { ResetDataCard } from '../components/ResetDataCard';
import './SettingsPage.css';

export const SettingsPage: React.FC = () => {
  return (
    <div className="page settings-page">
      <h1 className="settings-page__title">Налаштування</h1>

      {/* Сфери діяльності */}
      <AreasManager />

      {/* Денна норма (для заповнення прогрес-бару) */}
      <DailyGoalSelector />

      {/* Мінімум для вогника (для збереження серії) */}
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