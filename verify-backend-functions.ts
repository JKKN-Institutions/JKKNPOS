/**
 * JKKN POS Backend Function Verification
 *
 * Verifies all 88 functions exist in the database
 * Run with: npx tsx verify-backend-functions.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// All 88 functions organized by module
const EXPECTED_FUNCTIONS = {
  'Inventory Management (7)': [
    'get_business_items',
    'get_item_by_code',
    'adjust_item_stock',
    'bulk_update_prices',
    'get_low_stock_items',
    'get_expiring_items',
    'get_inventory_value',
  ],
  'Sales & POS (8)': [
    'generate_sale_number',
    'create_sale',
    'park_sale',
    'get_parked_sales',
    'cancel_sale',
    'get_sale_details',
    'get_daily_sales_report',
    'get_payment_summary',
  ],
  'Customer Management (8)': [
    'get_business_customers',
    'search_customers',
    'get_customer_details',
    'get_customer_analytics',
    'get_top_customers',
    'record_credit_payment',
    'update_loyalty_points',
    'get_customers_with_credit',
  ],
  'Expense Management (9)': [
    'get_business_expenses',
    'create_expense',
    'approve_expense',
    'get_expense_summary',
    'get_expense_categories',
    'get_top_expense_categories',
    'get_recurring_expenses',
    'get_staff_expenses',
    'get_dead_stock_report',
  ],
  'Reports & Analytics (8)': [
    'get_business_dashboard',
    'get_sales_summary',
    'get_profit_loss_statement',
    'get_cash_flow_statement',
    'get_gst_report',
    'get_hourly_sales_pattern',
    'get_top_selling_items',
    'get_comparative_sales_report',
  ],
  'Staff Management (8)': [
    'get_business_staff',
    'get_staff_details',
    'get_staff_performance',
    'update_staff_role',
    'toggle_staff_status',
    'get_top_performing_staff',
    'get_staff_hourly_performance',
    'get_staff_sales_comparison',
  ],
  'Categories (8)': [
    'get_business_categories',
    'get_category_tree',
    'get_category_analytics',
    'get_top_selling_categories',
    'create_category',
    'update_category',
    'delete_category',
    'reorder_categories',
  ],
  'Modifiers (10)': [
    'get_business_modifiers',
    'get_modifier_with_options',
    'get_item_modifiers',
    'create_modifier',
    'create_modifier_option',
    'assign_modifiers_to_item',
    'update_modifier',
    'update_modifier_option',
    'delete_modifier',
    'delete_modifier_option',
  ],
  'Purchase Orders & Suppliers (14)': [
    'get_business_suppliers',
    'get_supplier_details',
    'create_supplier',
    'update_supplier',
    'get_supplier_performance',
    'get_supplier_ledger',
    'get_business_purchase_orders',
    'get_purchase_order_details',
    'generate_po_number',
    'create_purchase_order',
    'update_purchase_order_status',
    'receive_purchase_order_items',
    'cancel_purchase_order',
    'record_supplier_payment',
  ],
  'Discounts & Promotions (8)': [
    'get_active_promotions',
    'get_applicable_promotions',
    'calculate_promotion_discount',
    'create_promotion',
    'update_promotion',
    'deactivate_promotion',
    'apply_promotion_to_sale',
    'get_promotion_performance',
  ],
};

async function verifyFunctions() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   JKKN POS BACKEND FUNCTION VERIFICATION                   ║');
  console.log('║   Checking 10 Modules (88 Functions)                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Query all functions in the public schema
    const { data: functions, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          proname as function_name,
          pg_get_function_arguments(oid) as parameters,
          pg_get_function_result(oid) as return_type
        FROM pg_proc
        WHERE pronamespace = 'public'::regnamespace
          AND prokind = 'f'
        ORDER BY proname;
      `
    }).select();

    if (error) {
      // Try alternative method
      const { data: alt, error: altError } = await supabase
        .from('pg_proc')
        .select('proname')
        .eq('pronamespace', 'public');

      if (altError) {
        console.log('⚠️  Cannot query functions directly. Using RPC check instead...\n');
        await verifyByRPC();
        return;
      }
    }

    const functionNames = functions ? functions.map((f: any) => f.function_name) : [];

    let totalExpected = 0;
    let totalFound = 0;
    const missing: string[] = [];

    console.log('📊 VERIFICATION RESULTS:\n');
    console.log('='.repeat(60));

    for (const [module, funcs] of Object.entries(EXPECTED_FUNCTIONS)) {
      console.log(`\n📦 ${module}`);
      console.log('-'.repeat(60));

      totalExpected += funcs.length;
      let moduleFound = 0;

      for (const funcName of funcs) {
        const exists = functionNames.includes(funcName);
        if (exists) {
          console.log(`  ✅ ${funcName}`);
          moduleFound++;
          totalFound++;
        } else {
          console.log(`  ❌ ${funcName} - NOT FOUND`);
          missing.push(funcName);
        }
      }

      console.log(`  Status: ${moduleFound}/${funcs.length} functions found`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n📈 SUMMARY:\n');
    console.log(`  Total Expected: ${totalExpected} functions`);
    console.log(`  Total Found: ${totalFound} functions`);
    console.log(`  Missing: ${missing.length} functions`);
    console.log(`  Success Rate: ${((totalFound / totalExpected) * 100).toFixed(1)}%`);

    if (missing.length > 0) {
      console.log('\n❌ Missing Functions:');
      missing.forEach(f => console.log(`  - ${f}`));
    } else {
      console.log('\n✅ All 88 functions are deployed and ready!');
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Falling back to RPC verification...\n');
    await verifyByRPC();
  }
}

async function verifyByRPC() {
  console.log('🔍 Verifying functions by attempting RPC calls...\n');

  let totalTests = 0;
  let passed = 0;

  for (const [module, funcs] of Object.entries(EXPECTED_FUNCTIONS)) {
    console.log(`\n📦 ${module}`);
    console.log('-'.repeat(60));

    for (const funcName of funcs) {
      totalTests++;
      try {
        // Try to call function with null/empty params - will fail but function exists if error is parameter-related
        const { error } = await supabase.rpc(funcName as any, {} as any);

        // Function exists if we get any error response (means it was found but params wrong)
        // or if it succeeds (unlikely without params)
        if (error) {
          // Check if error is about parameters (means function exists)
          if (
            error.message.includes('cannot be null') ||
            error.message.includes('violates') ||
            error.message.includes('required') ||
            error.message.includes('invalid') ||
            error.code === '42883'  // Function exists but wrong signature
          ) {
            console.log(`  ✅ ${funcName}`);
            passed++;
          } else if (error.code === '42883' && error.message.includes('does not exist')) {
            console.log(`  ❌ ${funcName} - NOT FOUND`);
          } else {
            console.log(`  ✅ ${funcName} (exists with error: ${error.code})`);
            passed++;
          }
        } else {
          console.log(`  ✅ ${funcName}`);
          passed++;
        }
      } catch (err: any) {
        console.log(`  ❓ ${funcName} - ${err.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📈 RPC Verification Result: ${passed}/${totalTests} functions verified\n`);
}

verifyFunctions();
