'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useLocale } from '@/lib/i18n/context';
import { t, getUnitOptions } from '@/lib/i18n/translations';

interface Product {
  id: string;
  name: string;
  unit: string;
  standard_production_time_hours: number | null;
  bom_count: number;
}

interface RawMaterial {
  id: string;
  name: string;
  unit: string;
}

interface BomRow {
  raw_material_id: string;
  quantity_per_unit: string;
  unit: string;
}

interface ProductsClientProps {
  initialProducts: Product[];
  rawMaterials: RawMaterial[];
  userRole: string;
  userName: string;
  factoryId: string;
}

const emptyForm = {
  name: '',
  unit: 'قطعة',
  standard_production_time_hours: '',
};

export default function ProductsClient({
  initialProducts,
  rawMaterials,
  userRole,
  userName,
  factoryId,
}: ProductsClientProps) {
  const { locale } = useLocale();
  const unitOptions = getUnitOptions(locale);

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [bomRows, setBomRows] = useState<BomRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);

  const isOwner = userRole === 'owner';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openAddForm = useCallback(() => {
    setEditingProduct(null);
    setForm(emptyForm);
    setBomRows([]);
    setShowForm(true);
    setError(null);
  }, []);

  const openEditForm = useCallback(async (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      unit: product.unit,
      standard_production_time_hours: product.standard_production_time_hours?.toString() ?? '',
    });

    // جلب بنود BOM للمنتج
    const supabase = createClient();
    const { data: bomItems } = await supabase
      .from('bom_items')
      .select('raw_material_id, quantity_per_unit')
      .eq('product_id', product.id);

    const rows = (bomItems ?? []).map((item) => {
      const material = rawMaterials.find((m) => m.id === item.raw_material_id);
      return {
        raw_material_id: item.raw_material_id,
        quantity_per_unit: item.quantity_per_unit.toString(),
        unit: material?.unit ?? '',
      };
    });

    setBomRows(rows);
    setShowForm(true);
    setError(null);
  }, [rawMaterials]);

  const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setBomRows([]);
    setError(null);
  }, []);

  const addBomRow = useCallback(() => {
    setBomRows((prev) => [...prev, { raw_material_id: '', quantity_per_unit: '', unit: '' }]);
  }, []);

  const removeBomRow = useCallback((index: number) => {
    setBomRows((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleBomChange = (index: number, field: keyof BomRow, value: string) => {
    setBomRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // تحديث الوحدة تلقائياً عند اختيار المادة
      if (field === 'raw_material_id') {
        const material = rawMaterials.find((m) => m.id === value);
        updated[index].unit = material?.unit ?? '';
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!form.name.trim()) {
      setError(t('products.errors.nameRequired', locale));
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const productPayload = {
      factory_id: factoryId,
      name: form.name.trim(),
      unit: form.unit,
      standard_production_time_hours: form.standard_production_time_hours
        ? parseFloat(form.standard_production_time_hours)
        : null,
    };

    let productId: string;

    if (editingProduct) {
      const { error: updateError } = await supabase
        .from('products')
        .update(productPayload)
        .eq('id', editingProduct.id);

      if (updateError) {
        setError(t('products.errors.updateFailed', locale));
        setLoading(false);
        return;
      }

      productId = editingProduct.id;

      // حذف بنود BOM القديمة
      await supabase.from('bom_items').delete().eq('product_id', productId);
    } else {
      const { data, error: insertError } = await supabase
        .from('products')
        .insert(productPayload)
        .select()
        .single();

      if (insertError) {
        setError(t('products.errors.addFailed', locale));
        setLoading(false);
        return;
      }

      productId = data.id;
    }

    // إدراج بنود BOM الجديدة
    const validBomRows = bomRows.filter((row) => row.raw_material_id && row.quantity_per_unit);
    if (validBomRows.length > 0) {
      const bomPayload = validBomRows.map((row) => ({
        factory_id: factoryId,
        product_id: productId,
        raw_material_id: row.raw_material_id,
        quantity_per_unit: parseFloat(row.quantity_per_unit),
      }));

      const { error: bomError } = await supabase.from('bom_items').insert(bomPayload);

      if (bomError) {
        setError(t('products.errors.recipeFailed', locale));
        setLoading(false);
        return;
      }
    }

    // تحديث القائمة المحلية
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, ...productPayload, bom_count: validBomRows.length }
            : p
        )
      );
    } else {
      setProducts((prev) => [
        ...prev,
        { id: productId, ...productPayload, bom_count: validBomRows.length },
      ]);
    }

    setLoading(false);
    closeForm();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.from('products').delete().eq('id', deleteConfirm.id);

    if (error) {
      setError(t('products.errors.deleteFailed', locale));
      setLoading(false);
      setDeleteConfirm(null);
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
    setDeleteConfirm(null);
    setLoading(false);
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
              {t('products.title', locale)}
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
                <span className="hidden sm:inline">{t('products.addProduct', locale)}</span>
                <span className="sm:hidden">{t('products.add', locale)}</span>
              </button>
            )}
          </div>

          {/* Mobile Form */}
          {showForm && (
            <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white">
              <div className="flex items-center justify-between border-b border-primary/5 px-4 py-3">
                <h2 className="text-base font-bold text-primary" style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}>
                  {editingProduct ? t('products.editProduct', locale) : t('products.productData', locale)}
                </h2>
                <button type="button" onClick={closeForm} className="text-primary/40 hover:text-primary/60">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
                {error && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                    {error}
                  </div>
                )}

                {/* {t('products.basicInfo', locale)} */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                    {t('products.basicInfo', locale)}
                  </h3>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('products.name', locale)}</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('products.unit', locale)}</label>
                      <select name="unit" value={form.unit} onChange={handleChange} className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {unitOptions.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('products.manufacturingTime', locale)}</label>
                      <input type="number" name="standard_production_time_hours" value={form.standard_production_time_hours} onChange={handleChange} min="0" step="0.5" className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-mono)' }} />
                    </div>
                  </div>
                </div>

                {/* {t('products.bom', locale)} */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {t('products.bom', locale)}
                    </h3>
                    <button type="button" onClick={addBomRow} className="text-xs text-accent hover:text-accent/80" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {t('products.addMaterial', locale)}
                    </button>
                  </div>

                  {bomRows.length === 0 ? (
                    <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {t('products.noMaterials', locale)}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {bomRows.map((row, index) => (
                        <div key={index} className="flex gap-2">
                          <select
                            value={row.raw_material_id}
                            onChange={(e) => handleBomChange(index, 'raw_material_id', e.target.value)}
                            className="flex-1 rounded-lg border border-primary/10 bg-background px-2 py-1.5 text-xs text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                            style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                          >
                            <option value="">{t('products.materialPlaceholder', locale)}</option>
                            {rawMaterials.map((m) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            value={row.quantity_per_unit}
                            onChange={(e) => handleBomChange(index, 'quantity_per_unit', e.target.value)}
                            placeholder={t('products.quantityPlaceholder', locale)}
                            min="0"
                            step="0.01"
                            className="w-20 rounded-lg border border-primary/10 bg-background px-2 py-1.5 text-xs text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          />
                          <span className="flex items-center text-xs text-primary/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                            {row.unit}
                          </span>
                          <button type="button" onClick={() => removeBomRow(index)} className="text-red-400 hover:text-red-600">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2d3a4f] disabled:opacity-50" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                    {loading ? t('products.submitSaving', locale) : t('products.submitSave', locale)}
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
            {products.length === 0 ? (
              <div className="rounded-xl border border-primary/5 bg-white px-4 py-12 text-center text-sm text-primary/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                {t('products.empty', locale)}
              </div>
            ) : (
              products.map((product) => (
                <div key={product.id} className="rounded-xl border border-primary/5 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {product.name}
                      </h3>
                      <div className="mt-2 space-y-1 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        <p>{t('products.unitLabel', locale)} {product.unit}</p>
                        <p>{t('products.materialsCount', locale)} {product.bom_count}</p>
                        <p>{t('products.costNotCalculated', locale)}</p>
                      </div>
                    </div>
                  </div>
                  {isOwner && (
                    <div className="mt-3 flex gap-2 border-t border-primary/5 pt-3">
                      <button onClick={() => openEditForm(product)} className="flex-1 rounded-lg border border-primary/10 px-3 py-2 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('common.edit', locale)}
                      </button>
                      <button onClick={() => setDeleteConfirm(product)} className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
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
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('products.table.name', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('products.table.unit', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('products.table.materialsCount', locale)}</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('products.table.totalCost', locale)}</th>
                      {isOwner && (
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('products.table.actions', locale)}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={isOwner ? 5 : 4} className="px-6 py-12 text-center text-sm text-primary/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                          {t('products.empty', locale)}
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id} className="transition-colors hover:bg-primary/[0.01]">
                          <td className="px-6 py-3.5 text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                            {product.name}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                            {product.unit}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-ink/60" style={{ fontFamily: 'var(--font-mono)' }}>
                            {product.bom_count}
                          </td>
                          <td className="px-6 py-3.5 text-sm text-ink/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                            {t('products.costNotCalculated', locale)}
                          </td>
                          {isOwner && (
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-2">
                                <button onClick={() => openEditForm(product)} className="text-primary/30 transition-colors hover:text-primary/60" title={t('products.editTooltip', locale)}>
                                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                  </svg>
                                </button>
                                <button onClick={() => setDeleteConfirm(product)} className="text-red-400 transition-colors hover:text-red-600" title={t('products.deleteTooltip', locale)}>
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

          {/* Desktop Side Panel Overlay */}
          {showForm && (
            <div className="hidden md:block">
              <div className="fixed inset-0 z-50 bg-black/40" onClick={closeForm} />
              <div className="fixed inset-y-0 right-0 z-50 w-96 overflow-y-auto border-l border-primary/5 bg-white shadow-xl">
                <div className="border-b border-primary/5 px-4 py-3">
                  <h2 className="text-base font-bold text-primary" style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}>
                    {editingProduct ? t('products.editProduct', locale) : t('products.productData', locale)}
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                  {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {error}
                    </div>
                  )}

                  {/* {t('products.basicInfo', locale)} */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-primary border-b border-primary/5 pb-2" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {t('products.basicInfo', locale)}
                    </h3>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('products.name', locale)}</label>
                      <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('products.unit', locale)}</label>
                        <select name="unit" value={form.unit} onChange={handleChange} className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                          {unitOptions.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>{t('products.manufacturingTime', locale)}</label>
                        <input type="number" name="standard_production_time_hours" value={form.standard_production_time_hours} onChange={handleChange} min="0" step="0.5" className="w-full rounded-lg border border-primary/10 bg-background px-3 py-2 text-sm text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30" style={{ fontFamily: 'var(--font-mono)' }} />
                      </div>
                    </div>
                  </div>

                  {/* {t('products.bom', locale)} */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-primary/5 pb-2">
                      <h3 className="text-sm font-semibold text-primary" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('products.bom', locale)}
                      </h3>
                      <button type="button" onClick={addBomRow} className="text-xs text-accent hover:text-accent/80" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('products.addMaterial', locale)}
                      </button>
                    </div>

                    {bomRows.length === 0 ? (
                      <p className="text-xs text-primary/40" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                        {t('products.noMaterials', locale)}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {bomRows.map((row, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <select
                              value={row.raw_material_id}
                              onChange={(e) => handleBomChange(index, 'raw_material_id', e.target.value)}
                              className="flex-1 rounded-lg border border-primary/10 bg-background px-2 py-1.5 text-xs text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                              style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
                            >
                              <option value="">{t('products.materialPlaceholder', locale)}</option>
                              {rawMaterials.map((m) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={row.quantity_per_unit}
                              onChange={(e) => handleBomChange(index, 'quantity_per_unit', e.target.value)}
                              placeholder={t('products.quantityPlaceholder', locale)}
                              min="0"
                              step="0.01"
                              className="w-20 rounded-lg border border-primary/10 bg-background px-2 py-1.5 text-xs text-primary placeholder:text-primary/30 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
                              style={{ fontFamily: 'var(--font-mono)' }}
                            />
                            <span className="text-xs text-primary/40 w-12" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                              {row.unit}
                            </span>
                            <button type="button" onClick={() => removeBomRow(index)} className="text-red-400 hover:text-red-600">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={loading} className="flex-1 rounded-lg bg-[#1e293b] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2d3a4f] disabled:opacity-50" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
                      {loading ? t('products.submitSaving', locale) : t('products.submitSave', locale)}
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

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-primary" style={{ fontFamily: 'var(--font-heading), var(--font-heading-arabic)' }}>
              {t('products.deleteConfirm', locale)}
            </h3>
            <p className="mt-2 text-sm text-primary/60" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }} dangerouslySetInnerHTML={{ __html: t('products.deleteMessage', locale).replace('{name}', `<strong>${deleteConfirm.name}</strong>`) }} />
            <p className="mt-1 text-xs text-red-500" style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}>
              {t('products.deleteDescription', locale)}
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
              >
                {loading ? t('products.deleting', locale) : t('products.yesDelete', locale)}
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-lg border border-primary/10 px-4 py-2.5 text-sm font-medium text-primary/60 transition-colors hover:bg-primary/5"
                style={{ fontFamily: 'var(--font-body-arabic), var(--font-body)' }}
              >
                {t('common.cancel', locale)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
