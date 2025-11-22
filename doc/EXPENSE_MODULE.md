# Expense Management Module - Complete Documentation

**Last Updated**: 2025-01-22
**Version**: 1.0.0
**Module**: Expense Management System

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Functions](#database-functions)
3. [Usage Examples](#usage-examples)
4. [Security & Performance](#security--performance)
5. [TypeScript Integration](#typescript-integration)

---

## Overview

The Expense Management Module provides comprehensive business expense tracking and management capabilities including:

- ✅ **Full CRUD operations** on expenses
- ✅ **Advanced filtering** by category, payment method, date range, and user
- ✅ **Expense approval workflow** with multi-level authorization
- ✅ **Receipt tracking** with file upload support
- ✅ **Recurring expense management** (daily, weekly, monthly, yearly)
- ✅ **Category-wise analytics** with percentage breakdown
- ✅ **Payment method tracking** for cash flow analysis
- ✅ **Monthly trend analysis** for forecasting
- ✅ **Staff expense tracking** with approval statistics
- ✅ **Multi-business support** with RLS
- ✅ **Optimized performance** with proper indexing

---

## Database Functions

### 1. `get_business_expenses()`

Get all expenses with advanced filtering options.

**Signature**:
```sql
get_business_expenses(
  p_business_id UUID,
  p_category TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT NULL,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_approved_only BOOLEAN DEFAULT NULL
)
```

**Parameters**:
- `p_business_id` - Business UUID
- `p_category` - Filter by expense category
- `p_payment_method` - Filter by payment method (CASH, CARD, UPI, etc.)
- `p_start_date` - Filter expenses from this date
- `p_end_date` - Filter expenses until this date
- `p_user_id` - Filter by staff member who created expense
- `p_approved_only` - Filter by approval status (true = approved, false = pending, null = all)

**Returns**:
- Full expense details including user names and approver information
- Receipt URLs
- Recurring expense details

**Example**:
```typescript
// Get all pending expenses for approval
const { data, error } = await supabase.rpc('get_business_expenses', {
  p_business_id: businessId,
  p_approved_only: false // Only pending expenses
});

// Get rent expenses for last month
const { data, error } = await supabase.rpc('get_business_expenses', {
  p_business_id: businessId,
  p_category: 'Rent',
  p_start_date: '2025-01-01',
  p_end_date: '2025-01-31'
});
```

---

### 2. `create_expense()`

Create a new expense with validation and automatic numbering.

**Signature**:
```sql
create_expense(
  p_business_id UUID,
  p_category TEXT,
  p_amount NUMERIC,
  p_user_id UUID,
  p_date DATE,
  p_description TEXT DEFAULT NULL,
  p_payment_method TEXT DEFAULT 'CASH',
  p_receipt_url TEXT DEFAULT NULL,
  p_is_recurring BOOLEAN DEFAULT FALSE,
  p_recurrence_interval TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
```

**Parameters**:
- `p_category` - Expense category (required)
- `p_amount` - Expense amount (must be > 0)
- `p_date` - Expense date
- `p_description` - Expense description
- `p_payment_method` - Payment method (CASH, CARD, UPI, etc.)
- `p_receipt_url` - URL to uploaded receipt image
- `p_is_recurring` - Whether this is a recurring expense
- `p_recurrence_interval` - Recurrence frequency: 'daily', 'weekly', 'monthly', 'yearly'
- `p_notes` - Additional notes

**Returns**:
```json
{
  "success": true,
  "expense_id": "uuid",
  "expense_number": "EXP-20250122-0001",
  "amount": 5000.00,
  "category": "Rent",
  "date": "2025-01-22"
}
```

**Example**:
```typescript
// Create one-time expense
const { data, error } = await supabase.rpc('create_expense', {
  p_business_id: businessId,
  p_category: 'Office Supplies',
  p_amount: 2500,
  p_user_id: userId,
  p_date: '2025-01-22',
  p_description: 'Printer paper and toner',
  p_payment_method: 'CARD',
  p_receipt_url: 'https://storage.example.com/receipts/12345.jpg'
});

// Create recurring expense (monthly rent)
const { data, error } = await supabase.rpc('create_expense', {
  p_business_id: businessId,
  p_category: 'Rent',
  p_amount: 25000,
  p_user_id: userId,
  p_date: '2025-01-01',
  p_description: 'Office rent',
  p_payment_method: 'BANK_TRANSFER',
  p_is_recurring: true,
  p_recurrence_interval: 'monthly'
});
```

---

### 3. `approve_expense()`

Approve a pending expense (requires manager/owner role).

**Signature**:
```sql
approve_expense(
  p_expense_id UUID,
  p_business_id UUID,
  p_approver_id UUID
)
```

**Returns**:
```json
{
  "success": true,
  "expense_id": "uuid",
  "amount": 5000.00,
  "category": "Travel",
  "approved_by": "approver-uuid",
  "approved_at": "2025-01-22T10:30:00Z"
}
```

**Example**:
```typescript
const { data, error } = await supabase.rpc('approve_expense', {
  p_expense_id: expenseId,
  p_business_id: businessId,
  p_approver_id: managerId
});

// Error handling
if (error) {
  if (error.message.includes('already approved')) {
    alert('Expense has already been approved');
  } else if (error.message.includes('not found')) {
    alert('Expense not found');
  }
}
```

---

### 4. `get_expense_summary()`

Get comprehensive expense summary with breakdowns and trends.

**Signature**:
```sql
get_expense_summary(
  p_business_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
```

**Returns**:
```json
{
  "period": {
    "start_date": "2025-01-01",
    "end_date": "2025-01-31"
  },
  "totals": {
    "total_expenses": 125000.00,
    "approved_expenses": 100000.00,
    "pending_expenses": 25000.00,
    "expense_count": 45,
    "avg_expense": 2777.78
  },
  "by_category": [
    {
      "category": "Rent",
      "total": 50000.00,
      "count": 1,
      "percentage": 40.00
    },
    {
      "category": "Salaries",
      "total": 35000.00,
      "count": 5,
      "percentage": 28.00
    }
  ],
  "by_payment_method": [
    {
      "method": "BANK_TRANSFER",
      "total": 75000.00,
      "count": 10
    },
    {
      "method": "CASH",
      "total": 30000.00,
      "count": 25
    }
  ],
  "monthly_trend": [
    {
      "month": "2025-01",
      "total": 125000.00,
      "count": 45
    },
    {
      "month": "2024-12",
      "total": 118000.00,
      "count": 42
    }
  ]
}
```

**Example**:
```typescript
// Get current month summary
const { data, error } = await supabase.rpc('get_expense_summary', {
  p_business_id: businessId
});

// Get custom date range summary
const { data, error } = await supabase.rpc('get_expense_summary', {
  p_business_id: businessId,
  p_start_date: '2024-01-01',
  p_end_date: '2024-12-31' // Full year summary
});

// Display on dashboard
console.log(`Total Expenses: ₹${data.totals.total_expenses}`);
console.log(`Pending Approval: ₹${data.totals.pending_expenses}`);
console.log(`Average Expense: ₹${data.totals.avg_expense}`);
```

---

### 5. `get_expense_categories()`

Get expense categories with statistics.

**Signature**:
```sql
get_expense_categories(
  p_business_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
```

**Returns**:
- Category name
- Total amount spent
- Number of expenses
- Average amount per expense
- Last expense date

**Example**:
```typescript
const { data, error } = await supabase.rpc('get_expense_categories', {
  p_business_id: businessId,
  p_start_date: '2025-01-01',
  p_end_date: '2025-01-31'
});

// Display categories
data?.forEach(cat => {
  console.log(`${cat.category}: ₹${cat.total_amount} (${cat.expense_count} expenses)`);
  console.log(`Average: ₹${cat.avg_amount}`);
});
```

---

### 6. `get_recurring_expenses()`

Get all recurring expenses with next occurrence dates.

**Signature**:
```sql
get_recurring_expenses(
  p_business_id UUID,
  p_active_only BOOLEAN DEFAULT TRUE
)
```

**Returns**:
- Recurring expense details
- Last occurrence date
- Calculated next occurrence date based on interval
- User who created the expense

**Example**:
```typescript
const { data, error } = await supabase.rpc('get_recurring_expenses', {
  p_business_id: businessId,
  p_active_only: true
});

// Display upcoming recurring expenses
data?.forEach(expense => {
  console.log(`${expense.category}: ₹${expense.amount}`);
  console.log(`Frequency: ${expense.recurrence_interval}`);
  console.log(`Next due: ${expense.next_occurrence_date}`);
});

// Send reminders for expenses due in next 7 days
const upcomingSoon = data?.filter(exp => {
  const daysUntil = daysBetween(new Date(), new Date(exp.next_occurrence_date));
  return daysUntil <= 7 && daysUntil >= 0;
});
```

---

### 7. `get_top_expense_categories()`

Get top expense categories by total amount with percentage breakdown.

**Signature**:
```sql
get_top_expense_categories(
  p_business_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
```

**Returns**:
- Category name
- Total amount
- Expense count
- Percentage of total expenses

**Example**:
```typescript
// Get top 5 expense categories
const { data, error } = await supabase.rpc('get_top_expense_categories', {
  p_business_id: businessId,
  p_limit: 5
});

// Display pie chart data
const chartData = data?.map(cat => ({
  label: cat.category,
  value: cat.total_amount,
  percentage: cat.percentage
}));
```

---

### 8. `get_staff_expenses()`

Get expenses grouped by staff member with approval statistics.

**Signature**:
```sql
get_staff_expenses(
  p_business_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
```

**Returns**:
- User ID and name
- Total expenses
- Expense count
- Approved count
- Pending count
- Average expense amount

**Example**:
```typescript
const { data, error } = await supabase.rpc('get_staff_expenses', {
  p_business_id: businessId,
  p_start_date: '2025-01-01',
  p_end_date: '2025-01-31'
});

// Display staff expense report
data?.forEach(staff => {
  console.log(`${staff.user_name}:`);
  console.log(`  Total: ₹${staff.total_expenses}`);
  console.log(`  Approved: ${staff.approved_count}/${staff.expense_count}`);
  console.log(`  Pending: ${staff.pending_count}`);
  console.log(`  Avg: ₹${staff.avg_expense}`);
});
```

---

## Usage Examples

### Complete Expense Operations

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// 1. List all expenses with filters
async function listExpenses(businessId: string, filters?: {
  category?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  approvedOnly?: boolean;
}) {
  const { data, error } = await supabase.rpc('get_business_expenses', {
    p_business_id: businessId,
    p_category: filters?.category,
    p_payment_method: filters?.paymentMethod,
    p_start_date: filters?.startDate,
    p_end_date: filters?.endDate,
    p_user_id: filters?.userId,
    p_approved_only: filters?.approvedOnly
  });

  return data;
}

// 2. Create new expense
async function createExpense(data: {
  businessId: string;
  category: string;
  amount: number;
  userId: string;
  date: string;
  description?: string;
  paymentMethod?: string;
  receiptUrl?: string;
  isRecurring?: boolean;
  recurrenceInterval?: string;
}) {
  const { data: expense, error } = await supabase.rpc('create_expense', {
    p_business_id: data.businessId,
    p_category: data.category,
    p_amount: data.amount,
    p_user_id: data.userId,
    p_date: data.date,
    p_description: data.description,
    p_payment_method: data.paymentMethod ?? 'CASH',
    p_receipt_url: data.receiptUrl,
    p_is_recurring: data.isRecurring ?? false,
    p_recurrence_interval: data.recurrenceInterval
  });

  if (error) throw error;
  return expense;
}

// 3. Update expense (standard table update)
async function updateExpense(expenseId: string, updates: {
  category?: string;
  amount?: number;
  description?: string;
  paymentMethod?: string;
  receiptUrl?: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', expenseId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 4. Approve expense
async function approveExpense(
  expenseId: string,
  businessId: string,
  approverId: string
) {
  const { data, error } = await supabase.rpc('approve_expense', {
    p_expense_id: expenseId,
    p_business_id: businessId,
    p_approver_id: approverId
  });

  if (error) throw error;
  return data;
}

// 5. Delete expense (soft delete or hard delete)
async function deleteExpense(expenseId: string) {
  const { data, error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId);

  if (error) throw error;
  return data;
}

// 6. Get expense dashboard statistics
async function getExpenseDashboard(businessId: string) {
  const { data: summary } = await supabase.rpc('get_expense_summary', {
    p_business_id: businessId
  });

  const { data: categories } = await supabase.rpc('get_top_expense_categories', {
    p_business_id: businessId,
    p_limit: 5
  });

  const { data: recurring } = await supabase.rpc('get_recurring_expenses', {
    p_business_id: businessId
  });

  return { summary, categories, recurring };
}

// 7. Handle recurring expense creation
async function createRecurringExpense(data: {
  businessId: string;
  category: string;
  amount: number;
  userId: string;
  description: string;
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  paymentMethod?: string;
}) {
  const today = new Date().toISOString().split('T')[0];

  const { data: expense, error } = await supabase.rpc('create_expense', {
    p_business_id: data.businessId,
    p_category: data.category,
    p_amount: data.amount,
    p_user_id: data.userId,
    p_date: today,
    p_description: data.description,
    p_payment_method: data.paymentMethod ?? 'CASH',
    p_is_recurring: true,
    p_recurrence_interval: data.interval
  });

  if (error) throw error;
  return expense;
}

// 8. Get expenses pending approval
async function getPendingExpenses(businessId: string) {
  const { data, error } = await supabase.rpc('get_business_expenses', {
    p_business_id: businessId,
    p_approved_only: false
  });

  if (error) throw error;
  return data;
}

// 9. Get expense report for date range
async function getExpenseReport(
  businessId: string,
  startDate: string,
  endDate: string
) {
  const { data: summary } = await supabase.rpc('get_expense_summary', {
    p_business_id: businessId,
    p_start_date: startDate,
    p_end_date: endDate
  });

  const { data: byCategory } = await supabase.rpc('get_expense_categories', {
    p_business_id: businessId,
    p_start_date: startDate,
    p_end_date: endDate
  });

  const { data: byStaff } = await supabase.rpc('get_staff_expenses', {
    p_business_id: businessId,
    p_start_date: startDate,
    p_end_date: endDate
  });

  return {
    summary,
    byCategory,
    byStaff
  };
}

// 10. Upload receipt and create expense
async function createExpenseWithReceipt(
  file: File,
  expenseData: {
    businessId: string;
    category: string;
    amount: number;
    userId: string;
    date: string;
    description?: string;
  }
) {
  // Upload receipt to storage
  const fileName = `receipts/${expenseData.businessId}/${Date.now()}_${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('expense-receipts')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('expense-receipts')
    .getPublicUrl(fileName);

  // Create expense with receipt URL
  const { data: expense, error } = await supabase.rpc('create_expense', {
    p_business_id: expenseData.businessId,
    p_category: expenseData.category,
    p_amount: expenseData.amount,
    p_user_id: expenseData.userId,
    p_date: expenseData.date,
    p_description: expenseData.description,
    p_receipt_url: urlData.publicUrl
  });

  if (error) throw error;
  return expense;
}
```

---

## Security & Performance

### Row Level Security (RLS)

All expense functions respect RLS policies:

```sql
-- Users can only access expenses from their business
CREATE POLICY "Users can view expenses in their business"
    ON public.expenses FOR SELECT
    TO authenticated
    USING (
        business_id IN (
            SELECT business_id FROM public.profiles
            WHERE id = (SELECT auth.uid())
        )
    );

-- Users can create expenses
CREATE POLICY "Users can create expenses"
    ON public.expenses FOR INSERT
    TO authenticated
    WITH CHECK (
        business_id IN (
            SELECT business_id FROM public.profiles
            WHERE id = (SELECT auth.uid())
        )
    );

-- Users can update their own expenses if not approved
CREATE POLICY "Users can update own unapproved expenses"
    ON public.expenses FOR UPDATE
    TO authenticated
    USING (
        business_id IN (
            SELECT business_id FROM public.profiles
            WHERE id = (SELECT auth.uid())
        )
        AND user_id = (SELECT auth.uid())
        AND approved_by IS NULL
    );
```

### Performance Optimizations

1. **Optimized Indexes**:
   ```sql
   -- Composite indexes for common queries
   idx_expenses_business_date (business_id, date DESC)
   idx_expenses_business_category (business_id, category)
   idx_expenses_business_user (business_id, user_id)

   -- Partial indexes for specific queries
   idx_expenses_approval_status (business_id, approved_by)
     WHERE approved_by IS NULL  -- Pending approvals

   idx_expenses_recurring (business_id, is_recurring, date)
     WHERE is_recurring = TRUE  -- Recurring expenses

   idx_expenses_payment_method (business_id, payment_method)
     WHERE payment_method IS NOT NULL
   ```

2. **Function Optimization**:
   - All functions use `SECURITY INVOKER` (runs with caller permissions)
   - `SET search_path = ''` for security
   - Proper volatility markers (`STABLE` for read-only)
   - RLS uses `(SELECT auth.uid())` pattern for performance

3. **Query Performance**:
   - Date range queries: O(log n) with indexed date
   - Category filtering: O(log n) with category index
   - Approval status queries: Partial index on pending approvals
   - Recurring expense queries: Partial index for fast lookup

---

## TypeScript Integration

### Type Definitions

```typescript
import type { Database } from '@/types/database.types';

// Auto-generated types from database
type Expense = Database['public']['Tables']['expenses']['Row'];
type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];

// Function return types
type ExpenseSummary = {
  period: {
    start_date: string;
    end_date: string;
  };
  totals: {
    total_expenses: number;
    approved_expenses: number;
    pending_expenses: number;
    expense_count: number;
    avg_expense: number;
  };
  by_category: Array<{
    category: string;
    total: number;
    count: number;
    percentage: number;
  }>;
  by_payment_method: Array<{
    method: string;
    total: number;
    count: number;
  }>;
  monthly_trend: Array<{
    month: string;
    total: number;
    count: number;
  }>;
};

type RecurringExpense = {
  id: string;
  category: string;
  amount: number;
  description: string;
  recurrence_interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  payment_method: string;
  last_occurrence_date: string;
  next_occurrence_date: string;
  user_name: string;
};
```

### Service Layer Example

```typescript
// lib/services/expenses/index.ts
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type Expense = Database['public']['Tables']['expenses']['Row'];
type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];

export class ExpenseService {
  private supabase = createClient();

  async getExpenses(businessId: string, filters?: {
    category?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
    userId?: string;
    approvedOnly?: boolean;
  }) {
    const { data, error } = await this.supabase.rpc('get_business_expenses', {
      p_business_id: businessId,
      p_category: filters?.category,
      p_payment_method: filters?.paymentMethod,
      p_start_date: filters?.startDate,
      p_end_date: filters?.endDate,
      p_user_id: filters?.userId,
      p_approved_only: filters?.approvedOnly
    });

    if (error) throw error;
    return data;
  }

  async createExpense(params: {
    businessId: string;
    category: string;
    amount: number;
    userId: string;
    date: string;
    description?: string;
    paymentMethod?: string;
    receiptUrl?: string;
    isRecurring?: boolean;
    recurrenceInterval?: string;
    notes?: string;
  }) {
    const { data, error } = await this.supabase.rpc('create_expense', {
      p_business_id: params.businessId,
      p_category: params.category,
      p_amount: params.amount,
      p_user_id: params.userId,
      p_date: params.date,
      p_description: params.description,
      p_payment_method: params.paymentMethod ?? 'CASH',
      p_receipt_url: params.receiptUrl,
      p_is_recurring: params.isRecurring ?? false,
      p_recurrence_interval: params.recurrenceInterval,
      p_notes: params.notes
    });

    if (error) throw error;
    return data;
  }

  async approveExpense(
    expenseId: string,
    businessId: string,
    approverId: string
  ) {
    const { data, error } = await this.supabase.rpc('approve_expense', {
      p_expense_id: expenseId,
      p_business_id: businessId,
      p_approver_id: approverId
    });

    if (error) throw error;
    return data;
  }

  async getExpenseSummary(
    businessId: string,
    startDate?: string,
    endDate?: string
  ) {
    const { data, error } = await this.supabase.rpc('get_expense_summary', {
      p_business_id: businessId,
      p_start_date: startDate,
      p_end_date: endDate
    });

    if (error) throw error;
    return data;
  }

  async getExpenseCategories(
    businessId: string,
    startDate?: string,
    endDate?: string
  ) {
    const { data, error } = await this.supabase.rpc('get_expense_categories', {
      p_business_id: businessId,
      p_start_date: startDate,
      p_end_date: endDate
    });

    if (error) throw error;
    return data;
  }

  async getRecurringExpenses(businessId: string, activeOnly: boolean = true) {
    const { data, error } = await this.supabase.rpc('get_recurring_expenses', {
      p_business_id: businessId,
      p_active_only: activeOnly
    });

    if (error) throw error;
    return data;
  }

  async getTopExpenseCategories(
    businessId: string,
    limit: number = 10,
    startDate?: string,
    endDate?: string
  ) {
    const { data, error } = await this.supabase.rpc('get_top_expense_categories', {
      p_business_id: businessId,
      p_limit: limit,
      p_start_date: startDate,
      p_end_date: endDate
    });

    if (error) throw error;
    return data;
  }

  async getStaffExpenses(
    businessId: string,
    startDate?: string,
    endDate?: string
  ) {
    const { data, error } = await this.supabase.rpc('get_staff_expenses', {
      p_business_id: businessId,
      p_start_date: startDate,
      p_end_date: endDate
    });

    if (error) throw error;
    return data;
  }

  async updateExpense(expenseId: string, updates: Partial<ExpenseInsert>) {
    const { data, error } = await this.supabase
      .from('expenses')
      .update(updates)
      .eq('id', expenseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteExpense(expenseId: string) {
    const { data, error } = await this.supabase
      .from('expenses')
      .delete()
      .eq('id', expenseId);

    if (error) throw error;
    return data;
  }
}

// Export singleton instance
export const expenseService = new ExpenseService();
```

---

## API Reference Summary

| Function | Purpose | Performance |
|----------|---------|-------------|
| `get_business_expenses()` | List expenses with filters | O(n log n) with indexes |
| `create_expense()` | Create new expense | O(1) insert with validation |
| `approve_expense()` | Approve pending expense | O(1) update |
| `get_expense_summary()` | Comprehensive analytics | O(n) aggregates |
| `get_expense_categories()` | Category statistics | O(n) grouped |
| `get_recurring_expenses()` | Recurring expense tracking | O(n) with partial index |
| `get_top_expense_categories()` | Top categories breakdown | O(n log n) with limit |
| `get_staff_expenses()` | Staff expense tracking | O(n) grouped by user |

---

## Migration History

- **001_initial_schema** - Base expenses table
- **007_expense_module_complete** - Complete CRUD functions, approval workflow, recurring expenses, optimized indexes

---

## Testing Checklist

- [ ] Create expense with all fields
- [ ] Create recurring expense
- [ ] Update expense details
- [ ] Delete expense
- [ ] Filter expenses by category
- [ ] Filter expenses by payment method
- [ ] Filter expenses by date range
- [ ] Filter expenses by user
- [ ] Filter expenses by approval status
- [ ] Approve pending expense
- [ ] Validate expense amount > 0
- [ ] Validate recurring expense has interval
- [ ] Get expense summary
- [ ] Get expense categories
- [ ] Get recurring expenses with next dates
- [ ] Get top expense categories
- [ ] Get staff expense statistics
- [ ] Upload and attach receipt
- [ ] Multi-business isolation (RLS)
- [ ] Performance with 10,000+ expenses

---

**End of Documentation** 🎉
