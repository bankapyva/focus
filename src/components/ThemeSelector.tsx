import React from 'react';
import { Sun, Moon, Contrast } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';
import { useTranslation } from '../hooks/useTranslation';
import type { Theme } from '../types/Settings';

export const ThemeSelector: React.FC = () => {
  const { settings, setSettings } = useAppContext();
  const { t } = useTranslation();

  const handleThemeChange = (theme: Theme) => {
    setSettings((prev) => ({ ...prev, theme }));
  };

  return (
    <div className="settings-row">
      <h3 className="settings-row__title">{t('settings.theme')}</h3>

      <div className="theme-switch-group">
        <button
          type="button"
          className={`theme-switch-card ${
            settings.theme === 'dark' ? 'theme-switch-card--active' : ''
          }`}
          onClick={() => handleThemeChange('dark')}
        >
          <Moon size={15} />
          <span>{t('settings.theme.dark')}</span>
        </button>

        <button
          type="button"
          className={`theme-switch-card ${
            settings.theme === 'light' ? 'theme-switch-card--active' : ''
          }`}
          onClick={() => handleThemeChange('light')}
        >
          <Sun size={15} />
          <span>{t('settings.theme.light')}</span>
        </button>

        <button
          type="button"
          className={`theme-switch-card ${
            settings.theme === 'monochrome' ? 'theme-switch-card--active' : ''
          }`}
          onClick={() => handleThemeChange('monochrome' as Theme)}
        >
          <Contrast size={15} />
          <span>{t('settings.theme.mono')}</span>
        </button>
      </div>
    </div>
  );
};

export default ThemeSelector;