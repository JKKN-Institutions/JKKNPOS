import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email('Invalid email').optional().or(z.literal('')).nullable(),
  address: z.string().max(200).optional().nullable(),
  credit_limit: z.number().min(0, 'Credit limit must be positive').default(0),
  notes: z.string().max(500).optional().nullable(),
})

export type CustomerFormValues = z.infer<typeof customerSchema>

export const quickAddCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().min(1, 'Phone is required').max(20),
})

export type QuickAddCustomerValues = z.infer<typeof quickAddCustomerSchema>
