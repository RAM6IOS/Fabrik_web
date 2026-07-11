'use client';

import { useEffect } from 'react';
import { COOKIE_NAME, getDir, DEFAULT_LOCALE, isValidLocale } from './config';

function readCookie(): string {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}\\s*=\\s*([^;]*)`));
  return match?.[1] ?? '';
}

/**
 * Inline script and hydration safety to prevent flash of wrong direction.
 * The script runs before React hydration to set dir/lang from cookie.
 * The useEffect handles SPA navigation where the cookie may have changed.
 */
export default function LocaleInit() {
  useEffect(() => {
    const value = readCookie();
    const locale = value && isValidLocale(value) ? value : DEFAULT_LOCALE;
    document.documentElement.dir = getDir(locale);
    document.documentElement.lang = locale;
  }, []);

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `!function(){var c=document.cookie.match(new RegExp("(?:^|;\\\\s*)${COOKIE_NAME}\\\\s*=\\\\s*([^;]*)"));if(c&&(c=c[1])&&["ar","fr"].includes(c)){document.documentElement.dir=c==="ar"?"rtl":"ltr";document.documentElement.lang=c}}()`,
      }}
    />
  );
}
