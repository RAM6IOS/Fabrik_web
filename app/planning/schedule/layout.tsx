import { cookies } from 'next/headers';
import AuthShell from '@/components/AuthShell';
import { COOKIE_NAME, DEFAULT_LOCALE, isValidLocale } from '@/lib/i18n/config';

export default async function ScheduleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(COOKIE_NAME)?.value;
  const initialLocale = localeCookie && isValidLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE;

  return (
    <AuthShell initialLocale={initialLocale}>
      {children}
    </AuthShell>
  );
}
