import { create } from 'zustand'
import type { Profile, Business, Permissions } from '@/types'

interface UserStore {
  user: Profile | null
  business: Business | null
  isLoading: boolean

  // Actions
  setUser: (user: Profile | null) => void
  setBusiness: (business: Business | null) => void
  setLoading: (loading: boolean) => void
  reset: () => void

  // Permission helpers
  hasPermission: (permission: keyof Permissions) => boolean
  getMaxDiscount: () => number
}

const DEFAULT_PERMISSIONS: Record<string, Permissions> = {
  OWNER: {
    viewReports: true,
    manageInventory: true,
    manageStaff: true,
    giveDiscount: true,
    maxDiscountPercent: 100,
    deleteSales: true,
    accessExpenses: true,
  },
  MANAGER: {
    viewReports: true,
    manageInventory: true,
    manageStaff: false,
    giveDiscount: true,
    maxDiscountPercent: 20,
    deleteSales: false,
    accessExpenses: true,
  },
  STAFF: {
    viewReports: false,
    manageInventory: true,
    manageStaff: false,
    giveDiscount: true,
    maxDiscountPercent: 10,
    deleteSales: false,
    accessExpenses: false,
  },
  HELPER: {
    viewReports: false,
    manageInventory: false,
    manageStaff: false,
    giveDiscount: false,
    maxDiscountPercent: 0,
    deleteSales: false,
    accessExpenses: false,
  },
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  business: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setBusiness: (business) => set({ business }),
  setLoading: (isLoading) => set({ isLoading }),

  reset: () => set({ user: null, business: null, isLoading: false }),

  hasPermission: (permission) => {
    const { user } = get()
    if (!user) return false

    // Owner has all permissions
    if (user.role === 'OWNER') return true

    // Check custom permissions first
    if (user.permissions) {
      const customPerms = user.permissions as unknown as Permissions
      return Boolean(customPerms[permission])
    }

    // Fall back to default role permissions
    const defaultPerms = DEFAULT_PERMISSIONS[user.role]
    return Boolean(defaultPerms?.[permission])
  },

  getMaxDiscount: () => {
    const { user } = get()
    if (!user) return 0

    if (user.role === 'OWNER') return 100

    if (user.permissions) {
      const customPerms = user.permissions as unknown as Permissions
      return customPerms.maxDiscountPercent ?? 0
    }

    const defaultPerms = DEFAULT_PERMISSIONS[user.role]
    return defaultPerms?.maxDiscountPercent ?? 0
  },
}))
