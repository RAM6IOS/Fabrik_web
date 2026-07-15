/**
 * Script to check for duplicate work orders per order_id
 * and assess inventory impact before cleanup.
 *
 * Run: npx tsx scripts/check-duplicate-work-orders.ts
 */
import { createAdminClient } from '../lib/supabase/admin';

async function main() {
  const supabase = createAdminClient();

  // 1. Fetch all work orders with order_id
  const { data: workOrders, error } = await supabase
    .from('work_orders')
    .select('id, order_id, product_name, status, quantity, planned_start')
    .order('planned_start', { ascending: true, nullsFirst: true });

  if (error) {
    console.error('Error fetching work orders:', error.message);
    process.exit(1);
  }

  // 2. Group by order_id
  const grouped: Record<string, typeof workOrders> = {};
  for (const wo of workOrders ?? []) {
    if (!wo.order_id) continue;
    if (!grouped[wo.order_id]) grouped[wo.order_id] = [];
    grouped[wo.order_id].push(wo);
  }

  // 3. Find duplicates
  const duplicates = Object.entries(grouped).filter(([_, orders]) => orders.length > 1);

  if (duplicates.length === 0) {
    console.log('✅ No duplicate work orders found.');
    return;
  }

  console.log(`\n⚠️  Found ${duplicates.length} order_id(s) with duplicate work orders:\n`);

  for (const [orderId, orders] of duplicates) {
    console.log(`Order ID: ${orderId}`);
    console.log(`  Total duplicates: ${orders.length}`);
    for (const wo of orders) {
      console.log(`  - id=${wo.id}  status=${wo.status}  product=${wo.product_name}  qty=${wo.quantity}  planned_start=${wo.planned_start}`);
    }

    const completedOnes = orders.filter(o => o.status === 'completed');
    if (completedOnes.length > 0) {
      console.log(`  ⛔ ${completedOnes.length} of these are "completed" — inventory was deducted!`);
      console.log(`     Must reverse inventory deductions before deleting these duplicates.`);
    }
    console.log('');
  }

  // 4. Show which ones would be kept (latest) vs deleted
  console.log('--- Cleanup Plan (keep latest per order_id) ---\n');
  for (const [orderId, orders] of duplicates) {
    const sorted = [...orders].sort((a, b) => {
      const dateA = a.planned_start ? new Date(a.planned_start).getTime() : 0;
      const dateB = b.planned_start ? new Date(b.planned_start).getTime() : 0;
      return dateB - dateA;
    });
    const keep = sorted[0];
    const deletees = sorted.slice(1);
    console.log(`Order ${orderId}:`);
    console.log(`  KEEP:    id=${keep.id} (${keep.status})`);
    for (const d of deletees) {
      console.log(`  DELETE:  id=${d.id} (${d.status})`);
    }
    console.log('');
  }
}

main().catch(console.error);
