export type Theme = 'dark' | 'light' | 'monochrome';
export type AccentColor = 'white' | 'blue' | 'purple' | 'turquoise' | 'green';
export type Language = 'uk' | 'en'; // <-- Новий тип

export interface Settings {
  theme: Theme;
  accentColor: AccentColor;
  language: Language; // <-- Нове поле
  dailyGoalHours: number;
  streakThresholdHours: number;
}