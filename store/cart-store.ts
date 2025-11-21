import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Customer } from '@/types'

interface CartStore {
  items: CartItem[]
  customer: Customer | null
  discount: number
  discountType: 'percentage' | 'fixed'
  notes: string

  // Actions
  addItem: (item: Omit<CartItem, 'quantity' | 'discount' | 'tax' | 'total'>) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  updateItemDiscount: (itemId: string, discount: number) => void
  setCustomer: (customer: Customer | null) => void
  setDiscount: (amount: number, type: 'percentage' | 'fixed') => void
  setNotes: (notes: string) => void
  clearCart: () => void

  // Computed
  getSubtotal: () => number
  getDiscountAmount: () => number
  getTaxAmount: () => number
  getTotal: () => number
  getItemCount: () => number
}

const TAX_RATE = 0.18 // 18% GST

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      customer: null,
      discount: 0,
      discountType: 'fixed',
      notes: '',

      addItem: (item) => {
        const { items } = get()
        const existingIndex = items.findIndex((i) => i.item_id === item.item_id)

        if (existingIndex > -1) {
          // Increase quantity if item exists
          const newItems = [...items]
          const existing = newItems[existingIndex]
          const newQuantity = existing.quantity + 1
          const total = (existing.price * newQuantity) - existing.discount + existing.tax
          newItems[existingIndex] = {
            ...existing,
            quantity: newQuantity,
            total,
          }
          set({ items: newItems })
        } else {
          // Add new item
          const tax = item.price * TAX_RATE
          const newItem: CartItem = {
            ...item,
            quantity: 1,
            discount: 0,
            tax,
            total: item.price + tax,
          }
          set({ items: [...items, newItem] })
        }
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((i) => i.item_id !== itemId) })
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }

        const { items } = get()
        const newItems = items.map((item) => {
          if (item.item_id === itemId) {
            const subtotal = item.price * quantity
            const tax = subtotal * TAX_RATE
            const total = subtotal - item.discount + tax
            return { ...item, quantity, tax, total }
          }
          return item
        })
        set({ items: newItems })
      },

      updateItemDiscount: (itemId, discount) => {
        const { items } = get()
        const newItems = items.map((item) => {
          if (item.item_id === itemId) {
            const subtotal = item.price * item.quantity
            const tax = (subtotal - discount) * TAX_RATE
            const total = subtotal - discount + tax
            return { ...item, discount, tax, total }
          }
          return item
        })
        set({ items: newItems })
      },

      setCustomer: (customer) => set({ customer }),

      setDiscount: (amount, type) => set({ discount: amount, discountType: type }),

      setNotes: (notes) => set({ notes }),

      clearCart: () => set({
        items: [],
        customer: null,
        discount: 0,
        discountType: 'fixed',
        notes: '',
      }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      },

      getDiscountAmount: () => {
        const { discount, discountType } = get()
        const subtotal = get().getSubtotal()

        if (discountType === 'percentage') {
          return (subtotal * discount) / 100
        }
        return discount
      },

      getTaxAmount: () => {
        const subtotal = get().getSubtotal()
        const discountAmount = get().getDiscountAmount()
        return (subtotal - discountAmount) * TAX_RATE
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        const discountAmount = get().getDiscountAmount()
        const tax = get().getTaxAmount()
        return subtotal - discountAmount + tax
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'jkkn-cart-storage',
      partialize: (state) => ({
        items: state.items,
        customer: state.customer,
        discount: state.discount,
        discountType: state.discountType,
        notes: state.notes,
      }),
    }
  )
)
