import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import OrdersClient from './OrdersClient';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
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

  // جلب الطلبيات
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, customer_id, customer_name, due_date, status, total_amount, quantity, product_id')
    .order('created_at', { ascending: false });

  if (ordersError) {
    console.error('Orders query error:', ordersError.message, ordersError.details);
  }

  // جلب المنتجات
  const { data: products } = await supabase
    .from('products')
    .select('id, name')
    .order('name', { ascending: true });

  // جلب العملاء
  const { data: customers } = await supabase
    .from('customers')
    .select('id, full_name')
    .order('full_name', { ascending: true });

  // إنشاء map للمنتجات
  const productMap = new Map((products ?? []).map((p) => [p.id, p.name]));

  const formattedOrders = (orders ?? []).map((o) => ({
    id: o.id,
    customer_id: o.customer_id ?? null,
    customer_name: o.customer_name,
    due_date: o.due_date,
    status: o.status,
    total_amount: Number(o.total_amount),
    quantity: o.quantity,
    product_id: o.product_id,
    product_name: productMap.get(o.product_id) ?? null,
  }));

  return (
    <OrdersClient
      initialOrders={formattedOrders}
      products={products ?? []}
      customers={customers ?? []}
      userRole={profile.role}
      userName={profile.full_name}
      factoryId={profile.factory_id}
    />
  );
}
