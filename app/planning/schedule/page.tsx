import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ScheduleClient from './ScheduleClient';

export default async function SchedulePage() {
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

  const today = new Date().toISOString().slice(0, 10);

  // ── استعلام 1: الطلبيات المؤكّدة أو قيد المعالجة ──
  const { data: confirmedOrders } = await supabase
    .from('orders')
    .select('id, product_id, quantity, due_date')
    .in('status', ['confirmed', 'processing']);

  // ── استعلام 2: جميع المواد الأولية ──
  const { data: rawMaterials } = await supabase
    .from('raw_materials')
    .select('id, name, unit, current_balance, default_supplier_id');

  // ── استعلام 3: جميع بنود التجميع (BOM) ──
  const { data: bomItems } = await supabase
    .from('bom_items')
    .select('product_id, raw_material_id, quantity');

  // ── استعلام 4: الموردون (لحساب lead_time_days) ──
  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('id, name, lead_time_days');

  // ════════════════════════════════════════════════
  // حساب تبويب "أوامر شراء مقترحة"
  // ════════════════════════════════════════════════
  const supplierMap = new Map((suppliers ?? []).map((s) => [s.id, s]));

  // بناء خريطة: materialId → { productId → quantity_per_unit }
  const bomByMaterial = new Map<string, Map<string, number>>();
  for (const item of bomItems ?? []) {
    const matId = item.raw_material_id;
    if (!bomByMaterial.has(matId)) bomByMaterial.set(matId, new Map());
    bomByMaterial.get(matId)!.set(item.product_id, item.quantity);
  }

  // حساب الطلب الإجمالي لكل مادة من الطلبيات المؤكّدة
  const demandByMaterial = new Map<string, number>();
  for (const order of confirmedOrders ?? []) {
    const matMap = bomByMaterial.get(order.product_id);
    if (!matMap) continue;
    for (const [matId, qtyPerUnit] of matMap) {
      const prev = demandByMaterial.get(matId) ?? 0;
      demandByMaterial.set(matId, prev + qtyPerUnit * order.quantity);
    }
  }

  // بناء اقتراحات شراء
  const purchaseSuggestions: {
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
  }[] = [];

  for (const material of rawMaterials ?? []) {
    const totalDemand = demandByMaterial.get(material.id) ?? 0;
    const netNeed = totalDemand - material.current_balance;

    if (netNeed <= 0) continue;
    if (!material.default_supplier_id) continue;

    const supplier = supplierMap.get(material.default_supplier_id);

    // تاريخ الإصدار = أقرب due_date - lead_time_days
    const relevantOrders = (confirmedOrders ?? []).filter((o) => {
      const matMap = bomByMaterial.get(o.product_id);
      return matMap?.has(material.id) && o.due_date;
    });

    const earliestDue = relevantOrders
      .map((o) => o.due_date!)
      .sort()[0];

    const leadDays = supplier?.lead_time_days ?? 0;
    const orderDate = earliestDue
      ? new Date(new Date(earliestDue).getTime() - leadDays * 86400000)
          .toISOString()
          .slice(0, 10)
      : today;

    purchaseSuggestions.push({
      raw_material_id: material.id,
      raw_material_name: material.name,
      unit: material.unit,
      total_demand: totalDemand,
      current_balance: material.current_balance,
      net_need: netNeed,
      supplier_id: supplier?.id ?? null,
      supplier_name: supplier?.name ?? '—',
      lead_time_days: supplier?.lead_time_days ?? null,
      order_date: orderDate,
      is_urgent: orderDate < today,
    });
  }

  return (
    <ScheduleClient
      purchaseSuggestions={purchaseSuggestions}
      userRole={profile.role}
      userName={profile.full_name}
      factoryId={profile.factory_id}
    />
  );
}
