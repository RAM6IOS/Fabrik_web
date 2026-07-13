'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from '@/lib/i18n/context';
import { t } from '@/lib/i18n/translations';

interface Material {
  id: string;
  name: string;
  sku: string;
  unit: string;
  current_balance: number;
  reorder_point: number;
  default_supplier_id: string | null;
  supplier_name: string | null;
}

interface Supplier {
  id: string;
  name: string;
}

interface MaterialsClientProps {
  initialMaterials: Material[];
  suppliers: Supplier[];
  userRole: string;
  userName: string;
  factoryId: string;
}

const emptyForm = {
  name: '',
  sku: '',
  unit: '',
  current_balance: '',
  reorder_point: '',
  default_supplier_id: '',
};

export default function MaterialsClient({
  initialMaterials,
  suppliers,
  userRole,
  userName,
  factoryId,
}: MaterialsClientProps) {
  const { locale } = useLocale();

  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOwner = userRole === 'owner';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = useCallback(() => {
    setEditingMaterial(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
  }, []);

  const openEditForm = useCallback((material: Material) => {
    setEditingMaterial(material);
    setForm({
      name: material.name,
      sku: material.sku,
      unit: material.unit,
      current_balance: material.current_balance.toString(),
      reorder_point: material.reorder_point.toString(),
      default_supplier_id: material.default_supplier_id ?? '',
    });
    setShowForm(true);
    setError(null);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingMaterial(null);
    setForm(emptyForm);
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!form.name.trim() || !form.sku.trim() || !form.unit.trim()) {
      setError(t('materials.errors.required', locale));
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const payload = {
      factory_id: factoryId,
      name: form.name.trim(),
      sku: form.sku.trim(),
      unit: form.unit.trim(),
      current_balance: form.current_balance ? parseFloat(form.current_balance) : 0,
      reorder_point: form.reorder_point ? parseFloat(form.reorder_point) : 0,
      default_supplier_id: form.default_supplier_id || null,
    };

    if (editingMaterial) {
      const { data, error: updateError } = await supabase
        .from('raw_materials')
        .update(payload)
        .eq('id', editingMaterial.id)
        .select()
        .single();

      if (updateError) {
        setError(t('materials.errors.updateFailed', locale));
        setLoading(false);
        return;
      }

      const supplierName = suppliers.find((s) => s.id === data.default_supplier_id)?.name ?? null;
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === data.id ? { ...m, ...data, supplier_name: supplierName } : m
        )
      );
    } else {
      const { data, error: insertError } = await supabase
        .from('raw_materials')
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        setError(t('materials.errors.addFailed', locale));
        setLoading(false);
        return;
      }

      const supplierName = suppliers.find((s) => s.id === data.default_supplier_id)?.name ?? null;
      setMaterials((prev) => [...prev, { ...data, supplier_name: supplierName }]);
    }

    setLoading(false);
    closeForm();
  };

  const getStatus = (material: Material) => {
    if (material.current_balance <= 0) {
      return { label: t('materials.status.outOfStock', locale), color: 'text-red-600', dot: 'bg-red-500' };
    }
    if (material.current_balance <= material.reorder_point) {
      return { label: t('materials.status.low', locale), color: 'text-[#E8A33D]', dot: 'bg-[#E8A33D]' };
    }
    return { label: t('materials.status.available', locale), color: 'text-[#10b981]', dot: 'bg-[#10b981]' };
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
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary md:text-2xl" style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}>
              {t('materials.title', locale)}
            </h1>
            {isOwner && (
              <button
                onClick={openAddForm}
                className="flex items-center gap-2 rounded-lg bg-[#1e293b] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2d3a4f] md:px-4 md:py-2.5"
                style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="hidden sm:inline">{t('materials.addMaterial', locale)}</span>
                <span className="sm:hidden">{t('materials.add', locale)}</span>
              </button>
            )}
          </div>

          {/* Mobile Form */}
          {showForm && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white">
              <div className="flex items-center justify-between border-b border-primary/5 px-4 py-3">
                <h2 className="text-base font-bold text-primary" style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}>
                  {editingMaterial ? t('materials.editMaterial', locale) : t('materials.materialData', locale)}
                </h2>
                <button type="button" onClick={closeForm} className="text-primary/40 hover:text-primary/60">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.name', locale)}</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.sku', locale)}</label>
                    <input type="text" name="sku" value={form.sku} onChange={handleChange} required className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-mono)' }} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.unit', locale)}</label>
                    <input type="text" name="unit" value={form.unit} onChange={handleChange} required placeholder={t('materials.unitPlaceholder', locale)} className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.currentQuantity', locale)}</label>
                    <input type="number" name="current_balance" value={form.current_balance} onChange={handleChange} min="0" step="0.01" className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-mono)' }} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.minimumAlert', locale)}</label>
                    <input type="number" name="reorder_point" value={form.reorder_point} onChange={handleChange} min="0" step="0.01" className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-mono)' }} />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.defaultSupplier', locale)}</label>
                  <select name="default_supplier_id" value={form.default_supplier_id} onChange={handleChange} className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                    <option value="">{t('materials.noSupplier', locale)}</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2d3a4f] disabled:opacity-50" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                    {loading ? t('materials.submitSaving', locale) : t('materials.submitSave', locale)}
                  </button>
                  <button type="button" onClick={closeForm} className="rounded-lg border border-primary/10 px-4 py-2.5 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                    {t('common.cancel', locale)}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {materials.length === 0 ? (
              <div className="rounded-xl border border-primary/5 bg-white px-4 py-12 text-center text-sm text-primary/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                {t('materials.empty', locale)}
              </div>
            ) : (
              materials.map((material) => {
                const status = getStatus(material);
                return (
                  <div key={material.id} className="rounded-xl border border-primary/5 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                          {material.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-primary/40" style={{ fontFamily: 'var(--font-mono)' }}>
                          {material.sku}
                        </p>
                        <div className="mt-2 space-y-1 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                          <p>{t('materials.unitLabel', locale)} {material.unit}</p>
                          <p>{t('materials.quantityLabel', locale)} {material.current_balance}</p>
                          <p>{t('materials.minimumLabel', locale)} {material.reorder_point}</p>
                          {material.supplier_name && <p>{t('materials.supplierLabel', locale)} {material.supplier_name}</p>}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                        <span className={status.color}>{status.label}</span>
                      </span>
                    </div>
                    {isOwner && (
                      <div className="mt-3 flex gap-2 border-t border-primary/5 pt-3">
                        <button onClick={() => openEditForm(material)} className="flex-1 rounded-lg border border-primary/10 px-3 py-2 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                          {t('common.edit', locale)}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block">
            <div className="rounded-xl border border-primary/5 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-primary/5 bg-[#1e293b]">
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.table.name', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.table.sku', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.table.unit', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.table.quantity', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.table.minimum', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.table.supplier', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.table.status', locale)}</th>
                      {isOwner && (
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.table.actions', locale)}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {materials.length === 0 ? (
                      <tr>
                        <td colSpan={isOwner ? 8 : 7} className="px-6 py-12 text-center text-sm text-primary/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                          {t('materials.empty', locale)}
                        </td>
                      </tr>
                    ) : (
                      materials.map((material) => {
                        const status = getStatus(material);
                        return (
                          <tr key={material.id} className="transition-colors hover:bg-primary/[0.01]">
                            <td className="px-6 py-3.5 text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                              {material.name}
                            </td>
                            <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-mono)' }}>
                              {material.sku}
                            </td>
                            <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                              {material.unit}
                            </td>
                            <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-mono)' }}>
                              {material.current_balance}
                            </td>
                            <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-mono)' }}>
                              {material.reorder_point}
                            </td>
                            <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                              {material.supplier_name ?? '—'}
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="inline-flex items-center gap-2 text-sm" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                                <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                                <span className={status.color}>{status.label}</span>
                              </span>
                            </td>
                            {isOwner && (
                              <td className="px-6 py-3.5">
                                <button onClick={() => openEditForm(material)} className="text-primary/30 transition-colors hover:text-primary/60" title={t('materials.editTooltip', locale)}>
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                  </svg>
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Desktop Side Panel Overlay */}
          {showForm && (
            <div className="hidden md:block">
              <div className="fixed inset-0 z-50 bg-black/40" onClick={closeForm} />
              <div className="fixed inset-y-0 right-0 z-50 w-80 overflow-y-auto border-l border-primary/5 bg-white shadow-xl">
                <div className="border-b border-primary/5 px-4 py-3">
                  <h2 className="text-base font-bold text-primary" style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}>
                    {editingMaterial ? t('materials.editMaterial', locale) : t('materials.materialData', locale)}
                  </h2>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.name', locale)}</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.sku', locale)}</label>
                    <input type="text" name="sku" value={form.sku} onChange={handleChange} required className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-mono)' }} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.unit', locale)}</label>
                    <input type="text" name="unit" value={form.unit} onChange={handleChange} required placeholder={t('materials.unitPlaceholder', locale)} className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.currentQuantity', locale)}</label>
                    <input type="number" name="current_balance" value={form.current_balance} onChange={handleChange} min="0" step="0.01" className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-mono)' }} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.minimumAlert', locale)}</label>
                    <input type="number" name="reorder_point" value={form.reorder_point} onChange={handleChange} min="0" step="0.01" className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-mono)' }} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('materials.defaultSupplier', locale)}</label>
                    <select name="default_supplier_id" value={form.default_supplier_id} onChange={handleChange} className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      <option value="">{t('materials.noSupplier', locale)}</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2d3a4f] disabled:opacity-50" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {loading ? t('materials.submitSaving', locale) : t('materials.submitSave', locale)}
                    </button>
                    <button type="button" onClick={closeForm} className="rounded-lg border border-primary/10 px-4 py-2.5 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {t('common.cancel', locale)}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
