import en from './en.json';

const translations: Record<string, typeof en> = { en };

export function t(locale: string = 'en') {
  return translations[locale] ?? translations['en'];
}

export type Translations = typeof en;
