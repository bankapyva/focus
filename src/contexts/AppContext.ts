import { createContext } from 'react';
import type { Area } from '../types/Area';
import type { Session } from '../types/Session';
import type { Settings } from '../types/Settings';
import type { Task } from '../types/Task';

export interface AppContextValue {
  areas: Area[];
  setAreas: React.Dispatch<React.SetStateAction<Area[]>>;
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  activeTimer: { areaId: string; startTime: string } | null;
  setActiveTimer: React.Dispatch<
    React.SetStateAction<{ areaId: string; startTime: string } | null>
  >;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export const AppContext = createContext<AppContextValue | undefined>(undefined);