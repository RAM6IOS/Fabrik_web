'use client';

import { useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { useLocale } from '@/lib/i18n/context';

interface AppLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export default function AppLayout({ children, pageTitle }: AppLayoutProps) {
  const { dir } = useLocale();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden bg-background" dir={dir}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 right-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
          md:static md:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
      >
        <Sidebar onClose={closeSidebar} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex items-center border-b border-primary/5 bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-primary/70 transition-colors hover:bg-primary/5"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          {pageTitle && (
            <span
              className="mr-3 text-lg font-bold text-primary"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {pageTitle}
            </span>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
