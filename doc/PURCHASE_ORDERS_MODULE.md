# Purchase Orders & Suppliers Module Documentation

**Module:** Purchase Orders & Suppliers Management
**Migration:** `012_purchase_orders_suppliers_module.sql`
**Functions:** 14
**Tables:** 4
**Status:** ✅ Production Ready

---

## Overview

The Purchase Orders & Suppliers module provides comprehensive functionality for managing suppliers, creating purchase orders, tracking deliveries, managing payments, and analyzing supplier performance. This module is critical for inventory procurement and supplier relationship management in a POS system.

**Key Features:**
- Complete supplier management with credit limits
- Purchase order lifecycle (Draft → Sent → Confirmed → Received)
- Partial and full PO receipt tracking
- Automated inventory updates on receipt
- Supplier payment tracking with ledger
- Delivery performance analytics
- Automated balance management

---

## Database Schema

### Tables

#### 1. `suppliers`
Stores supplier information and tracks current balance.

```sql
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    gstin TEXT,
    payment_terms TEXT,                    -- e.g., "NET30", "NET60"
    credit_limit NUMERIC DEFAULT 0,
    current_balance NUMERIC DEFAULT 0,     -- Outstanding amount owed
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_supplier_name UNIQUE(business_id, name)
);
```

#### 2. `purchase_orders`
Main purchase order table with status tracking.

```sql
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    po_number TEXT NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    status TEXT NOT NULL DEFAULT 'DRAFT',  -- DRAFT, SENT, CONFIRMED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED
    subtotal NUMERIC NOT NULL DEFAULT 0,
    tax NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    shipping_cost NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_po_status CHECK (status IN ('DRAFT', 'SENT', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED')),
    CONSTRAINT unique_po_number UNIQUE(business_id, po_number)
);
```

#### 3. `purchase_order_items`
Line items for purchase orders with quantity tracking.

```sql
CREATE TABLE purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id),
    quantity_ordered NUMERIC NOT NULL,
    quantity_received NUMERIC DEFAULT 0,
    unit_cost NUMERIC NOT NULL,
    tax_rate NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. `supplier_payments`
Payment records for suppliers.

```sql
CREATE TABLE supplier_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    purchase_order_id UUID REFERENCES purchase_orders(id),  -- Optional PO link
    amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    reference TEXT,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Functions Reference

### Supplier Management Functions

#### 1. `get_business_suppliers`
Lists all suppliers with purchase statistics.

```typescript
type GetBusinessSuppliersParams = {
  p_business_id: string;
  p_is_active?: boolean | null;
  p_search_term?: string | null;
  p_sort_by?: string | null;  // 'name' | 'total_purchases'
  p_sort_order?: string | null;  // 'ASC' | 'DESC'
};

type SupplierRow = {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  gstin: string | null;
  payment_terms: string | null;
  credit_limit: number;
  current_balance: number;
  is_active: boolean;
  total_purchases: number;
  purchase_count: number;
  last_purchase_date: string | null;
  created_at: string;
  updated_at: string;
};
```

**Example Usage:**
```typescript
// Service layer
export async function getSuppliers(
  businessId: string,
  filters?: {
    isActive?: boolean;
    searchTerm?: string;
    sortBy?: 'name' | 'total_purchases';
    sortOrder?: 'ASC' | 'DESC';
  }
) {
  const { data, error } = await supabase.rpc('get_business_suppliers', {
    p_business_id: businessId,
    p_is_active: filters?.isActive ?? null,
    p_search_term: filters?.searchTerm ?? null,
    p_sort_by: filters?.sortBy ?? 'name',
    p_sort_order: filters?.sortOrder ?? 'ASC'
  });

  if (error) throw error;
  return data as SupplierRow[];
}

// React Query hook
export function useSuppliers(
  businessId: string,
  filters?: Parameters<typeof getSuppliers>[1]
) {
  return useQuery({
    queryKey: ['suppliers', businessId, filters],
    queryFn: () => getSuppliers(businessId, filters),
    enabled: !!businessId
  });
}
```

---

#### 2. `get_supplier_details`
Gets complete supplier information with statistics and recent purchases.

```typescript
type GetSupplierDetailsParams = {
  p_business_id: string;
  p_supplier_id: string;
};

type SupplierDetails = {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  gstin: string | null;
  payment_terms: string | null;
  credit_limit: number;
  current_balance: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  statistics: {
    total_purchases: number;
    purchase_count: number;
    total_paid: number;
    last_purchase_date: string | null;
    average_order_value: number;
  };
  recent_purchases: Array<{
    id: string;
    po_number: string;
    order_date: string;
    status: string;
    total: number;
  }>;
};
```

**Example Usage:**
```typescript
// Service layer
export async function getSupplierDetails(
  businessId: string,
  supplierId: string
) {
  const { data, error } = await supabase.rpc('get_supplier_details', {
    p_business_id: businessId,
    p_supplier_id: supplierId
  });

  if (error) throw error;
  return data as SupplierDetails;
}

// React Query hook
export function useSupplierDetails(businessId: string, supplierId: string) {
  return useQuery({
    queryKey: ['supplier-details', businessId, supplierId],
    queryFn: () => getSupplierDetails(businessId, supplierId),
    enabled: !!businessId && !!supplierId
  });
}
```

---

#### 3. `create_supplier`
Creates a new supplier with validation.

```typescript
type CreateSupplierParams = {
  p_business_id: string;
  p_name: string;
  p_contact_person: string | null;
  p_email: string | null;
  p_phone: string | null;
  p_address: string | null;
  p_gstin: string | null;
  p_payment_terms: string | null;  // Defaults to 'NET30'
  p_credit_limit: number | null;   // Defaults to 0
  p_notes: string | null;
};

type CreateSupplierResponse = {
  success: boolean;
  supplier_id: string;
  name: string;
  created_at: string;
};
```

**Example Usage:**
```typescript
// Service layer
export async function createSupplier(
  businessId: string,
  supplier: Omit<CreateSupplierParams, 'p_business_id'>
) {
  const { data, error } = await supabase.rpc('create_supplier', {
    p_business_id: businessId,
    p_name: supplier.p_name,
    p_contact_person: supplier.p_contact_person || '',
    p_email: supplier.p_email || '',
    p_phone: supplier.p_phone || '',
    p_address: supplier.p_address || '',
    p_gstin: supplier.p_gstin || '',
    p_payment_terms: supplier.p_payment_terms || '',
    p_credit_limit: supplier.p_credit_limit || 0,
    p_notes: supplier.p_notes || ''
  });

  if (error) throw error;
  return data as CreateSupplierResponse;
}

// React Query mutation
export function useCreateSupplier(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supplier: Omit<CreateSupplierParams, 'p_business_id'>) =>
      createSupplier(businessId, supplier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', businessId] });
    }
  });
}
```

---

#### 4. `update_supplier`
Updates supplier information.

```typescript
type UpdateSupplierParams = {
  p_business_id: string;
  p_supplier_id: string;
  p_name: string | null;
  p_contact_person: string | null;
  p_email: string | null;
  p_phone: string | null;
  p_address: string | null;
  p_gstin: string | null;
  p_payment_terms: string | null;
  p_credit_limit: number | null;
  p_is_active: boolean | null;
  p_notes: string | null;
};

type UpdateSupplierResponse = {
  success: boolean;
  supplier_id: string;
  old_name: string;
  new_name: string;
  updated_at: string;
};
```

---

#### 5. `record_supplier_payment`
Records a payment to supplier and updates balance.

```typescript
type RecordSupplierPaymentParams = {
  p_business_id: string;
  p_supplier_id: string;
  p_amount: number;
  p_payment_method: string;
  p_payment_date: string | null;  // Defaults to today
  p_reference: string | null;
  p_purchase_order_id: string | null;  // Optional PO link
  p_notes: string | null;
  p_user_id: string;
};

type RecordSupplierPaymentResponse = {
  success: boolean;
  payment_id: string;
  amount: number;
  new_balance: number;
  payment_date: string;
  created_at: string;
};
```

**Example Usage:**
```typescript
// Service layer
export async function recordSupplierPayment(
  businessId: string,
  payment: Omit<RecordSupplierPaymentParams, 'p_business_id'>
) {
  const { data, error } = await supabase.rpc('record_supplier_payment', {
    p_business_id: businessId,
    p_supplier_id: payment.p_supplier_id,
    p_amount: payment.p_amount,
    p_payment_method: payment.p_payment_method,
    p_payment_date: payment.p_payment_date || '',
    p_reference: payment.p_reference || '',
    p_purchase_order_id: payment.p_purchase_order_id || '',
    p_notes: payment.p_notes || '',
    p_user_id: payment.p_user_id
  });

  if (error) throw error;
  return data as RecordSupplierPaymentResponse;
}
```

---

#### 6. `get_supplier_ledger`
Gets complete payment and purchase history for a supplier.

```typescript
type GetSupplierLedgerParams = {
  p_business_id: string;
  p_supplier_id: string;
  p_start_date: string | null;  // Defaults to 90 days ago
  p_end_date: string | null;    // Defaults to today
};

type SupplierLedgerRow = {
  transaction_date: string;
  transaction_type: 'PURCHASE' | 'PAYMENT';
  reference: string | null;
  debit: number;   // Purchase orders increase balance
  credit: number;  // Payments decrease balance
  balance: number; // Running balance
  notes: string | null;
};
```

**Example Usage:**
```typescript
// Service layer
export async function getSupplierLedger(
  businessId: string,
  supplierId: string,
  dateRange?: { startDate?: string; endDate?: string }
) {
  const { data, error } = await supabase.rpc('get_supplier_ledger', {
    p_business_id: businessId,
    p_supplier_id: supplierId,
    p_start_date: dateRange?.startDate || '',
    p_end_date: dateRange?.endDate || ''
  });

  if (error) throw error;
  return data as SupplierLedgerRow[];
}
```

---

### Purchase Order Functions

#### 7. `generate_po_number`
Generates unique PO number (PO-YYYYMMDD-XXXX).

```typescript
type GeneratePONumberParams = {
  p_business_id: string;
};

// Returns: "PO-20250122-0001"
```

---

#### 8. `get_business_purchase_orders`
Lists all purchase orders with filters.

```typescript
type GetBusinessPurchaseOrdersParams = {
  p_business_id: string;
  p_supplier_id: string | null;
  p_status: string | null;  // 'DRAFT' | 'SENT' | 'CONFIRMED' | etc.
  p_start_date: string | null;  // Defaults to 90 days ago
  p_end_date: string | null;    // Defaults to 30 days ahead
  p_sort_by: string | null;     // 'order_date' | 'total'
  p_sort_order: string | null;  // 'ASC' | 'DESC'
};

type PurchaseOrderRow = {
  id: string;
  po_number: string;
  supplier_id: string;
  supplier_name: string;
  order_date: string;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  status: string;
  subtotal: number;
  tax: number;
  discount: number;
  shipping_cost: number;
  total: number;
  items_count: number;
  created_by: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
};
```

---

#### 9. `get_purchase_order_details`
Gets complete PO with all items and supplier info.

```typescript
type GetPurchaseOrderDetailsParams = {
  p_business_id: string;
  p_purchase_order_id: string;
};

type PurchaseOrderDetails = {
  id: string;
  po_number: string;
  order_date: string;
  expected_delivery_date: string | null;
  actual_delivery_date: string | null;
  status: string;
  subtotal: number;
  tax: number;
  discount: number;
  shipping_cost: number;
  total: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  supplier: {
    id: string;
    name: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  created_by: {
    id: string;
    name: string;
  };
  items: Array<{
    id: string;
    item_id: string;
    item_name: string;
    quantity_ordered: number;
    quantity_received: number;
    unit_cost: number;
    tax_rate: number;
    discount: number;
    total: number;
  }>;
};
```

---

#### 10. `create_purchase_order`
Creates new purchase order with items and updates supplier balance.

```typescript
type CreatePurchaseOrderParams = {
  p_business_id: string;
  p_supplier_id: string;
  p_items: Array<{
    item_id: string;
    quantity: number;
    unit_cost: number;
    tax_rate?: number;
    discount?: number;
  }>;
  p_order_date: string | null;  // Defaults to today
  p_expected_delivery_date: string | null;
  p_shipping_cost: number | null;
  p_discount: number | null;
  p_notes: string | null;
  p_user_id: string;
};

type CreatePurchaseOrderResponse = {
  success: boolean;
  purchase_order_id: string;
  po_number: string;
  total: number;
  created_at: string;
};
```

**Example Usage:**
```typescript
// Service layer
export async function createPurchaseOrder(
  businessId: string,
  po: Omit<CreatePurchaseOrderParams, 'p_business_id'>
) {
  const { data, error } = await supabase.rpc('create_purchase_order', {
    p_business_id: businessId,
    p_supplier_id: po.p_supplier_id,
    p_items: po.p_items,
    p_order_date: po.p_order_date || '',
    p_expected_delivery_date: po.p_expected_delivery_date || '',
    p_shipping_cost: po.p_shipping_cost || 0,
    p_discount: po.p_discount || 0,
    p_notes: po.p_notes || '',
    p_user_id: po.p_user_id
  });

  if (error) throw error;
  return data as CreatePurchaseOrderResponse;
}

// React Query mutation
export function useCreatePurchaseOrder(businessId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (po: Omit<CreatePurchaseOrderParams, 'p_business_id'>) =>
      createPurchaseOrder(businessId, po),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', businessId] });
      queryClient.invalidateQueries({ queryKey: ['suppliers', businessId] });
    }
  });
}
```

---

#### 11. `update_purchase_order_status`
Updates PO status and optionally delivery dates.

```typescript
type UpdatePurchaseOrderStatusParams = {
  p_business_id: string;
  p_purchase_order_id: string;
  p_status: 'DRAFT' | 'SENT' | 'CONFIRMED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  p_actual_delivery_date: string | null;
};

type UpdatePurchaseOrderStatusResponse = {
  success: boolean;
  purchase_order_id: string;
  old_status: string;
  new_status: string;
  updated_at: string;
};
```

---

#### 12. `receive_purchase_order_items`
Records receipt of items, updates inventory, and creates stock movements.

```typescript
type ReceivePurchaseOrderItemsParams = {
  p_business_id: string;
  p_purchase_order_id: string;
  p_received_items: Array<{
    item_id: string;
    quantity_received: number;
  }>;
  p_user_id: string;
};

type ReceivePurchaseOrderItemsResponse = {
  success: boolean;
  purchase_order_id: string;
  items_received: number;
  new_status: 'CONFIRMED' | 'PARTIALLY_RECEIVED' | 'RECEIVED';
  updated_at: string;
};
```

**Example Usage:**
```typescript
// Service layer
export async function receivePurchaseOrderItems(
  businessId: string,
  receipt: Omit<ReceivePurchaseOrderItemsParams, 'p_business_id'>
) {
  const { data, error } = await supabase.rpc('receive_purchase_order_items', {
    p_business_id: businessId,
    p_purchase_order_id: receipt.p_purchase_order_id,
    p_received_items: receipt.p_received_items,
    p_user_id: receipt.p_user_id
  });

  if (error) throw error;
  return data as ReceivePurchaseOrderItemsResponse;
}
```

---

#### 13. `cancel_purchase_order`
Cancels PO and reverses supplier balance.

```typescript
type CancelPurchaseOrderParams = {
  p_business_id: string;
  p_purchase_order_id: string;
  p_reason: string;
};

type CancelPurchaseOrderResponse = {
  success: boolean;
  purchase_order_id: string;
  po_number: string;
  old_status: string;
  cancelled_at: string;
};
```

---

#### 14. `get_supplier_performance`
Analyzes supplier delivery performance.

```typescript
type GetSupplierPerformanceParams = {
  p_business_id: string;
  p_start_date: string | null;  // Defaults to 90 days ago
  p_end_date: string | null;    // Defaults to today
};

type SupplierPerformanceRow = {
  supplier_id: string;
  supplier_name: string;
  total_orders: number;
  total_value: number;
  avg_order_value: number;
  on_time_deliveries: number;
  late_deliveries: number;
  on_time_percentage: number;  // 0-100
  avg_delivery_days: number;   // Negative = early, Positive = late
};
```

**Example Usage:**
```typescript
// Service layer
export async function getSupplierPerformance(
  businessId: string,
  dateRange?: { startDate?: string; endDate?: string }
) {
  const { data, error } = await supabase.rpc('get_supplier_performance', {
    p_business_id: businessId,
    p_start_date: dateRange?.startDate || '',
    p_end_date: dateRange?.endDate || ''
  });

  if (error) throw error;
  return data as SupplierPerformanceRow[];
}

// React Query hook
export function useSupplierPerformance(
  businessId: string,
  dateRange?: { startDate?: string; endDate?: string }
) {
  return useQuery({
    queryKey: ['supplier-performance', businessId, dateRange],
    queryFn: () => getSupplierPerformance(businessId, dateRange),
    enabled: !!businessId
  });
}
```

---

## Complete Workflow Examples

### 1. Complete Purchase Order Flow

```typescript
// 1. Create new PO
const createPOMutation = useCreatePurchaseOrder(businessId);

const newPO = await createPOMutation.mutateAsync({
  p_supplier_id: 'supplier-uuid',
  p_items: [
    { item_id: 'item-1', quantity: 100, unit_cost: 10.50, tax_rate: 18 },
    { item_id: 'item-2', quantity: 50, unit_cost: 25.00, tax_rate: 18 }
  ],
  p_order_date: null,  // Today
  p_expected_delivery_date: '2025-02-01',
  p_shipping_cost: 50,
  p_discount: 0,
  p_notes: 'Urgent order',
  p_user_id: userId
});

// 2. Send PO to supplier (update status)
await updatePurchaseOrderStatus(businessId, {
  p_purchase_order_id: newPO.purchase_order_id,
  p_status: 'SENT',
  p_actual_delivery_date: null
});

// 3. Supplier confirms order
await updatePurchaseOrderStatus(businessId, {
  p_purchase_order_id: newPO.purchase_order_id,
  p_status: 'CONFIRMED',
  p_actual_delivery_date: null
});

// 4. Receive items (partial or full)
await receivePurchaseOrderItems(businessId, {
  p_purchase_order_id: newPO.purchase_order_id,
  p_received_items: [
    { item_id: 'item-1', quantity_received: 100 },  // Full
    { item_id: 'item-2', quantity_received: 30 }    // Partial
  ],
  p_user_id: userId
});
// Status automatically becomes 'PARTIALLY_RECEIVED'

// 5. Receive remaining items
await receivePurchaseOrderItems(businessId, {
  p_purchase_order_id: newPO.purchase_order_id,
  p_received_items: [
    { item_id: 'item-2', quantity_received: 20 }  // Remaining
  ],
  p_user_id: userId
});
// Status automatically becomes 'RECEIVED'

// 6. Make payment to supplier
await recordSupplierPayment(businessId, {
  p_supplier_id: 'supplier-uuid',
  p_amount: 2000,
  p_payment_method: 'BANK_TRANSFER',
  p_payment_date: null,  // Today
  p_reference: 'TXN123456',
  p_purchase_order_id: newPO.purchase_order_id,
  p_notes: 'Full payment',
  p_user_id: userId
});
```

---

### 2. Supplier Dashboard Component

```tsx
'use client';

import { useSuppliers, useSupplierPerformance } from '@/services/suppliers';

export function SupplierDashboard({ businessId }: { businessId: string }) {
  const { data: suppliers, isLoading: loadingSuppliers } = useSuppliers(businessId, {
    isActive: true,
    sortBy: 'total_purchases',
    sortOrder: 'DESC'
  });

  const { data: performance, isLoading: loadingPerformance } = useSupplierPerformance(
    businessId,
    { startDate: '2025-01-01', endDate: '2025-01-31' }
  );

  if (loadingSuppliers || loadingPerformance) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{suppliers?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              ₹{suppliers?.reduce((sum, s) => sum + s.current_balance, 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg On-Time %</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {performance?.length
                ? (performance.reduce((sum, p) => sum + p.on_time_percentage, 0) / performance.length).toFixed(1)
                : '0'}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Total Purchases</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers?.slice(0, 10).map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.phone || supplier.email}</TableCell>
                  <TableCell className="text-right">
                    ₹{supplier.total_purchases.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    ₹{supplier.current_balance.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">{supplier.purchase_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Security Features

1. **Row Level Security (RLS):** All tables have RLS enabled for multi-tenant isolation
2. **SECURITY INVOKER:** All functions run with caller's permissions
3. **SET search_path = '':** Prevents schema injection attacks
4. **Business ID Validation:** All operations validate business ownership
5. **Status Validation:** PO status changes follow strict state machine
6. **Balance Integrity:** Automated balance updates prevent manual errors

---

## Performance Optimization

**Indexes Created (9 total):**
```sql
CREATE INDEX idx_suppliers_business_active ON suppliers(business_id, is_active);
CREATE INDEX idx_suppliers_name ON suppliers(business_id, name);
CREATE INDEX idx_purchase_orders_business_status ON purchase_orders(business_id, status);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id, order_date);
CREATE INDEX idx_purchase_orders_dates ON purchase_orders(business_id, order_date);
CREATE INDEX idx_po_items_po ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_po_items_item ON purchase_order_items(item_id);
CREATE INDEX idx_supplier_payments_supplier ON supplier_payments(supplier_id, payment_date);
CREATE INDEX idx_supplier_payments_business ON supplier_payments(business_id, payment_date);
```

**Query Optimization:**
- Composite indexes for multi-column filters
- STABLE volatility for read-only functions
- Efficient JOINs with proper indexing
- Window functions for running balances

---

## Business Logic

### PO Status State Machine
```
DRAFT → SENT → CONFIRMED → PARTIALLY_RECEIVED → RECEIVED
  ↓                            ↓
CANCELLED                  CANCELLED
```

**Status Rules:**
- Can only cancel DRAFT, SENT, or CONFIRMED POs
- Cannot cancel POs with received items
- Status automatically updates on item receipt
- Balance reversal on cancellation (except DRAFT)

### Supplier Balance Management
- **Increases on:** PO creation (except DRAFT status)
- **Decreases on:** Payment recording
- **Reverses on:** PO cancellation
- **Tracks:** Outstanding amount owed to supplier

---

## Testing

**Sample Test Cases:**

```typescript
describe('Purchase Orders Module', () => {
  test('Create supplier with validation', async () => {
    const result = await createSupplier(businessId, {
      p_name: 'Test Supplier',
      p_contact_person: 'John Doe',
      p_email: 'john@supplier.com',
      p_phone: '+1234567890',
      p_address: '123 Main St',
      p_gstin: 'GST123',
      p_payment_terms: 'NET30',
      p_credit_limit: 50000,
      p_notes: 'Preferred supplier'
    });

    expect(result.success).toBe(true);
    expect(result.supplier_id).toBeDefined();
  });

  test('Create PO and verify balance update', async () => {
    // Create PO
    const po = await createPurchaseOrder(businessId, {
      p_supplier_id: supplierId,
      p_items: [{ item_id: itemId, quantity: 10, unit_cost: 100, tax_rate: 18 }],
      p_order_date: null,
      p_expected_delivery_date: '2025-02-01',
      p_shipping_cost: 50,
      p_discount: 0,
      p_notes: 'Test PO',
      p_user_id: userId
    });

    // Verify supplier balance increased
    const supplier = await getSupplierDetails(businessId, supplierId);
    expect(supplier.current_balance).toBeGreaterThan(0);
  });

  test('Receive items and verify inventory update', async () => {
    // Get initial stock
    const itemBefore = await getItemByCode(businessId, 'SKU001');
    const initialStock = itemBefore[0].stock;

    // Receive items
    await receivePurchaseOrderItems(businessId, {
      p_purchase_order_id: poId,
      p_received_items: [{ item_id: itemId, quantity_received: 10 }],
      p_user_id: userId
    });

    // Verify stock increased
    const itemAfter = await getItemByCode(businessId, 'SKU001');
    expect(itemAfter[0].stock).toBe(initialStock + 10);
  });

  test('Supplier performance analytics', async () => {
    const performance = await getSupplierPerformance(businessId, {
      startDate: '2025-01-01',
      endDate: '2025-01-31'
    });

    expect(performance.length).toBeGreaterThan(0);
    expect(performance[0].on_time_percentage).toBeGreaterThanOrEqual(0);
    expect(performance[0].on_time_percentage).toBeLessThanOrEqual(100);
  });
});
```

---

## Migration History

**Migration 012:** `012_purchase_orders_suppliers_module.sql`
- Created 4 tables
- Created 14 functions
- Created 9 performance indexes
- Enabled RLS on all tables
- Granted permissions to authenticated users

---

## Next Steps

1. **Frontend Integration:**
   - Build supplier management UI
   - Create PO creation form with item selector
   - Build PO receiving interface
   - Create supplier payment form
   - Build supplier performance dashboard

2. **Additional Features:**
   - Email notifications on PO status changes
   - Automated reorder points based on usage
   - Supplier rating system
   - Purchase analytics dashboard
   - Export PO to PDF

3. **Optimizations:**
   - Add caching for frequently accessed suppliers
   - Implement pagination for large PO lists
   - Add full-text search for suppliers
   - Create materialized views for performance reports

---

## Conclusion

The Purchase Orders & Suppliers module is now **production-ready** with all 14 functions successfully implemented and tested. This module provides complete functionality for managing supplier relationships, creating and tracking purchase orders, receiving inventory, and analyzing supplier performance.

**Key Metrics:**
- ✅ 14 functions implemented
- ✅ 4 tables created
- ✅ 9 performance indexes
- ✅ Full RLS security
- ✅ TypeScript type definitions
- ✅ Complete documentation

For implementation examples and best practices, refer to the completed modules documentation in the `doc/` folder.
