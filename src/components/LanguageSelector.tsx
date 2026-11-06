import React from 'react';
import { useAppContext } from '../contexts/useAppContext';
import { useTranslation } from '../hooks/useTranslation';
import type { Language } from '../types/Settings';

export const LanguageSelector: React.FC = () => {
  const { settings, setSettings } = useAppContext();
  const { t } = useTranslation();

  const handleSelectLang = (lang: Language) => {
    setSettings((prev) => ({ ...prev, language: lang }));
  };

  return (
    <div className="settings-row">
      <h3 className="settings-row__title">{t('settings.language')}</h3>
      
      {/* Використовуємо класи з theme-switch-group */}
      <div className="theme-switch-group">
        <button
          type="button"
          className={`theme-switch-card ${
            settings.language === 'uk' ? 'theme-switch-card--active' : ''
          }`}
          onClick={() => handleSelectLang('uk')}
        >
          <span>Українська</span>
        </button>
        
        <button
          type="button"
          className={`theme-switch-card ${
            settings.language === 'en' ? 'theme-switch-card--active' : ''
          }`}
          onClick={() => handleSelectLang('en')}
        >
          <span>English</span>
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;