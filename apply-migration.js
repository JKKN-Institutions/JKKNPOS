// Script to apply remaining purchase order functions
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Read SQL file
const sql = fs.readFileSync('./supabase/migrations/012_purchase_orders_suppliers_module.sql', 'utf8');

// Extract only the function definitions (skip tables, indexes which are already created)
const functions = sql.split('CREATE OR REPLACE FUNCTION').slice(1);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyFunctions() {
  console.log(`Found ${functions.length} functions to apply`);

  for (let i = 0; i < functions.length; i++) {
    const funcSQL = 'CREATE OR REPLACE FUNCTION' + functions[i];
    const funcName = funcSQL.match(/FUNCTION\s+public\.(\w+)/)?.[1] || `function_${i+1}`;

    console.log(`Applying function ${i+1}/${functions.length}: ${funcName}...`);

    try {
      const { error } = await supabase.rpc('exec_sql', { query: funcSQL });
      if (error) {
        console.error(`Error applying ${funcName}:`, error.message);
      } else {
        console.log(`✓ ${funcName} applied successfully`);
      }
    } catch (err) {
      console.error(`Exception applying ${funcName}:`, err.message);
    }
  }

  console.log('Migration complete!');
}

applyFunctions().catch(console.error);
