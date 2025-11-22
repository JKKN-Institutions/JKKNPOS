"use client"

import { Check, ChevronsUpDown, MapPin } from "lucide-react"
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
import { useStoreContext } from "@/store/store-context"

export function StoreSelector() {
  const { currentStore, stores, switchStore } = useStoreContext()

  const handleSelectStore = (storeId: string) => {
    switchStore(storeId)
    const selectedStore = stores.find(s => s.id === storeId)
    if (selectedStore) {
      toast.success(`Switched to ${selectedStore.name}`)
    }
  }

  if (!currentStore) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="justify-between gap-1.5 md:gap-2 h-9 md:h-10 px-2 md:px-3 rounded-lg md:rounded-xl border-dashed"
        >
          <div className="flex items-center gap-1 md:gap-2">
            <MapPin className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            <span className="hidden sm:inline font-medium text-xs md:text-sm truncate max-w-[80px] md:max-w-[150px]">
              {currentStore.name}
            </span>
            <span className="sm:hidden font-medium text-xs">
              {currentStore.name.substring(0, 10)}
            </span>
          </div>
          <ChevronsUpDown className="h-3 w-3 md:h-4 md:w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[300px]" align="start">
        <DropdownMenuLabel>Select Business</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {stores.map((store) => (
          <DropdownMenuItem
            key={store.id}
            onClick={() => handleSelectStore(store.id)}
            className="cursor-pointer py-3"
          >
            <div className="flex items-center gap-3 w-full">
              <span className="text-xl">🏬</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{store.name}</span>
                  {currentStore.id === store.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {store.email || store.phone || ''}
                </div>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
