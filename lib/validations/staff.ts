import { z } from 'zod'

export const staffSchema = z.object({
  email: z.string().email('Invalid email'),
  full_name: z.string().min(1, 'Name is required').max(100),
  phone: z.string().max(20).optional().nullable(),
  role: z.enum(['OWNER', 'MANAGER', 'STAFF', 'HELPER']),
  permissions: z.object({
    viewReports: z.boolean().default(false),
    manageInventory: z.boolean().default(false),
    manageStaff: z.boolean().default(false),
    giveDiscount: z.boolean().default(false),
    maxDiscountPercent: z.number().min(0).max(100).default(0),
    deleteSales: z.boolean().default(false),
    accessExpenses: z.boolean().default(false),
  }).optional(),
  is_active: z.boolean().default(true),
})

export type StaffFormValues = z.infer<typeof staffSchema>

export const permissionsSchema = z.object({
  viewReports: z.boolean(),
  manageInventory: z.boolean(),
  manageStaff: z.boolean(),
  giveDiscount: z.boolean(),
  maxDiscountPercent: z.number().min(0).max(100),
  deleteSales: z.boolean(),
  accessExpenses: z.boolean(),
})

export type PermissionsFormValues = z.infer<typeof permissionsSchema>
