'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from '@/lib/i18n/context';
import { t } from '@/lib/i18n/translations';

interface NavSubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  subItems?: NavSubItem[];
}

interface SidebarProps {
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  onClose?: () => void;
}

export default function Sidebar({ userName = 'أحمد المحمدي', userRole = 'مدير الإنتاج', userAvatar, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { locale } = useLocale();
  const [expandedItems, setExpandedItems] = useState<string[]>(['/planning']);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((item) => item !== href) : [...prev, href]
    );
  };

  const navItems: NavItem[] = [
    {
      label: t('sidebar.dashboard', locale),
      href: '/dashboard',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      ),
    },
    {
      label: t('sidebar.productionPlanning', locale),
      href: '/planning',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      subItems: [
        { label: t('sidebar.suppliers', locale), href: '/planning/suppliers' },
        { label: t('sidebar.rawMaterials', locale), href: '/planning/materials' },
        { label: t('sidebar.products', locale), href: '/planning/products' },
        { label: t('sidebar.orders', locale), href: '/planning/orders' },
        { label: t('sidebar.schedule', locale), href: '/planning/schedule' },
      ],
    },
    {
      label: t('sidebar.customers', locale),
      href: '/customers',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      label: t('sidebar.productionTracking', locale),
      href: '/tracking',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M21.015 4.657v4.992" />
        </svg>
      ),
    },
    {
      label: t('sidebar.machineMaintenance', locale),
      href: '/maintenance',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1m5.1 5.1L17.25 9m-5.83 6.17l5.1-5.1m-5.1 5.1L6 15.17m5.83-6.17l-5.1-5.1m5.1 5.1L12 3" />
        </svg>
      ),
    },
    {
      label: t('sidebar.userManagement', locale),
      href: '/users',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      label: t('sidebar.settings', locale),
      href: '/settings',
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const handleLogout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  }, []);

  return (
    <aside className="flex h-full w-64 flex-col bg-[#1A2332] text-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
          </div>
          <span
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {t('sidebar.brand', locale)}
          </span>
        </div>
        {/* Close button - mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white md:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-4">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white/70">
              {userName.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p
            className="truncate text-sm font-semibold text-white"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {userName}
          </p>
          <p
            className="truncate text-xs text-white/50"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            {userRole}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const expanded = expandedItems.includes(item.href);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <li key={item.href}>
                {hasSubItems ? (
                  <div>
                    <button
                      onClick={() => toggleExpand(item.href)}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-white/10 text-white'
                          : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                      }`}
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      <span className={active ? 'text-accent' : ''}>{item.icon}</span>
                      <span className="flex-1 text-right">{item.label}</span>
                      <svg
                        className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>
                    {expanded && (
                      <ul className="mr-4 mt-1 space-y-0.5 border-r-2 border-white/10 pr-3">
                        {item.subItems!.map((subItem) => {
                          const subActive = pathname === subItem.href;
                          return (
                            <li key={subItem.href}>
                  <Link
                    href={subItem.href}
                    onClick={onClose}
                    className={`block rounded-lg px-4 py-2 text-sm transition-colors ${
                                  subActive
                                    ? 'bg-white/10 text-white'
                                    : 'text-white/50 hover:bg-white/5 hover:text-white/70'
                                }`}
                                style={{ fontFamily: 'var(--font-body)' }}
                              >
                                {subItem.label}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                    }`}
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    <span className={active ? 'text-accent' : ''}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-white/10 px-3 py-4">
        <ul className="space-y-1">
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white/80"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              <span>{t('sidebar.technicalSupport', locale)}</span>
            </a>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white/80"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <span>{t('sidebar.logout', locale)}</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
