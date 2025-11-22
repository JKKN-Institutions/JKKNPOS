# Reports & Analytics Module - Database Functions

This document outlines all database functions for the **Reports & Analytics** module, providing comprehensive business intelligence, financial reporting, and decision-making capabilities for the POS system.

## Overview

The Reports & Analytics module provides 8 comprehensive reporting functions:

1. **get_profit_loss_statement** - P&L statement with category breakdown
2. **get_hourly_sales_pattern** - Peak hour analysis
3. **get_daily_sales_report** - Daily sales breakdown
4. **get_dead_stock_report** - Slow-moving items detection
5. **get_gst_report** - GST tax filing reports
6. **get_cash_flow_statement** - Cash flow analysis
7. **get_business_dashboard** - KPI dashboard with alerts
8. **get_comparative_sales_report** - Period comparison

---

## 1. get_profit_loss_statement

Generates comprehensive Profit & Loss statement with revenue, COGS, expenses breakdown, and profit margins.

### Function Signature

```sql
get_profit_loss_statement(
  p_business_id UUID,
  p_start_date DATE DEFAULT NULL,  -- Defaults to start of current month
  p_end_date DATE DEFAULT NULL     -- Defaults to current date
) RETURNS JSONB
```

### Returns

```typescript
{
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_revenue: number;
    total_cost: number;        // COGS
    gross_profit: number;      // Revenue - COGS
    total_expenses: number;
    net_profit: number;        // Gross Profit - Expenses
    gross_margin: number;      // %
    net_margin: number;        // %
  };
  revenue_breakdown: Array<{
    payment_method: string;
    amount: number;
    percentage: number;
  }>;
  expense_breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}
```

### TypeScript Usage

```typescript
import { createClient } from '@/lib/supabase/client';

export async function getProfitLossStatement(
  businessId: string,
  startDate?: string,
  endDate?: string
) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_profit_loss_statement', {
    p_business_id: businessId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) throw error;
  return data;
}
```

---

## 2. get_hourly_sales_pattern

Analyzes sales patterns by hour to identify peak business hours. Flags hours with 80%+ of max sales as peak hours.

### Function Signature

```sql
get_hourly_sales_pattern(
  p_business_id UUID,
  p_start_date DATE DEFAULT NULL,  -- Defaults to 30 days ago
  p_end_date DATE DEFAULT NULL     -- Defaults to current date
) RETURNS TABLE
```

### Returns

```typescript
Array<{
  hour: number;                    // 0-23
  total_sales: number;
  transaction_count: number;
  avg_transaction_value: number;
  is_peak_hour: boolean;          // 80%+ of max sales
}>
```

### TypeScript Usage

```typescript
export async function getHourlySalesPattern(
  businessId: string,
  startDate?: string,
  endDate?: string
) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_hourly_sales_pattern', {
    p_business_id: businessId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) throw error;
  return data;
}
```

---

## 3. get_daily_sales_report

Comprehensive daily sales breakdown with multiple dimensions (payment methods, items sold, transaction counts).

### Function Signature

```sql
get_daily_sales_report(
  p_business_id UUID,
  p_start_date DATE DEFAULT NULL,  -- Defaults to 30 days ago
  p_end_date DATE DEFAULT NULL     -- Defaults to current date
) RETURNS TABLE
```

### Returns

```typescript
Array<{
  sale_date: string;
  total_sales: number;
  total_items_sold: number;
  transaction_count: number;
  avg_transaction_value: number;
  cash_sales: number;
  card_sales: number;
  upi_sales: number;
  credit_sales: number;
}>
```

### TypeScript Usage

```typescript
export async function getDailySalesReport(
  businessId: string,
  startDate?: string,
  endDate?: string
) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_daily_sales_report', {
    p_business_id: businessId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) throw error;
  return data;
}
```

---

## 4. get_dead_stock_report

Identifies slow-moving or dead stock items that haven't sold within a specified threshold.

### Function Signature

```sql
get_dead_stock_report(
  p_business_id UUID,
  p_days_threshold INTEGER DEFAULT 30  -- Days since last sale
) RETURNS TABLE
```

### Returns

```typescript
Array<{
  item_id: string;
  item_name: string;
  category: string;
  current_stock: number;
  cost: number;
  price: number;
  total_value: number;           // stock * cost
  last_sale_date: string | null;
  days_since_last_sale: number;
}>
```

### TypeScript Usage

```typescript
export async function getDeadStockReport(
  businessId: string,
  daysThreshold: number = 30
) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_dead_stock_report', {
    p_business_id: businessId,
    p_days_threshold: daysThreshold,
  });

  if (error) throw error;
  return data;
}
```

---

## 5. get_gst_report

Generates GST tax report for filing with B2B/B2C breakdown and item-wise GST details.

### Function Signature

```sql
get_gst_report(
  p_business_id UUID,
  p_start_date DATE DEFAULT NULL,  -- Defaults to start of current month
  p_end_date DATE DEFAULT NULL     -- Defaults to current date
) RETURNS JSONB
```

### Returns

```typescript
{
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_sales: number;
    taxable_amount: number;
    cgst: number;              // Total tax / 2
    sgst: number;              // Total tax / 2
    igst: number;              // 0 for intra-state
    total_tax: number;
    b2b_sales: number;         // Sales with customer
    b2c_sales: number;         // Sales without customer
  };
  item_wise_breakdown: Array<{
    item_name: string;
    hsn_code: string;
    quantity: number;
    taxable_value: number;
    tax_amount: number;
    total_value: number;
  }>;
}
```

### TypeScript Usage

```typescript
export async function getGSTReport(
  businessId: string,
  startDate?: string,
  endDate?: string
) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_gst_report', {
    p_business_id: businessId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) throw error;
  return data;
}
```

---

## 6. get_cash_flow_statement

Analyzes cash inflows (sales by payment method) and outflows (expenses by category).

### Function Signature

```sql
get_cash_flow_statement(
  p_business_id UUID,
  p_start_date DATE DEFAULT NULL,  -- Defaults to start of current month
  p_end_date DATE DEFAULT NULL     -- Defaults to current date
) RETURNS JSONB
```

### Returns

```typescript
{
  period: {
    start_date: string;
    end_date: string;
  };
  summary: {
    total_inflow: number;
    total_outflow: number;
    net_cash_flow: number;
  };
  inflows: Array<{
    source: string;            // payment_method
    amount: number;
  }>;
  outflows: Array<{
    category: string;          // expense category
    amount: number;
  }>;
}
```

### TypeScript Usage

```typescript
export async function getCashFlowStatement(
  businessId: string,
  startDate?: string,
  endDate?: string
) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_cash_flow_statement', {
    p_business_id: businessId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) throw error;
  return data;
}
```

---

## 7. get_business_dashboard

Comprehensive dashboard with key business metrics and alerts (low stock, expiring items, pending approvals).

### Function Signature

```sql
get_business_dashboard(
  p_business_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
) RETURNS JSONB
```

### Returns

```typescript
{
  date: string;
  sales: {
    today: number;
    yesterday: number;
    month_to_date: number;
    year_to_date: number;
    growth_vs_yesterday: number;  // %
  };
  alerts: {
    low_stock_items: number;      // stock < reorder_level
    expiring_items: number;       // expiring in 7 days
    pending_approvals: number;    // expense approvals
  };
  customers: {
    total: number;
    credit_outstanding: number;
  };
  insights: {
    top_selling_item: string | null;
    peak_hour: number | null;     // 0-23
  };
}
```

### TypeScript Usage

```typescript
export async function getBusinessDashboard(
  businessId: string,
  date?: string
) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_business_dashboard', {
    p_business_id: businessId,
    p_date: date,
  });

  if (error) throw error;
  return data;
}
```

---

## 8. get_comparative_sales_report

Compares sales across different time periods to track growth metrics.

### Function Signature

```sql
get_comparative_sales_report(
  p_business_id UUID,
  p_current_start DATE,
  p_current_end DATE,
  p_previous_start DATE,
  p_previous_end DATE
) RETURNS JSONB
```

### Returns

```typescript
{
  current_period: {
    start_date: string;
    end_date: string;
    total_sales: number;
    transactions: number;
    avg_transaction_value: number;
  };
  previous_period: {
    start_date: string;
    end_date: string;
    total_sales: number;
    transactions: number;
    avg_transaction_value: number;
  };
  growth: {
    sales_growth_percent: number;
    transaction_growth_percent: number;
    avg_value_growth_percent: number;
    sales_difference: number;
    transaction_difference: number;
  };
}
```

### TypeScript Usage

```typescript
export async function getComparativeSalesReport(
  businessId: string,
  currentStart: string,
  currentEnd: string,
  previousStart: string,
  previousEnd: string
) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_comparative_sales_report', {
    p_business_id: businessId,
    p_current_start: currentStart,
    p_current_end: currentEnd,
    p_previous_start: previousStart,
    p_previous_end: previousEnd,
  });

  if (error) throw error;
  return data;
}
```

---

## Service Layer Implementation

Here's a complete service layer for the Reports & Analytics module:

```typescript
// services/reports.service.ts
import { createClient } from '@/lib/supabase/client';

export class ReportsService {
  private supabase = createClient();

  // Profit & Loss Statement
  async getProfitLossStatement(
    businessId: string,
    startDate?: string,
    endDate?: string
  ) {
    const { data, error } = await this.supabase.rpc('get_profit_loss_statement', {
      p_business_id: businessId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) throw error;
    return data;
  }

  // Hourly Sales Pattern
  async getHourlySalesPattern(
    businessId: string,
    startDate?: string,
    endDate?: string
  ) {
    const { data, error } = await this.supabase.rpc('get_hourly_sales_pattern', {
      p_business_id: businessId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) throw error;
    return data;
  }

  // Daily Sales Report
  async getDailySalesReport(
    businessId: string,
    startDate?: string,
    endDate?: string
  ) {
    const { data, error } = await this.supabase.rpc('get_daily_sales_report', {
      p_business_id: businessId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) throw error;
    return data;
  }

  // Dead Stock Report
  async getDeadStockReport(businessId: string, daysThreshold: number = 30) {
    const { data, error } = await this.supabase.rpc('get_dead_stock_report', {
      p_business_id: businessId,
      p_days_threshold: daysThreshold,
    });

    if (error) throw error;
    return data;
  }

  // GST Report
  async getGSTReport(
    businessId: string,
    startDate?: string,
    endDate?: string
  ) {
    const { data, error } = await this.supabase.rpc('get_gst_report', {
      p_business_id: businessId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) throw error;
    return data;
  }

  // Cash Flow Statement
  async getCashFlowStatement(
    businessId: string,
    startDate?: string,
    endDate?: string
  ) {
    const { data, error } = await this.supabase.rpc('get_cash_flow_statement', {
      p_business_id: businessId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) throw error;
    return data;
  }

  // Business Dashboard
  async getBusinessDashboard(businessId: string, date?: string) {
    const { data, error } = await this.supabase.rpc('get_business_dashboard', {
      p_business_id: businessId,
      p_date: date,
    });

    if (error) throw error;
    return data;
  }

  // Comparative Sales Report
  async getComparativeSalesReport(
    businessId: string,
    currentStart: string,
    currentEnd: string,
    previousStart: string,
    previousEnd: string
  ) {
    const { data, error } = await this.supabase.rpc('get_comparative_sales_report', {
      p_business_id: businessId,
      p_current_start: currentStart,
      p_current_end: currentEnd,
      p_previous_start: previousStart,
      p_previous_end: previousEnd,
    });

    if (error) throw error;
    return data;
  }

  // Helper: Get Month-to-Date comparison
  async getMonthToDateComparison(businessId: string) {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    return this.getComparativeSalesReport(
      businessId,
      currentMonthStart.toISOString().split('T')[0],
      now.toISOString().split('T')[0],
      previousMonthStart.toISOString().split('T')[0],
      previousMonthEnd.toISOString().split('T')[0]
    );
  }

  // Helper: Get Year-to-Date comparison
  async getYearToDateComparison(businessId: string) {
    const now = new Date();
    const currentYearStart = new Date(now.getFullYear(), 0, 1);
    const previousYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const previousYearEnd = new Date(now.getFullYear() - 1, 11, 31);

    return this.getComparativeSalesReport(
      businessId,
      currentYearStart.toISOString().split('T')[0],
      now.toISOString().split('T')[0],
      previousYearStart.toISOString().split('T')[0],
      previousYearEnd.toISOString().split('T')[0]
    );
  }
}

// Export singleton instance
export const reportsService = new ReportsService();
```

---

## React Hook Implementation

```typescript
// hooks/useReports.ts
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';

export function useProfitLossStatement(
  businessId: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['profitLoss', businessId, startDate, endDate],
    queryFn: () => reportsService.getProfitLossStatement(businessId, startDate, endDate),
    enabled: !!businessId,
  });
}

export function useHourlySalesPattern(
  businessId: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['hourlySales', businessId, startDate, endDate],
    queryFn: () => reportsService.getHourlySalesPattern(businessId, startDate, endDate),
    enabled: !!businessId,
  });
}

export function useDailySalesReport(
  businessId: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['dailySales', businessId, startDate, endDate],
    queryFn: () => reportsService.getDailySalesReport(businessId, startDate, endDate),
    enabled: !!businessId,
  });
}

export function useDeadStockReport(businessId: string, daysThreshold: number = 30) {
  return useQuery({
    queryKey: ['deadStock', businessId, daysThreshold],
    queryFn: () => reportsService.getDeadStockReport(businessId, daysThreshold),
    enabled: !!businessId,
  });
}

export function useGSTReport(
  businessId: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['gstReport', businessId, startDate, endDate],
    queryFn: () => reportsService.getGSTReport(businessId, startDate, endDate),
    enabled: !!businessId,
  });
}

export function useCashFlowStatement(
  businessId: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['cashFlow', businessId, startDate, endDate],
    queryFn: () => reportsService.getCashFlowStatement(businessId, startDate, endDate),
    enabled: !!businessId,
  });
}

export function useBusinessDashboard(businessId: string, date?: string) {
  return useQuery({
    queryKey: ['dashboard', businessId, date],
    queryFn: () => reportsService.getBusinessDashboard(businessId, date),
    enabled: !!businessId,
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useComparativeSalesReport(
  businessId: string,
  currentStart: string,
  currentEnd: string,
  previousStart: string,
  previousEnd: string
) {
  return useQuery({
    queryKey: [
      'comparativeSales',
      businessId,
      currentStart,
      currentEnd,
      previousStart,
      previousEnd,
    ],
    queryFn: () =>
      reportsService.getComparativeSalesReport(
        businessId,
        currentStart,
        currentEnd,
        previousStart,
        previousEnd
      ),
    enabled: !!businessId && !!currentStart && !!previousStart,
  });
}
```

---

## Security Considerations

- All functions use `SECURITY INVOKER` - they run with the caller's permissions
- All functions use `SET search_path = ''` to prevent schema injection attacks
- All functions are marked `STABLE` for read-only query optimization
- RLS policies on underlying tables (sales, expenses, items, customers) ensure proper data isolation
- Business ID is required for all queries to ensure multi-tenant isolation

---

## Performance Optimization

### Indexes

The migration creates performance indexes:

```sql
-- Index for sales queries with date filtering
CREATE INDEX IF NOT EXISTS idx_sales_created_at_date
    ON public.sales(business_id, created_at)
    WHERE status = 'COMPLETED';
```

### Query Optimization Tips

1. **Use specific date ranges** - Avoid querying all data; use start/end dates
2. **Dashboard caching** - Cache dashboard results for 1 minute to reduce load
3. **Comparative reports** - Use indexed date columns for period comparisons
4. **Dead stock** - Adjust `days_threshold` based on business needs (30-90 days typical)
5. **Peak hour analysis** - Use 30-day windows for accurate patterns

---

## Migration Information

- **Migration File**: `008_reports_analytics_module.sql`
- **Functions Created**: 8
- **Indexes Created**: 1
- **Dependencies**: Requires sales, expenses, items, and customers tables

---

## Related Modules

- **Sales Module** - Provides sales data for reporting
- **Expense Module** - Provides expense data for P&L and cash flow
- **Inventory Module** - Provides dead stock data
- **Customer Module** - Provides customer analytics data

---

## Example Use Cases

### Financial Statement Generation

```typescript
// Get P&L for Q1 2025
const pnl = await reportsService.getProfitLossStatement(
  businessId,
  '2025-01-01',
  '2025-03-31'
);

console.log(`Net Profit: ₹${pnl.summary.net_profit}`);
console.log(`Net Margin: ${pnl.summary.net_margin}%`);
```

### Peak Hour Staffing

```typescript
// Identify peak hours for staffing
const pattern = await reportsService.getHourlySalesPattern(businessId);
const peakHours = pattern.filter(h => h.is_peak_hour);

console.log('Staff more during:', peakHours.map(h => `${h.hour}:00`));
```

### Inventory Optimization

```typescript
// Find dead stock to discount/remove
const deadStock = await reportsService.getDeadStockReport(businessId, 60);
const highValue = deadStock.filter(item => item.total_value > 10000);

console.log('High-value dead stock:', highValue);
```

### Tax Filing

```typescript
// Get GST report for monthly filing
const gst = await reportsService.getGSTReport(
  businessId,
  '2025-01-01',
  '2025-01-31'
);

console.log(`CGST: ₹${gst.summary.cgst}`);
console.log(`SGST: ₹${gst.summary.sgst}`);
console.log(`Total Tax: ₹${gst.summary.total_tax}`);
```

---

## Module Status

- Migration: Applied
- TypeScript Types: Generated
- Documentation: Complete
- Functions: 8/8 implemented
- Service Layer: Complete
- React Hooks: Complete
