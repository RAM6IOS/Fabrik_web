import type { LocaleCode } from '@/types';

export const locales: LocaleCode[] = ['ar', 'fr'];

export const localeConfig: Record<LocaleCode, { dir: 'rtl' | 'ltr'; label: string; flag: string }> = {
  ar: { dir: 'rtl', label: 'العربية', flag: '🇸🇦' },
  fr: { dir: 'ltr', label: 'Français', flag: '🇫🇷' },
};

export function getDir(locale: string): 'rtl' | 'ltr' {
  return localeConfig[locale as LocaleCode]?.dir ?? 'rtl';
}

export function isValidLocale(locale: string): locale is LocaleCode {
  return locales.includes(locale as LocaleCode);
}

export const COOKIE_NAME = 'locale';
export const DEFAULT_LOCALE: LocaleCode = 'ar';
