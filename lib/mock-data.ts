// Mock data for prototype - remove when connecting to Supabase

export const mockCategories = [
  { id: "cat-1", name: "Dental Instruments", description: "Hand instruments for dental procedures", sort_order: 1 },
  { id: "cat-2", name: "Consumables", description: "Disposable dental supplies", sort_order: 2 },
  { id: "cat-3", name: "Equipment", description: "Dental equipment and machines", sort_order: 3 },
  { id: "cat-4", name: "Medications", description: "Dental medications and anesthetics", sort_order: 4 },
  { id: "cat-5", name: "Orthodontics", description: "Braces and orthodontic supplies", sort_order: 5 },
]

export const mockItems = [
  { id: "item-1", name: "Dental Mirror", category_id: "cat-1", price: 150, cost: 80, stock: 50, min_stock: 10, unit: "pieces", barcode: "DM001", sku: "SKU-DM001", is_active: true, category: { id: "cat-1", name: "Dental Instruments" } },
  { id: "item-2", name: "Explorer Probe", category_id: "cat-1", price: 120, cost: 60, stock: 45, min_stock: 10, unit: "pieces", barcode: "EP001", sku: "SKU-EP001", is_active: true, category: { id: "cat-1", name: "Dental Instruments" } },
  { id: "item-3", name: "Cotton Rolls (Pack of 100)", category_id: "cat-2", price: 250, cost: 150, stock: 8, min_stock: 20, unit: "pack", barcode: "CR001", sku: "SKU-CR001", is_active: true, category: { id: "cat-2", name: "Consumables" } },
  { id: "item-4", name: "Disposable Gloves (Box)", category_id: "cat-2", price: 450, cost: 300, stock: 25, min_stock: 10, unit: "box", barcode: "DG001", sku: "SKU-DG001", is_active: true, category: { id: "cat-2", name: "Consumables" } },
  { id: "item-5", name: "Dental Chair Cover", category_id: "cat-2", price: 180, cost: 100, stock: 5, min_stock: 15, unit: "pack", barcode: "DC001", sku: "SKU-DC001", is_active: true, category: { id: "cat-2", name: "Consumables" } },
  { id: "item-6", name: "LED Curing Light", category_id: "cat-3", price: 8500, cost: 5500, stock: 3, min_stock: 2, unit: "pieces", barcode: "LC001", sku: "SKU-LC001", is_active: true, category: { id: "cat-3", name: "Equipment" } },
  { id: "item-7", name: "Ultrasonic Scaler", category_id: "cat-3", price: 15000, cost: 10000, stock: 2, min_stock: 1, unit: "pieces", barcode: "US001", sku: "SKU-US001", is_active: true, category: { id: "cat-3", name: "Equipment" } },
  { id: "item-8", name: "Lidocaine 2% (10 vials)", category_id: "cat-4", price: 850, cost: 550, stock: 12, min_stock: 5, unit: "box", barcode: "LD001", sku: "SKU-LD001", is_active: true, category: { id: "cat-4", name: "Medications" } },
  { id: "item-9", name: "Composite Resin Kit", category_id: "cat-2", price: 3500, cost: 2200, stock: 6, min_stock: 3, unit: "kit", barcode: "CK001", sku: "SKU-CK001", is_active: true, category: { id: "cat-2", name: "Consumables" } },
  { id: "item-10", name: "Orthodontic Brackets Set", category_id: "cat-5", price: 2800, cost: 1800, stock: 4, min_stock: 2, unit: "set", barcode: "OB001", sku: "SKU-OB001", is_active: true, category: { id: "cat-5", name: "Orthodontics" } },
]

export const mockCustomers = [
  { id: "cust-1", business_id: "mock-business-id", name: "Dr. Rajesh Kumar", phone: "9876543210", email: "rajesh@clinic.com", address: "123 Medical Street, Chennai", loyalty_points: 500, credit_limit: 50000, credit_balance: 0, total_purchases: 125000, last_visit: null, notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "cust-2", business_id: "mock-business-id", name: "City Dental Clinic", phone: "9876543211", email: "city@dental.com", address: "456 Healthcare Ave, Coimbatore", loyalty_points: 1200, credit_limit: 100000, credit_balance: 15000, total_purchases: 450000, last_visit: null, notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "cust-3", business_id: "mock-business-id", name: "Dr. Priya Sharma", phone: "9876543212", email: "priya@dentist.com", address: "789 Smile Road, Madurai", loyalty_points: 300, credit_limit: 30000, credit_balance: 0, total_purchases: 75000, last_visit: null, notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "cust-4", business_id: "mock-business-id", name: "Sunshine Dental Care", phone: "9876543213", email: "sunshine@care.com", address: "321 Dental Lane, Salem", loyalty_points: 800, credit_limit: 75000, credit_balance: 5000, total_purchases: 280000, last_visit: null, notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "cust-5", business_id: "mock-business-id", name: "Dr. Arun Prakash", phone: "9876543214", email: "arun@practice.com", address: "654 Tooth Street, Trichy", loyalty_points: 150, credit_limit: 25000, credit_balance: 0, total_purchases: 45000, last_visit: null, notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
]

export const mockSales = [
  { id: "sale-1", sale_number: "INV-241121-0001", customer_id: "cust-1", total: 4500, subtotal: 4200, discount: 200, tax: 500, status: "COMPLETED", created_at: new Date().toISOString(), customer: { name: "Dr. Rajesh Kumar" }, user: { full_name: "Test User" } },
  { id: "sale-2", sale_number: "INV-241121-0002", customer_id: "cust-2", total: 12500, subtotal: 11800, discount: 500, tax: 1200, status: "COMPLETED", created_at: new Date(Date.now() - 3600000).toISOString(), customer: { name: "City Dental Clinic" }, user: { full_name: "Test User" } },
  { id: "sale-3", sale_number: "INV-241121-0003", customer_id: null, total: 850, subtotal: 800, discount: 0, tax: 50, status: "COMPLETED", created_at: new Date(Date.now() - 7200000).toISOString(), customer: null, user: { full_name: "Test User" } },
  { id: "sale-4", sale_number: "INV-241120-0001", customer_id: "cust-3", total: 3200, subtotal: 3000, discount: 100, tax: 300, status: "COMPLETED", created_at: new Date(Date.now() - 86400000).toISOString(), customer: { name: "Dr. Priya Sharma" }, user: { full_name: "Test User" } },
  { id: "sale-5", sale_number: "INV-241120-0002", customer_id: "cust-4", total: 8900, subtotal: 8500, discount: 300, tax: 700, status: "COMPLETED", created_at: new Date(Date.now() - 90000000).toISOString(), customer: { name: "Sunshine Dental Care" }, user: { full_name: "Test User" } },
]

export const mockStaff = [
  { id: "staff-1", full_name: "Admin User", phone: "9876543200", role: "OWNER", is_active: true },
  { id: "staff-2", full_name: "Pradeep Manager", phone: "9876543201", role: "MANAGER", is_active: true },
  { id: "staff-3", full_name: "Kavitha Staff", phone: "9876543202", role: "STAFF", is_active: true },
  { id: "staff-4", full_name: "Ravi Helper", phone: "9876543203", role: "HELPER", is_active: true },
  { id: "staff-5", full_name: "Lakshmi Staff", phone: "9876543204", role: "STAFF", is_active: false },
]

export const mockStores = [
  {
    id: "store-1",
    name: "JKKN Dental - Main Store",
    code: "MAIN-001",
    type: "retail",
    address: "123 Anna Nagar, Chennai",
    manager: "Pradeep Kumar",
    phone: "9876543100",
    email: "main@jkkndental.com",
    tax_rate: 18,
    hours: "9 AM - 9 PM",
    is_active: true,
    today_sales: 45600,
    today_orders: 28,
    staff_count: 5,
    inventory_items: 150,
    created_at: new Date().toISOString()
  },
  {
    id: "store-2",
    name: "JKKN Dental - Mall Branch",
    code: "MALL-002",
    type: "retail",
    address: "456 Phoenix Mall, Coimbatore",
    manager: "Kavitha S",
    phone: "9876543101",
    email: "mall@jkkndental.com",
    tax_rate: 18,
    hours: "10 AM - 10 PM",
    is_active: true,
    today_sales: 32400,
    today_orders: 18,
    staff_count: 3,
    inventory_items: 120,
    created_at: new Date().toISOString()
  },
  {
    id: "store-3",
    name: "JKKN Dental - Warehouse",
    code: "WH-003",
    type: "warehouse",
    address: "789 Industrial Area, Madurai",
    manager: "Ravi M",
    phone: "9876543102",
    email: "warehouse@jkkndental.com",
    tax_rate: 18,
    hours: "8 AM - 6 PM",
    is_active: true,
    today_sales: 125000,
    today_orders: 8,
    staff_count: 4,
    inventory_items: 500,
    created_at: new Date().toISOString()
  },
]

// Helper functions for localStorage
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : defaultValue
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

// Initialize mock data in localStorage
export function initializeMockData() {
  if (typeof window === 'undefined') return

  if (!localStorage.getItem('mock_categories')) {
    saveToStorage('mock_categories', mockCategories)
  }
  if (!localStorage.getItem('mock_items')) {
    saveToStorage('mock_items', mockItems)
  }
  if (!localStorage.getItem('mock_customers')) {
    saveToStorage('mock_customers', mockCustomers)
  }
  if (!localStorage.getItem('mock_sales')) {
    saveToStorage('mock_sales', mockSales)
  }
  if (!localStorage.getItem('mock_staff')) {
    saveToStorage('mock_staff', mockStaff)
  }
  if (!localStorage.getItem('mock_stores')) {
    saveToStorage('mock_stores', mockStores)
  }
  if (!localStorage.getItem('current_store_id')) {
    saveToStorage('current_store_id', mockStores[0].id)
  }
}
