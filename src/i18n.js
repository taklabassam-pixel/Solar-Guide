import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import arTranslation from './locales/ar.json';
import enTranslation from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: arTranslation },
      en: { translation: enTranslation }
    },
    fallbackLng: 'ar', // اللغة الافتراضية إذا لم تُحدد لغة أخرى
    interpolation: {
      escapeValue: false
    }
  });

// دالة لتحديث اتجاه HTML (RTL/LTR) تلقائياً عند تغيير اللغة
i18n.on('languageChanged', (lng) => {
  document.dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

export default i18n;