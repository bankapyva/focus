import type { Area } from '../types/Area';
import type { Session } from '../types/Session';
import { calculateRecordStreak } from './streaks';

export type StatsPeriod = '7d' | '30d' | 'all' | 'custom';

export interface CustomDateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface AreaStat {
  id: string;
  name: string;
  color: string;
  totalSeconds: number;
  percentage: number;
}

export interface DayBarData {
  dateKey: string;
  dateLabel: string;
  totalHours: number;
  [areaId: string]: string | number;
}

export interface StatisticsOverview {
  totalSeconds: number;
  averageSecondsPerDay: number;
  bestDay: {
    formattedDate: string;
    seconds: number;
  } | null;
  bestWeek: {
    formattedRange: string;
    seconds: number;
  } | null;
  bestMonth: {
    monthLabel: string;
    seconds: number;
  } | null;
  recordStreak: number;
  streakThresholdHours: number;
  areaStats: AreaStat[];
  dailyChartData: DayBarData[];
}

const MONTH_NAMES_UK = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
];

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Понеділок = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekRange(startOfWeek: Date): string {
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  const sDay = startOfWeek.getDate();
  const eDay = endOfWeek.getDate();
  const sMonth = MONTH_NAMES_UK[startOfWeek.getMonth()].toLowerCase();
  const eMonth = MONTH_NAMES_UK[endOfWeek.getMonth()].toLowerCase();

  if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
    return `${sDay} – ${eDay} ${sMonth}`;
  }
  return `${sDay} ${sMonth} – ${eDay} ${eMonth}`;
}

export function calculateStatistics(
  sessions: Session[],
  areas: Area[],
  period: StatsPeriod,
  customRange?: CustomDateRange,
  streakThresholdHours: number = 1
): StatisticsOverview {
  const now = new Date();
  let startDate: Date;
  let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  if (period === '7d') {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === '30d') {
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'custom' && customRange) {
    const [sY, sM, sD] = customRange.startDate.split('-').map(Number);
    startDate = new Date(sY, sM - 1, sD, 0, 0, 0, 0);
    const [eY, eM, eD] = customRange.endDate.split('-').map(Number);
    endDate = new Date(eY, eM - 1, eD, 23, 59, 59, 999);
  } else {
    // 'all'
    if (sessions.length > 0) {
      const earliest = Math.min(...sessions.map((s) => new Date(s.startTime).getTime()));
      startDate = new Date(earliest);
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
    }
  }

  // Фільтруємо сесії за вибраний період
  const filteredSessions = sessions.filter((s) => {
    const sessionTime = new Date(s.startTime).getTime();
    return sessionTime >= startDate.getTime() && sessionTime <= endDate.getTime();
  });

  // Загальний час за період
  const totalSeconds = filteredSessions.reduce((acc, s) => acc + s.duration, 0);

  // Кількість днів для розрахунку середнього
  const diffDays = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
  );
  const averageSecondsPerDay = Math.round(totalSeconds / diffDays);

  // 1. Найкращий день за період
  const dayTotals: Record<string, number> = {};
  filteredSessions.forEach((s) => {
    const dKey = s.startTime.split('T')[0];
    dayTotals[dKey] = (dayTotals[dKey] || 0) + s.duration;
  });

  let bestDay: { formattedDate: string; seconds: number } | null = null;
  let maxDaySeconds = 0;

  Object.entries(dayTotals).forEach(([dKey, sec]) => {
    if (sec > maxDaySeconds) {
      maxDaySeconds = sec;
      const parts = dKey.split('-');
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      bestDay = {
        formattedDate: `${d.getDate()} ${MONTH_NAMES_UK[d.getMonth()].toLowerCase()}`,
        seconds: sec,
      };
    }
  });

  // 2. Найкращий тиждень за період
  const weekTotals: Record<string, number> = {};
  filteredSessions.forEach((s) => {
    const sDate = new Date(s.startTime);
    const startOfWeek = getStartOfWeek(sDate);
    const wKey = startOfWeek.toISOString().split('T')[0];
    weekTotals[wKey] = (weekTotals[wKey] || 0) + s.duration;
  });

  let bestWeek: { formattedRange: string; seconds: number } | null = null;
  let maxWeekSeconds = 0;

  Object.entries(weekTotals).forEach(([wKey, sec]) => {
    if (sec > maxWeekSeconds) {
      maxWeekSeconds = sec;
      const [y, m, d] = wKey.split('-').map(Number);
      const wDate = new Date(y, m - 1, d);
      bestWeek = {
        formattedRange: formatWeekRange(wDate),
        seconds: sec,
      };
    }
  });

  // 3. Найкращий календарний місяць (за весь час)
  const monthTotals: Record<string, number> = {};
  sessions.forEach((s) => {
    const d = new Date(s.startTime);
    const mKey = `${d.getFullYear()}-${d.getMonth()}`;
    monthTotals[mKey] = (monthTotals[mKey] || 0) + s.duration;
  });

  let bestMonth: { monthLabel: string; seconds: number } | null = null;
  let maxMonthSeconds = 0;

  Object.entries(monthTotals).forEach(([mKey, sec]) => {
    if (sec > maxMonthSeconds) {
      maxMonthSeconds = sec;
      const [yearStr, monthStr] = mKey.split('-');
      const mIdx = Number(monthStr);
      bestMonth = {
        monthLabel: `${MONTH_NAMES_UK[mIdx]} ${yearStr}`,
        seconds: sec,
      };
    }
  });

  // 4. Рекордна серія за заданим порогом
  const recordStreak = calculateRecordStreak(sessions, streakThresholdHours);

  // 5. Статистика по сферах
  const areaTotals: Record<string, number> = {};
  filteredSessions.forEach((s) => {
    areaTotals[s.areaId] = (areaTotals[s.areaId] || 0) + s.duration;
  });

  const areaStats: AreaStat[] = areas
    .map((area) => {
      const sec = areaTotals[area.id] || 0;
      const pct = totalSeconds > 0 ? (sec / totalSeconds) * 100 : 0;
      return {
        id: area.id,
        name: area.name,
        color: area.color,
        totalSeconds: sec,
        percentage: Number(pct.toFixed(1)),
      };
    })
    .sort((a, b) => b.totalSeconds - a.totalSeconds);

  return {
    totalSeconds,
    averageSecondsPerDay,
    bestDay,
    bestWeek,
    bestMonth,
    recordStreak,
    streakThresholdHours,
    areaStats,
    dailyChartData: [],
  };
}