import { getClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Sale = Database['public']['Tables']['sales']['Row']
type SaleItem = Database['public']['Tables']['sale_items']['Row']
type Payment = Database['public']['Tables']['payments']['Row']

export const salesService = {
  async generateSaleNumber(businessId: string) {
    const supabase = getClient()

    const { data, error } = await supabase.rpc('generate_sale_number', {
      p_business_id: businessId,
    })

    if (error) throw error
    return data as string
  },

  async createSale(sale: {
    businessId: string
    userId: string
    customerId?: string | null
    items: Array<{
      item_id: string
      name: string
      quantity: number
      price: number
      discount: number
      tax: number
      total: number
    }>
    payment: {
      method: 'CASH' | 'CARD' | 'UPI' | 'WALLET'
      amount: number
      reference?: string
    }
    subtotal: number
    discount: number
    discountType: 'AMOUNT' | 'PERCENTAGE'
    tax: number
    total: number
    notes?: string
  }) {
    const supabase = getClient()

    const { data, error } = await supabase.rpc('create_sale', {
      p_business_id: sale.businessId,
      p_user_id: sale.userId,
      p_customer_id: sale.customerId || null,
      p_items: sale.items,
      p_payment_method: sale.payment.method,
      p_payment_amount: sale.payment.amount,
      p_payment_reference: sale.payment.reference || null,
      p_subtotal: sale.subtotal,
      p_discount: sale.discount,
      p_discount_type: sale.discountType,
      p_tax: sale.tax,
      p_total: sale.total,
      p_notes: sale.notes || null,
    })

    if (error) throw error
    return data
  },

  async parkSale(sale: {
    businessId: string
    userId: string
    customerId?: string | null
    items: Array<{
      item_id: string
      name: string
      quantity: number
      price: number
      discount: number
      tax: number
      total: number
    }>
    subtotal: number
    discount: number
    discountType: 'AMOUNT' | 'PERCENTAGE'
    tax: number
    total: number
    notes?: string
  }) {
    const supabase = getClient()

    const { data, error } = await supabase.rpc('park_sale', {
      p_business_id: sale.businessId,
      p_user_id: sale.userId,
      p_customer_id: sale.customerId || null,
      p_items: sale.items,
      p_subtotal: sale.subtotal,
      p_discount: sale.discount,
      p_discount_type: sale.discountType,
      p_tax: sale.tax,
      p_total: sale.total,
      p_notes: sale.notes || null,
    })

    if (error) throw error
    return data
  },

  async getParkedSales(businessId: string) {
    const supabase = getClient()

    const { data, error } = await supabase.rpc('get_parked_sales', {
      p_business_id: businessId,
    })

    if (error) throw error
    return data || []
  },

  async getSaleDetails(saleId: string) {
    const supabase = getClient()

    const { data, error } = await supabase.rpc('get_sale_details', {
      p_sale_id: saleId,
    })

    if (error) throw error
    return data
  },

  async getDailySalesReport(businessId: string, date: string) {
    const supabase = getClient()

    const { data, error } = await supabase.rpc('get_daily_sales_report', {
      p_business_id: businessId,
      p_date: date,
    })

    if (error) throw error
    return data
  },

  async getPaymentSummary(businessId: string, startDate: string, endDate: string) {
    const supabase = getClient()

    const { data, error } = await supabase.rpc('get_payment_summary', {
      p_business_id: businessId,
      p_start_date: startDate,
      p_end_date: endDate,
    })

    if (error) throw error
    return data || []
  },

  async cancelSale(saleId: string, reason: string) {
    const supabase = getClient()

    const { data, error } = await supabase.rpc('cancel_sale', {
      p_sale_id: saleId,
      p_reason: reason,
    })

    if (error) throw error
    return data
  },
}
