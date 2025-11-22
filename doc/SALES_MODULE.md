# Sales/POS Module - Complete Documentation

**Last Updated**: 2025-01-22
**Version**: 1.0.0
**Module**: Sales & Point of Sale System

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Functions](#database-functions)
3. [Usage Examples](#usage-examples)
4. [GST Calculation](#gst-calculation)
5. [TypeScript Integration](#typescript-integration)

---

## Overview

The Sales/POS Module provides comprehensive point-of-sale capabilities including:

- ✅ **Complete POS checkout** with GST calculation
- ✅ **Split payments** (CASH, CARD, UPI, WALLET)
- ✅ **Restaurant modifiers** support
- ✅ **Park/Resume sales** for later completion
- ✅ **Sale cancellation** with automatic stock reversal
- ✅ **Sales reports** and analytics
- ✅ **Payment summaries** by method
- ✅ **Top selling items** tracking
- ✅ **B2B/B2C invoicing** with GST compliance
- ✅ **Automatic stock management** on sale

---

## Database Functions

### 1. `create_sale()`

Complete POS checkout with automatic GST, stock management, and payments.

**Signature**:
```sql
create_sale(
  p_business_id UUID,
  p_user_id UUID,
  p_items JSONB,
  p_payments JSONB,
  p_customer_id UUID DEFAULT NULL,
  p_discount NUMERIC DEFAULT 0,
  p_discount_type TEXT DEFAULT 'fixed',
  p_notes TEXT DEFAULT NULL,
  p_invoice_type TEXT DEFAULT 'B2C',
  p_place_of_supply TEXT DEFAULT NULL
)
```

**Items JSONB Format**:
```json
[
  {
    "item_id": "uuid",
    "name": "Product Name",
    "quantity": 2,
    "price": 100.00,
    "discount": 10.00,
    "tax": 18.00,
    "modifiers": [
      {
        "modifier_id": "uuid",
        "modifier_option_id": "uuid",
        "modifier_name": "Size",
        "option_name": "Large",
        "price_adjustment": 20.00
      }
    ]
  }
]
```

**Payments JSONB Format**:
```json
[
  {
    "method": "CASH",
    "amount": 150.00,
    "reference": null
  },
  {
    "method": "CARD",
    "amount": 50.00,
    "reference": "TXN123456"
  }
]
```

**Returns**:
```json
{
  "success": true,
  "sale_id": "uuid",
  "sale_number": "SAL-20250122-0001",
  "total": 200.00,
  "subtotal": 180.00,
  "discount": 10.00,
  "tax": 30.00,
  "cgst": 15.00,
  "sgst": 15.00,
  "igst": 0
}
```

**Example**:
```typescript
const { data, error } = await supabase.rpc('create_sale', {
  p_business_id: businessId,
  p_user_id: userId,
  p_items: [
    {
      item_id: '...',
      name: 'Coffee',
      quantity: 2,
      price: 100,
      discount: 0,
      tax: 18,
      modifiers: [
        {
          modifier_id: '...',
          modifier_option_id: '...',
          modifier_name: 'Size',
          option_name: 'Large',
          price_adjustment: 20
        }
      ]
    }
  ],
  p_payments: [
    { method: 'CASH', amount: 236, reference: null }
  ],
  p_customer_id: customerId,
  p_discount: 0,
  p_discount_type: 'fixed',
  p_invoice_type: 'B2C'
});
```

---

### 2. `get_sale_details()`

Get complete sale information including items, modifiers, and payments.

**Signature**:
```sql
get_sale_details(
  p_sale_id UUID,
  p_business_id UUID
)
```

**Returns**: JSONB with complete sale data

**Example**:
```typescript
const { data, error } = await supabase.rpc('get_sale_details', {
  p_sale_id: saleId,
  p_business_id: businessId
});

// Returns:
{
  id: "uuid",
  sale_number: "SAL-20250122-0001",
  customer_name: "John Doe",
  cashier_name: "Jane Smith",
  subtotal: 180.00,
  discount: 10.00,
  tax: 30.00,
  total: 200.00,
  status: "COMPLETED",
  cgst_amount: 15.00,
  sgst_amount: 15.00,
  items: [
    {
      id: "uuid",
      name: "Coffee",
      quantity: 2,
      price: 100.00,
      total: 200.00,
      modifiers: [
        {
          modifier_name: "Size",
          option_name: "Large",
          price_adjustment: 20.00
        }
      ]
    }
  ],
  payments: [
    {
      method: "CASH",
      amount: 200.00,
      reference: null
    }
  ]
}
```

---

### 3. `park_sale()`

Save cart for later without completing transaction (no stock deduction).

**Signature**:
```sql
park_sale(
  p_business_id UUID,
  p_user_id UUID,
  p_items JSONB,
  p_customer_id UUID DEFAULT NULL,
  p_discount NUMERIC DEFAULT 0,
  p_discount_type TEXT DEFAULT 'fixed',
  p_notes TEXT DEFAULT NULL
)
```

**Returns**:
```json
{
  "success": true,
  "sale_id": "uuid",
  "sale_number": "PARK-20250122-143025-a1b2"
}
```

**Example**:
```typescript
const { data, error } = await supabase.rpc('park_sale', {
  p_business_id: businessId,
  p_user_id: userId,
  p_items: cartItems,
  p_customer_id: customerId,
  p_notes: 'Table 5 - Customer stepped out'
});
```

---

### 4. `get_parked_sales()`

List all parked sales for resuming.

**Signature**:
```sql
get_parked_sales(p_business_id UUID)
```

**Returns**: Table with parked sales summary

**Example**:
```typescript
const { data, error } = await supabase.rpc('get_parked_sales', {
  p_business_id: businessId
});

// Returns array:
[
  {
    id: "uuid",
    sale_number: "PARK-20250122-143025-a1b2",
    customer_name: "John Doe",
    cashier_name: "Jane Smith",
    subtotal: 150.00,
    discount: 10.00,
    total: 140.00,
    items_count: 3,
    notes: "Table 5",
    created_at: "2025-01-22T14:30:25Z"
  }
]
```

---

### 5. `cancel_sale()`

Cancel sale with automatic stock reversal.

**Signature**:
```sql
cancel_sale(
  p_sale_id UUID,
  p_business_id UUID,
  p_user_id UUID,
  p_reason TEXT
)
```

**Returns**:
```json
{
  "success": true,
  "sale_id": "uuid",
  "message": "Sale cancelled successfully"
}
```

**Example**:
```typescript
const { data, error } = await supabase.rpc('cancel_sale', {
  p_sale_id: saleId,
  p_business_id: businessId,
  p_user_id: userId,
  p_reason: 'Customer requested cancellation'
});
```

---

### 6. `get_sales_summary()`

Sales summary report with totals and averages.

**Signature**:
```sql
get_sales_summary(
  p_business_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
```

**Returns**:
```json
{
  "total_sales": 45,
  "total_revenue": 12500.00,
  "total_discount": 500.00,
  "total_tax": 2250.00,
  "average_sale": 277.78,
  "completed_sales": 42,
  "cancelled_sales": 2,
  "parked_sales": 1
}
```

**Example**:
```typescript
// Today's sales
const { data, error } = await supabase.rpc('get_sales_summary', {
  p_business_id: businessId
});

// Date range
const { data, error } = await supabase.rpc('get_sales_summary', {
  p_business_id: businessId,
  p_start_date: '2025-01-01T00:00:00Z',
  p_end_date: '2025-01-31T23:59:59Z'
});
```

---

### 7. `get_payment_summary()`

Payment method breakdown report.

**Signature**:
```sql
get_payment_summary(
  p_business_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL
)
```

**Returns**: Table with payment breakdown

**Example**:
```typescript
const { data, error } = await supabase.rpc('get_payment_summary', {
  p_business_id: businessId
});

// Returns:
[
  {
    payment_method: "CASH",
    transaction_count: 25,
    total_amount: 6500.00
  },
  {
    payment_method: "UPI",
    transaction_count: 15,
    total_amount: 4200.00
  },
  {
    payment_method: "CARD",
    transaction_count: 5,
    total_amount: 1800.00
  }
]
```

---

### 8. `get_top_selling_items()`

Top selling items by quantity or revenue.

**Signature**:
```sql
get_top_selling_items(
  p_business_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
)
```

**Returns**: Table with top items

**Example**:
```typescript
const { data, error } = await supabase.rpc('get_top_selling_items', {
  p_business_id: businessId,
  p_limit: 5
});

// Returns:
[
  {
    item_id: "uuid",
    item_name: "Coffee",
    quantity_sold: 150,
    total_revenue: 15000.00,
    times_sold: 75
  },
  {
    item_id: "uuid",
    item_name: "Sandwich",
    quantity_sold: 80,
    total_revenue: 8000.00,
    times_sold: 80
  }
]
```

---

## Usage Examples

### Complete POS Workflow

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// 1. Complete Checkout with Modifiers
async function completeSale(
  businessId: string,
  userId: string,
  cart: CartItem[],
  payments: Payment[],
  customerId?: string
) {
  // Format items with modifiers
  const items = cart.map(item => ({
    item_id: item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    discount: item.discount || 0,
    tax: calculateItemTax(item),
    modifiers: item.selectedModifiers?.map(mod => ({
      modifier_id: mod.modifierId,
      modifier_option_id: mod.optionId,
      modifier_name: mod.name,
      option_name: mod.optionName,
      price_adjustment: mod.priceAdjustment
    })) || []
  }));

  const { data, error } = await supabase.rpc('create_sale', {
    p_business_id: businessId,
    p_user_id: userId,
    p_items: items,
    p_payments: payments,
    p_customer_id: customerId,
    p_discount: 0,
    p_invoice_type: 'B2C'
  });

  if (error) throw error;
  return data;
}

// 2. Park Sale for Later
async function parkCurrentSale(
  businessId: string,
  userId: string,
  cart: CartItem[],
  tableNumber: string
) {
  const items = cart.map(item => ({
    item_id: item.id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    discount: 0,
    modifiers: item.selectedModifiers || []
  }));

  const { data, error } = await supabase.rpc('park_sale', {
    p_business_id: businessId,
    p_user_id: userId,
    p_items: items,
    p_notes: `Table ${tableNumber}`
  });

  return data;
}

// 3. Resume Parked Sale
async function getParkedSales(businessId: string) {
  const { data, error } = await supabase.rpc('get_parked_sales', {
    p_business_id: businessId
  });

  return data;
}

async function resumeParkedSale(saleId: string, businessId: string) {
  const { data, error } = await supabase.rpc('get_sale_details', {
    p_sale_id: saleId,
    p_business_id: businessId
  });

  // Convert back to cart format
  const cart = data.items.map(item => ({
    id: item.item_id,
    name: item.name,
    quantity: item.quantity,
    price: item.price,
    selectedModifiers: item.modifiers
  }));

  return cart;
}

// 4. Daily Sales Dashboard
async function getDailySalesDashboard(businessId: string) {
  const [summary, paymentSummary, topItems] = await Promise.all([
    supabase.rpc('get_sales_summary', {
      p_business_id: businessId
    }),
    supabase.rpc('get_payment_summary', {
      p_business_id: businessId
    }),
    supabase.rpc('get_top_selling_items', {
      p_business_id: businessId,
      p_limit: 5
    })
  ]);

  return {
    summary: summary.data,
    paymentSummary: paymentSummary.data,
    topItems: topItems.data
  };
}

// 5. Cancel Sale
async function cancelSale(
  saleId: string,
  businessId: string,
  userId: string,
  reason: string
) {
  const { data, error } = await supabase.rpc('cancel_sale', {
    p_sale_id: saleId,
    p_business_id: businessId,
    p_user_id: userId,
    p_reason: reason
  });

  return data;
}
```

---

## GST Calculation

The system automatically calculates GST based on:

### Intra-State (Same State)
- **CGST** = Tax Amount / 2
- **SGST** = Tax Amount / 2
- **IGST** = 0

### Inter-State (Different State)
- **CGST** = 0
- **SGST** = 0
- **IGST** = Full Tax Amount

**Example**:
```typescript
// Intra-state: Tamil Nadu to Tamil Nadu
// Item GST Rate: 18%
// Item Price: ₹1000
// Tax Amount: ₹180
// Result: CGST = ₹90, SGST = ₹90, IGST = ₹0

// Inter-state: Tamil Nadu to Karnataka
// Item GST Rate: 18%
// Item Price: ₹1000
// Tax Amount: ₹180
// Result: CGST = ₹0, SGST = ₹0, IGST = ₹180
```

---

## TypeScript Integration

### Type Definitions

```typescript
import type { Database } from '@/types/database.types';

// Sale types
type Sale = Database['public']['Tables']['sales']['Row'];
type SaleInsert = Database['public']['Tables']['sales']['Insert'];

type SaleItem = Database['public']['Tables']['sale_items']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];

// Enum types
type PaymentMethod = Database['public']['Enums']['payment_method'];
type SaleStatus = Database['public']['Enums']['sale_status'];

// Function types
type CreateSaleArgs = Database['public']['Functions']['create_sale']['Args'];
type CreateSaleReturn = Database['public']['Functions']['create_sale']['Returns'];

type SalesSummary = Database['public']['Functions']['get_sales_summary']['Returns'];
```

### Service Layer Example

```typescript
// lib/services/sales/sales.ts
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type PaymentMethod = Database['public']['Enums']['payment_method'];

export class SalesService {
  private supabase = createClient();

  async createSale(params: {
    businessId: string;
    userId: string;
    items: Array<{
      itemId: string;
      name: string;
      quantity: number;
      price: number;
      discount?: number;
      tax?: number;
      modifiers?: Array<{
        modifierId: string;
        modifierOptionId: string;
        modifierName: string;
        optionName: string;
        priceAdjustment: number;
      }>;
    }>;
    payments: Array<{
      method: PaymentMethod;
      amount: number;
      reference?: string;
    }>;
    customerId?: string;
    discount?: number;
    discountType?: 'fixed' | 'percentage';
    invoiceType?: 'B2B' | 'B2C';
    placeOfSupply?: string;
  }) {
    const { data, error } = await this.supabase.rpc('create_sale', {
      p_business_id: params.businessId,
      p_user_id: params.userId,
      p_items: params.items.map(item => ({
        item_id: item.itemId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
        tax: item.tax || 0,
        modifiers: item.modifiers || []
      })),
      p_payments: params.payments,
      p_customer_id: params.customerId,
      p_discount: params.discount || 0,
      p_discount_type: params.discountType || 'fixed',
      p_invoice_type: params.invoiceType || 'B2C',
      p_place_of_supply: params.placeOfSupply
    });

    if (error) throw error;
    return data;
  }

  async getSaleDetails(saleId: string, businessId: string) {
    const { data, error } = await this.supabase.rpc('get_sale_details', {
      p_sale_id: saleId,
      p_business_id: businessId
    });

    if (error) throw error;
    return data;
  }

  async parkSale(params: {
    businessId: string;
    userId: string;
    items: any[];
    customerId?: string;
    notes?: string;
  }) {
    const { data, error } = await this.supabase.rpc('park_sale', {
      p_business_id: params.businessId,
      p_user_id: params.userId,
      p_items: params.items,
      p_customer_id: params.customerId,
      p_notes: params.notes
    });

    if (error) throw error;
    return data;
  }

  async getParkedSales(businessId: string) {
    const { data, error } = await this.supabase.rpc('get_parked_sales', {
      p_business_id: businessId
    });

    if (error) throw error;
    return data;
  }

  async cancelSale(
    saleId: string,
    businessId: string,
    userId: string,
    reason: string
  ) {
    const { data, error } = await this.supabase.rpc('cancel_sale', {
      p_sale_id: saleId,
      p_business_id: businessId,
      p_user_id: userId,
      p_reason: reason
    });

    if (error) throw error;
    return data;
  }

  async getSalesSummary(
    businessId: string,
    startDate?: string,
    endDate?: string
  ) {
    const { data, error } = await this.supabase.rpc('get_sales_summary', {
      p_business_id: businessId,
      p_start_date: startDate,
      p_end_date: endDate
    });

    if (error) throw error;
    return data;
  }

  async getPaymentSummary(
    businessId: string,
    startDate?: string,
    endDate?: string
  ) {
    const { data, error } = await this.supabase.rpc('get_payment_summary', {
      p_business_id: businessId,
      p_start_date: startDate,
      p_end_date: endDate
    });

    if (error) throw error;
    return data;
  }

  async getTopSellingItems(
    businessId: string,
    startDate?: string,
    endDate?: string,
    limit: number = 10
  ) {
    const { data, error } = await this.supabase.rpc('get_top_selling_items', {
      p_business_id: businessId,
      p_start_date: startDate,
      p_end_date: endDate,
      p_limit: limit
    });

    if (error) throw error;
    return data;
  }
}

// Export singleton instance
export const salesService = new SalesService();
```

---

## API Reference Summary

| Function | Purpose | Key Features |
|----------|---------|--------------|
| `create_sale()` | Complete checkout | GST calc, stock mgmt, modifiers, split payments |
| `get_sale_details()` | Sale information | Full details with items, modifiers, payments |
| `park_sale()` | Hold sale | Save cart without stock deduction |
| `get_parked_sales()` | List parked | Resume capability |
| `cancel_sale()` | Cancel transaction | Automatic stock reversal |
| `get_sales_summary()` | Sales analytics | Revenue, averages, counts |
| `get_payment_summary()` | Payment breakdown | By payment method |
| `get_top_selling_items()` | Best sellers | By quantity or revenue |

---

## Migration History

- **001_initial_schema** - Base tables (sales, sale_items, payments)
- **002_add_gst_and_modifiers** - GST fields & modifiers system
- **004_sales_module_complete** - Complete POS functions
- **005_optimize_rls_policies** - Performance optimization

---

**End of Documentation** 🎉
