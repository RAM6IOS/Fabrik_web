import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MaterialsClient from './MaterialsClient';

export default async function MaterialsPage() {
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

  const { data: materials } = await supabase
    .from('raw_materials')
    .select('id, name, sku, unit, current_balance, reorder_point, default_supplier_id')
    .order('name', { ascending: true });

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('id, name')
    .eq('is_active', true)
    .order('name', { ascending: true });

  const formattedMaterials = (materials ?? []).map((m) => {
    const supplierName = (suppliers ?? []).find((s) => s.id === m.default_supplier_id)?.name ?? null;
    return {
      id: m.id,
      name: m.name,
      sku: m.sku,
      unit: m.unit,
      current_balance: Number(m.current_balance),
      reorder_point: Number(m.reorder_point),
      default_supplier_id: m.default_supplier_id,
      supplier_name: supplierName,
    };
  });

  return (
    <MaterialsClient
      initialMaterials={formattedMaterials}
      suppliers={suppliers ?? []}
      userRole={profile.role}
      userName={profile.full_name}
      factoryId={profile.factory_id}
    />
  );
}
