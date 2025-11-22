import { getClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Item = Database['public']['Tables']['items']['Row']
type Category = Database['public']['Tables']['categories']['Row']

export const inventoryService = {
  async getBusinessItems(businessId: string, filters?: {
    categoryId?: string
    isActive?: boolean
    lowStockOnly?: boolean
    searchTerm?: string
  }) {
    const supabase = getClient()

    const { data, error } = await supabase.rpc('get_business_items', {
      p_business_id: businessId,
      p_category_id: filters?.categoryId || '',
      p_is_active: filters?.isActive ?? true,
      p_low_stock_only: filters?.lowStockOnly ?? false,
      p_search_term: filters?.searchTerm || '',
    })

    if (error) throw error
    return data || []
  },

  async getItemByCode(businessId: string, code: string) {
    const supabase = getClient()

    const { data, error } = await supabase.rpc('get_item_by_code', {
      p_business_id: businessId,
      p_code: code,
    })

    if (error) throw error
    return data
  },

  async getCategories(businessId: string) {
    const supabase = getClient()

    const { data, error } = await supabase.rpc('get_business_categories', {
      p_business_id: businessId,
    })

    if (error) throw error
    return (data || []) as Category[]
  },

  async getLowStockItems(businessId: string) {
    const supabase = getClient()

    const { data, error } = await supabase.rpc('get_low_stock_items', {
      p_business_id: businessId,
    })

    if (error) throw error
    return data || []
  },

  async getInventoryValue(businessId: string) {
    const supabase = getClient()

    const { data, error } = await supabase.rpc('get_inventory_value', {
      p_business_id: businessId,
    })

    if (error) throw error
    return data
  },
}
