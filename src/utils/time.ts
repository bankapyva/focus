const UKRAINIAN_MONTHS_GENITIVE = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня',
];

const UKRAINIAN_MONTHS_SHORT = [
  'січ', 'лют', 'бер', 'кві', 'тра', 'чер',
  'лип', 'сер', 'вер', 'жов', 'лис', 'гру',
];

/**
 * Форматує секунди у вигляд цифрового таймера: "02:35:12"
 */
export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Форматує секунди у природний формат:
 * 5100 сек -> "1 год 25 хв"
 * 2700 сек -> "45 хв"
 * 7200 сек -> "2 год"
 * 0 сек    -> "0 хв"
 */
export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '0 хв';

  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} хв`;
  }
  if (minutes === 0) {
    return `${hours} год`;
  }
  return `${hours} год ${minutes} хв`;
}

/**
 * Форматує секунди у десяткові години (для зворотної сумісності): 5400 -> "1.5"
 */
export function formatHours(totalSeconds: number): string {
  const hours = totalSeconds / 3600;
  return hours.toFixed(1);
}

/**
 * Форматує дату у вигляд "12 вересня"
 */
export function formatDateUkrainian(date: Date): string {
  const day = date.getDate();
  const month = UKRAINIAN_MONTHS_GENITIVE[date.getMonth()];
  return `${day} ${month}`;
}

/**
 * Форматує дату для підписів графіка: "1 вер"
 */
export function formatDateShort(date: Date): string {
  const day = date.getDate();
  const month = UKRAINIAN_MONTHS_SHORT[date.getMonth()];
  return `${day} ${month}`;
}

/**
 * Форматує діапазон дат тижня: "8 – 14 вересня" або "28 серпня – 3 вересня"
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const startMonth = startDate.getMonth();
  const endMonth = endDate.getMonth();

  if (startMonth === endMonth) {
    return `${startDay} – ${endDay} ${UKRAINIAN_MONTHS_GENITIVE[endMonth]}`;
  }

  return `${startDay} ${UKRAINIAN_MONTHS_GENITIVE[startMonth]} – ${endDay} ${UKRAINIAN_MONTHS_GENITIVE[endMonth]}`;
}

/**
 * Повертає дату понеділка для переданого дня
 */
export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // Понеділок = 0
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Форматує тижневий інтервал від дати понеділка
 */
export function formatWeekRange(startOfWeek: Date): string {
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  return formatDateRange(startOfWeek, endOfWeek);
}

/**
 * Повертає локальний ключ дати у форматі YYYY-MM-DD
 */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}