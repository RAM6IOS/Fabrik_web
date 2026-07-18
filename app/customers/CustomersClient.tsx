'use client';

import { useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from '@/lib/i18n/context';
import { t } from '@/lib/i18n/translations';
import Alert from '@/components/Alert';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Customer {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  order_count: number;
}

interface CustomerOrder {
  id: string;
  customer_name: string;
  product_name: string | null;
  quantity: number;
  status: string;
  due_date: string | null;
  total_amount: number;
}

interface CustomersClientProps {
  initialCustomers: Customer[];
  userRole: string;
  userName: string;
  factoryId: string;
}

const emptyForm = {
  full_name: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

export default function CustomersClient({
  initialCustomers,
  userRole,
  userName,
  factoryId,
}: CustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { locale } = useLocale();

  const isOwner = userRole === 'owner';

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.full_name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = useCallback(() => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
  }, []);

  const openEditForm = useCallback((customer: Customer) => {
    setEditingCustomer(customer);
    setForm({
      full_name: customer.full_name,
      phone: customer.phone ?? '',
      email: customer.email ?? '',
      address: customer.address ?? '',
      notes: customer.notes ?? '',
    });
    setShowForm(true);
    setError(null);
  }, []);

  const openDetails = useCallback(async (customer: Customer) => {
    setViewingCustomer(customer);
    setLoadingOrders(true);
    setCustomerOrders([]);

    const supabase = createClient();

    // Fetch orders where customer_id matches, or customer_name matches (for backward compatibility)
    const { data: ordersByCustomerId } = await supabase
      .from('orders')
      .select('id, customer_name, quantity, status, due_date, total_amount, product_id')
      .eq('customer_id', customer.id);

    const { data: ordersByName } = await supabase
      .from('orders')
      .select('id, customer_name, quantity, status, due_date, total_amount, product_id')
      .eq('customer_name', customer.full_name)
      .is('customer_id', null);

    const allOrders = [...(ordersByCustomerId ?? []), ...(ordersByName ?? [])];
    const uniqueOrders = Array.from(new Map(allOrders.map((o) => [o.id, o])).values());

    // Fetch product names
    const productIds = uniqueOrders.map((o) => o.product_id).filter(Boolean);
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);

    const productMap = new Map((products ?? []).map((p) => [p.id, p.name]));

    const enrichedOrders = uniqueOrders.map((o) => ({
      id: o.id,
      customer_name: o.customer_name,
      product_name: productMap.get(o.product_id) ?? null,
      quantity: o.quantity,
      status: o.status,
      due_date: o.due_date,
      total_amount: Number(o.total_amount),
    }));

    setCustomerOrders(enrichedOrders);
    setLoadingOrders(false);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingCustomer(null);
    setForm(emptyForm);
    setError(null);
  }, []);

  const closeDetails = useCallback(() => {
    setViewingCustomer(null);
    setCustomerOrders([]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!form.full_name.trim()) {
      setError(t('customers.errors.nameRequired', locale));
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const payload = {
      factory_id: factoryId,
      full_name: form.full_name.trim(),
      phone: form.phone.trim() || null,
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
    };

    if (editingCustomer) {
      const { data, error: updateError } = await supabase
        .from('customers')
        .update(payload)
        .eq('id', editingCustomer.id)
        .select()
        .single();

      if (updateError) {
        setError(t('customers.errors.updateFailed', locale));
        setLoading(false);
        return;
      }

      setCustomers((prev) =>
        prev.map((c) => (c.id === data.id ? { ...c, ...data } : c))
      );
    } else {
      const { data, error: insertError } = await supabase
        .from('customers')
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        setError(t('customers.errors.addFailed', locale));
        setLoading(false);
        return;
      }

      setCustomers((prev) => [{ ...data, order_count: 0 }, ...prev]);
    }

    setLoading(false);
    closeForm();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from('customers')
      .delete()
      .eq('id', deleteTarget.id);

    if (deleteError) {
      setDeleting(false);
      setDeleteTarget(null);
      return;
    }

    setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === 'ar' ? 'ar-DZ' : 'fr-FR', {
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
            <p
              className="text-sm font-semibold text-primary"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {userName}
            </p>
            <p
              className="text-xs text-primary/40"
              style={{ fontFamily: 'var(--font-body)' }}
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
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {t('customers.title', locale)}
            </h1>
            {isOwner && (
              <button
                onClick={openAddForm}
                className="flex items-center gap-2 rounded-lg bg-[#1e293b] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2d3a4f] md:px-4 md:py-2.5"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span className="hidden sm:inline">{t('customers.addCustomer', locale)}</span>
                <span className="sm:hidden">{t('customers.add', locale)}</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <svg
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('customers.searchPlaceholder', locale)}
              className="w-full rounded-lg border border-primary/10 bg-white py-2.5 pr-10 pl-3 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
              style={{ fontFamily: 'var(--font-body)' }}
            />
          </div>

          {/* Mobile Form */}
          {showForm && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white">
              <div className="flex items-center justify-between border-b border-primary/5 px-4 py-3">
                <h2
                  className="text-base font-bold text-primary"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {editingCustomer ? t('customers.editCustomer', locale) : t('customers.customerData', locale)}
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
                  <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                    {t('customers.fullName', locale)}
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                    {t('customers.phone', locale)}
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                    {t('customers.email', locale)}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                    {t('customers.address', locale)}
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                    {t('customers.notes', locale)}
                  </label>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-lg bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2d3a4f] disabled:opacity-50"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {loading ? t('customers.submitSaving', locale) : t('customers.submitSave', locale)}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="rounded-lg border border-primary/10 px-4 py-2.5 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    {t('common.cancel', locale)}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mobile Details View */}
          {viewingCustomer && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white">
              <div className="flex items-center justify-between border-b border-primary/5 px-4 py-3">
                <h2
                  className="text-base font-bold text-primary"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {t('customers.customerDetails', locale)}
                </h2>
                <button
                  type="button"
                  onClick={closeDetails}
                  className="text-primary/40 hover:text-primary/60"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="rounded-xl border border-primary/5 bg-white p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                      {viewingCustomer.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3
                        className="text-lg font-bold text-primary"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {viewingCustomer.full_name}
                      </h3>
                      <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body)' }}>
                        {t('customers.registeredOn', locale)} {formatDate(viewingCustomer.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-primary/5 bg-white p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                    {t('customers.contactInfo', locale)}
                  </h4>
                  <div className="space-y-2 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body)' }}>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                      </svg>
                      <span>{viewingCustomer.phone ?? '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      <span>{viewingCustomer.email ?? '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span>{viewingCustomer.address ?? '—'}</span>
                    </div>
                  </div>
                </div>

                {viewingCustomer.notes && (
                  <div className="rounded-xl border border-primary/5 bg-white p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                      {t('customers.notesLabel', locale)}
                    </h4>
                    <p className="text-sm text-ink/60" style={{ fontFamily: 'var(--font-body)' }}>
                      {viewingCustomer.notes}
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-primary/5 bg-white p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                    {t('customers.customerOrders', locale)}
                  </h4>
                  {loadingOrders ? (
                    <p className="text-sm text-primary/40" style={{ fontFamily: 'var(--font-body)' }}>
                      {t('common.loading', locale)}
                    </p>
                  ) : customerOrders.length === 0 ? (
                    <p className="text-sm text-primary/40" style={{ fontFamily: 'var(--font-body)' }}>
                      {t('customers.noOrders', locale)}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {customerOrders.map((order) => (
                        <div key={order.id} className="rounded-lg border border-primary/5 bg-background/50 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body)' }}>
                              {order.product_name ?? '—'}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-xs text-ink/60" style={{ fontFamily: 'var(--font-body)' }}>
                            <span>{t('customers.orderQuantity', locale)}: {order.quantity}</span>
                            <span>{t('customers.orderStatus', locale)}: {order.status}</span>
                          </div>
                          {order.due_date && (
                            <p className="mt-1 text-xs text-primary/40" style={{ fontFamily: 'var(--font-body)' }}>
                              {t('customers.orderDueDate', locale)}: {formatDate(order.due_date)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {filteredCustomers.length === 0 ? (
              <div className="rounded-xl border border-primary/5 bg-white px-4 py-12 text-center text-sm text-primary/30" style={{ fontFamily: 'var(--font-body)' }}>
                {searchQuery ? t('customers.noResults', locale) : t('customers.empty', locale)}
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <div key={customer.id} className="rounded-xl border border-primary/5 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {customer.full_name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-base font-semibold text-primary truncate"
                          style={{ fontFamily: 'var(--font-body)' }}
                        >
                          {customer.full_name}
                        </h3>
                        <div className="mt-1 space-y-0.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body)' }}>
                          <p>{customer.phone ?? '—'}</p>
                          <p className="text-xs text-primary/30">{customer.order_count} {t('customers.orders', locale)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {isOwner && (
                    <div className="mt-3 flex gap-2 border-t border-primary/5 pt-3">
                      <button
                        onClick={() => openDetails(customer)}
                        className="flex-1 rounded-lg border border-primary/10 px-3 py-2 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {t('customers.details', locale)}
                      </button>
                      <button
                        onClick={() => openEditForm(customer)}
                        className="flex-1 rounded-lg border border-primary/10 px-3 py-2 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {t('common.edit', locale)}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(customer)}
                        className="flex-1 rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        {t('common.delete', locale)}
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
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>
                        {t('customers.table.name', locale)}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>
                        {t('customers.table.phone', locale)}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>
                        {t('customers.table.email', locale)}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>
                        {t('customers.table.orders', locale)}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>
                        {t('customers.table.registered', locale)}
                      </th>
                      {isOwner && (
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>
                          {t('customers.table.actions', locale)}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={isOwner ? 6 : 5} className="px-6 py-12 text-center text-sm text-primary/30" style={{ fontFamily: 'var(--font-body)' }}>
                          {searchQuery ? t('customers.noResults', locale) : t('customers.empty', locale)}
                        </td>
                      </tr>
                    ) : (
                      filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="transition-colors hover:bg-primary/[0.01]">
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {customer.full_name.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                                {customer.full_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body)' }}>
                            {customer.phone ?? '—'}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body)' }}>
                            {customer.email ?? '—'}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body)' }}>
                            {customer.order_count}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body)' }}>
                            {formatDate(customer.created_at)}
                          </td>
                          {isOwner && (
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openDetails(customer)}
                                  className="text-primary/30 transition-colors hover:text-primary/60"
                                  title={t('customers.details', locale)}
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => openEditForm(customer)}
                                  className="text-primary/30 transition-colors hover:text-primary/60"
                                  title={t('common.edit', locale)}
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(customer)}
                                  className="text-red-400 transition-colors hover:text-red-600"
                                  title={t('common.delete', locale)}
                                >
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                  </svg>
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

          {/* Desktop Side Panel - Form */}
          {showForm && (
            <div className="hidden md:block">
              <div className="fixed inset-0 z-50 bg-black/40" onClick={closeForm} />
              <div className="fixed inset-y-0 right-0 z-50 w-80 overflow-y-auto border-l border-primary/5 bg-white shadow-xl">
                <div className="border-b border-primary/5 px-4 py-3">
                  <h2
                    className="text-base font-bold text-primary"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {editingCustomer ? t('customers.editCustomer', locale) : t('customers.customerData', locale)}
                  </h2>
                </div>
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600" style={{ fontFamily: 'var(--font-body)' }}>
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                      {t('customers.fullName', locale)}
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                      style={{ fontFamily: 'var(--font-body)' }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                      {t('customers.phone', locale)}
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                      style={{ fontFamily: 'var(--font-body)' }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                      {t('customers.email', locale)}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                      style={{ fontFamily: 'var(--font-body)' }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                      {t('customers.address', locale)}
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                      style={{ fontFamily: 'var(--font-body)' }}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                      {t('customers.notes', locale)}
                    </label>
                    <textarea
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
                      style={{ fontFamily: 'var(--font-body)' }}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 rounded-lg bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2d3a4f] disabled:opacity-50"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {loading ? t('customers.submitSaving', locale) : t('customers.submitSave', locale)}
                    </button>
                    <button
                      type="button"
                      onClick={closeForm}
                      className="rounded-lg border border-primary/10 px-4 py-2.5 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5"
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      {t('common.cancel', locale)}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Desktop Details View */}
          {viewingCustomer && (
            <div className="hidden md:block">
              <div className="fixed inset-0 z-50 bg-black/40" onClick={closeDetails} />
              <div className="fixed inset-y-0 right-0 z-50 w-96 overflow-y-auto border-l border-primary/5 bg-white shadow-xl">
                <div className="border-b border-primary/5 px-4 py-3 flex items-center justify-between">
                  <h2
                    className="text-base font-bold text-primary"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {t('customers.customerDetails', locale)}
                  </h2>
                  <button
                    onClick={closeDetails}
                    className="text-primary/40 hover:text-primary/60"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                      {viewingCustomer.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3
                        className="text-lg font-bold text-primary"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {viewingCustomer.full_name}
                      </h3>
                      <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body)' }}>
                        {t('customers.registeredOn', locale)} {formatDate(viewingCustomer.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="rounded-xl border border-primary/5 bg-background/50 p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                      {t('customers.contactInfo', locale)}
                    </h4>
                    <div className="space-y-2.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body)' }}>
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 shrink-0 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                        </svg>
                        <span>{viewingCustomer.phone ?? '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 shrink-0 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                        <span>{viewingCustomer.email ?? '—'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 shrink-0 text-primary/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <span>{viewingCustomer.address ?? '—'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {viewingCustomer.notes && (
                    <div className="rounded-xl border border-primary/5 bg-background/50 p-4 space-y-2">
                      <h4 className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                        {t('customers.notesLabel', locale)}
                      </h4>
                      <p className="text-sm text-ink/60 whitespace-pre-wrap" style={{ fontFamily: 'var(--font-body)' }}>
                        {viewingCustomer.notes}
                      </p>
                    </div>
                  )}

                  {/* Customer Orders */}
                  <div className="rounded-xl border border-primary/5 bg-background/50 p-4 space-y-3">
                    <h4 className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-body)' }}>
                      {t('customers.customerOrders', locale)}
                    </h4>
                    {loadingOrders ? (
                      <p className="text-sm text-primary/40" style={{ fontFamily: 'var(--font-body)' }}>
                        {t('common.loading', locale)}
                      </p>
                    ) : customerOrders.length === 0 ? (
                      <p className="text-sm text-primary/40" style={{ fontFamily: 'var(--font-body)' }}>
                        {t('customers.noOrders', locale)}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {customerOrders.map((order) => (
                          <div key={order.id} className="rounded-lg border border-primary/5 bg-white p-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                                #{order.id.slice(0, 8).toUpperCase()}
                              </span>
                              <span className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body)' }}>
                                {order.product_name ?? '—'}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-xs text-ink/60" style={{ fontFamily: 'var(--font-body)' }}>
                              <span>{t('customers.orderQuantity', locale)}: {order.quantity}</span>
                              <span>{t('customers.orderStatus', locale)}: {order.status}</span>
                            </div>
                            {order.due_date && (
                              <p className="mt-1 text-xs text-primary/40" style={{ fontFamily: 'var(--font-body)' }}>
                                {t('customers.orderDueDate', locale)}: {formatDate(order.due_date)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('customers.deleteConfirm', locale)}
        message={t('customers.deleteDescription', locale)}
        confirmLabel={t('common.delete', locale)}
        cancelLabel={t('common.cancel', locale)}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </>
  );
}
