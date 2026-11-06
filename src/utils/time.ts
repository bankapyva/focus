const UKRAINIAN_MONTHS_GENITIVE = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня',
];

const UKRAINIAN_MONTHS_SHORT = [
  'січ', 'лют', 'бер', 'кві', 'тра', 'чер',
  'лип', 'сер', 'вер', 'жов', 'лис', 'гру',
];

const ENGLISH_MONTHS_GENITIVE = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const ENGLISH_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatDuration(totalSeconds: number, lang: 'uk' | 'en' = 'uk'): string {
  if (!totalSeconds || totalSeconds <= 0) return lang === 'en' ? '0 m' : '0 хв';

  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const h = lang === 'en' ? 'h' : 'год';
  const m = lang === 'en' ? 'm' : 'хв';

  if (hours === 0) return `${minutes} ${m}`;
  if (minutes === 0) return `${hours} ${h}`;
  return `${hours} ${h} ${minutes} ${m}`;
}

export function formatHours(totalSeconds: number): string {
  const hours = totalSeconds / 3600;
  return hours.toFixed(1);
}

export function formatDateUkrainian(date: Date, lang: 'uk' | 'en' = 'uk'): string {
  const day = date.getDate();
  const monthList = lang === 'en' ? ENGLISH_MONTHS_GENITIVE : UKRAINIAN_MONTHS_GENITIVE;
  const month = monthList[date.getMonth()];
  return `${day} ${month}`;
}

export function formatDateShort(date: Date, lang: 'uk' | 'en' = 'uk'): string {
  const day = date.getDate();
  const monthList = lang === 'en' ? ENGLISH_MONTHS_SHORT : UKRAINIAN_MONTHS_SHORT;
  const month = monthList[date.getMonth()];
  return `${day} ${month}`;
}

export function formatDateRange(startDate: Date, endDate: Date, lang: 'uk' | 'en' = 'uk'): string {
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();
  const startMonth = startDate.getMonth();
  const endMonth = endDate.getMonth();
  const monthList = lang === 'en' ? ENGLISH_MONTHS_GENITIVE : UKRAINIAN_MONTHS_GENITIVE;

  if (startMonth === endMonth) {
    return `${startDay} – ${endDay} ${monthList[endMonth]}`;
  }

  return `${startDay} ${monthList[startMonth]} – ${endDay} ${monthList[endMonth]}`;
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; 
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatWeekRange(startOfWeek: Date, lang: 'uk' | 'en' = 'uk'): string {
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  return formatDateRange(startOfWeek, endOfWeek, lang);
}

export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}