'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from '@/lib/i18n/context';
import { t } from '@/lib/i18n/translations';
import Alert from '@/components/Alert';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Order {
  id: string;
  customer_id: string | null;
  customer_name: string;
  due_date: string | null;
  status: string;
  total_amount: number;
  quantity: number;
  product_id: string;
  product_name: string | null;
}

interface Product {
  id: string;
  name: string;
}

interface Customer {
  id: string;
  full_name: string;
}

interface OrdersClientProps {
  initialOrders: Order[];
  products: Product[];
  customers: Customer[];
  userRole: string;
  userName: string;
  factoryId: string;
}

const emptyForm = {
  product_id: '',
  quantity: '',
  due_date: '',
  customer_id: '',
  customer_name: '',
};

const defaultStatus = 'draft';

export default function OrdersClient({
  initialOrders,
  products,
  customers,
  userRole,
  userName,
  factoryId,
}: OrdersClientProps) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [allCustomers, setAllCustomers] = useState<Customer[]>(customers);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [movingOrderId, setMovingOrderId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const { locale } = useLocale();

  const isOwner = userRole === 'owner';

  const frozenStatuses = ['processing', 'completed'];
  const isFrozen = (status: string) => frozenStatuses.includes(status);

  // Customer search/filter
  const filteredCustomers = allCustomers.filter((c) =>
    c.full_name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCustomerSelect = (customer: Customer) => {
    setForm((prev) => ({ ...prev, customer_id: customer.id, customer_name: customer.full_name }));
    setCustomerSearch(customer.full_name);
    setIsNewCustomer(false);
    setShowCustomerDropdown(false);
  };

  const handleCustomerSearchChange = (value: string) => {
    setCustomerSearch(value);
    setForm((prev) => ({ ...prev, customer_id: '', customer_name: value }));
    setIsNewCustomer(value.trim().length > 0 && !allCustomers.some((c) => c.full_name.toLowerCase() === value.toLowerCase()));
    setShowCustomerDropdown(true);
  };

  const handleCustomerInputFocus = () => {
    setShowCustomerDropdown(true);
  };

  const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
    'draft': { label: t('orders.status.draft', locale), color: 'text-yellow-600', dot: 'bg-yellow-500' },
    'processing': { label: t('orders.status.processing', locale), color: 'text-[#E8A33D]', dot: 'bg-[#E8A33D]' },
    'confirmed': { label: t('orders.status.confirmed', locale), color: 'text-[#10b981]', dot: 'bg-[#10b981]' },
  };

  const editableStatuses: Record<string, { label: string }> = {
    'draft': { label: t('orders.status.draft', locale) },
    'confirmed': { label: t('orders.status.confirmed', locale) },
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = useCallback(() => {
    setEditingOrder(null);
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
  }, []);

  const openEditForm = useCallback((order: Order) => {
    setEditingOrder(order);
    setForm({
      product_id: order.product_id,
      quantity: order.quantity.toString(),
      due_date: order.due_date ?? '',
      customer_id: order.customer_id ?? '',
      customer_name: order.customer_name,
    });
    setCustomerSearch(order.customer_name);
    setIsNewCustomer(!order.customer_id);
    setShowForm(true);
    setError(null);
  }, []);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingOrder(null);
    setForm(emptyForm);
    setCustomerSearch('');
    setIsNewCustomer(false);
    setShowCustomerDropdown(false);
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!form.product_id || !form.quantity || !form.customer_name.trim()) {
      setError(t('orders.errors.required', locale));
      setLoading(false);
      return;
    }

    const supabase = createClient();
    let customerId = form.customer_id || null;

    // If new customer, create them first
    if (isNewCustomer && form.customer_name.trim()) {
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          factory_id: factoryId,
          full_name: form.customer_name.trim(),
        })
        .select('id, full_name')
        .single();

      if (customerError) {
        setError(t('customers.errors.addFailed', locale));
        setLoading(false);
        return;
      }

      customerId = newCustomer.id;
      setAllCustomers((prev) => [...prev, newCustomer].sort((a, b) => a.full_name.localeCompare(b.full_name)));
    }

    const payload = {
      factory_id: factoryId,
      product_id: form.product_id,
      quantity: parseInt(form.quantity, 10),
      due_date: form.due_date || null,
      customer_id: customerId,
      customer_name: form.customer_name.trim(),
      status: editingOrder?.status ?? defaultStatus,
      total_amount: editingOrder?.total_amount ?? 0,
    };

    if (editingOrder) {
      const { data, error: updateError } = await supabase
        .from('orders')
        .update(payload)
        .eq('id', editingOrder.id)
        .select()
        .single();

      if (updateError) {
        setError(updateError.message || t('orders.errors.updateFailed', locale));
        setLoading(false);
        return;
      }

      const productName = products.find((p) => p.id === data.product_id)?.name ?? null;
      setOrders((prev) =>
        prev.map((o) => (o.id === data.id ? { ...o, ...data, product_name: productName } : o))
      );
    } else {
      const { data, error: insertError } = await supabase
        .from('orders')
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        setError(insertError.message || t('orders.errors.addFailed', locale));
        setLoading(false);
        return;
      }

      const productName = products.find((p) => p.id === data.product_id)?.name ?? null;
      setOrders((prev) => [{ ...data, product_name: productName }, ...prev]);
    }

    setLoading(false);
    closeForm();
  };

  const updateStatus = async (order: Order, newStatus: string) => {
    const supabase = createClient();

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id);

    if (error) return;

    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
    );
  };

  const moveToProduction = async (orderId: string) => {
    const supabase = createClient();
    setMovingOrderId(orderId);

    // Client-side duplicate check
    const { data: existingWO } = await supabase
      .from('work_orders')
      .select('id')
      .eq('order_id', orderId)
      .limit(1);

    if (existingWO && existingWO.length > 0) {
      setMovingOrderId(null);
      return;
    }

    const { error } = await supabase.rpc('move_order_to_production', {
      p_order_id: orderId,
    });

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'processing' } : o))
      );
    }

    setMovingOrderId(null);
  };

  const deleteOrder = useCallback((order: Order) => {
    if (isFrozen(order.status)) {
      setError(t('orders.errors.cannotDelete', locale));
      return;
    }
    setDeleteTarget(order);
  }, [locale]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    const res = await fetch('/api/orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: deleteTarget.id }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || t('orders.errors.deleteFailed', locale));
      setDeleting(false);
      setDeleteTarget(null);
      return;
    }

    setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
  }, [deleteTarget, locale]);

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
               {t('orders.title', locale)}
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
                <span className="hidden sm:inline">{t('orders.addOrder', locale)}</span>
                <span className="sm:hidden">{t('orders.add', locale)}</span>
              </button>
            )}
          </div>

          {/* Mobile Form */}
          {showForm && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white">
              <div className="flex items-center justify-between border-b border-primary/5 px-4 py-3">
                <h2 className="text-base font-bold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                  {editingOrder ? t('orders.editOrder', locale) : t('orders.orderData', locale)}
                </h2>
                <button type="button" onClick={closeForm} className="text-primary/40 hover:text-primary/60">
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
                  <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>{t('orders.product', locale)}</label>
                  <select name="product_id" value={form.product_id} onChange={handleChange} className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-body)' }}>
                    <option value="">{t('orders.productPlaceholder', locale)}</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>{t('orders.quantity', locale)}</label>
                    <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" required className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-mono)' }} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>{t('orders.dueDate', locale)}</label>
                    <input type="date" name="due_date" value={form.due_date} onChange={handleChange} className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-mono)' }} />
                  </div>
                </div>

                <div ref={customerDropdownRef} className="relative">
                  <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>{t('orders.customerName', locale)}</label>
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => handleCustomerSearchChange(e.target.value)}
                    onFocus={handleCustomerInputFocus}
                    placeholder={t('orders.customerPlaceholder', locale)}
                    required
                    className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                    style={{ fontFamily: 'var(--font-body)' }}
                  />
                  {showCustomerDropdown && (
                    <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-primary/10 bg-white shadow-lg">
                      {filteredCustomers.length > 0 && (
                        <div className="p-1">
                          {filteredCustomers.map((customer) => (
                            <button
                              key={customer.id}
                              type="button"
                              onClick={() => handleCustomerSelect(customer)}
                              className="w-full px-3 py-2 text-right text-sm text-primary hover:bg-primary/5 rounded-md"
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              {customer.full_name}
                            </button>
                          ))}
                        </div>
                      )}
                      {isNewCustomer && customerSearch.trim() && (
                        <div className="border-t border-primary/5 p-2">
                          <button
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({ ...prev, customer_id: '', customer_name: customerSearch.trim() }));
                              setIsNewCustomer(true);
                              setShowCustomerDropdown(false);
                            }}
                            className="w-full rounded-md bg-primary/5 px-3 py-2 text-right text-sm font-medium text-primary hover:bg-primary/10"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            {t('orders.addNewCustomer', locale)}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2d3a4f] disabled:opacity-50" style={{ fontFamily: 'var(--font-body)' }}>
                    {loading ? t('orders.submitSaving', locale) : t('orders.submitSave', locale)}
                  </button>
                  <button type="button" onClick={closeForm} className="rounded-lg border border-primary/10 px-4 py-2.5 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5" style={{ fontFamily: 'var(--font-body)' }}>
                    {t('common.cancel', locale)}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {orders.length === 0 ? (
              <div className="rounded-xl border border-primary/5 bg-white px-4 py-12 text-center text-sm text-primary/30" style={{ fontFamily: 'var(--font-body)' }}>
                {t('orders.empty', locale)}
              </div>
            ) : (
              orders.map((order) => {
                const st = statusConfig[order.status] ?? statusConfig.draft;
                return (
                  <div key={order.id} className="rounded-xl border border-primary/5 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-semibold text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                            #{order.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <span className="inline-flex items-center gap-1 text-xs" style={{ fontFamily: 'var(--font-body)' }}>
                            <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                            <span className={st.color}>{st.label}</span>
                          </span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body)' }}>
                          <p>{t('orders.productLabel', locale)} {order.product_name ?? '—'}</p>
                          <p>{t('orders.quantityLabel', locale)} {order.quantity}</p>
                          <p>{t('orders.customerLabel', locale)} {order.customer_id ? (
                            <a href="/customers" className="text-accent hover:underline">{order.customer_name}</a>
                          ) : order.customer_name}</p>
                          {order.due_date && <p>{t('orders.dueDateLabel', locale)} {formatDate(order.due_date)}</p>}
                        </div>
                      </div>
                    </div>
                    {isOwner && (
                      <div className="mt-3 flex gap-2 border-t border-primary/5 pt-3">
                        {!isFrozen(order.status) && (
                          <>
                            <button onClick={() => openEditForm(order)} className="flex-1 rounded-lg border border-primary/10 px-3 py-2 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5" style={{ fontFamily: 'var(--font-body)' }}>
                              {t('common.edit', locale)}
                            </button>
                            <button
                              onClick={() => deleteOrder(order)}
                              className="flex-1 rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                              style={{ fontFamily: 'var(--font-body)' }}
                              title={t('orders.deleteTooltip', locale)}
                            >
                              {t('common.delete', locale)}
                            </button>
                            {order.status === 'confirmed' && (
                              <button
                                onClick={() => moveToProduction(order.id)}
                                disabled={movingOrderId === order.id}
                                className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                                style={{ fontFamily: 'var(--font-body)' }}
                              >
                                {movingOrderId === order.id ? t('orders.moving', locale) : t('orders.moveToProduction', locale)}
                              </button>
                            )}
                            <select
                              value={order.status}
                              onChange={(e) => updateStatus(order, e.target.value)}
                              className="flex-1 rounded-lg border border-primary/10 bg-background px-2 py-1.5 text-xs text-primary focus:border-accent focus:outline-none"
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              {Object.entries(editableStatuses).map(([value, config]) => (
                                <option key={value} value={value}>{config.label}</option>
                              ))}
                            </select>
                          </>
                        )}
                        {isFrozen(order.status) && (
                          <span className="flex-1 flex items-center justify-center text-xs text-primary/40" style={{ fontFamily: 'var(--font-body)' }}>
                            {st.label}
                          </span>
                        )}
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
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>{t('orders.orderNumber', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>{t('orders.productLabel', locale).replace(':','')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>{t('orders.quantityLabel', locale).replace(':','')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>{t('orders.dueDateLabel', locale).replace(':','')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>{t('orders.customerLabel', locale).replace(':','')}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>{t('orders.table.status', locale)}</th>
                      {isOwner && (
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body)' }}>{t('orders.table.actions', locale)}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={isOwner ? 7 : 6} className="px-6 py-12 text-center text-sm text-primary/30" style={{ fontFamily: 'var(--font-body)' }}>
                          {t('orders.empty', locale)}
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => {
                        const st = statusConfig[order.status] ?? statusConfig.draft;
                        return (
                          <tr key={order.id} className="transition-colors hover:bg-primary/[0.01]">
                            <td className="px-6 py-3.5 text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-mono)' }}>
                              #{order.id.slice(0, 8).toUpperCase()}
                            </td>
                            <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body)' }}>
                              {order.product_name ?? '—'}
                            </td>
                            <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-mono)' }}>
                              {order.quantity}
                            </td>
                            <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-mono)' }}>
                              {formatDate(order.due_date)}
                            </td>
                            <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body)' }}>
                              {order.customer_id ? (
                                <a href="/customers" className="text-accent hover:underline">{order.customer_name}</a>
                              ) : order.customer_name}
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="inline-flex items-center gap-2 text-sm" style={{ fontFamily: 'var(--font-body)' }}>
                                <span className={`h-2 w-2 rounded-full ${st.dot}`} />
                                <span className={st.color}>{st.label}</span>
                              </span>
                            </td>
                            {isOwner && (
                              <td className="px-6 py-3.5">
                                <div className="flex items-center gap-2">
                                  {!isFrozen(order.status) && (
                                    <>
                                      <button onClick={() => openEditForm(order)} className="text-primary/30 transition-colors hover:text-primary/60" title={t('common.edit', locale)}>
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => deleteOrder(order)}
                                        className="text-red-300 transition-colors hover:text-red-500"
                                        title={t('orders.deleteTooltip', locale)}
                                      >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                        </svg>
                                      </button>
                                      {order.status === 'confirmed' && (
                                        <button
                                          onClick={() => moveToProduction(order.id)}
                                          disabled={movingOrderId === order.id}
                                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                                          style={{ fontFamily: 'var(--font-body)' }}
                                          title={t('orders.moveToProduction', locale)}
                                        >
                                          {movingOrderId === order.id ? '...' : t('orders.moveToProduction', locale)}
                                        </button>
                                      )}
                                      <select
                                        value={order.status}
                                        onChange={(e) => updateStatus(order, e.target.value)}
                                        className="rounded-lg border border-primary/10 bg-background px-2 py-1 text-xs text-primary focus:border-accent focus:outline-none"
                                        style={{ fontFamily: 'var(--font-body)' }}
                                      >
                                        {Object.entries(editableStatuses).map(([value, config]) => (
                                          <option key={value} value={value}>{config.label}</option>
                                        ))}
                                      </select>
                                    </>
                                  )}
                                  {isFrozen(order.status) && (
                                    <span className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body)' }}>
                                      {st.label}
                                    </span>
                                  )}
                                </div>
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
                  <h2 className="text-base font-bold text-primary" style={{ fontFamily: 'var(--font-heading)' }}>
                    {editingOrder ? t('orders.editOrder', locale) : t('orders.orderData', locale)}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600" style={{ fontFamily: 'var(--font-body)' }}>
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>{t('orders.product', locale)}</label>
                    <select name="product_id" value={form.product_id} onChange={handleChange} className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-body)' }}>
                      <option value="">{t('orders.productPlaceholder', locale)}</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>{t('orders.quantity', locale)}</label>
                    <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" required className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-mono)' }} />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>{t('orders.dueDate', locale)}</label>
                    <input type="date" name="due_date" value={form.due_date} onChange={handleChange} className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-mono)' }} />
                  </div>

                  <div ref={customerDropdownRef} className="relative">
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body)' }}>{t('orders.customerName', locale)}</label>
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => handleCustomerSearchChange(e.target.value)}
                      onFocus={handleCustomerInputFocus}
                      placeholder={t('orders.customerPlaceholder', locale)}
                      required
                      className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                      style={{ fontFamily: 'var(--font-body)' }}
                    />
                    {showCustomerDropdown && (
                      <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-primary/10 bg-white shadow-lg">
                        {filteredCustomers.length > 0 && (
                          <div className="p-1">
                            {filteredCustomers.map((customer) => (
                              <button
                                key={customer.id}
                                type="button"
                                onClick={() => handleCustomerSelect(customer)}
                                className="w-full px-3 py-2 text-right text-sm text-primary hover:bg-primary/5 rounded-md"
                                style={{ fontFamily: 'var(--font-body)' }}
                              >
                                {customer.full_name}
                              </button>
                            ))}
                          </div>
                        )}
                        {isNewCustomer && customerSearch.trim() && (
                          <div className="border-t border-primary/5 p-2">
                            <button
                              type="button"
                              onClick={() => {
                                setForm((prev) => ({ ...prev, customer_id: '', customer_name: customerSearch.trim() }));
                                setIsNewCustomer(true);
                                setShowCustomerDropdown(false);
                              }}
                              className="w-full rounded-md bg-primary/5 px-3 py-2 text-right text-sm font-medium text-primary hover:bg-primary/10"
                              style={{ fontFamily: 'var(--font-body)' }}
                            >
                              {t('orders.addNewCustomer', locale)}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2d3a4f] disabled:opacity-50" style={{ fontFamily: 'var(--font-body)' }}>
                      {loading ? t('orders.submitSaving', locale) : t('orders.submitSave', locale)}
                    </button>
                    <button type="button" onClick={closeForm} className="rounded-lg border border-primary/10 px-4 py-2.5 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5" style={{ fontFamily: 'var(--font-body)' }}>
                      {t('common.cancel', locale)}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('common.delete', locale)}
        message={t('orders.deleteConfirm', locale)}
        confirmLabel={t('common.delete', locale)}
        cancelLabel={t('common.cancel', locale)}
        onConfirm={confirmDelete}
        onCancel={() => { setDeleteTarget(null); setDeleting(false); }}
        loading={deleting}
      />
    </>
  );
}
