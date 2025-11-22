// Apply Purchase Order Migration - Remaining Functions
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const sql = readFileSync('./supabase/migrations/012_purchase_orders_suppliers_module.sql', 'utf8');

// Extract function definitions (lines 226-1203)
const functionsSQL = sql.split('\n').slice(225, 1203).join('\n');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function apply() {
  console.log('Applying remaining PO functions...');

  // Split into individual functions
  const funcs = functionsSQL.split('-- =====').filter(s => s.trim());

  for (const func of funcs) {
    if (func.includes('CREATE OR REPLACE FUNCTION')) {
      const name = func.match(/FUNCTION\s+public\.(\w+)/)?.[1];
      console.log(`Applying: ${name}`);

      const {  error } = await supabase.from('_migration_exec').insert({ sql: func });
      if (error) console.error(`Error: ${error.message}`);
    }
  }

  console.log('Complete!');
}

apply();
