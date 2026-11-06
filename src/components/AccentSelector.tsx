import React from 'react';
import { useAppContext } from '../contexts/useAppContext';
import { useTranslation } from '../hooks/useTranslation';
import { Check } from 'lucide-react';
import type { AccentColor } from '../types/Settings';

const ACCENTS: { id: AccentColor; hex: string }[] = [
  { id: 'white', hex: '#e4e4e7' },
  { id: 'blue', hex: '#3b82f6' },
  { id: 'purple', hex: '#8b5cf6' },
  { id: 'turquoise', hex: '#14b8a6' },
  { id: 'green', hex: '#22c55e' },
];

export const AccentSelector: React.FC = () => {
  const { settings, setSettings } = useAppContext();
  const { t } = useTranslation();

  const handleAccentChange = (accentColor: AccentColor) => {
    setSettings((prev) => ({ ...prev, accentColor }));
  };

  return (
    <div className="settings-row">
      <h3 className="settings-row__title">{t('settings.accentColor')}</h3>
      <div className="area-color-picker">
        {ACCENTS.map((accent) => (
          <button
            key={accent.id}
            type="button"
            className="area-color-picker__item"
            style={{ backgroundColor: accent.hex }}
            onClick={() => handleAccentChange(accent.id)}
          >
            {settings.accentColor === accent.id && (
              <Check size={14} color={accent.id === 'white' ? '#000' : '#fff'} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AccentSelector;