# Customer Management Module - Complete Documentation

**Last Updated**: 2025-01-22
**Version**: 1.0.0
**Module**: Customer Management System

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Functions](#database-functions)
3. [Usage Examples](#usage-examples)
4. [Security & Performance](#security--performance)
5. [TypeScript Integration](#typescript-integration)

---

## Overview

The Customer Management Module provides comprehensive customer relationship management capabilities including:

- ✅ **Full CRUD operations** on customers
- ✅ **Advanced filtering and sorting** with multiple criteria
- ✅ **Credit sales management** with limit tracking
- ✅ **Credit payment recording** with automatic balance updates
- ✅ **Loyalty points system** with accumulation and redemption
- ✅ **Customer analytics** and statistics
- ✅ **Top customers tracking** by revenue
- ✅ **Fuzzy search** with pg_trgm for flexible matching
- ✅ **Purchase history** tracking with sale details
- ✅ **Multi-business support** with RLS
- ✅ **Optimized performance** with proper indexing

---

## Database Functions

### 1. `get_business_customers()`

Get all customers for a business with advanced filtering and sorting.

**Signature**:
```sql
get_business_customers(
  p_business_id UUID,
  p_search_term TEXT DEFAULT NULL,
  p_customer_type TEXT DEFAULT NULL,
  p_has_credit_balance BOOLEAN DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'name',
  p_sort_order TEXT DEFAULT 'ASC'
)
```

**Parameters**:
- `p_business_id` - Business UUID
- `p_search_term` - Search in name, phone, email (fuzzy matching)
- `p_customer_type` - Filter by customer type ('RETAIL', 'WHOLESALE', 'VIP')
- `p_has_credit_balance` - Filter customers with outstanding credit
- `p_sort_by` - Sort field: 'name', 'credit_balance', 'total_purchases', 'loyalty_points', 'created_at'
- `p_sort_order` - 'ASC' or 'DESC'

**Returns**:
- Full customer details
- `available_credit` calculated field (credit_limit - credit_balance)
- Purchase statistics

**Example**:
```typescript
// Get all wholesale customers with outstanding credit, sorted by balance
const { data, error } = await supabase.rpc('get_business_customers', {
  p_business_id: businessId,
  p_customer_type: 'WHOLESALE',
  p_has_credit_balance: true,
  p_sort_by: 'credit_balance',
  p_sort_order: 'DESC'
});

// Search for customer by name or phone
const { data, error } = await supabase.rpc('get_business_customers', {
  p_business_id: businessId,
  p_search_term: 'john' // Matches "John Doe", "Johnny", phone numbers
});
```

---

### 2. `get_customer_details()`

Get complete customer information including purchase history and statistics.

**Signature**:
```sql
get_customer_details(
  p_customer_id UUID,
  p_business_id UUID
)
```

**Returns**:
```json
{
  "customer": {
    "id": "uuid",
    "name": "John Doe",
    "credit_balance": 5000.00,
    "available_credit": 15000.00,
    "loyalty_points": 450,
    "total_purchases": 125000.00,
    "total_sales_count": 48,
    "avg_sale_value": 2604.17,
    "last_purchase_date": "2025-01-20"
  },
  "recent_sales": [
    {
      "sale_id": "uuid",
      "sale_number": "SAL-20250120-0001",
      "date": "2025-01-20",
      "total": 3500.00,
      "payment_status": "COMPLETED"
    }
  ],
  "credit_summary": {
    "total_credit_used": 5000.00,
    "credit_limit": 20000.00,
    "available_credit": 15000.00
  }
}
```

**Example**:
```typescript
const { data, error } = await supabase.rpc('get_customer_details', {
  p_customer_id: customerId,
  p_business_id: businessId
});

// Access nested data
console.log(`Customer: ${data.customer.name}`);
console.log(`Available Credit: ₹${data.customer.available_credit}`);
console.log(`Recent Purchases: ${data.recent_sales.length}`);
```

---

### 3. `record_credit_payment()`

Record a credit payment from customer with automatic balance updates.

**Signature**:
```sql
record_credit_payment(
  p_customer_id UUID,
  p_business_id UUID,
  p_amount NUMERIC,
  p_payment_method TEXT,
  p_user_id UUID,
  p_reference TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
```

**Parameters**:
- `p_amount` - Payment amount (must be <= credit_balance)
- `p_payment_method` - 'CASH', 'CARD', 'UPI', 'WALLET', 'BANK_TRANSFER'
- `p_reference` - Transaction reference (UPI ID, cheque number, etc.)
- `p_notes` - Additional notes

**Returns**:
```json
{
  "success": true,
  "payment_id": "uuid",
  "previous_balance": 5000.00,
  "payment_amount": 2000.00,
  "new_balance": 3000.00,
  "customer_name": "John Doe"
}
```

**Example**:
```typescript
// Record UPI payment
const { data, error } = await supabase.rpc('record_credit_payment', {
  p_customer_id: customerId,
  p_business_id: businessId,
  p_amount: 2000,
  p_payment_method: 'UPI',
  p_user_id: userId,
  p_reference: 'john@paytm',
  p_notes: 'Partial payment for January purchases'
});

// Error handling
if (error) {
  if (error.message.includes('exceeds credit balance')) {
    alert('Payment amount exceeds outstanding balance');
  }
}
```

---

### 4. `get_customers_with_credit()`

Get all customers with outstanding credit balances.

**Signature**:
```sql
get_customers_with_credit(p_business_id UUID)
```

**Returns**:
- Customers with credit_balance > 0
- `days_overdue` calculated field
- Sorted by balance (highest first)

**Example**:
```typescript
const { data, error } = await supabase.rpc('get_customers_with_credit', {
  p_business_id: businessId
});

// Show overdue alerts
data?.forEach(customer => {
  if (customer.days_overdue > 30) {
    console.warn(`${customer.name} has ₹${customer.credit_balance} overdue by ${customer.days_overdue} days`);
  }
});
```

---

### 5. `update_loyalty_points()`

Update customer loyalty points (add or redeem).

**Signature**:
```sql
update_loyalty_points(
  p_customer_id UUID,
  p_business_id UUID,
  p_points INTEGER,
  p_operation TEXT, -- 'ADD' or 'REDEEM'
  p_reason TEXT
)
```

**Returns**:
```json
{
  "success": true,
  "customer_id": "uuid",
  "previous_points": 450,
  "points_changed": 50,
  "new_points": 500
}
```

**Example**:
```typescript
// Add points after purchase (typically 1 point per ₹100 spent)
const purchaseAmount = 1500;
const pointsEarned = Math.floor(purchaseAmount / 100);

const { data, error } = await supabase.rpc('update_loyalty_points', {
  p_customer_id: customerId,
  p_business_id: businessId,
  p_points: pointsEarned,
  p_operation: 'ADD',
  p_reason: `Purchase of ₹${purchaseAmount}`
});

// Redeem points (typically 1 point = ₹1 discount)
const { data, error } = await supabase.rpc('update_loyalty_points', {
  p_customer_id: customerId,
  p_business_id: businessId,
  p_points: 100,
  p_operation: 'REDEEM',
  p_reason: 'Discount on sale SAL-20250122-0001'
});
```

---

### 6. `get_customer_analytics()`

Get comprehensive customer statistics and analytics.

**Signature**:
```sql
get_customer_analytics(p_business_id UUID)
```

**Returns**:
```json
{
  "total_customers": 350,
  "active_customers": 280,
  "customers_with_credit": 45,
  "total_credit_outstanding": 125000.00,
  "total_loyalty_points": 15600,
  "avg_customer_value": 35714.29,
  "total_customer_lifetime_value": 12500000.00,
  "new_customers_this_month": 12,
  "repeat_customer_rate": 65.5
}
```

**Example**:
```typescript
const { data, error } = await supabase.rpc('get_customer_analytics', {
  p_business_id: businessId
});

// Display on dashboard
console.log(`Total Customers: ${data.total_customers}`);
console.log(`Active: ${data.active_customers} (${(data.active_customers/data.total_customers*100).toFixed(1)}%)`);
console.log(`Average Customer Value: ₹${data.avg_customer_value.toFixed(2)}`);
console.log(`Outstanding Credit: ₹${data.total_credit_outstanding}`);
```

---

### 7. `get_top_customers()`

Get top customers by total revenue.

**Signature**:
```sql
get_top_customers(
  p_business_id UUID,
  p_limit INTEGER DEFAULT 10
)
```

**Returns**:
- Top N customers by total_purchases
- Purchase count and average sale value
- Loyalty points

**Example**:
```typescript
// Get top 5 customers for VIP program
const { data, error } = await supabase.rpc('get_top_customers', {
  p_business_id: businessId,
  p_limit: 5
});

// Display leaderboard
data?.forEach((customer, index) => {
  console.log(`${index + 1}. ${customer.name}`);
  console.log(`   Total Purchases: ₹${customer.total_purchases}`);
  console.log(`   Sales Count: ${customer.sales_count}`);
  console.log(`   Avg Sale: ₹${customer.avg_sale_value}`);
});
```

---

### 8. `search_customers()`

Quick customer search with fuzzy matching (faster than get_business_customers for simple searches).

**Signature**:
```sql
search_customers(
  p_business_id UUID,
  p_search_term TEXT
)
```

**Returns**: Active customers matching search term in name, phone, or email

**Example**:
```typescript
// Real-time search as user types
const handleSearch = async (searchTerm: string) => {
  if (searchTerm.length < 2) return;

  const { data, error } = await supabase.rpc('search_customers', {
    p_business_id: businessId,
    p_search_term: searchTerm
  });

  setSearchResults(data);
};

// Debounced search
const debouncedSearch = debounce(handleSearch, 300);
```

---

## Usage Examples

### Complete Customer Operations

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// 1. List all customers with filters
async function listCustomers(businessId: string, filters?: {
  type?: string;
  hasCredit?: boolean;
  search?: string;
}) {
  const { data, error } = await supabase.rpc('get_business_customers', {
    p_business_id: businessId,
    p_customer_type: filters?.type,
    p_has_credit_balance: filters?.hasCredit,
    p_search_term: filters?.search,
    p_sort_by: 'total_purchases',
    p_sort_order: 'DESC'
  });

  return data;
}

// 2. Create new customer (standard table insert)
async function createCustomer(businessId: string, customerData: {
  name: string;
  phone: string;
  email?: string;
  customer_type: 'RETAIL' | 'WHOLESALE' | 'VIP';
  credit_limit?: number;
}) {
  const { data, error } = await supabase
    .from('customers')
    .insert({
      business_id: businessId,
      ...customerData,
      credit_balance: 0,
      loyalty_points: 0,
      total_purchases: 0,
      is_active: true
    })
    .select()
    .single();

  return data;
}

// 3. View customer profile
async function getCustomerProfile(customerId: string, businessId: string) {
  const { data, error } = await supabase.rpc('get_customer_details', {
    p_customer_id: customerId,
    p_business_id: businessId
  });

  return data;
}

// 4. Process credit sale
async function processCreditSale(
  customerId: string,
  businessId: string,
  saleAmount: number
) {
  // First check available credit
  const { data: customer } = await supabase
    .from('customers')
    .select('credit_limit, credit_balance')
    .eq('id', customerId)
    .single();

  const availableCredit = (customer.credit_limit || 0) - (customer.credit_balance || 0);

  if (saleAmount > availableCredit) {
    throw new Error(`Insufficient credit. Available: ₹${availableCredit}`);
  }

  // Create sale with customer_id
  // The create_sale() function will automatically update customer's credit_balance
  const { data: sale } = await supabase.rpc('create_sale', {
    p_business_id: businessId,
    p_user_id: userId,
    p_customer_id: customerId,
    p_items: items,
    p_payments: [{ method: 'CREDIT', amount: saleAmount }]
  });

  return sale;
}

// 5. Record credit payment
async function recordPayment(
  customerId: string,
  businessId: string,
  amount: number,
  method: string,
  userId: string
) {
  const { data, error } = await supabase.rpc('record_credit_payment', {
    p_customer_id: customerId,
    p_business_id: businessId,
    p_amount: amount,
    p_payment_method: method,
    p_user_id: userId,
    p_notes: 'Payment received'
  });

  if (error) throw error;

  console.log(`Received ₹${amount} from ${data.customer_name}`);
  console.log(`New balance: ₹${data.new_balance}`);

  return data;
}

// 6. Manage loyalty points
async function handleLoyaltyPoints(
  customerId: string,
  businessId: string,
  saleAmount: number
) {
  // Add points: 1 point per ₹100 spent
  const pointsEarned = Math.floor(saleAmount / 100);

  if (pointsEarned > 0) {
    const { data } = await supabase.rpc('update_loyalty_points', {
      p_customer_id: customerId,
      p_business_id: businessId,
      p_points: pointsEarned,
      p_operation: 'ADD',
      p_reason: `Purchase of ₹${saleAmount}`
    });

    return data;
  }
}

async function redeemPoints(
  customerId: string,
  businessId: string,
  points: number
) {
  // Redeem points: 1 point = ₹1 discount
  const { data, error } = await supabase.rpc('update_loyalty_points', {
    p_customer_id: customerId,
    p_business_id: businessId,
    p_points: points,
    p_operation: 'REDEEM',
    p_reason: 'Points redeemed for discount'
  });

  if (error) throw error;
  return data;
}

// 7. Get credit alerts for dashboard
async function getCreditAlerts(businessId: string) {
  const { data, error } = await supabase.rpc('get_customers_with_credit', {
    p_business_id: businessId
  });

  // Filter by urgency
  const overdue = data?.filter(c => c.days_overdue > 30) || [];
  const approaching = data?.filter(c =>
    c.days_overdue > 15 && c.days_overdue <= 30
  ) || [];

  return { overdue, approaching, all: data };
}

// 8. Get customer insights
async function getCustomerInsights(businessId: string) {
  const { data: analytics } = await supabase.rpc('get_customer_analytics', {
    p_business_id: businessId
  });

  const { data: topCustomers } = await supabase.rpc('get_top_customers', {
    p_business_id: businessId,
    p_limit: 10
  });

  return { analytics, topCustomers };
}

// 9. Quick customer search for POS
async function quickSearch(businessId: string, term: string) {
  const { data, error } = await supabase.rpc('search_customers', {
    p_business_id: businessId,
    p_search_term: term
  });

  return data;
}
```

---

## Security & Performance

### Row Level Security (RLS)

All customer functions respect RLS policies:

```sql
-- Users can only access customers from their business
CREATE POLICY "Users can view customers in their business"
    ON public.customers FOR SELECT
    TO authenticated
    USING (
        business_id IN (
            SELECT business_id FROM public.profiles
            WHERE id = (SELECT auth.uid())
        )
    );

-- Similar policies for INSERT, UPDATE, DELETE
```

### Performance Optimizations

1. **Optimized Indexes**:
   ```sql
   -- Foreign key indexes
   idx_customers_business_id

   -- Composite indexes for common queries
   idx_customers_business_active (business_id, is_active)
   idx_customers_business_type (business_id, customer_type)
   idx_customers_credit (business_id, credit_balance)
     WHERE credit_balance > 0

   -- Fuzzy search indexes (pg_trgm)
   idx_customers_name_trgm (name gin_trgm_ops)
   idx_customers_phone_trgm (phone gin_trgm_ops)
   idx_customers_email_trgm (email gin_trgm_ops)
   ```

2. **Function Optimization**:
   - All functions use `SECURITY INVOKER` (runs with caller permissions)
   - `SET search_path = ''` for security
   - Proper volatility markers (`STABLE` for read-only)
   - RLS uses `(SELECT auth.uid())` pattern for performance

3. **Query Performance**:
   - Customer search: O(log n) with GIN indexes
   - Credit balance queries: Partial index on customers with credit
   - Type filtering: Indexed for fast lookups
   - Fuzzy search: pg_trgm provides fast similarity matching

---

## TypeScript Integration

### Type Definitions

```typescript
import type { Database } from '@/types/database.types';

// Auto-generated types from database
type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];

// Function return types
type CustomerAnalytics = {
  total_customers: number;
  active_customers: number;
  customers_with_credit: number;
  total_credit_outstanding: number;
  total_loyalty_points: number;
  avg_customer_value: number;
  total_customer_lifetime_value: number;
  new_customers_this_month: number;
  repeat_customer_rate: number;
};

type CustomerDetails = {
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
    credit_balance: number;
    available_credit: number;
    loyalty_points: number;
    total_purchases: number;
    total_sales_count: number;
    avg_sale_value: number;
    last_purchase_date: string;
  };
  recent_sales: Array<{
    sale_id: string;
    sale_number: string;
    date: string;
    total: number;
    payment_status: string;
  }>;
  credit_summary: {
    total_credit_used: number;
    credit_limit: number;
    available_credit: number;
  };
};
```

### Service Layer Example

```typescript
// lib/services/customers/index.ts
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];

export class CustomerService {
  private supabase = createClient();

  async getCustomers(businessId: string, filters?: {
    search?: string;
    type?: string;
    hasCredit?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) {
    const { data, error } = await this.supabase.rpc('get_business_customers', {
      p_business_id: businessId,
      p_search_term: filters?.search,
      p_customer_type: filters?.type,
      p_has_credit_balance: filters?.hasCredit,
      p_sort_by: filters?.sortBy ?? 'name',
      p_sort_order: filters?.sortOrder ?? 'ASC'
    });

    if (error) throw error;
    return data;
  }

  async getCustomerDetails(customerId: string, businessId: string) {
    const { data, error } = await this.supabase.rpc('get_customer_details', {
      p_customer_id: customerId,
      p_business_id: businessId
    });

    if (error) throw error;
    return data;
  }

  async recordCreditPayment(params: {
    customerId: string;
    businessId: string;
    amount: number;
    method: string;
    userId: string;
    reference?: string;
    notes?: string;
  }) {
    const { data, error } = await this.supabase.rpc('record_credit_payment', {
      p_customer_id: params.customerId,
      p_business_id: params.businessId,
      p_amount: params.amount,
      p_payment_method: params.method,
      p_user_id: params.userId,
      p_reference: params.reference,
      p_notes: params.notes
    });

    if (error) throw error;
    return data;
  }

  async getCustomersWithCredit(businessId: string) {
    const { data, error } = await this.supabase.rpc('get_customers_with_credit', {
      p_business_id: businessId
    });

    if (error) throw error;
    return data;
  }

  async updateLoyaltyPoints(params: {
    customerId: string;
    businessId: string;
    points: number;
    operation: 'ADD' | 'REDEEM';
    reason: string;
  }) {
    const { data, error } = await this.supabase.rpc('update_loyalty_points', {
      p_customer_id: params.customerId,
      p_business_id: params.businessId,
      p_points: params.points,
      p_operation: params.operation,
      p_reason: params.reason
    });

    if (error) throw error;
    return data;
  }

  async getAnalytics(businessId: string) {
    const { data, error } = await this.supabase.rpc('get_customer_analytics', {
      p_business_id: businessId
    });

    if (error) throw error;
    return data;
  }

  async getTopCustomers(businessId: string, limit: number = 10) {
    const { data, error } = await this.supabase.rpc('get_top_customers', {
      p_business_id: businessId,
      p_limit: limit
    });

    if (error) throw error;
    return data;
  }

  async searchCustomers(businessId: string, searchTerm: string) {
    const { data, error } = await this.supabase.rpc('search_customers', {
      p_business_id: businessId,
      p_search_term: searchTerm
    });

    if (error) throw error;
    return data;
  }

  async createCustomer(businessId: string, customerData: CustomerInsert) {
    const { data, error } = await this.supabase
      .from('customers')
      .insert({
        business_id: businessId,
        ...customerData,
        credit_balance: 0,
        loyalty_points: 0,
        total_purchases: 0,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateCustomer(customerId: string, updates: Partial<CustomerInsert>) {
    const { data, error } = await this.supabase
      .from('customers')
      .update(updates)
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteCustomer(customerId: string) {
    // Soft delete by setting is_active = false
    const { data, error } = await this.supabase
      .from('customers')
      .update({ is_active: false })
      .eq('id', customerId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

// Export singleton instance
export const customerService = new CustomerService();
```

---

## API Reference Summary

| Function | Purpose | Performance |
|----------|---------|-------------|
| `get_business_customers()` | List customers with filters/sort | O(n log n) with indexes |
| `get_customer_details()` | Full customer profile + history | O(log n) + O(k) sales |
| `record_credit_payment()` | Record credit payments | O(1) update + insert |
| `get_customers_with_credit()` | Outstanding credit tracking | O(n) with partial index |
| `update_loyalty_points()` | Manage loyalty program | O(1) update |
| `get_customer_analytics()` | Business statistics | O(n) aggregate |
| `get_top_customers()` | Top customers by revenue | O(n log n) with limit |
| `search_customers()` | Quick fuzzy search | O(log n) with GIN index |

---

## Migration History

- **001_initial_schema** - Base customers table
- **002_add_gst_and_modifiers** - Additional customer fields
- **006_customer_module_complete** - Complete CRUD functions, fuzzy search, optimized indexes

---

## Testing Checklist

- [ ] Create customer with all fields
- [ ] Update customer details
- [ ] Soft delete (is_active = false)
- [ ] Search by name/phone/email (fuzzy)
- [ ] Filter by customer type
- [ ] Filter customers with credit
- [ ] Sort by various fields (name, purchases, points)
- [ ] View customer details with purchase history
- [ ] Record credit payment
- [ ] Validate payment amount <= balance
- [ ] Add loyalty points
- [ ] Redeem loyalty points
- [ ] Get customers with outstanding credit
- [ ] Calculate days overdue
- [ ] Get customer analytics
- [ ] Get top customers by revenue
- [ ] Quick search functionality
- [ ] Multi-business isolation (RLS)
- [ ] Performance with 10,000+ customers

---

**End of Documentation** 🎉
