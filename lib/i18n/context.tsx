'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { type LocaleCode } from '@/types';
import { localeConfig, COOKIE_NAME } from './config';
import { createClient } from '@/lib/supabase/client';

interface LocaleContextType {
  locale: LocaleCode;
  dir: 'rtl' | 'ltr';
  setLocale: (locale: LocaleCode) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

function writeCookie(locale: LocaleCode): void {
  document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: LocaleCode;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<LocaleCode>(initialLocale);
  const updatingDb = useRef(false);

  useEffect(() => {
    writeCookie(locale);
    document.documentElement.dir = localeConfig[locale].dir;
    document.documentElement.lang = locale;

    if (!updatingDb.current) return;
    updatingDb.current = false;

    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('users').update({ locale }).eq('id', user.id).then(({ error }) => {
          if (error) console.error('Failed to sync locale to DB:', error);
        });
      }
    });
  }, [locale]);

  const setLocale = useCallback(async (newLocale: LocaleCode) => {
    updatingDb.current = true;
    setLocaleState(newLocale);
  }, []);

  const dir = localeConfig[locale].dir;

  return (
    <LocaleContext.Provider value={{ locale, dir, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
