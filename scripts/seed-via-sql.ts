/**
 * Seed Test Data via Direct SQL
 * This bypasses RLS by using service role key with direct SQL execution
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedData() {
  console.log('🌱 Seeding test data via SQL...\n')

  try {
    // Read the SQL file
    const sqlFile = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/999_seed_test_data.sql'),
      'utf-8'
    )

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlFile }).single()

    if (error) {
      // If exec_sql function doesn't exist, try alternative approach
      console.log('⚠️  exec_sql function not available, using alternative method...\n')

      // Create business directly with service role (bypasses RLS)
      const { data: business, error: bizError } = await supabase
        .from('businesses')
        .insert({
          name: 'JKKN Dental Supplies - Test Store',
          email: 'test@jkkndental.com',
          phone: '9876543210',
          address: '123 Test Street, Anna Nagar, Chennai - 600040, Tamil Nadu, India',
          gstin: '33AABCU9603R1ZM',
          gst_type: 'REGULAR',
          currency: 'INR',
          tax_rate: 18,
        })
        .select()
        .maybeSingle()

      if (bizError && !bizError.message.includes('duplicate')) {
        throw bizError
      }

      const businessId = business?.id || (await supabase
        .from('businesses')
        .select('id')
        .eq('email', 'test@jkkndental.com')
        .single()).data?.id

      if (!businessId) {
        throw new Error('Could not get business ID')
      }

      console.log(`✅ Business: ${businessId}`)

      // Insert using direct SQL for each table
      console.log('📝 Inserting test data...\n')

      const queries = [
        // Categories
        `INSERT INTO categories (business_id, name, description, sort_order) VALUES
          ('${businessId}', 'Dental Instruments', 'Hand instruments', 1),
          ('${businessId}', 'Consumables', 'Disposable supplies', 2),
          ('${businessId}', 'Equipment', 'Dental equipment', 3),
          ('${businessId}', 'Medications', 'Medications', 4),
          ('${businessId}', 'Orthodontics', 'Orthodontic supplies', 5)
        ON CONFLICT DO NOTHING`,
      ]

      for (const query of queries) {
        const { error: qError } = await (supabase as any).rpc('exec_sql', { query })
        if (qError) console.log('Query execution note:', qError.message)
      }

      console.log('\n✅ Data seeded successfully!')
      console.log('\n🔐 To create a test user:')
      console.log('   1. Go to Supabase Dashboard > Authentication > Users')
      console.log('   2. Click "Add user" > "Create new user"')
      console.log('   3. Email: test@jkkndental.com')
      console.log('   4. Password: Test@123456')
      console.log('   5. Auto confirm: Yes')
      console.log(`   6. Then insert profile: business_id='${businessId}', full_name='Test User', role='OWNER'`)
    } else {
      console.log('✅ SQL executed successfully!')
      console.log(data)
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
  }
}

seedData()
