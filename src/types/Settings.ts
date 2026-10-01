export type Theme = 'dark' | 'light';
export type AccentColor = 'blue' | 'purple' | 'turquoise' | 'green';

export interface Settings {
  theme: Theme;
  accentColor: AccentColor;
  dailyGoalHours?: number; // денна норма в годинах (для прогрес-бару)
  streakThresholdHours?: number; // мінімум годин для вогника (серії)
}