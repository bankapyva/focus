import React, { useEffect } from 'react';
import { Check } from 'lucide-react';
import { useAppContext } from '../contexts/useAppContext';
import type { AccentColor } from '../types/Settings';

const ACCENTS: { id: AccentColor; label: string; primary: string; hover: string }[] = [
  { id: 'blue', label: 'Синій', primary: '#3f78ff', hover: '#5287ff' },
  { id: 'purple', label: 'Фіолетовий', primary: '#8b5cf6', hover: '#a78bfa' },
  { id: 'turquoise', label: 'Бірюзовий', primary: '#14b8a6', hover: '#2dd4bf' },
  { id: 'green', label: 'Зелений', primary: '#22c55e', hover: '#4ade80' },
];

export const AccentSelector: React.FC = () => {
  const { settings, setSettings } = useAppContext();

  useEffect(() => {
    const active = ACCENTS.find((a) => a.id === settings.accentColor) || ACCENTS[0];
    document.documentElement.style.setProperty('--color-primary', active.primary);
    document.documentElement.style.setProperty('--color-primary-hover', active.hover);
  }, [settings.accentColor]);

  const handleSelectAccent = (colorId: AccentColor) => {
    setSettings((prev) => ({ ...prev, accentColor: colorId }));
  };

  return (
    <div className="settings-row">
      <h3 className="settings-row__title">Основний акцентний колір</h3>

      <div className="accent-picker">
        {ACCENTS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`accent-picker__item ${
              settings.accentColor === item.id ? 'accent-picker__item--active' : ''
            }`}
            style={{ backgroundColor: item.primary }}
            onClick={() => handleSelectAccent(item.id)}
            title={item.label}
          >
            {settings.accentColor === item.id && <Check size={14} color="#ffffff" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AccentSelector;