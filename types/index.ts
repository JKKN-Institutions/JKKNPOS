// Re-export all database types
export * from './database.types'

// Additional application types

// Cart types for POS
export interface CartItem {
  id: string
  item_id: string
  name: string
  price: number
  quantity: number
  discount: number
  tax: number
  total: number
  image_url?: string | null
}

export interface Cart {
  items: CartItem[]
  customer_id: string | null
  discount: number
  discount_type: 'percentage' | 'fixed'
  notes: string
}

// Report types
export interface SalesReportData {
  total_sales: number
  total_revenue: number
  total_discount: number
  total_tax: number
  average_sale: number
  sales_by_date: {
    date: string
    count: number
    total: number
  }[]
  sales_by_payment: {
    method: string
    count: number
    total: number
  }[]
  top_items: {
    item_id: string
    name: string
    quantity: number
    revenue: number
  }[]
}

export interface InventoryReportData {
  total_items: number
  total_stock_value: number
  low_stock_items: number
  out_of_stock_items: number
  items_by_category: {
    category_id: string
    category_name: string
    count: number
    value: number
  }[]
}

// Permission types
export interface Permissions {
  viewReports: boolean
  manageInventory: boolean
  manageStaff: boolean
  giveDiscount: boolean
  maxDiscountPercent: number
  deleteSales: boolean
  accessExpenses: boolean
}

// Receipt types
export interface ReceiptData {
  business: {
    name: string
    address: string | null
    phone: string | null
    email: string | null
  }
  sale: {
    sale_number: string
    date: string
    cashier: string
    subtotal: number
    discount: number
    tax: number
    total: number
  }
  items: {
    name: string
    quantity: number
    price: number
    total: number
  }[]
  payments: {
    method: string
    amount: number
  }[]
  customer?: {
    name: string
    loyalty_points?: number
  }
}
