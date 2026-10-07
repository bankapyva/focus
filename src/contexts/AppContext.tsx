import { useEffect, useState, type ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { AppContext } from './AppContext';
import { supabase } from '../lib/supabase';
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
  const [settings, setSettings] = useLocalStorage<Settings>('focustime-settings', defaultSettings);
  const [activeTimer, setActiveTimer] = useLocalStorage<{ areaId: string; startTime: string } | null>(
    'focustime-active-timer',
    null
  );
  const [tasks, setTasks] = useLocalStorage<Task[]>('focustime-tasks', []);

  // Стан акаунта та модального вікна
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem('focustime-username');
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Синхронізація теми та акцентів
  const activeTheme = settings.theme || defaultSettings.theme;
  const activeAccent = settings.accentColor || defaultSettings.accentColor;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
    document.documentElement.setAttribute('data-accent', activeAccent);

    const colors = ACCENT_PALETTE[activeAccent] || ACCENT_PALETTE.blue;
    document.documentElement.style.setProperty('--color-primary', colors.primary);
    document.documentElement.style.setProperty('--color-primary-hover', colors.hover);
  }, [activeTheme, activeAccent]);

  // Завантаження та слухач авторизації Supabase
  useEffect(() => {
    async function fetchCloudData(userId: string) {
      try {
        const { data, error } = await supabase
          .from('user_data')
          .select('*')
          .eq('id', userId)
          .single();

        if (error && error.code === 'PGRST116') {
          // Якщо першого запису ще немає — зберегти поточні локальні дані в базу
          await supabase.from('user_data').insert({
            id: userId,
            username: localStorage.getItem('focustime-username') || 'User',
            areas,
            tasks,
            sessions,
            settings,
            active_timer: activeTimer,
          });
        } else if (data) {
          if (data.areas) setAreas(data.areas);
          if (data.tasks) setTasks(data.tasks);
          if (data.sessions) setSessions(data.sessions);
          if (data.settings) setSettings(data.settings);
          if (data.active_timer !== undefined) setActiveTimer(data.active_timer);
        }
      } catch (e) {
        console.error('Помилка завантаження даних із хмари:', e);
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        const name =
          data.session.user.user_metadata?.username ||
          data.session.user.email?.split('@')[0] ||
          'User';
        setCurrentUser(name);
        localStorage.setItem('focustime-username', name);
        fetchCloudData(data.session.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const name =
          session.user.user_metadata?.username ||
          session.user.email?.split('@')[0] ||
          'User';
        setCurrentUser(name);
        localStorage.setItem('focustime-username', name);
        fetchCloudData(session.user.id);
      } else {
        setCurrentUser(null);
        localStorage.removeItem('focustime-username');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Автозбереження змін у хмару для авторизованого користувача
  useEffect(() => {
    const syncToCloud = async () => {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session?.user) return;

      await supabase.from('user_data').upsert({
        id: authData.session.user.id,
        username: currentUser || 'User',
        areas,
        tasks,
        sessions,
        settings,
        active_timer: activeTimer,
        updated_at: new Date().toISOString(),
      });
    };

    const timer = setTimeout(syncToCloud, 1000);
    return () => clearTimeout(timer);
  }, [areas, tasks, sessions, settings, activeTimer, currentUser]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    localStorage.removeItem('focustime-username');
  };

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
        currentUser,
        setCurrentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        handleLogout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}