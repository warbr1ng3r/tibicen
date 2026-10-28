export type Locale = 'en' | 'ru';

export function localize(locale: Locale, english: string, russian: string) {
  return locale === 'ru' ? russian : english;
}
