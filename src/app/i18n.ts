import { createI18n } from 'vue-i18n';
import en from '../locales/en.json';
import fr from '../locales/fr.json';

export const SUPPORTED_LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
] as const;

const storageKey = 'mako-editor:locale';
const fallbackLocale = 'en';

function isSupported(value: string | null | undefined): value is string {
  return !!value && SUPPORTED_LOCALES.some((loc) => loc.value === value);
}

function detectLocale(): string {
  try {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(storageKey) : null;
    if (isSupported(stored)) return stored;
    const nav = typeof navigator !== 'undefined' ? navigator.language ?? navigator.languages?.[0] : '';
    if (nav) {
      const lowerNav = nav.toLowerCase();
      const exact = SUPPORTED_LOCALES.find((loc) => loc.value === lowerNav);
      if (exact) return exact.value;
      const partial = SUPPORTED_LOCALES.find((loc) => lowerNav.startsWith(loc.value));
      if (partial) return partial.value;
    }
  } catch {
    // ignore detection errors and fall back to default
  }
  return fallbackLocale;
}

export const i18n = createI18n({
  legacy: false,
  locale: detectLocale(),
  fallbackLocale,
  messages: { en, fr },
});

export function setLocale(locale: string): void {
  if (!isSupported(locale)) return;
  const target = (i18n.global.locale as any);
  if (target?.value !== undefined) {
    target.value = locale;
  } else {
    i18n.global.locale = locale as any;
  }
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(storageKey, locale);
  } catch {
    // ignore storage errors
  }
}
