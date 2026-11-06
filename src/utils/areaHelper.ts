import type { Area } from '../types/Area';
import type { Language } from '../types/Settings';

export function getAreaName(area: Area | undefined | null, lang: Language = 'uk'): string {
  if (!area) return 'Без сфери';
  
  if (typeof area.name === 'string') {
    return area.name; // Для старих даних, де name - це просто рядок
  }
  
  return area.name[lang] || area.name['uk'] || 'Без назви';
}