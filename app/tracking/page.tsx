import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import TrackingClient from './TrackingClient';

export const metadata = {
  title: 'تتبع الإنتاج - منصة إدارة الإنتاج',
};

export default async function TrackingPage() {
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

  // جلب أوامر العمل للمصنع الحالي فقط (RLS يُطبَّق تلقائياً)
  const { data: workOrders } = await supabase
    .from('work_orders')
    .select('id, product_name, product_id, quantity, status, planned_start, planned_end, order_id')
    .order('planned_start', { ascending: true, nullsFirst: false });

  return (
    <TrackingClient
      initialWorkOrders={(workOrders ?? []).map((wo) => ({
        ...wo,
        formatted_order_id: wo.order_id
          ? `#${wo.order_id.slice(0, 8).toUpperCase()}`
          : null,
      }))}
      userRole={profile.role}
      userName={profile.full_name}
    />
  );
}
