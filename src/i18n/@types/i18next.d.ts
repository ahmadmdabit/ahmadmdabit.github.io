import 'i18next';
import type translationSchema from '@/i18n/schema/translation.schema';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof translationSchema;
    };
  }
}
