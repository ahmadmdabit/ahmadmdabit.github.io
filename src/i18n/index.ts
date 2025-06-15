import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import tEN from './locales/en/translation';
import tTR from './locales/tr/translation';

const resources = {
    en: { translation: tEN },
    tr: { translation: tTR },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'tr',
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
    });

export default i18n;
