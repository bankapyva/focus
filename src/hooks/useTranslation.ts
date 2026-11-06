import { translations, type TranslationKey } from '../i18n/translations';
import { useAppContext } from '../contexts/useAppContext';

export function useTranslation() {
  const { settings } = useAppContext();
  const lang = settings.language || 'uk';

  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    let text = translations[lang][key] || translations['uk'][key] || key;

    // Якщо є параметри (наприклад {count}), замінюємо їх у тексті
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }

    return text;
  };

  return { t, lang };
}