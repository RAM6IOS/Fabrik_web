'use client';

import { LocaleProvider } from '@/lib/i18n/context';
import type { LocaleCode } from '@/types';

export default function PublicLocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: LocaleCode;
  children: React.ReactNode;
}) {
  return <LocaleProvider initialLocale={initialLocale}>{children}</LocaleProvider>;
}
