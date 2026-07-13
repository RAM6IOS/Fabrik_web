import { cookies } from 'next/headers';
import { COOKIE_NAME, DEFAULT_LOCALE, isValidLocale } from '@/lib/i18n/config';
import PublicLocaleProvider from '@/components/PublicLocaleProvider';
import type { LocaleCode } from '@/types';

export default async function SignupLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(COOKIE_NAME)?.value;
  const locale: LocaleCode = localeCookie && isValidLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE;

  return <PublicLocaleProvider initialLocale={locale}>{children}</PublicLocaleProvider>;
}
