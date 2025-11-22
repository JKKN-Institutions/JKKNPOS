import { getClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Customer = Database['public']['Tables']['customers']['Row']

export const customerService = {
  async getBusinessCustomers(businessId: string, filters?: {
    searchTerm?: string
    hasCredit?: boolean
  }) {
    const supabase = getClient()

    const { data, error } = await supabase.rpc('get_business_customers', {
      p_business_id: businessId,
      p_search_term: filters?.searchTerm || '',
      p_has_credit: filters?.hasCredit ?? false,
    })

    if (error) throw error
    return (data || []) as Customer[]
  },

  async searchCustomers(businessId: string, searchTerm: string) {
    const supabase = getClient()

    const { data, error } = await supabase.rpc('search_customers', {
      p_business_id: businessId,
      p_search_term: searchTerm,
    })

    if (error) throw error
    return (data || []) as Customer[]
  },

  async getCustomerDetails(customerId: string) {
    const supabase = getClient()

    const { data, error } = await supabase.rpc('get_customer_details', {
      p_customer_id: customerId,
    })

    if (error) throw error
    return data
  },

  async getTopCustomers(businessId: string, limit: number = 10) {
    const supabase = getClient()

    const { data, error } = await supabase.rpc('get_top_customers', {
      p_business_id: businessId,
      p_limit: limit,
    })

    if (error) throw error
    return data || []
  },
}
