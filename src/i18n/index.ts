import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend) // Loads translations from server
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    fallbackLng: "en", // Use en if detected lng is not available
    debug: import.meta.env.DEV,
    load: 'languageOnly', // Instructs i18next to ignore region-specific codes like -US
    interpolation: { escapeValue: false }, // React already safes from xss
    
    // Dynamic loadPath with hash for cache busting
    backend: {
      loadPath: `/locales/{{lng}}/{{ns}}.json${import.meta.env.VITE_LOCALES_HASH ? `?v=${import.meta.env.VITE_LOCALES_HASH}` : ''}`, // Append ?v=hash if defined
    },
  });

export default i18n;
