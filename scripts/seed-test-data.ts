/**
 * Test Data Seeding Script
 * Purpose: Add sample data to verify database tables are storing correctly
 * Run: npx tsx scripts/seed-test-data.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
})

async function seedTestData() {
  console.log('🌱 Starting test data seeding...\n')

  try {
    // 1. Create Test Business
    console.log('1️⃣ Creating test business...')
    const { data: business, error: businessError } = await supabase
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
      .single()

    if (businessError) {
      console.error('❌ Business creation failed:', businessError.message)
      return
    }

    console.log(`✅ Business created: ${business.name} (ID: ${business.id})`)

    // 2. Create Categories
    console.log('\n2️⃣ Creating categories...')
    const categories = [
      { name: 'Dental Instruments', description: 'Hand instruments for dental procedures', sort_order: 1 },
      { name: 'Consumables', description: 'Disposable dental supplies', sort_order: 2 },
      { name: 'Equipment', description: 'Dental equipment and machines', sort_order: 3 },
      { name: 'Medications', description: 'Dental medications and anesthetics', sort_order: 4 },
      { name: 'Orthodontics', description: 'Braces and orthodontic supplies', sort_order: 5 },
    ]

    const { data: createdCategories, error: categoriesError } = await supabase
      .from('categories')
      .insert(
        categories.map(cat => ({
          ...cat,
          business_id: business.id,
        }))
      )
      .select()

    if (categoriesError) {
      console.error('❌ Categories creation failed:', categoriesError.message)
      return
    }

    console.log(`✅ Created ${createdCategories.length} categories`)

    // 3. Create Items
    console.log('\n3️⃣ Creating inventory items...')
    const items = [
      {
        name: 'Dental Mirror',
        category: 'Dental Instruments',
        sku: 'SKU-DM001',
        barcode: 'DM001',
        cost_price: 80,
        sell_price: 150,
        stock: 50,
        min_stock: 10,
        unit: 'pieces',
        tax_rate: 18,
      },
      {
        name: 'Explorer Probe',
        category: 'Dental Instruments',
        sku: 'SKU-EP001',
        barcode: 'EP001',
        cost_price: 60,
        sell_price: 120,
        stock: 45,
        min_stock: 10,
        unit: 'pieces',
        tax_rate: 18,
      },
      {
        name: 'Cotton Rolls (Pack of 100)',
        category: 'Consumables',
        sku: 'SKU-CR001',
        barcode: 'CR001',
        cost_price: 150,
        sell_price: 250,
        stock: 8,
        min_stock: 20,
        unit: 'pack',
        tax_rate: 18,
      },
      {
        name: 'Disposable Gloves (Box)',
        category: 'Consumables',
        sku: 'SKU-DG001',
        barcode: 'DG001',
        cost_price: 300,
        sell_price: 450,
        stock: 25,
        min_stock: 10,
        unit: 'box',
        tax_rate: 18,
      },
      {
        name: 'LED Curing Light',
        category: 'Equipment',
        sku: 'SKU-LC001',
        barcode: 'LC001',
        cost_price: 5500,
        sell_price: 8500,
        stock: 3,
        min_stock: 2,
        unit: 'pieces',
        tax_rate: 18,
      },
      {
        name: 'Ultrasonic Scaler',
        category: 'Equipment',
        sku: 'SKU-US001',
        barcode: 'US001',
        cost_price: 10000,
        sell_price: 15000,
        stock: 2,
        min_stock: 1,
        unit: 'pieces',
        tax_rate: 18,
      },
      {
        name: 'Lidocaine 2% (10 vials)',
        category: 'Medications',
        sku: 'SKU-LD001',
        barcode: 'LD001',
        cost_price: 550,
        sell_price: 850,
        stock: 12,
        min_stock: 5,
        unit: 'box',
        tax_rate: 18,
      },
      {
        name: 'Composite Resin Kit',
        category: 'Consumables',
        sku: 'SKU-CK001',
        barcode: 'CK001',
        cost_price: 2200,
        sell_price: 3500,
        stock: 6,
        min_stock: 3,
        unit: 'kit',
        tax_rate: 18,
      },
      {
        name: 'Orthodontic Brackets Set',
        category: 'Orthodontics',
        sku: 'SKU-OB001',
        barcode: 'OB001',
        cost_price: 1800,
        sell_price: 2800,
        stock: 4,
        min_stock: 2,
        unit: 'set',
        tax_rate: 18,
      },
      {
        name: 'Dental Chair Cover (100 pcs)',
        category: 'Consumables',
        sku: 'SKU-DC001',
        barcode: 'DC001',
        cost_price: 100,
        sell_price: 180,
        stock: 15,
        min_stock: 10,
        unit: 'pack',
        tax_rate: 18,
      },
    ]

    const itemsToInsert = items.map(item => {
      const category = createdCategories.find(c => c.name === item.category)
      return {
        business_id: business.id,
        category_id: category?.id || null,
        name: item.name,
        sku: item.sku,
        barcode: item.barcode,
        cost_price: item.cost_price,
        sell_price: item.sell_price,
        stock: item.stock,
        min_stock: item.min_stock,
        unit: item.unit,
        tax_rate: item.tax_rate,
      }
    })

    const { data: createdItems, error: itemsError } = await supabase
      .from('items')
      .insert(itemsToInsert)
      .select()

    if (itemsError) {
      console.error('❌ Items creation failed:', itemsError.message)
      return
    }

    console.log(`✅ Created ${createdItems.length} inventory items`)

    // 4. Create Customers
    console.log('\n4️⃣ Creating customers...')
    const customers = [
      {
        name: 'Dr. Rajesh Kumar',
        phone: '9876543210',
        email: 'rajesh@clinic.com',
        address: '123 Medical Street, T. Nagar, Chennai - 600017',
        loyalty_points: 500,
        credit_limit: 50000,
        credit_balance: 0,
      },
      {
        name: 'City Dental Clinic',
        phone: '9876543211',
        email: 'city@dental.com',
        address: '456 Healthcare Ave, RS Puram, Coimbatore - 641002',
        loyalty_points: 1200,
        credit_limit: 100000,
        credit_balance: 15000,
      },
      {
        name: 'Dr. Priya Sharma',
        phone: '9876543212',
        email: 'priya@dentist.com',
        address: '789 Smile Road, Anna Salai, Madurai - 625001',
        loyalty_points: 300,
        credit_limit: 30000,
        credit_balance: 0,
      },
      {
        name: 'Sunshine Dental Care',
        phone: '9876543213',
        email: 'sunshine@care.com',
        address: '321 Dental Lane, Fairlands, Salem - 636016',
        loyalty_points: 800,
        credit_limit: 75000,
        credit_balance: 5000,
      },
      {
        name: 'Dr. Arun Prakash',
        phone: '9876543214',
        email: 'arun@practice.com',
        address: '654 Tooth Street, Thillai Nagar, Trichy - 620018',
        loyalty_points: 150,
        credit_limit: 25000,
        credit_balance: 0,
      },
    ]

    const { data: createdCustomers, error: customersError } = await supabase
      .from('customers')
      .insert(
        customers.map(customer => ({
          ...customer,
          business_id: business.id,
        }))
      )
      .select()

    if (customersError) {
      console.error('❌ Customers creation failed:', customersError.message)
      return
    }

    console.log(`✅ Created ${createdCustomers.length} customers`)

    // 5. Create Test User Profile (if not exists)
    console.log('\n5️⃣ Creating test user profile...')

    // First, create auth user
    const testEmail = 'test@jkkndental.com'
    const testPassword = 'Test@123456'

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    })

    if (authError && !authError.message.includes('already registered')) {
      console.error('❌ Auth user creation failed:', authError.message)
    } else if (authData.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          business_id: business.id,
          full_name: 'Test Admin User',
          role: 'OWNER',
          phone: '9876543200',
          is_active: true,
        })

      if (profileError && !profileError.message.includes('duplicate')) {
        console.error('❌ Profile creation failed:', profileError.message)
      } else {
        console.log(`✅ Test user created`)
        console.log(`   Email: ${testEmail}`)
        console.log(`   Password: ${testPassword}`)
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('✅ TEST DATA SEEDING COMPLETED SUCCESSFULLY!')
    console.log('='.repeat(60))
    console.log('\n📊 Summary:')
    console.log(`   • Business: ${business.name}`)
    console.log(`   • Business ID: ${business.id}`)
    console.log(`   • Categories: ${createdCategories.length}`)
    console.log(`   • Items: ${createdItems.length}`)
    console.log(`   • Customers: ${createdCustomers.length}`)
    console.log(`   • Test User: ${testEmail}`)
    console.log('\n🔐 Login Credentials:')
    console.log(`   Email: ${testEmail}`)
    console.log(`   Password: ${testPassword}`)
    console.log('\n🎯 Next Steps:')
    console.log('   1. Run: npm run dev')
    console.log('   2. Go to: http://localhost:3000/login')
    console.log('   3. Login with the credentials above')
    console.log('   4. Test the POS system with real data!')
    console.log('')

  } catch (error: any) {
    console.error('\n❌ Seeding failed:', error.message)
    console.error('Full error:', error)
  }
}

// Run the seeding
seedTestData()
