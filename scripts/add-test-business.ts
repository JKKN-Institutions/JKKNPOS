import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addTestBusiness() {
  console.log('🚀 Adding test business to database...\n')

  try {
    // Insert test business
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
      console.error('❌ Error creating business:', businessError)
      return
    }

    console.log('✅ Test business created successfully!')
    console.log('📋 Business Details:')
    console.log('   ID:', business.id)
    console.log('   Name:', business.name)
    console.log('   Email:', business.email)
    console.log('   Phone:', business.phone)
    console.log('   GSTIN:', business.gstin)
    console.log('\n✨ You can now reload your application and the business should appear!\n')
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

addTestBusiness()
