import 'i18next';
import tEN from './../locales/en/translation';
import tTR from './../locales/tr/translation';


declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      en: typeof tEN;
      tr: typeof tTR;
    };
  }
}
