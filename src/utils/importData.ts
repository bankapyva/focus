import type { Area } from '../types/Area';
import type { Session } from '../types/Session';
import type { Settings } from '../types/Settings';

export interface ImportedData {
  areas?: Area[];
  sessions?: Session[];
  settings?: Settings;
}

export function parseImportFile(file: File): Promise<ImportedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Файл не містить валідних даних');
        }

        resolve(parsed as ImportedData);
      } catch {
        reject(new Error('Помилка при зчитуванні JSON-файлу'));
      }
    };

    reader.onerror = () => reject(new Error('Не вдалося прочитати файл'));
    reader.readAsText(file);
  });
}