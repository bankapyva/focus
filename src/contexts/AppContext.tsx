import { useEffect, type ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { AppContext } from './AppContext';
import type { Area } from '../types/Area';
import type { Session } from '../types/Session';
import type { Settings } from '../types/Settings';
import type { Task } from '../types/Task';

const defaultSettings: Settings = {
  theme: 'dark',
  accentColor: 'blue',
  dailyGoalHours: 4,
  streakThresholdHours: 1,
};

// Палітра акцентних кольорів
const ACCENT_PALETTE: Record<string, { primary: string; hover: string }> = {
  blue: { primary: '#3f78ff', hover: '#5287ff' },
  purple: { primary: '#8b5cf6', hover: '#a78bfa' },
  turquoise: { primary: '#14b8a6', hover: '#2dd4bf' },
  green: { primary: '#22c55e', hover: '#4ade80' },
};

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [areas, setAreas] = useLocalStorage<Area[]>('focustime-areas', []);
  const [sessions, setSessions] = useLocalStorage<Session[]>('focustime-sessions', []);
  const [settings, setSettings] = useLocalStorage<Settings>(
    'focustime-settings',
    defaultSettings
  );
  const [activeTimer, setActiveTimer] = useLocalStorage<{
    areaId: string;
    startTime: string;
  } | null>('focustime-active-timer', null);

  const [tasks, setTasks] = useLocalStorage<Task[]>('focustime-tasks', []);

  const activeTheme = settings.theme || defaultSettings.theme;
  const activeAccent = settings.accentColor || defaultSettings.accentColor;

  // Глобальне застосування теми, дата-атрибутів та CSS-змінних на всіх сторінках
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    document.documentElement.setAttribute('data-accent', activeAccent);

    const colors = ACCENT_PALETTE[activeAccent] || ACCENT_PALETTE.blue;
    document.documentElement.style.setProperty('--color-primary', colors.primary);
    document.documentElement.style.setProperty('--color-primary-hover', colors.hover);
  }, [activeTheme, activeAccent]);

  // Міграція налаштувань у localStorage
  useEffect(() => {
    const isMissingFields =
      settings.streakThresholdHours === undefined ||
      !settings.accentColor ||
      !settings.theme;

    if (isMissingFields) {
      setSettings((prev) => ({
        ...defaultSettings,
        ...prev,
        accentColor: prev.accentColor || defaultSettings.accentColor,
        theme: prev.theme || defaultSettings.theme,
        streakThresholdHours:
          prev.streakThresholdHours ?? defaultSettings.streakThresholdHours,
      }));
    }
  }, [settings, setSettings]);

  return (
    <AppContext.Provider
      value={{
        areas,
        setAreas,
        sessions,
        setSessions,
        settings,
        setSettings,
        activeTimer,
        setActiveTimer,
        tasks,
        setTasks,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}