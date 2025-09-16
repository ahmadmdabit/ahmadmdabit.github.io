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
    debug: true, // Set to false in production
    load: 'languageOnly', // Instructs i18next to ignore region-specific codes like -US
    interpolation: { escapeValue: false }, // React already safes from xss
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // Path to the translation files
    },
  });

export default i18n;
