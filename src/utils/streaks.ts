import type { Session } from '../types/Session';
import { toLocalDateString } from './time';

export function getDaysLabel(days: number): string {
  const mod10 = days % 10;
  const mod100 = days % 100;

  if (mod100 >= 11 && mod100 <= 19) return 'днів';
  if (mod10 === 1) return 'день';
  if (mod10 >= 2 && mod10 <= 4) return 'дні';
  return 'днів';
}

/**
 * Агрегує загальний час роботи (у секундах) по днях (YYYY-MM-DD)
 */
function getSecondsPerDayMap(
  sessions: Session[],
  activeSeconds: number = 0,
  activeStartTime?: string
): Map<string, number> {
  const map = new Map<string, number>();

  for (const session of sessions) {
    const key = toLocalDateString(new Date(session.startTime));
    map.set(key, (map.get(key) || 0) + session.duration);
  }

  if (activeStartTime && activeSeconds > 0) {
    const activeKey = toLocalDateString(new Date(activeStartTime));
    map.set(activeKey, (map.get(activeKey) || 0) + activeSeconds);
  }

  return map;
}

/**
 * 1. Розрахунок поточної серії днів за заданим порогом годин (за замовчуванням 1 год)
 */
export function calculateCurrentStreak(
  sessions: Session[],
  activeSeconds: number = 0,
  activeStartTime?: string,
  minHours: number = 1
): number {
  const minSeconds = minHours * 3600;
  const secondsPerDay = getSecondsPerDayMap(sessions, activeSeconds, activeStartTime);

  const today = new Date();
  const todayKey = toLocalDateString(today);
  const todaySeconds = secondsPerDay.get(todayKey) || 0;

  let streak = 0;
  const checkDate = new Date(today);

  if (todaySeconds >= minSeconds) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // Якщо сьогодні ще не закрили мінімум, перевіряємо від вчорашнього дня,
    // щоб серія не згорала посеред дня
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const key = toLocalDateString(checkDate);
    const daySeconds = secondsPerDay.get(key) || 0;

    if (daySeconds >= minSeconds) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * 2. Розрахунок рекордної серії днів за весь час за заданим порогом годин
 */
export function calculateRecordStreak(
  sessions: Session[],
  minHours: number = 1
): number {
  if (sessions.length === 0) return 0;

  const minSeconds = minHours * 3600;
  const secondsPerDay = getSecondsPerDayMap(sessions);

  // Знаходимо всі унікальні дні, де відпрацьовано >= minSeconds
  const qualifyingDays = Array.from(secondsPerDay.entries())
    .filter(([, sec]) => sec >= minSeconds)
    .map(([dateStr]) => dateStr)
    .sort(); // сортування у хронологічному порядку YYYY-MM-DD

  if (qualifyingDays.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < qualifyingDays.length; i++) {
    const prevDate = new Date(qualifyingDays[i - 1]);
    const currDate = new Date(qualifyingDays[i]);

    // Різниця у днях
    const diffTime = currDate.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }

  return maxStreak;
}