import { z } from 'zod'

export const saleItemSchema = z.object({
  item_id: z.string().uuid(),
  name: z.string(),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0),
  discount: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  total: z.number().min(0),
})

export const paymentSchema = z.object({
  method: z.enum(['CASH', 'CARD', 'UPI', 'WALLET']),
  amount: z.number().min(0.01, 'Amount must be positive'),
  reference: z.string().max(100).optional().nullable(),
})

export const saleSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  items: z.array(saleItemSchema).min(1, 'At least one item is required'),
  subtotal: z.number().min(0),
  discount: z.number().min(0).default(0),
  discount_type: z.enum(['percentage', 'fixed']).default('fixed'),
  tax: z.number().min(0).default(0),
  total: z.number().min(0),
  payments: z.array(paymentSchema).min(1, 'At least one payment is required'),
  notes: z.string().max(500).optional().nullable(),
})

export type SaleItemValues = z.infer<typeof saleItemSchema>
export type PaymentValues = z.infer<typeof paymentSchema>
export type SaleFormValues = z.infer<typeof saleSchema>
