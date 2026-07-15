/**
 * Script to clean up duplicate work orders with inventory correction.
 *
 * Strategy:
 * - For each order_id with duplicates, keep the latest (by id DESC)
 * - Delete all older duplicates
 * - For each DELETED completed work order: reverse inventory deduction
 *
 * Run: npx tsx scripts/cleanup-duplicate-work-orders.ts
 */
import { createAdminClient } from '../lib/supabase/admin';

async function main() {
  const supabase = createAdminClient();

  // 1. Fetch all work orders
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

  const duplicates = Object.entries(grouped).filter(([_, orders]) => orders.length > 1);

  if (duplicates.length === 0) {
    console.log('✅ No duplicate work orders found. Nothing to clean up.');
    return;
  }

  console.log(`\n🔧 Cleaning up ${duplicates.length} order_id(s) with duplicates...\n`);

  const inventoryAdjustments: { materialName: string; materialId: string; amount: number; unit: string }[] = [];

  for (const [orderId, orders] of duplicates) {
    // Keep the latest (highest id = most recent)
    const sorted = [...orders].sort((a, b) => b.id.localeCompare(a.id));
    const keep = sorted[0];
    const deletees = sorted.slice(1);

    console.log(`Order ${orderId}:`);
    console.log(`  KEEP:    id=${keep.id} (${keep.status}, qty=${keep.quantity})`);

    for (const wo of deletees) {
      console.log(`  DELETE:  id=${wo.id} (${wo.status}, qty=${wo.quantity})`);

      // If this duplicate is completed, reverse inventory deduction
      if (wo.status === 'completed') {
        console.log(`    ⚠️  Completed — reversing inventory deduction...`);

        // Find product ID
        const { data: products } = await supabase
          .from('products')
          .select('id')
          .eq('name', wo.product_name)
          .limit(1);

        if (!products || products.length === 0) {
          console.log(`    ❌ Product "${wo.product_name}" not found`);
          continue;
        }

        const productId = products[0].id;

        // Get BOM items
        const { data: bomItems } = await supabase
          .from('bom_items')
          .select('raw_material_id, quantity_per_unit')
          .eq('product_id', productId);

        if (!bomItems || bomItems.length === 0) {
          console.log(`    ❌ No BOM items for product "${wo.product_name}"`);
          continue;
        }

        for (const bom of bomItems) {
          const deductionAmount = bom.quantity_per_unit * wo.quantity;

          // Get current balance
          const { data: material } = await supabase
            .from('raw_materials')
            .select('id, name, unit, current_balance')
            .eq('id', bom.raw_material_id)
            .single();

          if (!material) {
            console.log(`    ❌ Material ${bom.raw_material_id} not found`);
            continue;
          }

          const newBalance = Number(material.current_balance) + deductionAmount;

          console.log(`    📦 ${material.name}: +${deductionAmount} ${material.unit} (${material.current_balance} → ${newBalance})`);

          // Update the balance
          const { error: updateError } = await supabase
            .from('raw_materials')
            .update({ current_balance: newBalance })
            .eq('id', bom.raw_material_id);

          if (updateError) {
            console.log(`    ❌ Failed to update ${material.name}: ${updateError.message}`);
          } else {
            console.log(`    ✅ Updated ${material.name} balance`);
            inventoryAdjustments.push({
              materialName: material.name,
              materialId: bom.raw_material_id,
              amount: deductionAmount,
              unit: material.unit,
            });
          }
        }
      }

      // Delete the duplicate work order
      const { error: deleteError } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', wo.id);

      if (deleteError) {
        console.log(`    ❌ Failed to delete work order ${wo.id}: ${deleteError.message}`);
      } else {
        console.log(`    ✅ Deleted work order ${wo.id}`);
      }
    }
    console.log('');
  }

  // Summary
  console.log('\n=== CLEANUP SUMMARY ===\n');
  console.log(`Deleted ${duplicates.reduce((sum, [_, orders]) => sum + orders.length - 1, 0)} duplicate work orders`);

  if (inventoryAdjustments.length > 0) {
    console.log('\nInventory adjustments made:');
    for (const adj of inventoryAdjustments) {
      console.log(`  +${adj.amount} ${adj.unit} → ${adj.materialName}`);
    }
  } else {
    console.log('\nNo inventory adjustments needed');
  }

  console.log('\n✅ Cleanup complete!');
}

main().catch(console.error);
