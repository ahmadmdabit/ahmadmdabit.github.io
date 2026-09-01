import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { DEFAULT_LOCALE, extractLocaleFromPath } from '@/i18n/locales';

// Determine initial locale from URL path, falling back to detector.
const pathLocale = extractLocaleFromPath(window.location.pathname);

i18next
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: DEFAULT_LOCALE,
    debug: import.meta.env.DEV,
    load: 'languageOnly',
    interpolation: { escapeValue: false },
    // Start with the URL-prefixed locale so the first render matches the path.
    lng: pathLocale,
    backend: {
      loadPath: `/locales/{{lng}}/{{ns}}.json${import.meta.env.VITE_LOCALE_HASH ? `?v=${import.meta.env.VITE_LOCALE_HASH}` : ''}`,
    },
  });

export default i18next;
