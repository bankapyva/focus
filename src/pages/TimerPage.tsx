import React from 'react';
import { useAppContext } from '../contexts/useAppContext';
import { Sun, Moon } from 'lucide-react';
import { TimerCard } from '../components/TimerCard';
import { TodayAreas } from '../components/TodayAreas';
import { TasksCard } from '../components/TasksCard';
import './TimerPage.css';

export const TimerPage: React.FC = () => {
  const { settings, setSettings } = useAppContext();

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  return (
    <div className="page timer-page">
      <header className="timer-page__header">
        <h1 className="timer-page__title">Головна</h1>

        <div className="timer-page__header-actions">
          <div className="theme-toggle">
            <button
              type="button"
              className={`theme-toggle__btn ${settings.theme === 'light' ? 'theme-toggle__btn--active' : ''}`}
              onClick={toggleTheme}
              aria-label="Світла тема"
            >
              <Sun size={15} />
            </button>
            <button
              type="button"
              className={`theme-toggle__btn ${settings.theme === 'dark' ? 'theme-toggle__btn--active' : ''}`}
              onClick={toggleTheme}
              aria-label="Темна тема"
            >
              <Moon size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Центральний таймер */}
      <section className="timer-hero">
        <TimerCard />
      </section>

      {/* Нижня секція: Сьогодні зліва + Завдання справа */}
      <section className="timer-bottom-grid">
        <TodayAreas />
        <TasksCard />
      </section>
    </div>
  );
};

export default TimerPage;