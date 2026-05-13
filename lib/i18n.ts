"use client";

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// 引入我們剛剛寫好的兩本字典
import zh from '../locales/zh.json';
import en from '../locales/en.json';

i18n
  .use(initReactI18next) // 告訴 i18n 我們要搭配 React 使用
  .init({
    resources: {
      zh: { translation: zh },
      en: { translation: en }
    },
    lng: 'zh',           // 預設語言：中文
    fallbackLng: 'en',   // 如果找不到中文翻譯，就退回英文
    interpolation: {
      escapeValue: false // React 已經有防 XSS 注入了，所以這裡關閉
    }
  });

export default i18n;