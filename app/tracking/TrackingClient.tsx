'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from '@/lib/i18n/context';
import { t } from '@/lib/i18n/translations';
import Alert from '@/components/Alert';

interface WorkOrder {
  id: string;
  product_name: string;
  product_id: string | null;
  quantity: number;
  status: string;
  planned_start: string | null;
  planned_end: string | null;
  order_id: string | null;
  formatted_order_id: string | null;
}

interface TrackingClientProps {
  initialWorkOrders: WorkOrder[];
  userRole: string;
  userName: string;
}

type StatusFilter = 'all' | 'pending' | 'in_progress' | 'completed';

export default function TrackingClient({
  initialWorkOrders,
  userRole,
  userName,
}: TrackingClientProps) {
  const { locale } = useLocale();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isOwner = userRole === 'owner';

  const statusConfig: Record<string, { label: string; color: string; dot: string; bg: string }> = {
    pending: {
      label: t('tracking.status.pending', locale),
      color: 'text-gray-600',
      dot: 'bg-gray-400',
      bg: 'bg-gray-100',
    },
    in_progress: {
      label: t('tracking.status.inProgress', locale),
      color: 'text-[#E8A33D]',
      dot: 'bg-[#E8A33D]',
      bg: 'bg-[#FEF3E2]',
    },
    completed: {
      label: t('tracking.status.completed', locale),
      color: 'text-[#10b981]',
      dot: 'bg-[#10b981]',
      bg: 'bg-[#ECFDF5]',
    },
  };

  const editableStatuses: StatusFilter[] = ['pending', 'in_progress', 'completed'];

  const getAvailableStatuses = (currentStatus: string): StatusFilter[] => {
    if (currentStatus === 'completed') return ['completed'];
    return ['pending', 'in_progress'];
  };

  const filteredWorkOrders = activeFilter === 'all'
    ? workOrders
    : workOrders.filter((wo) => wo.status === activeFilter);

  const updateStatus = useCallback(async (id: string, newStatus: string) => {
    setUpdatingId(id);
    setError(null);

    const supabase = createClient();

    const currentWo = workOrders.find((wo) => wo.id === id);
    if (currentWo?.status === 'completed') {
      setError(t('tracking.errors.updateFailed', locale));
      setUpdatingId(null);
      return;
    }

    // Use RPC for completed status (handles inventory deduction)
    // Use direct update for other status changes
    if (newStatus === 'completed') {
      const { error: rpcError } = await supabase.rpc('complete_work_order', {
        p_work_order_id: id,
      });

      if (rpcError) {
        setError(rpcError.message || t('tracking.errors.updateFailed', locale));
        setUpdatingId(null);
        return;
      }
    } else {
      const { error: updateError } = await supabase
        .from('work_orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (updateError) {
        setError(t('tracking.errors.updateFailed', locale));
        setUpdatingId(null);
        return;
      }
    }

    setWorkOrders((prev) =>
      prev.map((wo) => (wo.id === id ? { ...wo, status: newStatus } : wo))
    );
    setUpdatingId(null);
  }, [locale, workOrders]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="flex items-center justify-between border-b border-primary/5 bg-white px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {userName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
              {userName}
            </p>
            <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
              {isOwner ? t('role.owner', locale) : t('role.worker', locale)}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-xl font-bold text-primary md:text-2xl" style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}>
              {t('tracking.title', locale)}
            </h1>
            <p className="mt-1 text-sm text-primary/50" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
              {t('tracking.subtitle', locale)}
            </p>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-[#1e293b] text-white'
                  : 'bg-primary/5 text-primary/60 hover:bg-primary/10'
              }`}
              style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
            >
              {locale === 'ar' ? 'الكل' : 'Tout'}
            </button>
            {editableStatuses.map((status) => {
              const config = statusConfig[status];
              return (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeFilter === status
                      ? 'bg-[#1e293b] text-white'
                      : 'bg-primary/5 text-primary/60 hover:bg-primary/10'
                  }`}
                  style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                >
                  <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                  {config.label}
                </button>
              );
            })}
          </div>

{/* Error Message */}
{error && (
  <Alert type="error">
    {error}
  </Alert>
)}

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {filteredWorkOrders.length === 0 ? (
              <div className="rounded-xl border border-primary/5 bg-white px-4 py-12 text-center text-sm text-primary/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                {t('tracking.empty', locale)}
              </div>
            ) : (
              filteredWorkOrders.map((wo) => (
                <div key={wo.id} className="rounded-xl border border-primary/5 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {wo.product_name}
                      </h3>
                        <div className="mt-2 space-y-1 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                          <p>{t('tracking.table.quantity', locale)}: {wo.quantity}</p>
                          {wo.formatted_order_id && (
                            <p style={{ fontFamily: 'var(--font-mono)' }}>
                              {t('tracking.table.orderNumber', locale)}: {wo.formatted_order_id}
                            </p>
                          )}
                          {wo.planned_start && (
                            <p>{t('tracking.table.plannedStart', locale)}: {formatDate(wo.planned_start)}</p>
                          )}
                          {wo.planned_end && (
                            <p>{t('tracking.table.plannedEnd', locale)}: {formatDate(wo.planned_end)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 border-t border-primary/5 pt-3">
                      <select
                        value={wo.status}
                        onChange={(e) => updateStatus(wo.id, e.target.value)}
                        disabled={updatingId === wo.id || wo.status === 'completed'}
                        className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-50"
                        style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                      >
                        {getAvailableStatuses(wo.status).map((status) => {
                          const config = statusConfig[status];
                          return (
                            <option key={status} value={status}>{config.label}</option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <div className="rounded-xl border border-primary/5 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/5 bg-[#1e293b]">
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('tracking.table.product', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('tracking.table.quantity', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('tracking.table.status', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('tracking.table.plannedStart', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('tracking.table.plannedEnd', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('tracking.table.orderNumber', locale)}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {filteredWorkOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-primary/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                          {t('tracking.empty', locale)}
                        </td>
                      </tr>
                    ) : (
                      filteredWorkOrders.map((wo) => (
                          <tr key={wo.id} className="transition-colors hover:bg-primary/[0.01]">
                            <td className="px-6 py-3.5 text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                              {wo.product_name}
                            </td>
                            <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-mono)' }}>
                              {wo.quantity}
                            </td>
                            <td className="px-6 py-3.5">
                              <select
                                value={wo.status}
                                onChange={(e) => updateStatus(wo.id, e.target.value)}
                                disabled={updatingId === wo.id || wo.status === 'completed'}
                                className="rounded-lg border border-primary/10 bg-background px-2 py-1.5 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-50"
                                style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                              >
                                {getAvailableStatuses(wo.status).map((status) => {
                                  const config = statusConfig[status];
                                  return (
                                    <option key={status} value={status}>{config.label}</option>
                                  );
                                })}
                              </select>
                            </td>
                            <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-mono)' }}>
                              {formatDate(wo.planned_start)}
                            </td>
                            <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-mono)' }}>
                              {formatDate(wo.planned_end)}
                            </td>
                            <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-mono)' }}>
                              {wo.formatted_order_id ?? '—'}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
