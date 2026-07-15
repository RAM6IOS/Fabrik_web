/**
 * Script to analyze inventory impact of duplicate completed work orders.
 * Checks BOM items for the affected products and current stock levels.
 *
 * Run: npx tsx scripts/analyze-inventory-impact.ts
 */
import { createAdminClient } from '../lib/supabase/admin';

async function main() {
  const supabase = createAdminClient();

  // The duplicate work orders
  const duplicates = [
    { orderId: 'effdba1a-db7e-48e5-b89a-8b2064449241', product: 'avatars', qty: 8 },
    { orderId: '9426acec-a161-40a8-841f-a49f40ccf84c', product: 'خزان ضغط عالي 500 لتر', qty: 30 },
  ];

  // For each product, find its BOM items
  for (const dup of duplicates) {
    console.log(`\n=== Product: ${dup.product} (order: ${dup.orderId}) ===\n`);

    // Find the product ID
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .eq('name', dup.product);

    if (!products || products.length === 0) {
      console.log('  Product not found in products table');
      continue;
    }

    for (const product of products) {
      console.log(`  Product ID: ${product.id}`);

      // Get BOM items for this product
      const { data: bomItems } = await supabase
        .from('bom_items')
        .select('raw_material_id, quantity_per_unit')
        .eq('product_id', product.id);

      if (!bomItems || bomItems.length === 0) {
        console.log('  No BOM items found');
        continue;
      }

      console.log(`  BOM items (${bomItems.length}):`);
      let totalDeductionPerUnit = 0;

      for (const bom of bomItems) {
        // Get raw material details
        const { data: material } = await supabase
          .from('raw_materials')
          .select('id, name, unit, current_balance')
          .eq('id', bom.raw_material_id)
          .single();

        if (material) {
          const deduction = bom.quantity_per_unit * dup.qty;
          totalDeductionPerUnit += deduction;
          console.log(`    - ${material.name} (${material.unit}):`);
          console.log(`        BOM: ${bom.quantity_per_unit} per unit × ${dup.qty} units = ${deduction} ${material.unit}`);
          console.log(`        Current balance: ${material.current_balance} ${material.unit}`);
        }
      }
    }
  }

  // Summary of all completed work orders that are duplicates
  console.log('\n\n=== SUMMARY: Completed duplicate work orders ===\n');
  console.log('Order effdba1a: 2 completed duplicates (qty=8 each)');
  console.log('  - id=32e342c1 (completed, qty=8) → KEEP');
  console.log('  - id=be5ba338 (completed, qty=8) → DELETE (reverse deduction)');
  console.log('  - id=f5d54c24 (in_progress, qty=8) → DELETE');
  console.log('  - id=99d8df00 (in_progress, qty=8) → DELETE');
  console.log('  - id=121a91e1 (in_progress, qty=8) → DELETE');
  console.log('  Net: 1 completed kept, 1 completed deleted → reverse deduction for 1 × qty=8');
  console.log('');
  console.log('Order 9426acec: 1 completed duplicate (qty=30)');
  console.log('  - id=97c2c83c (in_progress, qty=100) → KEEP');
  console.log('  - id=1d3862a7 (completed, qty=30) → DELETE (reverse deduction)');
  console.log('  Net: 0 completed kept, 1 completed deleted → reverse deduction for 1 × qty=30');
}

main().catch(console.error);
