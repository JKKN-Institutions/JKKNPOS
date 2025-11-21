import { getClient } from '@/lib/supabase/client'
import type { TablesInsert, TablesUpdate } from '@/types'

const supabase = getClient()

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')
    .order('name')

  if (error) throw error
  return data
}

export async function getCategoryById(id: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createCategory(category: TablesInsert<'categories'>) {
  const { data, error } = await supabase
    .from('categories')
    .insert(category as never)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCategory(id: string, category: TablesUpdate<'categories'>) {
  const { data, error } = await supabase
    .from('categories')
    .update(category as never)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCategory(id: string) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}
