"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Database } from '@/types/database.types'

type Business = Database['public']['Tables']['businesses']['Row']

interface StoreContextType {
  currentStore: Business | null
  stores: Business[]
  switchStore: (storeId: string) => void
  refreshStores: () => void
  loading: boolean
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentStore, setCurrentStore] = useState<Business | null>(null)
  const [stores, setStores] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = getClient()

  const refreshStores = async () => {
    try {
      setLoading(true)

      // Fetch all businesses (no is_active column in DB yet)
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching businesses:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        toast.error('Failed to load businesses. Please check your database connection.')
        return
      }

      console.log('Businesses fetched:', businesses?.length || 0, 'businesses')

      if (!businesses || businesses.length === 0) {
        console.warn('No businesses found in database. Please add test data.')
        console.warn('See TEST_DATA_SETUP_GUIDE.md for instructions')
        setStores([])
        setCurrentStore(null)
        return
      }

      setStores(businesses)

      // Get current store from localStorage or use first available
      const storedStoreId = typeof window !== 'undefined'
        ? localStorage.getItem('current_store_id')
        : null

      if (storedStoreId) {
        const store = businesses.find(s => s.id === storedStoreId)
        setCurrentStore(store || businesses[0])
      } else {
        setCurrentStore(businesses[0])
        if (typeof window !== 'undefined') {
          localStorage.setItem('current_store_id', businesses[0].id)
        }
      }
    } catch (err) {
      console.error('Error in refreshStores:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshStores()
  }, [])

  const switchStore = (storeId: string) => {
    const store = stores.find(s => s.id === storeId)
    if (store) {
      setCurrentStore(store)
      if (typeof window !== 'undefined') {
        localStorage.setItem('current_store_id', storeId)
      }
    }
  }

  return (
    <StoreContext.Provider value={{ currentStore, stores, switchStore, refreshStores, loading }}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStoreContext = () => {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error('useStoreContext must be used within StoreProvider')
  }
  return context
}
