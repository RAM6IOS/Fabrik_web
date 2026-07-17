import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProductsClient from './ProductsClient';

export const metadata = {
  title: 'المنتجات - منصة إدارة الإنتاج',
};

export default async function ProductsPage() {
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

  // استعلام 1: جلب المنتجات
  const { data: products } = await supabase
    .from('products')
    .select('id, name, unit, standard_production_time_hours')
    .order('name', { ascending: true });

  // استعلام 2: جلب عدد المواد لكل منتج (bom_items)
  const { data: bomItems } = await supabase
    .from('bom_items')
    .select('product_id');

  // حساب عدد المواد لكل منتج
  const bomCountMap: Record<string, number> = {};
  (bomItems ?? []).forEach((item) => {
    bomCountMap[item.product_id] = (bomCountMap[item.product_id] || 0) + 1;
  });

  // استعلام 3: جلب المواد الأولية لنموذج BOM
  const { data: rawMaterials } = await supabase
    .from('raw_materials')
    .select('id, name, unit')
    .order('name', { ascending: true });

  return (
    <ProductsClient
      initialProducts={(products ?? []).map((p) => ({
        ...p,
        bom_count: bomCountMap[p.id] || 0,
      }))}
      rawMaterials={rawMaterials ?? []}
      userRole={profile.role}
      userName={profile.full_name}
      factoryId={profile.factory_id}
    />
  );
}
