'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from '@/lib/i18n/context';
import { t } from '@/lib/i18n/translations';

interface PurchaseSuggestion {
  raw_material_id: string;
  raw_material_name: string;
  unit: string;
  total_demand: number;
  current_balance: number;
  net_need: number;
  supplier_id: string | null;
  supplier_name: string;
  lead_time_days: number | null;
  order_date: string;
  is_urgent: boolean;
}

interface ScheduleClientProps {
  purchaseSuggestions: PurchaseSuggestion[];
  userRole: string;
  userName: string;
  factoryId: string;
}

export default function ScheduleClient({
  purchaseSuggestions: initialPurchase,
  userRole,
  userName,
  factoryId,
}: ScheduleClientProps) {
  const [purchaseSuggestions, setPurchaseSuggestions] = useState<PurchaseSuggestion[]>(initialPurchase);
  const { locale } = useLocale();

  const isOwner = userRole === 'owner';

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const approvePurchase = useCallback(async (suggestion: PurchaseSuggestion) => {
    if (!suggestion.supplier_id) return;
    const supabase = createClient();

    const { error } = await supabase.from('purchase_orders').insert({
      factory_id: factoryId,
      supplier_id: suggestion.supplier_id,
      raw_material_id: suggestion.raw_material_id,
      quantity: suggestion.net_need,
      unit_cost: 0,
      status: 'pending',
      order_date: suggestion.order_date,
      expected_delivery: null,
    });

    if (error) return;

    setPurchaseSuggestions((prev) =>
      prev.filter((s) => s.raw_material_id !== suggestion.raw_material_id)
    );
  }, [factoryId]);

  const dismissPurchase = useCallback((rawMaterialId: string) => {
    setPurchaseSuggestions((prev) =>
      prev.filter((s) => s.raw_material_id !== rawMaterialId)
    );
  }, []);

  return (
    <>
      {/* Mobile Header */}
      <header className="flex items-center justify-between border-b border-primary/5 bg-white px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {userName.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-body)' }}>
              {userName}
            </p>
            <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body)' }}>
              {isOwner ? t('role.owner', locale) : t('role.worker', locale)}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary md:text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
               {t('schedule.title', locale)}
            </h1>
          </div>

          {/* Section Title */}
          <div className="border-b border-primary/5 pb-3">
            <h2 className="text-sm font-medium text-primary/60" style={{ fontFamily: 'var(--font-body)' }}>
               {t('schedule.suggestedOrders', locale)}
              {purchaseSuggestions.length > 0 && (
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/10 text-xs text-accent">
                  {purchaseSuggestions.length}
                </span>
              )}
            </h2>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {purchaseSuggestions.length === 0 ? (
              <div className="rounded-xl border border-primary/5 bg-white px-4 py-12 text-center text-sm text-primary/30" style={{ fontFamily: 'var(--font-body)' }}>
                          {t('schedule.noOrders', locale)}
              </div>
            ) : (
              purchaseSuggestions.map((s) => (
                <div key={s.raw_material_id} className="rounded-xl border border-primary/5 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                          {s.raw_material_name}
                        </h3>
                        {s.is_urgent && (
                          <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600" style={{ fontFamily: 'var(--font-body)' }}>
                                {t('schedule.urgent', locale)}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body)' }}>
                        <p>{t('schedule.requiredQuantity', locale)} {s.net_need} {s.unit}</p>
                        <p>{t('schedule.currentStock', locale)} {s.current_balance} {s.unit}</p>
                        <p>{t('schedule.supplierLabel', locale)} {s.supplier_name}</p>
                        <p>{t('schedule.orderDate', locale)} {formatDate(s.order_date)}</p>
                      </div>
                    </div>
                  </div>
                  {isOwner && (
                    <div className="mt-3 flex gap-2 border-t border-primary/5 pt-3">
                      <button
                        onClick={() => approvePurchase(s)}
                        className="flex-1 rounded-lg bg-[#1e293b] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2d3a4f]"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {t('common.approve', locale)}
                      </button>
                      <button
                        onClick={() => dismissPurchase(s.raw_material_id)}
                        className="flex-1 rounded-lg border border-primary/10 px-3 py-2 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {t('common.postpone', locale)}
                      </button>
                    </div>
                  )}
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
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>{t('schedule.table.material', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>{t('schedule.table.requiredQuantity', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>{t('schedule.table.stock', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>{t('schedule.table.supplier', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>{t('schedule.table.supplyDuration', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>{t('schedule.table.orderDate', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>{t('schedule.table.status', locale)}</th>
                      {isOwner && (
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>{t('schedule.table.actions', locale)}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {purchaseSuggestions.length === 0 ? (
                      <tr>
                        <td colSpan={isOwner ? 8 : 7} className="px-6 py-12 text-center text-sm text-primary/30" style={{ fontFamily: 'var(--font-body)' }}>
                {t('schedule.noOrders', locale)}
                        </td>
                      </tr>
                    ) : (
                      purchaseSuggestions.map((s) => (
                        <tr key={s.raw_material_id} className="transition-colors hover:bg-primary/[0.01]">
                          <td className="px-6 py-3.5 text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                            {s.raw_material_name}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-mono)' }}>
                            {s.net_need} {s.unit}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-mono)' }}>
                            {s.current_balance} {s.unit}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body)' }}>
                            {s.supplier_name}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-mono)' }}>
                            {s.lead_time_days ? `${s.lead_time_days} ${t('common.days', locale)}` : '—'}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-mono)' }}>
                            {formatDate(s.order_date)}
                          </td>
                          <td className="px-6 py-3.5">
                            {s.is_urgent ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600" style={{ fontFamily: 'var(--font-body)' }}>
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            {t('schedule.urgent', locale)}
                              </span>
                            ) : (
                              <span className="text-sm text-primary/30" style={{ fontFamily: 'var(--font-body)' }}>—</span>
                            )}
                          </td>
                          {isOwner && (
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => approvePurchase(s)}
                                  className="rounded-lg bg-[#1e293b] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#2d3a4f]"
                                  style={{ fontFamily: 'var(--font-body)' }}
                                >
                                   {t('common.approve', locale)}
                                 </button>
                                 <button
                                   onClick={() => dismissPurchase(s.raw_material_id)}
                                   className="rounded-lg border border-primary/10 px-3 py-1.5 text-xs font-medium text-primary/60 transition-colors hover:bg-primary/5"
                                   style={{ fontFamily: 'var(--font-body)' }}
                                 >
                                   {t('common.postpone', locale)}
                                </button>
                              </div>
                            </td>
                          )}
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
