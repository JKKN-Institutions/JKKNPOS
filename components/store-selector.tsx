"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils/currency"
import { getFromStorage, saveToStorage, mockStores } from "@/lib/mock-data"

type MockStore = typeof mockStores[0]

export function StoreSelector() {
  const [stores, setStores] = useState<MockStore[]>([])
  const [currentStore, setCurrentStore] = useState<MockStore | null>(null)

  useEffect(() => {
    const allStores = getFromStorage('mock_stores', mockStores).filter((s: MockStore) => s.is_active)
    setStores(allStores)

    const currentStoreId = getFromStorage('current_store_id', mockStores[0]?.id)
    const store = allStores.find((s: MockStore) => s.id === currentStoreId)
    setCurrentStore(store || allStores[0] || null)
  }, [])

  const handleSelectStore = (store: MockStore) => {
    setCurrentStore(store)
    saveToStorage('current_store_id', store.id)
    toast.success(`Switched to ${store.name}`)
  }

  const getStoreTypeIcon = (type: string) => {
    switch (type) {
      case 'warehouse': return '📦'
      case 'kiosk': return '🏪'
      default: return '🏬'
    }
  }

  if (!currentStore) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="justify-between gap-2 h-10 px-3 rounded-xl border-dashed"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="hidden sm:inline font-medium truncate max-w-[150px]">
              {currentStore.name.split(' - ')[1] || currentStore.name}
            </span>
            <span className="sm:hidden font-medium">
              {currentStore.code}
            </span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px]" align="start">
        <DropdownMenuLabel>Select Store</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {stores.map((store) => (
          <DropdownMenuItem
            key={store.id}
            onClick={() => handleSelectStore(store)}
            className="cursor-pointer py-3"
          >
            <div className="flex items-center gap-3 w-full">
              <span className="text-xl">{getStoreTypeIcon(store.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{store.name}</span>
                  {currentStore.id === store.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{store.code}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-medium">
                    {formatCurrency(store.today_sales)}
                  </span>
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
