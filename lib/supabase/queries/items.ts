import { getClient } from '@/lib/supabase/client'
import type { Item, TablesInsert, TablesUpdate } from '@/types'

const supabase = getClient()

export interface ItemFilters {
  search?: string
  category_id?: string
  is_active?: boolean
  low_stock?: boolean
}

export async function getItems(filters?: ItemFilters) {
  let query = supabase
    .from('items')
    .select(`
      *,
      category:categories(id, name)
    `)
    .order('name')

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,barcode.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`)
  }

  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id)
  }

  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active)
  }

  if (filters?.low_stock) {
    query = query.lte('stock', supabase.rpc('get_min_stock'))
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getItemById(id: string) {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      category:categories(id, name)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getItemByBarcode(barcode: string) {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('barcode', barcode)
    .eq('is_active', true)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createItem(item: TablesInsert<'items'>) {
  const { data, error } = await supabase
    .from('items')
    .insert(item as never)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateItem(id: string, item: TablesUpdate<'items'>) {
  const { data, error } = await supabase
    .from('items')
    .update(item as never)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteItem(id: string) {
  // Soft delete - set is_active to false
  const { error } = await supabase
    .from('items')
    .update({ is_active: false } as never)
    .eq('id', id)

  if (error) throw error
}

export async function getLowStockItems() {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('is_active', true)
    .filter('stock', 'lte', supabase.rpc('get_min_stock_value'))

  // Alternative: fetch and filter client-side
  const { data: items, error: itemsError } = await supabase
    .from('items')
    .select('*')
    .eq('is_active', true)

  if (itemsError) throw itemsError

  type ItemRow = { stock: number; min_stock: number }
  const typedItems = (items || []) as ItemRow[]
  return typedItems.filter(item => item.stock <= item.min_stock)
}

export interface StockAdjustment {
  item_id: string
  quantity: number
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  reason?: string
  user_id: string
  business_id: string
}

export async function adjustStock(adjustment: StockAdjustment) {
  // Get current item
  const { data: item, error: itemError } = await supabase
    .from('items')
    .select('stock')
    .eq('id', adjustment.item_id)
    .single()

  if (itemError) throw itemError

  // Calculate new stock
  const typedItem = item as { stock: number }
  let newStock = typedItem.stock
  if (adjustment.type === 'IN') {
    newStock += adjustment.quantity
  } else if (adjustment.type === 'OUT') {
    newStock -= adjustment.quantity
  } else {
    newStock = adjustment.quantity
  }

  // Update item stock
  const { error: updateError } = await supabase
    .from('items')
    .update({ stock: newStock } as never)
    .eq('id', adjustment.item_id)

  if (updateError) throw updateError

  // Log stock movement
  const { error: movementError } = await supabase
    .from('stock_movements')
    .insert({
      item_id: adjustment.item_id,
      business_id: adjustment.business_id,
      quantity: adjustment.quantity,
      type: adjustment.type,
      reason: adjustment.reason,
      user_id: adjustment.user_id,
    } as never)

  if (movementError) throw movementError

  return { newStock }
}

export async function getStockMovements(itemId: string) {
  const { data, error } = await supabase
    .from('stock_movements')
    .select(`
      *,
      user:profiles(full_name)
    `)
    .eq('item_id', itemId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}
