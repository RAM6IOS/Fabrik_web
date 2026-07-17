import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import CustomersClient from './CustomersClient';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
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

  const { data: customers } = await supabase
    .from('customers')
    .select('id, full_name, phone, email, address, notes, created_at')
    .order('created_at', { ascending: false });

  // Count orders per customer by matching customer_name
  const { data: orders } = await supabase
    .from('orders')
    .select('id, customer_name, status')
    .eq('factory_id', profile.factory_id);

  // Build customer stats
  const customerStats = new Map<string, { orderCount: number; lastOrder: string | null }>();
  for (const order of orders ?? []) {
    const name = order.customer_name;
    if (!name) continue;
    const existing = customerStats.get(name) ?? { orderCount: 0, lastOrder: null };
    existing.orderCount += 1;
    if (!existing.lastOrder || order.status) {
      existing.lastOrder = order.status;
    }
    customerStats.set(name, existing);
  }

  const enrichedCustomers = (customers ?? []).map((c) => {
    const stats = customerStats.get(c.full_name);
    return {
      ...c,
      order_count: stats?.orderCount ?? 0,
    };
  });

  return (
    <CustomersClient
      initialCustomers={enrichedCustomers}
      userRole={profile.role}
      userName={profile.full_name}
      factoryId={profile.factory_id}
    />
  );
}
