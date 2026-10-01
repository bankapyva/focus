import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';
import type { Theme } from '../types/Settings';

export const ThemeSelector: React.FC = () => {
  const { settings, setSettings } = useAppContext();

  const handleThemeChange = (theme: Theme) => {
    setSettings((prev) => ({ ...prev, theme }));
  };

  return (
    <div className="settings-row">
      <h3 className="settings-row__title">Тема інтерфейсу</h3>

      <div className="theme-switch-group">
        <button
          type="button"
          className={`theme-switch-card ${
            settings.theme === 'dark' ? 'theme-switch-card--active' : ''
          }`}
          onClick={() => handleThemeChange('dark')}
        >
          <Moon size={15} />
          <span>Темна</span>
        </button>
        <button
          type="button"
          className={`theme-switch-card ${
            settings.theme === 'light' ? 'theme-switch-card--active' : ''
          }`}
          onClick={() => handleThemeChange('light')}
        >
          <Sun size={15} />
          <span>Світла</span>
        </button>
      </div>
    </div>
  );
};

export default ThemeSelector;