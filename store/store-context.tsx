"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getFromStorage, saveToStorage, mockStores } from '@/lib/mock-data'

export interface Store {
  id: string
  name: string
  code: string
  type: string
  address: string
  manager: string
  phone: string
  email: string
  tax_rate: number
  hours: string
  is_active: boolean
  today_sales: number
  today_orders: number
  staff_count: number
  inventory_items: number
  created_at: string
}

interface StoreContextType {
  currentStore: Store | null
  stores: Store[]
  switchStore: (storeId: string) => void
  refreshStores: () => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentStore, setCurrentStore] = useState<Store | null>(null)
  const [stores, setStores] = useState<Store[]>([])

  const refreshStores = () => {
    const allStores = getFromStorage('mock_stores', mockStores)
    setStores(allStores.filter((s: Store) => s.is_active))

    const currentStoreId = getFromStorage('current_store_id', mockStores[0]?.id)
    const store = allStores.find((s: Store) => s.id === currentStoreId)
    setCurrentStore(store || allStores[0] || null)
  }

  useEffect(() => {
    refreshStores()
  }, [])

  const switchStore = (storeId: string) => {
    const store = stores.find(s => s.id === storeId)
    if (store) {
      setCurrentStore(store)
      saveToStorage('current_store_id', storeId)
    }
  }

  return (
    <StoreContext.Provider value={{ currentStore, stores, switchStore, refreshStores }}>
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
