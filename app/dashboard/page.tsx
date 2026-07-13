import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { COOKIE_NAME, DEFAULT_LOCALE, isValidLocale } from '@/lib/i18n/config';
import { t, tRaw } from '@/lib/i18n/translations';
import type { LocaleCode } from '@/types';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(COOKIE_NAME)?.value;
  const locale: LocaleCode = localeCookie && isValidLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, factory_id, role')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  const { data: factory } = await supabase
    .from('factories')
    .select('name')
    .eq('id', profile.factory_id)
    .single();

  const { count: activeOrdersCount } = await supabase
    .from('work_orders')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'in_progress');

  const { data: pendingOrders } = await supabase
    .from('work_orders')
    .select('id, product_name, quantity, status, planned_start, planned_end')
    .in('status', ['pending', 'in_progress'])
    .order('planned_start', { ascending: true, nullsFirst: false })
    .limit(10);

  const { data: activeMachines } = await supabase
    .from('machines')
    .select('id, name, location, last_maintenance_date, maintenance_interval_days')
    .eq('is_active', true)
    .order('last_maintenance_date', { ascending: true, nullsFirst: true })
    .limit(10);

  const overdueCount = activeMachines?.filter((m) => {
    if (!m.last_maintenance_date) return false;
    const next = new Date(m.last_maintenance_date);
    next.setDate(next.getDate() + m.maintenance_interval_days);
    return next < new Date();
  }).length ?? 0;

  const activeOrdersCountValue = activeOrdersCount ?? 0;

  const machinesWithStatus = (activeMachines ?? []).map((m) => {
    let nextDate: Date | null = null;
    let status: 'overdue' | 'due_soon' | 'ok' = 'ok';

    if (m.last_maintenance_date) {
      nextDate = new Date(m.last_maintenance_date);
      nextDate.setDate(nextDate.getDate() + m.maintenance_interval_days);

      const now = new Date();
      if (nextDate < now) {
        status = 'overdue';
      } else {
        const daysUntil = Math.ceil((nextDate.getTime() - now.getTime()) / 86400000);
        if (daysUntil <= 7) status = 'due_soon';
      }
    }

    return {
      ...m,
      next_maintenance_date: nextDate?.toISOString().split('T')[0] ?? null,
      maintenance_status: status,
    };
  });

  const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    pending: { label: t('dashboard.status.pending', locale), color: 'text-yellow-700', dot: 'bg-yellow-500' },
    in_progress: { label: t('dashboard.status.inProgress', locale), color: 'text-orange-700', dot: 'bg-accent' },
    completed: { label: t('dashboard.status.completed', locale), color: 'text-success', dot: 'bg-success' },
    cancelled: { label: t('dashboard.status.cancelled', locale), color: 'text-gray-500', dot: 'bg-gray-400' },
  };

  const machineStatusConfig: Record<string, { label: string; color: string; dot: string }> = {
    overdue: { label: t('dashboard.due.overdue', locale), color: 'text-red-600', dot: 'bg-red-500' },
    due_soon: { label: t('dashboard.due.upcoming', locale), color: 'text-accent', dot: 'bg-accent' },
    ok: { label: t('dashboard.due.onTrack', locale), color: 'text-success', dot: 'bg-success' },
  };

  const userInitial = profile.full_name?.charAt(0) ?? 'م';

  return (
    <>
      <header className="flex items-center justify-between border-b border-primary/5 bg-white px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {userInitial}
          </div>
          <div>
            <p
              className="text-sm font-semibold text-primary"
              style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
            >
              {profile.full_name}
            </p>
            <p
              className="text-xs text-primary/40"
              style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
            >
              {factory?.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder={t('dashboard.searchPlaceholder', locale)}
              className="w-64 rounded-lg border border-primary/10 bg-background px-4 py-2 pr-10 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
              style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
            />
            <svg
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard
                title={t('dashboard.activeWorkOrders.title', locale)}
                value={activeOrdersCountValue}
                subtitle={t(activeOrdersCountValue > 0 ? 'dashboard.activeWorkOrders.needsAttention' : 'dashboard.activeWorkOrders.noOrders', locale)}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                valueColor="text-primary"
                borderColor="border-primary/10"
              />
              <StatCard
                title={t('dashboard.maintenanceAlerts.title', locale)}
                value={overdueCount}
                subtitle={overdueCount > 0 ? t('dashboard.maintenanceAlerts.needsAction', locale) : t('dashboard.maintenanceAlerts.allGood', locale)}
                icon={
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                }
                valueColor="text-accent"
                borderColor="border-accent/20"
                iconColor="text-accent"
              />
            </div>

            {/* Production Status + Activity */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <div className="rounded-xl border border-primary/5 bg-white">
                  <div className="flex items-center justify-between border-b border-primary/5 px-4 py-3 md:px-6 md:py-4">
                    <h2
                      className="text-base font-bold text-primary md:text-lg"
                      style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
                    >
                      {t('dashboard.productionLive.title', locale)}
                    </h2>
                    <a
                      href="/work-orders"
                      className="text-xs text-primary/50 transition-colors hover:text-primary/70 md:text-sm"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    >
                      {t('dashboard.productionLive.showAll', locale)}
                    </a>
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-primary/5 bg-primary/[0.02]">
                          <th
                            className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-primary/50"
                            style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                          >
                            {t('dashboard.productionLive.orderId', locale)}
                          </th>
                          <th
                            className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-primary/50"
                            style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                          >
                            {t('dashboard.productionLive.product', locale)}
                          </th>
                          <th
                            className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-primary/50"
                            style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                          >
                            {t('dashboard.productionLive.status', locale)}
                          </th>
                          <th
                            className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-primary/50"
                            style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                          >
                            {t('dashboard.productionLive.actions', locale)}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary/5">
                        {(pendingOrders ?? []).length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-6 py-12 text-center text-sm text-primary/30"
                              style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                            >
                              {t('dashboard.productionLive.empty', locale)}
                            </td>
                          </tr>
                        ) : (
                          (pendingOrders ?? []).map((order) => {
                            const st = statusConfig[order.status] ?? statusConfig.pending;
                            return (
                              <tr key={order.id} className="transition-colors hover:bg-primary/[0.01]">
                                <td
                                  className="px-6 py-3.5 text-sm font-medium text-primary"
                                  style={{ fontFamily: 'var(--font-mono)' }}
                                >
                                  WO-{order.id.slice(0, 4).toUpperCase()}
                                </td>
                                <td
                                  className="px-6 py-3.5 text-sm text-ink"
                                  style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                                >
                                  {order.product_name}
                                </td>
                                <td className="px-6 py-3.5">
                                  <span className="inline-flex items-center gap-2 text-sm" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                                    <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                                    <span className={st.color}>{st.label}</span>
                                  </span>
                                </td>
                                <td className="px-6 py-3.5">
                                  <button className="text-primary/30 transition-colors hover:text-primary/60">
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                      <circle cx="12" cy="5" r="1.5" />
                                      <circle cx="12" cy="12" r="1.5" />
                                      <circle cx="12" cy="19" r="1.5" />
                                    </svg>
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="divide-y divide-primary/5 md:hidden">
                    {(pendingOrders ?? []).length === 0 ? (
                      <div className="px-4 py-12 text-center text-sm text-primary/30"
                        style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                      >
                        {t('dashboard.productionLive.empty', locale)}
                      </div>
                    ) : (
                      (pendingOrders ?? []).map((order) => {
                        const st = statusConfig[order.status] ?? statusConfig.pending;
                        return (
                          <div key={order.id} className="px-4 py-3">
                            <div className="flex items-center justify-between">
                              <span
                                className="text-base font-bold text-primary"
                                style={{ fontFamily: 'var(--font-mono)' }}
                              >
                                WO-{order.id.slice(0, 4).toUpperCase()}
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-xs" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                                <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                                <span className={st.color}>{st.label}</span>
                              </span>
                            </div>
                            <p
                              className="mt-1 text-sm text-ink"
                              style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                            >
                              {order.product_name}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <div className="xl:col-span-1">
                <div className="rounded-xl border border-primary/5 bg-white">
                  <div className="border-b border-primary/5 px-4 py-3 md:px-6 md:py-4">
                    <h2
                      className="text-base font-bold text-primary md:text-lg"
                      style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
                    >
                      {t('dashboard.recentActivity.title', locale)}
                    </h2>
                  </div>
                  <div className="divide-y divide-primary/5">
                    {(pendingOrders ?? []).slice(0, 4).map((order) => {
                      const timeAgo = order.planned_start
                        ? getTimeAgo(order.planned_start, locale)
                        : t('dashboard.recentActivity.justNow', locale);
                      return (
                        <div key={order.id} className="px-4 py-3 md:px-6 md:py-4">
                          <p
                            className="text-sm font-semibold text-primary"
                            style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                          >
                            {order.status === 'completed'
                              ? `${t('dashboard.recentActivity.completedOrder', locale)} WO-${order.id.slice(0, 4).toUpperCase()}`
                              : order.status === 'in_progress'
                                ? `${t('dashboard.recentActivity.inProgressOrder', locale)} WO-${order.id.slice(0, 4).toUpperCase()}`
                                : `${t('dashboard.recentActivity.newOrder', locale)} WO-${order.id.slice(0, 4).toUpperCase()}`}
                          </p>
                          <p
                            className="mt-1 text-xs text-primary/40"
                            style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                          >
                            {timeAgo} · {order.product_name}
                          </p>
                        </div>
                      );
                    })}
                    {(pendingOrders ?? []).length === 0 && (
                      <div className="px-4 py-8 text-center text-sm text-primary/30 md:px-6"
                        style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                      >
                        {t('dashboard.recentActivity.empty', locale)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Machine Status */}
            <div className="rounded-xl border border-primary/5 bg-white">
              <div className="flex items-center justify-between border-b border-primary/5 px-4 py-3 md:px-6 md:py-4">
                <h2
                  className="text-base font-bold text-primary md:text-lg"
                  style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
                >
                  {t('dashboard.machines.title', locale)}
                </h2>
                <a
                  href="/maintenance"
                  className="text-xs text-primary/50 transition-colors hover:text-primary/70 md:text-sm"
                  style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                >
                  {t('dashboard.machines.showAll', locale)}
                </a>
              </div>

              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/5 bg-primary/[0.02]">
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-primary/50"
                        style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                      >
                        {t('dashboard.machines.name', locale)}
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-primary/50"
                        style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                      >
                        {t('dashboard.machines.lastMaintenance', locale)}
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-primary/50"
                        style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                      >
                        {t('dashboard.machines.nextMaintenance', locale)}
                      </th>
                      <th
                        className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-primary/50"
                        style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                      >
                        {t('dashboard.machines.status', locale)}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {machinesWithStatus.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-12 text-center text-sm text-primary/30"
                          style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                        >
                          {t('dashboard.machines.empty', locale)}
                        </td>
                      </tr>
                    ) : (
                      machinesWithStatus.map((machine) => {
                        const st = machineStatusConfig[machine.maintenance_status];
                        return (
                          <tr key={machine.id} className="transition-colors hover:bg-primary/[0.01]">
                            <td
                              className="px-6 py-3.5 text-sm font-medium text-primary"
                              style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                            >
                              {machine.name}
                            </td>
                            <td
                              className="px-6 py-3.5 text-sm text-ink/60"
                              style={{ fontFamily: 'var(--font-mono)' }}
                            >
                              {machine.last_maintenance_date ?? '—'}
                            </td>
                            <td
                              className="px-6 py-3.5 text-sm text-ink/60"
                              style={{ fontFamily: 'var(--font-mono)' }}
                            >
                              {machine.next_maintenance_date ?? '—'}
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="inline-flex items-center gap-2 text-sm" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                                <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                                <span className={st.color}>{st.label}</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-primary/5 md:hidden">
                {machinesWithStatus.length === 0 ? (
                  <div className="px-4 py-12 text-center text-sm text-primary/30"
                    style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                  >
                    {t('dashboard.machines.empty', locale)}
                  </div>
                ) : (
                  machinesWithStatus.map((machine) => {
                    const st = machineStatusConfig[machine.maintenance_status];
                    return (
                      <div key={machine.id} className="px-4 py-3">
                        <div className="flex items-center justify-between">
                          <span
                            className="text-sm font-medium text-primary"
                            style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                          >
                            {machine.name}
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-xs" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                            <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                            <span className={st.color}>{st.label}</span>
                          </span>
                        </div>
                        <div className="mt-1 flex gap-4 text-xs text-ink/60">
                          <span style={{ fontFamily: 'var(--font-mono)' }}>
                            {t('dashboard.machines.lastLabel', locale)} {machine.last_maintenance_date ?? '—'}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>
                            {t('dashboard.machines.nextLabel', locale)} {machine.next_maintenance_date ?? '—'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
      </main>
    </>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  valueColor = 'text-primary',
  borderColor = 'border-primary/10',
  iconColor = 'text-primary/40',
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  valueColor?: string;
  borderColor?: string;
  iconColor?: string;
}) {
  return (
    <div className={`rounded-xl border ${borderColor} bg-white p-4 sm:p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-xs font-medium text-primary/50 sm:text-sm"
            style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
          >
            {title}
          </p>
          <p
            className={`mt-3 text-4xl font-bold tracking-tight sm:text-5xl ${valueColor}`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {String(value).padStart(2, '0')}
          </p>
          <p
            className="mt-2 text-xs text-primary/40 sm:text-sm"
            style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
          >
            {subtitle}
          </p>
        </div>
        <div className={`${iconColor}`}>{icon}</div>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string, locale: LocaleCode): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return t('dashboard.time.now', locale);
  if (diffMin < 60) return tRaw('dashboard.time.minutesAgo', locale, { n: diffMin });
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return tRaw('dashboard.time.hoursAgo', locale, { n: diffH });
  const diffD = Math.floor(diffH / 24);
  return tRaw('dashboard.time.daysAgo', locale, { n: diffD });
}
