import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { en } from '../translations/en';
import { ml } from '../translations/ml';
import { hi } from '../translations/hi';
import { ta } from '../translations/ta';

const translations: Record<string, any> = { en, ml, hi, ta };

type LanguageContextType = {
  locale: string;
  changeLanguage: (lang: string) => Promise<void>;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    const loadLocale = async () => {
      const savedLocale = await AsyncStorage.getItem('userLocale');
      if (savedLocale && ['en', 'ml', 'hi', 'ta'].includes(savedLocale)) {
        setLocale(savedLocale);
      }
    };
    loadLocale();
  }, []);

  const changeLanguage = async (lang: string) => {
    setLocale(lang);
    await AsyncStorage.setItem('userLocale', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let translation = translations[locale];
    
    for (const k of keys) {
      if (translation && translation[k]) {
        translation = translation[k];
      } else {
        // Fallback to English
        let fallback = translations['en'];
        for (const fk of keys) {
          if (fallback && fallback[fk]) {
            fallback = fallback[fk];
          } else {
            return key; // return key as final fallback
          }
        }
        return fallback;
      }
    }
    return typeof translation === 'string' ? translation : key;
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
