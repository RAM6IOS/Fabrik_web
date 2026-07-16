import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MaintenanceClient from './MaintenanceClient';

export default async function MaintenancePage() {
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

  const { data: machines } = await supabase
    .from('machines')
    .select('id, name, location, notes, maintenance_interval_days, last_maintenance_date, is_active')
    .order('name', { ascending: true });

  const machinesWithStatus = (machines ?? []).map((m) => {
    let next_maintenance_date: string | null = null;
    let status: 'good' | 'under_maintenance' | 'stopped' = 'good';

    if (!m.is_active) {
      status = 'stopped';
    } else if (m.last_maintenance_date) {
      const next = new Date(m.last_maintenance_date);
      next.setDate(next.getDate() + m.maintenance_interval_days);
      next_maintenance_date = next.toISOString().split('T')[0];

      if (next < new Date()) {
        status = 'under_maintenance';
      }
    }

    return {
      id: m.id,
      name: m.name,
      location: m.location,
      notes: m.notes,
      maintenance_interval_days: m.maintenance_interval_days,
      last_maintenance_date: m.last_maintenance_date,
      next_maintenance_date,
      is_active: m.is_active,
      status,
    };
  });

  return (
    <MaintenanceClient
      initialMachines={machinesWithStatus}
      userRole={profile.role}
      userName={profile.full_name}
      factoryId={profile.factory_id}
    />
  );
}
