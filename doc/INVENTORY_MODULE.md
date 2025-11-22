# Inventory Module - Complete Documentation

**Last Updated**: 2025-01-22
**Version**: 1.0.0
**Module**: Inventory Management System

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Functions](#database-functions)
3. [Usage Examples](#usage-examples)
4. [Security & Performance](#security--performance)
5. [TypeScript Integration](#typescript-integration)

---

## Overview

The Inventory Module provides comprehensive inventory management capabilities including:

- ✅ **Full CRUD operations** on items
- ✅ **Stock management** with automatic tracking
- ✅ **Low stock alerts** and monitoring
- ✅ **Expiry date tracking** for perishable items
- ✅ **Barcode/SKU search** for quick lookups
- ✅ **Inventory valuation** and reporting
- ✅ **Bulk price updates** by category
- ✅ **GST compliance** with HSN codes
- ✅ **Multi-business support** with RLS
- ✅ **Optimized performance** with proper indexing

---

## Database Functions

### 1. `get_business_items()`

Get all items for a business with advanced filtering and search.

**Signature**:
```sql
get_business_items(
  p_business_id UUID,
  p_category_id UUID DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL,
  p_low_stock_only BOOLEAN DEFAULT FALSE,
  p_search_term TEXT DEFAULT NULL
)
```

**Returns**:
- Full item details with category names
- `is_low_stock` boolean indicator
- `profit_margin` calculated field

**Example**:
```typescript
const { data, error } = await supabase.rpc('get_business_items', {
  p_business_id: businessId,
  p_low_stock_only: true, // Get only low stock items
  p_search_term: 'laptop' // Search by name/barcode/SKU
});
```

---

### 2. `get_item_by_code()`

Fast barcode/SKU lookup for scanning operations.

**Signature**:
```sql
get_item_by_code(
  p_business_id UUID,
  p_code TEXT
)
```

**Returns**: Single item matching the barcode or SKU

**Example**:
```typescript
const { data, error } = await supabase.rpc('get_item_by_code', {
  p_business_id: businessId,
  p_code: '1234567890' // Barcode or SKU
});
```

---

### 3. `adjust_item_stock()`

Adjust item stock with automatic stock movement recording.

**Signature**:
```sql
adjust_item_stock(
  p_item_id UUID,
  p_business_id UUID,
  p_quantity INTEGER,
  p_adjustment_type TEXT, -- 'IN', 'OUT', 'ADJUSTMENT'
  p_reason TEXT,
  p_user_id UUID
)
```

**Returns**: JSON with adjustment details

**Example**:
```typescript
// Add 50 units to stock
const { data, error } = await supabase.rpc('adjust_item_stock', {
  p_item_id: itemId,
  p_business_id: businessId,
  p_quantity: 50,
  p_adjustment_type: 'IN',
  p_reason: 'New stock received from supplier',
  p_user_id: userId
});

// Result:
{
  "success": true,
  "item_id": "uuid",
  "previous_stock": 100,
  "new_stock": 150,
  "movement_id": "uuid"
}
```

---

### 4. `get_low_stock_items()`

Get all items with stock at or below minimum level.

**Signature**:
```sql
get_low_stock_items(p_business_id UUID)
```

**Returns**: Items with low stock including `stock_percentage`

**Example**:
```typescript
const { data, error } = await supabase.rpc('get_low_stock_items', {
  p_business_id: businessId
});

// Returns items sorted by urgency (lowest stock % first)
```

---

### 5. `get_expiring_items()`

Get items expiring within specified days.

**Signature**:
```sql
get_expiring_items(
  p_business_id UUID,
  p_days_threshold INTEGER DEFAULT 30
)
```

**Returns**: Items with expiry dates within threshold

**Example**:
```typescript
// Get items expiring in next 7 days
const { data, error } = await supabase.rpc('get_expiring_items', {
  p_business_id: businessId,
  p_days_threshold: 7
});
```

---

### 6. `get_inventory_value()`

Get comprehensive inventory valuation and statistics.

**Signature**:
```sql
get_inventory_value(p_business_id UUID)
```

**Returns**:
```json
{
  "total_cost": 150000.00,
  "total_value": 225000.00,
  "potential_profit": 75000.00,
  "total_items": 150,
  "total_stock": 3500,
  "low_stock_count": 12,
  "out_of_stock_count": 3
}
```

**Example**:
```typescript
const { data, error } = await supabase.rpc('get_inventory_value', {
  p_business_id: businessId
});
```

---

### 7. `bulk_update_prices()`

Bulk update prices by percentage for a category or all items.

**Signature**:
```sql
bulk_update_prices(
  p_business_id UUID,
  p_category_id UUID, -- NULL for all categories
  p_percentage NUMERIC,
  p_round_to NUMERIC DEFAULT 0.01
)
```

**Returns**: Count of updated items

**Example**:
```typescript
// Increase all electronics prices by 10%
const { data, error } = await supabase.rpc('bulk_update_prices', {
  p_business_id: businessId,
  p_category_id: electronicsId,
  p_percentage: 10,
  p_round_to: 0.99 // Round to .99 (e.g., 19.99, 29.99)
});

// Returns: 45 (number of items updated)
```

---

## Usage Examples

### Complete Inventory Operations

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// 1. Get all items with search
async function searchItems(businessId: string, searchTerm: string) {
  const { data, error } = await supabase.rpc('get_business_items', {
    p_business_id: businessId,
    p_search_term: searchTerm,
    p_is_active: true
  });

  return data;
}

// 2. Scan barcode and add to cart
async function scanBarcode(businessId: string, barcode: string) {
  const { data, error } = await supabase.rpc('get_item_by_code', {
    p_business_id: businessId,
    p_code: barcode
  });

  if (data && data.length > 0) {
    return data[0]; // Found item
  }
  return null; // Barcode not found
}

// 3. Adjust stock after receiving inventory
async function receiveStock(
  itemId: string,
  businessId: string,
  quantity: number,
  userId: string
) {
  const { data, error } = await supabase.rpc('adjust_item_stock', {
    p_item_id: itemId,
    p_business_id: businessId,
    p_quantity: quantity,
    p_adjustment_type: 'IN',
    p_reason: 'Stock received from supplier',
    p_user_id: userId
  });

  return data;
}

// 4. Get low stock alerts for dashboard
async function getLowStockAlerts(businessId: string) {
  const { data, error } = await supabase.rpc('get_low_stock_items', {
    p_business_id: businessId
  });

  // Filter critical alerts (less than 50% of min stock)
  const critical = data?.filter(item => item.stock_percentage < 50);

  return { all: data, critical };
}

// 5. Check expiring items for next week
async function checkExpiringItems(businessId: string) {
  const { data, error } = await supabase.rpc('get_expiring_items', {
    p_business_id: businessId,
    p_days_threshold: 7
  });

  return data;
}

// 6. Get inventory dashboard stats
async function getInventoryStats(businessId: string) {
  const { data, error } = await supabase.rpc('get_inventory_value', {
    p_business_id: businessId
  });

  return data;
}

// 7. Seasonal price increase
async function applySeasonalPricing(businessId: string, categoryId: string) {
  const { data, error } = await supabase.rpc('bulk_update_prices', {
    p_business_id: businessId,
    p_category_id: categoryId,
    p_percentage: 15 // 15% increase
  });

  console.log(`Updated ${data} items`);
}
```

---

## Security & Performance

### Row Level Security (RLS)

All inventory functions respect RLS policies:

```sql
-- Users can only access items from their business
CREATE POLICY "Users can view items in their business"
    ON public.items FOR SELECT
    TO authenticated
    USING (
        business_id IN (
            SELECT business_id FROM public.profiles
            WHERE id = (SELECT auth.uid())
        )
    );
```

### Performance Optimizations

1. **Optimized Indexes**:
   ```sql
   -- Foreign key indexes
   idx_items_business_id
   idx_items_category_id
   idx_items_barcode
   idx_items_sku

   -- Composite indexes for common queries
   idx_items_business_active (business_id, is_active)
   idx_items_low_stock (business_id, stock, min_stock)
   idx_items_expiry_date (expiry_date)
   ```

2. **Function Optimization**:
   - All functions use `SECURITY INVOKER` (runs with caller permissions)
   - `SET search_path = ''` for security
   - Proper volatility markers (`STABLE` for read-only)
   - RLS uses `(SELECT auth.uid())` pattern for performance

3. **Query Performance**:
   - Barcode lookup: O(1) with index
   - Category filtering: Indexed
   - Low stock queries: Partial index on low stock items
   - Search: Uses ILIKE with indexes

---

## TypeScript Integration

### Type Definitions

```typescript
import type { Database } from '@/types/database.types';

// Auto-generated types from database
type Item = Database['public']['Tables']['items']['Row'];
type ItemInsert = Database['public']['Tables']['items']['Insert'];
type ItemUpdate = Database['public']['Tables']['items']['Update'];

// Function return types
type InventoryValue = {
  total_cost: number;
  total_value: number;
  potential_profit: number;
  total_items: number;
  total_stock: number;
  low_stock_count: number;
  out_of_stock_count: number;
};

type BusinessItem = {
  id: string;
  business_id: string;
  category_id: string;
  category_name: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  barcode: string;
  sku: string;
  image_url: string;
  is_active: boolean;
  hsn_code: string;
  gst_rate: number;
  cess_rate: number;
  expiry_date: string;
  created_at: string;
  updated_at: string;
  is_low_stock: boolean;
  profit_margin: number;
};
```

### Service Layer Example

```typescript
// lib/services/inventory/items.ts
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type Item = Database['public']['Tables']['items']['Row'];
type ItemInsert = Database['public']['Tables']['items']['Insert'];

export class InventoryService {
  private supabase = createClient();

  async getItems(businessId: string, filters?: {
    categoryId?: string;
    isActive?: boolean;
    lowStockOnly?: boolean;
    searchTerm?: string;
  }) {
    const { data, error } = await this.supabase.rpc('get_business_items', {
      p_business_id: businessId,
      p_category_id: filters?.categoryId,
      p_is_active: filters?.isActive,
      p_low_stock_only: filters?.lowStockOnly ?? false,
      p_search_term: filters?.searchTerm
    });

    if (error) throw error;
    return data;
  }

  async scanBarcode(businessId: string, code: string) {
    const { data, error } = await this.supabase.rpc('get_item_by_code', {
      p_business_id: businessId,
      p_code: code
    });

    if (error) throw error;
    return data?.[0] ?? null;
  }

  async adjustStock(params: {
    itemId: string;
    businessId: string;
    quantity: number;
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    reason: string;
    userId: string;
  }) {
    const { data, error } = await this.supabase.rpc('adjust_item_stock', {
      p_item_id: params.itemId,
      p_business_id: params.businessId,
      p_quantity: params.quantity,
      p_adjustment_type: params.type,
      p_reason: params.reason,
      p_user_id: params.userId
    });

    if (error) throw error;
    return data;
  }

  async getLowStockItems(businessId: string) {
    const { data, error } = await this.supabase.rpc('get_low_stock_items', {
      p_business_id: businessId
    });

    if (error) throw error;
    return data;
  }

  async getExpiringItems(businessId: string, daysThreshold: number = 30) {
    const { data, error } = await this.supabase.rpc('get_expiring_items', {
      p_business_id: businessId,
      p_days_threshold: daysThreshold
    });

    if (error) throw error;
    return data;
  }

  async getInventoryValue(businessId: string) {
    const { data, error } = await this.supabase.rpc('get_inventory_value', {
      p_business_id: businessId
    });

    if (error) throw error;
    return data;
  }

  async bulkUpdatePrices(params: {
    businessId: string;
    categoryId?: string;
    percentage: number;
    roundTo?: number;
  }) {
    const { data, error } = await this.supabase.rpc('bulk_update_prices', {
      p_business_id: params.businessId,
      p_category_id: params.categoryId ?? null,
      p_percentage: params.percentage,
      p_round_to: params.roundTo ?? 0.01
    });

    if (error) throw error;
    return data; // Returns count of updated items
  }
}

// Export singleton instance
export const inventoryService = new InventoryService();
```

---

## API Reference Summary

| Function | Purpose | Performance |
|----------|---------|-------------|
| `get_business_items()` | List items with filters | O(n log n) with indexes |
| `get_item_by_code()` | Barcode/SKU lookup | O(1) with index |
| `adjust_item_stock()` | Stock adjustments | O(1) update + insert |
| `get_low_stock_items()` | Low stock alerts | O(n) with partial index |
| `get_expiring_items()` | Expiry tracking | O(n) with partial index |
| `get_inventory_value()` | Valuation stats | O(n) aggregate |
| `bulk_update_prices()` | Bulk price updates | O(n) updates |

---

## Migration History

- **001_initial_schema** - Base inventory tables
- **002_add_gst_and_modifiers** - GST fields & modifiers
- **003_inventory_module_complete** - Complete CRUD functions, optimized RLS, performance indexes

---

## Testing Checklist

- [ ] Create item with all fields
- [ ] Update item details
- [ ] Soft delete (is_active = false)
- [ ] Search by name/barcode/SKU
- [ ] Filter by category
- [ ] Adjust stock (IN/OUT/ADJUSTMENT)
- [ ] Low stock alerts
- [ ] Expiry date tracking
- [ ] Inventory valuation
- [ ] Bulk price updates
- [ ] Multi-business isolation (RLS)
- [ ] Performance with 10,000+ items

---

**End of Documentation** 🎉
