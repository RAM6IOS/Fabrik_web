'use client';

import Sidebar from '@/components/Sidebar';
import { LocaleProvider, useLocale } from '@/lib/i18n/context';
import type { LocaleCode } from '@/types';

function ShellContent({ children }: { children: React.ReactNode }) {
  const { dir } = useLocale();

  return (
    <div className="flex h-screen bg-background" dir={dir}>
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export default function AuthShell({
  initialLocale,
  children,
}: {
  initialLocale: string;
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider initialLocale={initialLocale as LocaleCode}>
      <ShellContent>{children}</ShellContent>
    </LocaleProvider>
  );
}
