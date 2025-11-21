import { z } from 'zod'

export const itemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  category_id: z.string().uuid('Invalid category').optional().nullable(),
  price: z.number().min(0, 'Price must be positive'),
  cost: z.number().min(0, 'Cost must be positive').optional().nullable(),
  stock: z.number().int().min(0, 'Stock must be positive'),
  min_stock: z.number().int().min(0, 'Min stock must be positive').default(0),
  max_stock: z.number().int().min(0, 'Max stock must be positive').optional().nullable(),
  unit: z.string().min(1, 'Unit is required').default('pieces'),
  barcode: z.string().max(50).optional().nullable(),
  sku: z.string().max(50).optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  is_active: z.boolean().default(true),
})

export type ItemFormValues = z.infer<typeof itemSchema>

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  description: z.string().max(200).optional(),
  parent_id: z.string().uuid().optional().nullable(),
  sort_order: z.number().int().min(0).default(0),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
