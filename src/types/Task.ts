export interface Task {
  id: string;
  title: string;
  completed: boolean;
  areaId?: string | null;
  createdAt: string;
}