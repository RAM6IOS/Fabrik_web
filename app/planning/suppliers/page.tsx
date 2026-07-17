import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SuppliersClient from './SuppliersClient';

export const metadata = {
  title: 'الموردون - منصة إدارة الإنتاج',
};

export default async function SuppliersPage() {
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

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('id, name, phone, email, contact_name, lead_time_days, minimum_order, is_active')
    .order('name', { ascending: true });

  return (
    <SuppliersClient
      initialSuppliers={suppliers ?? []}
      userRole={profile.role}
      userName={profile.full_name}
      factoryId={profile.factory_id}
    />
  );
}
