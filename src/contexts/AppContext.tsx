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

  // Синхронізація теми та акцентного кольору з атрибутами HTML
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    if (settings.accentColor) {
      document.documentElement.setAttribute('data-accent', settings.accentColor);
    }
  }, [settings.theme, settings.accentColor]);

  // Якщо в localStorage збереглися старі налаштування без streakThresholdHours
  useEffect(() => {
    if (settings.streakThresholdHours === undefined) {
      setSettings((prev) => ({
        ...prev,
        streakThresholdHours: 1,
      }));
    }
  }, [settings.streakThresholdHours, setSettings]);

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