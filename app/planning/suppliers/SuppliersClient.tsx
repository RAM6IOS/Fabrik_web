'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from '@/lib/i18n/context';
import { t } from '@/lib/i18n/translations';
import Alert from '@/components/Alert';

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  contact_name: string | null;
  lead_time_days: number | null;
  minimum_order: number | null;
  is_active: boolean;
}

interface SuppliersClientProps {
  initialSuppliers: Supplier[];
  userRole: string;
  userName: string;
  factoryId: string;
}

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  contact_name: '',
  lead_time_days: '',
  minimum_order: '',
};

export default function SuppliersClient({
  initialSuppliers,
  userRole,
  userName,
  factoryId,
}: SuppliersClientProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { locale } = useLocale();

  const isOwner = userRole === 'owner';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = useCallback(() => {
    setEditingSupplier(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
  }, []);

  const openEditForm = useCallback((supplier: Supplier) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name,
      phone: supplier.phone ?? '',
      email: supplier.email ?? '',
      contact_name: supplier.contact_name ?? '',
      lead_time_days: supplier.lead_time_days?.toString() ?? '',
      minimum_order: supplier.minimum_order?.toString() ?? '',
    });
    setShowForm(true);
    setError(null);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingSupplier(null);
    setForm(emptyForm);
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!form.name.trim()) {
      setError(t('suppliers.errors.nameRequired', locale));
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const payload = {
      factory_id: factoryId,
      name: form.name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      contact_name: form.contact_name.trim() || null,
      lead_time_days: form.lead_time_days ? parseInt(form.lead_time_days, 10) : null,
      minimum_order: form.minimum_order ? parseInt(form.minimum_order, 10) : null,
    };

    if (editingSupplier) {
      const { data, error: updateError } = await supabase
        .from('suppliers')
        .update(payload)
        .eq('id', editingSupplier.id)
        .select()
        .single();

      if (updateError) {
        setError(t('suppliers.errors.updateFailed', locale));
        setLoading(false);
        return;
      }

      setSuppliers((prev) =>
        prev.map((s) => (s.id === data.id ? { ...s, ...data } : s))
      );
    } else {
      const { data, error: insertError } = await supabase
        .from('suppliers')
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        setError(t('suppliers.errors.addFailed', locale));
        setLoading(false);
        return;
      }

      setSuppliers((prev) => [...prev, data]);
    }

    setLoading(false);
    closeForm();
  };

  const toggleActive = async (supplier: Supplier) => {
    if (!isOwner) return;

    const supabase = createClient();
    const newActive = !supplier.is_active;

    const { error: updateError } = await supabase
      .from('suppliers')
      .update({ is_active: newActive })
      .eq('id', supplier.id);

    if (updateError) {
      return;
    }

    setSuppliers((prev) =>
      prev.map((s) => (s.id === supplier.id ? { ...s, is_active: newActive } : s))
    );
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
            <p
              className="text-sm font-semibold text-primary"
              style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
            >
              {userName}
            </p>
            <p
              className="text-xs text-primary/40"
              style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
            >
              {isOwner ? t('role.owner', locale) : t('role.worker', locale)}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-4 md:space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <h1
              className="text-xl font-bold text-primary md:text-2xl"
              style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
            >
               {t('suppliers.title', locale)}
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
                <span className="hidden sm:inline">{t('suppliers.addSupplier', locale)}</span>
                <span className="sm:hidden">{t('suppliers.add', locale)}</span>
              </button>
            )}
          </div>

          {/* Mobile Form */}
          {showForm && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white">
              <div className="flex items-center justify-between border-b border-primary/5 px-4 py-3">
                <h2
                  className="text-base font-bold text-primary"
                  style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
                >
                    {editingSupplier ? t('suppliers.editSupplier', locale) : t('suppliers.supplierData', locale)}
                </h2>
                <button
                  type="button"
                  onClick={closeForm}
                  className="text-primary/40 hover:text-primary/60"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-3">
{error && (
  <Alert type="error">
    {error}
  </Alert>
)}

                <div>
                  <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                    {t('suppliers.name', locale)}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                    style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                    {t('suppliers.phone', locale)}
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                    style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                    {t('suppliers.emailOptional', locale)}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                    style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {t('suppliers.supplyDuration', locale)}
                    </label>
                    <input
                      type="number"
                      name="lead_time_days"
                      value={form.lead_time_days}
                      onChange={handleChange}
                      min="0"
                      className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {t('suppliers.minimumOrder', locale)}
                    </label>
                    <input
                      type="number"
                      name="minimum_order"
                      value={form.minimum_order}
                      onChange={handleChange}
                      min="0"
                      className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2d3a4f] disabled:opacity-50"
                    style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                  >
                    {loading ? t('suppliers.submitSaving', locale) : t('suppliers.submitSave', locale)}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-lg border border-primary/10 px-4 py-2.5 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5"
                    style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                  >
                    {t('common.cancel', locale)}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {suppliers.length === 0 ? (
              <div className="rounded-xl border border-primary/5 bg-white px-4 py-12 text-center text-sm text-primary/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                          {t('suppliers.empty', locale)}
              </div>
            ) : (
              suppliers.map((supplier) => (
                <div key={supplier.id} className="rounded-xl border border-primary/5 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3
                        className="text-base font-semibold text-primary"
                        style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                      >
                        {supplier.name}
                      </h3>
                      <div className="mt-2 space-y-1 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        <p>{t('suppliers.phoneLabel', locale)} {supplier.phone ?? '—'}</p>
                        <p>{t('suppliers.supplyDurationLabel', locale)} {supplier.lead_time_days ? `${supplier.lead_time_days} ${t('common.days', locale)}` : '—'}</p>
                        <p>{t('suppliers.minimumOrderLabel', locale)} {supplier.minimum_order ?? '—'}</p>
                      </div>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 text-xs"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          supplier.is_active ? 'bg-[#10b981]' : 'bg-[#9ca3af]'
                        }`}
                      />
                      <span className={supplier.is_active ? 'text-[#10b981]' : 'text-[#9ca3af]'}>
                                {supplier.is_active ? t('suppliers.status.active', locale) : t('suppliers.status.inactive', locale)}
                      </span>
                    </span>
                  </div>
                  {isOwner && (
                    <div className="mt-3 flex gap-2 border-t border-primary/5 pt-3">
                      <button
                        onClick={() => openEditForm(supplier)}
                        className="flex-1 rounded-lg border border-primary/10 px-3 py-2 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5"
                        style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                      >
                        {t('common.edit', locale)}
                      </button>
                      <button
                        onClick={() => toggleActive(supplier)}
                        className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          supplier.is_active
                            ? 'border border-red-200 text-red-600 hover:bg-red-50'
                            : 'border border-[#10b981]/20 text-[#10b981] hover:bg-[#10b981]/5'
                        }`}
                        style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                      >
                        {supplier.is_active ? 'تعطيل' : 'تفعيل'}
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
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('suppliers.table.name', locale)}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('suppliers.table.phone', locale)}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('suppliers.table.supplyDuration', locale)}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('suppliers.table.minimumOrder', locale)}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('suppliers.table.status', locale)}
                      </th>
                      {isOwner && (
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                          {t('suppliers.table.actions', locale)}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {suppliers.length === 0 ? (
                      <tr>
                        <td colSpan={isOwner ? 6 : 5} className="px-6 py-12 text-center text-sm text-primary/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                {t('suppliers.empty', locale)}
                        </td>
                      </tr>
                    ) : (
                      suppliers.map((supplier) => (
                        <tr key={supplier.id} className="transition-colors hover:bg-primary/[0.01]">
                          <td className="px-6 py-3.5 text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                            {supplier.name}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                            {supplier.phone ?? '—'}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                            {supplier.lead_time_days ? `${supplier.lead_time_days} ${t('common.days', locale)}` : '—'}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                            {supplier.minimum_order ?? '—'}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="inline-flex items-center gap-2 text-sm" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                              <span className={`h-2 w-2 rounded-full ${supplier.is_active ? 'bg-[#10b981]' : 'bg-[#9ca3af]'}`} />
                              <span className={supplier.is_active ? 'text-[#10b981]' : 'text-[#9ca3af]'}>
                      {supplier.is_active ? t('suppliers.status.active', locale) : t('suppliers.status.inactive', locale)}
                              </span>
                            </span>
                          </td>
                          {isOwner && (
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openEditForm(supplier)}
                                  className="text-primary/30 transition-colors hover:text-primary/60"
                                  title={t('common.edit', locale)}
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => toggleActive(supplier)}
                                  className={`transition-colors ${supplier.is_active ? 'text-red-400 hover:text-red-600' : 'text-[#10b981] hover:text-[#059669]'}`}
                                  title={supplier.is_active ? 'تعطيل' : 'تفعيل'}
                                >
                                  {supplier.is_active ? (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                  ) : (
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  )}
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

          {/* Desktop Side Panel Overlay */}
          {showForm && (
            <div className="hidden md:block">
              <div className="fixed inset-0 z-50 bg-black/40" onClick={closeForm} />
              <div className="fixed inset-y-0 right-0 z-50 w-80 overflow-y-auto border-l border-primary/5 bg-white shadow-xl">
                <div className="border-b border-primary/5 px-4 py-3">
                  <h2
                    className="text-base font-bold text-primary"
                    style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}
                  >
                  {editingSupplier ? t('suppliers.editSupplier', locale) : t('suppliers.supplierData', locale)}
                  </h2>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {t('suppliers.name', locale)}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {t('suppliers.phone', locale)}
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {t('suppliers.emailOptional', locale)}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {t('suppliers.supplyDuration', locale)}
                    </label>
                    <input
                      type="number"
                      name="lead_time_days"
                      value={form.lead_time_days}
                      onChange={handleChange}
                      min="0"
                      className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {t('suppliers.minimumOrderDesktop', locale)}
                    </label>
                    <input
                      type="number"
                      name="minimum_order"
                      value={form.minimum_order}
                      onChange={handleChange}
                      min="0"
                      className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-lg bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2d3a4f] disabled:opacity-50"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    >
                      {loading ? t('suppliers.submitSaving', locale) : t('suppliers.submitSave', locale)}
                    </button>
                    <button
                      type="button"
                      onClick={closeForm}
                      className="rounded-lg border border-primary/10 px-4 py-2.5 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5"
                      style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                    >
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
