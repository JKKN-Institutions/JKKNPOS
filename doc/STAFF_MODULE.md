# Staff Management Module - Database Functions

This document outlines all database functions for the **Staff Management** module, providing comprehensive user management, performance tracking, and role-based access control for the POS system.

## Overview

The Staff Management module provides 8 comprehensive functions:

1. **get_business_staff** - List all staff with filtering and sorting
2. **get_staff_details** - Detailed staff information with sales summary
3. **get_staff_performance** - Performance metrics with ranking
4. **get_staff_sales_comparison** - Period-over-period comparison
5. **get_top_performing_staff** - Top performers by metric
6. **update_staff_role** - Update role and permissions
7. **toggle_staff_status** - Activate/deactivate staff
8. **get_staff_hourly_performance** - Hourly performance analysis

---

## 1. get_business_staff

Retrieves all staff members for a business with advanced filtering and sorting capabilities.

### Function Signature

```sql
get_business_staff(
  p_business_id UUID,
  p_role TEXT DEFAULT NULL,              -- Filter by role: 'OWNER', 'MANAGER', 'STAFF', 'HELPER'
  p_is_active BOOLEAN DEFAULT NULL,      -- Filter by active status
  p_search_term TEXT DEFAULT NULL,       -- Search by name or phone
  p_sort_by TEXT DEFAULT 'created_at',   -- 'full_name', 'total_sales', 'created_at'
  p_sort_order TEXT DEFAULT 'DESC'       -- 'ASC' or 'DESC'
) RETURNS TABLE
```

### Returns

```typescript
Array<{
  id: string;
  full_name: string;
  phone: string;
  role: string;                    // 'OWNER' | 'MANAGER' | 'STAFF' | 'HELPER'
  is_active: boolean;
  permissions: Record<string, any>;
  created_at: string;
  updated_at: string;
  total_sales: number;             // Lifetime sales
  total_transactions: number;      // Lifetime transaction count
  avg_transaction_value: number;   // Average per transaction
}>
```

### TypeScript Usage

```typescript
import { createClient } from '@/lib/supabase/client';

export async function getBusinessStaff(
  businessId: string,
  filters?: {
    role?: 'OWNER' | 'MANAGER' | 'STAFF' | 'HELPER';
    isActive?: boolean;
    searchTerm?: string;
    sortBy?: 'full_name' | 'total_sales' | 'created_at';
    sortOrder?: 'ASC' | 'DESC';
  }
) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_business_staff', {
    p_business_id: businessId,
    p_role: filters?.role,
    p_is_active: filters?.isActive,
    p_search_term: filters?.searchTerm,
    p_sort_by: filters?.sortBy || 'created_at',
    p_sort_order: filters?.sortOrder || 'DESC',
  });

  if (error) throw error;
  return data;
}
```

---

## 2. get_staff_details

Retrieves detailed information about a specific staff member including sales summary and recent sales.

### Function Signature

```sql
get_staff_details(
  p_business_id UUID,
  p_staff_id UUID
) RETURNS JSONB
```

### Returns

```typescript
{
  staff: {
    id: string;
    full_name: string;
    phone: string;
    role: string;
    is_active: boolean;
    permissions: Record<string, any>;
    created_at: string;
    updated_at: string;
  };
  sales_summary: {
    total_sales: number;
    total_transactions: number;
    avg_transaction_value: number;
    today_sales: number;
    this_month_sales: number;
  };
  recent_sales: Array<{
    id: string;
    sale_number: string;
    total: number;
    created_at: string;
    customer_id: string | null;
  }>;  // Last 10 sales
}
```

### TypeScript Usage

```typescript
export async function getStaffDetails(
  businessId: string,
  staffId: string
) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_staff_details', {
    p_business_id: businessId,
    p_staff_id: staffId,
  });

  if (error) throw error;
  return data;
}
```

---

## 3. get_staff_performance

Analyzes comprehensive performance metrics for all active staff with ranking.

### Function Signature

```sql
get_staff_performance(
  p_business_id UUID,
  p_start_date DATE DEFAULT NULL,  -- Defaults to 30 days ago
  p_end_date DATE DEFAULT NULL     -- Defaults to current date
) RETURNS TABLE
```

### Returns

```typescript
Array<{
  staff_id: string;
  staff_name: string;
  role: string;
  total_sales: number;
  transaction_count: number;
  avg_transaction_value: number;
  total_items_sold: number;
  unique_customers: number;
  cash_sales: number;
  card_sales: number;
  upi_sales: number;
  performance_rank: number;        // Ranked by total_sales
}>
```

### TypeScript Usage

```typescript
export async function getStaffPerformance(
  businessId: string,
  startDate?: string,
  endDate?: string
) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_staff_performance', {
    p_business_id: businessId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) throw error;
  return data;
}
```

---

## 4. get_staff_sales_comparison

Compares staff sales performance across two time periods to track growth.

### Function Signature

```sql
get_staff_sales_comparison(
  p_business_id UUID,
  p_current_start DATE,
  p_current_end DATE,
  p_previous_start DATE,
  p_previous_end DATE
) RETURNS TABLE
```

### Returns

```typescript
Array<{
  staff_id: string;
  staff_name: string;
  role: string;
  current_period_sales: number;
  previous_period_sales: number;
  sales_growth: number;              // % growth (null if no previous sales)
  current_transactions: number;
  previous_transactions: number;
  transaction_growth: number;        // % growth (null if no previous)
}>
```

### TypeScript Usage

```typescript
export async function getStaffSalesComparison(
  businessId: string,
  currentStart: string,
  currentEnd: string,
  previousStart: string,
  previousEnd: string
) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_staff_sales_comparison', {
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

## 5. get_top_performing_staff

Retrieves top performing staff by specified metric (sales, transactions, or avg value).

### Function Signature

```sql
get_top_performing_staff(
  p_business_id UUID,
  p_metric TEXT DEFAULT 'sales',   -- 'sales', 'transactions', 'avg_value'
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL,
  p_limit INTEGER DEFAULT 10
) RETURNS TABLE
```

### Returns

```typescript
Array<{
  staff_id: string;
  staff_name: string;
  role: string;
  metric_value: number;            // Value of the selected metric
  total_sales: number;
  transaction_count: number;
  avg_transaction_value: number;
}>
```

### TypeScript Usage

```typescript
export async function getTopPerformingStaff(
  businessId: string,
  metric: 'sales' | 'transactions' | 'avg_value' = 'sales',
  startDate?: string,
  endDate?: string,
  limit: number = 10
) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_top_performing_staff', {
    p_business_id: businessId,
    p_metric: metric,
    p_start_date: startDate,
    p_end_date: endDate,
    p_limit: limit,
  });

  if (error) throw error;
  return data;
}
```

---

## 6. update_staff_role

Updates a staff member's role and optionally their permissions.

### Function Signature

```sql
update_staff_role(
  p_business_id UUID,
  p_staff_id UUID,
  p_new_role TEXT,                 -- 'OWNER', 'MANAGER', 'STAFF', 'HELPER'
  p_permissions JSONB DEFAULT NULL -- Optional custom permissions
) RETURNS JSONB
```

### Returns

```typescript
{
  success: boolean;
  staff_id: string;
  staff_name: string;
  old_role: string;
  new_role: string;
  updated_at: string;
}
```

### TypeScript Usage

```typescript
export async function updateStaffRole(
  businessId: string,
  staffId: string,
  newRole: 'OWNER' | 'MANAGER' | 'STAFF' | 'HELPER',
  permissions?: Record<string, any>
) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('update_staff_role', {
    p_business_id: businessId,
    p_staff_id: staffId,
    p_new_role: newRole,
    p_permissions: permissions,
  });

  if (error) throw error;
  return data;
}
```

---

## 7. toggle_staff_status

Activates or deactivates a staff member.

### Function Signature

```sql
toggle_staff_status(
  p_business_id UUID,
  p_staff_id UUID,
  p_is_active BOOLEAN
) RETURNS JSONB
```

### Returns

```typescript
{
  success: boolean;
  staff_id: string;
  staff_name: string;
  old_status: boolean;
  new_status: boolean;
  action: 'activated' | 'deactivated';
  updated_at: string;
}
```

### TypeScript Usage

```typescript
export async function toggleStaffStatus(
  businessId: string,
  staffId: string,
  isActive: boolean
) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('toggle_staff_status', {
    p_business_id: businessId,
    p_staff_id: staffId,
    p_is_active: isActive,
  });

  if (error) throw error;
  return data;
}
```

---

## 8. get_staff_hourly_performance

Analyzes staff performance by hour of day to identify individual peak hours.

### Function Signature

```sql
get_staff_hourly_performance(
  p_business_id UUID,
  p_staff_id UUID DEFAULT NULL,    -- Optional: specific staff or all staff
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
) RETURNS TABLE
```

### Returns

```typescript
Array<{
  staff_id: string;
  staff_name: string;
  hour: number;                    // 0-23
  total_sales: number;
  transaction_count: number;
  avg_transaction_value: number;
}>
```

### TypeScript Usage

```typescript
export async function getStaffHourlyPerformance(
  businessId: string,
  staffId?: string,
  startDate?: string,
  endDate?: string
) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('get_staff_hourly_performance', {
    p_business_id: businessId,
    p_staff_id: staffId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) throw error;
  return data;
}
```

---

## Service Layer Implementation

Here's a complete service layer for the Staff Management module:

```typescript
// services/staff.service.ts
import { createClient } from '@/lib/supabase/client';

export class StaffService {
  private supabase = createClient();

  // Get all staff with filters
  async getBusinessStaff(
    businessId: string,
    filters?: {
      role?: 'OWNER' | 'MANAGER' | 'STAFF' | 'HELPER';
      isActive?: boolean;
      searchTerm?: string;
      sortBy?: 'full_name' | 'total_sales' | 'created_at';
      sortOrder?: 'ASC' | 'DESC';
    }
  ) {
    const { data, error } = await this.supabase.rpc('get_business_staff', {
      p_business_id: businessId,
      p_role: filters?.role,
      p_is_active: filters?.isActive,
      p_search_term: filters?.searchTerm,
      p_sort_by: filters?.sortBy || 'created_at',
      p_sort_order: filters?.sortOrder || 'DESC',
    });

    if (error) throw error;
    return data;
  }

  // Get staff details
  async getStaffDetails(businessId: string, staffId: string) {
    const { data, error } = await this.supabase.rpc('get_staff_details', {
      p_business_id: businessId,
      p_staff_id: staffId,
    });

    if (error) throw error;
    return data;
  }

  // Get staff performance
  async getStaffPerformance(
    businessId: string,
    startDate?: string,
    endDate?: string
  ) {
    const { data, error } = await this.supabase.rpc('get_staff_performance', {
      p_business_id: businessId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) throw error;
    return data;
  }

  // Compare staff performance across periods
  async getStaffSalesComparison(
    businessId: string,
    currentStart: string,
    currentEnd: string,
    previousStart: string,
    previousEnd: string
  ) {
    const { data, error } = await this.supabase.rpc('get_staff_sales_comparison', {
      p_business_id: businessId,
      p_current_start: currentStart,
      p_current_end: currentEnd,
      p_previous_start: previousStart,
      p_previous_end: previousEnd,
    });

    if (error) throw error;
    return data;
  }

  // Get top performers
  async getTopPerformingStaff(
    businessId: string,
    metric: 'sales' | 'transactions' | 'avg_value' = 'sales',
    startDate?: string,
    endDate?: string,
    limit: number = 10
  ) {
    const { data, error } = await this.supabase.rpc('get_top_performing_staff', {
      p_business_id: businessId,
      p_metric: metric,
      p_start_date: startDate,
      p_end_date: endDate,
      p_limit: limit,
    });

    if (error) throw error;
    return data;
  }

  // Update staff role
  async updateStaffRole(
    businessId: string,
    staffId: string,
    newRole: 'OWNER' | 'MANAGER' | 'STAFF' | 'HELPER',
    permissions?: Record<string, any>
  ) {
    const { data, error } = await this.supabase.rpc('update_staff_role', {
      p_business_id: businessId,
      p_staff_id: staffId,
      p_new_role: newRole,
      p_permissions: permissions,
    });

    if (error) throw error;
    return data;
  }

  // Toggle staff status
  async toggleStaffStatus(
    businessId: string,
    staffId: string,
    isActive: boolean
  ) {
    const { data, error } = await this.supabase.rpc('toggle_staff_status', {
      p_business_id: businessId,
      p_staff_id: staffId,
      p_is_active: isActive,
    });

    if (error) throw error;
    return data;
  }

  // Activate staff member
  async activateStaff(businessId: string, staffId: string) {
    return this.toggleStaffStatus(businessId, staffId, true);
  }

  // Deactivate staff member
  async deactivateStaff(businessId: string, staffId: string) {
    return this.toggleStaffStatus(businessId, staffId, false);
  }

  // Get staff hourly performance
  async getStaffHourlyPerformance(
    businessId: string,
    staffId?: string,
    startDate?: string,
    endDate?: string
  ) {
    const { data, error } = await this.supabase.rpc('get_staff_hourly_performance', {
      p_business_id: businessId,
      p_staff_id: staffId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error) throw error;
    return data;
  }

  // Helper: Get active staff only
  async getActiveStaff(businessId: string) {
    return this.getBusinessStaff(businessId, { isActive: true });
  }

  // Helper: Get staff by role
  async getStaffByRole(
    businessId: string,
    role: 'OWNER' | 'MANAGER' | 'STAFF' | 'HELPER'
  ) {
    return this.getBusinessStaff(businessId, { role, isActive: true });
  }

  // Helper: Get month-to-date staff comparison
  async getMonthToDateStaffComparison(businessId: string) {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    return this.getStaffSalesComparison(
      businessId,
      currentMonthStart.toISOString().split('T')[0],
      now.toISOString().split('T')[0],
      previousMonthStart.toISOString().split('T')[0],
      previousMonthEnd.toISOString().split('T')[0]
    );
  }
}

// Export singleton instance
export const staffService = new StaffService();
```

---

## React Hook Implementation

```typescript
// hooks/useStaff.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '@/services/staff.service';

export function useBusinessStaff(
  businessId: string,
  filters?: {
    role?: 'OWNER' | 'MANAGER' | 'STAFF' | 'HELPER';
    isActive?: boolean;
    searchTerm?: string;
    sortBy?: 'full_name' | 'total_sales' | 'created_at';
    sortOrder?: 'ASC' | 'DESC';
  }
) {
  return useQuery({
    queryKey: ['staff', businessId, filters],
    queryFn: () => staffService.getBusinessStaff(businessId, filters),
    enabled: !!businessId,
  });
}

export function useStaffDetails(businessId: string, staffId: string) {
  return useQuery({
    queryKey: ['staff', businessId, staffId],
    queryFn: () => staffService.getStaffDetails(businessId, staffId),
    enabled: !!businessId && !!staffId,
  });
}

export function useStaffPerformance(
  businessId: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['staffPerformance', businessId, startDate, endDate],
    queryFn: () => staffService.getStaffPerformance(businessId, startDate, endDate),
    enabled: !!businessId,
  });
}

export function useTopPerformingStaff(
  businessId: string,
  metric: 'sales' | 'transactions' | 'avg_value' = 'sales',
  startDate?: string,
  endDate?: string,
  limit: number = 10
) {
  return useQuery({
    queryKey: ['topStaff', businessId, metric, startDate, endDate, limit],
    queryFn: () =>
      staffService.getTopPerformingStaff(businessId, metric, startDate, endDate, limit),
    enabled: !!businessId,
  });
}

export function useUpdateStaffRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      businessId,
      staffId,
      newRole,
      permissions,
    }: {
      businessId: string;
      staffId: string;
      newRole: 'OWNER' | 'MANAGER' | 'STAFF' | 'HELPER';
      permissions?: Record<string, any>;
    }) => staffService.updateStaffRole(businessId, staffId, newRole, permissions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff', variables.businessId] });
    },
  });
}

export function useToggleStaffStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      businessId,
      staffId,
      isActive,
    }: {
      businessId: string;
      staffId: string;
      isActive: boolean;
    }) => staffService.toggleStaffStatus(businessId, staffId, isActive),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff', variables.businessId] });
    },
  });
}
```

---

## Security Considerations

- All functions use `SECURITY INVOKER` - they run with the caller's permissions
- All functions use `SET search_path = ''` to prevent schema injection attacks
- Read functions are marked `STABLE` for query optimization
- RLS policies on underlying tables (profiles, sales) ensure proper data isolation
- Role updates validate against allowed roles: OWNER, MANAGER, STAFF, HELPER
- Business ID is required for all queries to ensure multi-tenant isolation

---

## Performance Optimization

### Indexes

The migration creates performance indexes:

```sql
-- Index for active staff queries
CREATE INDEX IF NOT EXISTS idx_profiles_business_active
    ON public.profiles(business_id, is_active)
    WHERE is_active = TRUE;

-- Index for staff sales queries
CREATE INDEX IF NOT EXISTS idx_sales_user_date
    ON public.sales(user_id, business_id, created_at)
    WHERE status = 'COMPLETED';
```

### Query Optimization Tips

1. **Use active filter** - Query active staff only when possible
2. **Limit date ranges** - Use specific date ranges for performance queries
3. **Cache frequently accessed data** - Cache top performers, staff lists
4. **Use role filters** - Filter by specific roles to reduce result sets
5. **Paginate large results** - For businesses with many staff members

---

## Migration Information

- **Migration File**: `009_staff_management_module.sql`
- **Functions Created**: 8
- **Indexes Created**: 2
- **Dependencies**: Requires profiles and sales tables

---

## Related Modules

- **Sales Module** - Provides sales data for staff performance
- **Reports Module** - Uses staff data for comprehensive reporting
- **Expense Module** - Tracks expenses by staff member

---

## Example Use Cases

### Staff Leaderboard

```typescript
// Get top 5 staff by sales this month
const topStaff = await staffService.getTopPerformingStaff(
  businessId,
  'sales',
  '2025-01-01',
  '2025-01-31',
  5
);

console.log('Top Performers:', topStaff);
```

### Performance Review

```typescript
// Get detailed performance for review
const performance = await staffService.getStaffPerformance(
  businessId,
  '2025-01-01',
  '2025-01-31'
);

performance.forEach(staff => {
  console.log(`${staff.staff_name}: Rank #${staff.performance_rank}`);
  console.log(`  Sales: ₹${staff.total_sales}`);
  console.log(`  Transactions: ${staff.transaction_count}`);
  console.log(`  Avg Value: ₹${staff.avg_transaction_value}`);
});
```

### Role Management

```typescript
// Promote staff to manager
const result = await staffService.updateStaffRole(
  businessId,
  staffId,
  'MANAGER',
  {
    canViewReports: true,
    canManageInventory: true,
    canManageStaff: false,
  }
);

console.log(`${result.staff_name} promoted to ${result.new_role}`);
```

### Shift Performance Analysis

```typescript
// Analyze staff performance by hour
const hourlyPerf = await staffService.getStaffHourlyPerformance(
  businessId,
  staffId
);

// Find peak hours for this staff member
const peakHours = hourlyPerf
  .sort((a, b) => b.total_sales - a.total_sales)
  .slice(0, 3);

console.log('Best hours:', peakHours.map(h => `${h.hour}:00`));
```

### Growth Tracking

```typescript
// Compare this month vs last month
const comparison = await staffService.getMonthToDateStaffComparison(businessId);

comparison.forEach(staff => {
  if (staff.sales_growth !== null) {
    console.log(
      `${staff.staff_name}: ${staff.sales_growth > 0 ? '↑' : '↓'} ${Math.abs(staff.sales_growth)}%`
    );
  }
});
```

---

## Role-Based Access Control

### Role Hierarchy

1. **OWNER** - Full access to everything
2. **MANAGER** - Can manage sales, inventory, view reports (no settings/staff management)
3. **STAFF** - Can process sales, limited inventory access
4. **HELPER** - Sales only, no inventory or reports

### Permission Structure Example

```typescript
const permissions = {
  // Sales
  canCreateSales: true,
  canCancelSales: false,
  canViewAllSales: false,

  // Inventory
  canManageInventory: false,
  canAdjustStock: false,
  canViewInventory: true,

  // Customers
  canManageCustomers: false,
  canViewCustomers: true,

  // Reports
  canViewReports: false,
  canExportReports: false,

  // Staff
  canManageStaff: false,
  canViewStaffPerformance: false,

  // Settings
  canManageSettings: false,
  canManageBusiness: false,
};
```

---

## Module Status

- Migration: Applied
- TypeScript Types: Generated
- Documentation: Complete
- Functions: 8/8 implemented
- Service Layer: Complete
- React Hooks: Complete
