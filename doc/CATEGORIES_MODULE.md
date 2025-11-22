# Categories Management Module

Complete documentation for the Categories Management module in the JKKN POS system. This module provides comprehensive category management with hierarchical structure, bulk operations, and performance analytics.

## Module Overview

The Categories Management module enables:
- Hierarchical category organization (parent-child relationships)
- Unlimited category depth with recursive tree queries
- Product-to-category associations with analytics
- Bulk category reordering
- Safe category deletion with product migration
- Category performance tracking with sales metrics

**Total Functions: 8**

---

## Database Functions

### 1. Get Business Categories

Retrieves all categories with hierarchical structure, product counts, and stock values.

**Function Signature:**
```sql
get_business_categories(
    p_business_id UUID,
    p_parent_id UUID DEFAULT NULL,
    p_include_inactive BOOLEAN DEFAULT FALSE
) RETURNS TABLE
```

**Returns:**
```typescript
{
  id: string;
  name: string;
  description: string;
  parent_id: string;
  parent_name: string;
  sort_order: number;
  product_count: number;
  active_product_count: number;
  total_stock_value: number;
  created_at: string;
  updated_at: string;
  is_parent: boolean;
  level: number;
}[]
```

**Parameters:**
- `p_business_id` - Business UUID
- `p_parent_id` - Filter by parent category (NULL for root categories)
- `p_include_inactive` - Include inactive products in counts

**Features:**
- Uses recursive CTE for hierarchical traversal
- Calculates product counts and stock values
- Identifies parent categories
- Tracks category depth level
- Ordered by level, sort_order, and name

---

### 2. Get Category Tree

Returns complete hierarchical category tree with nested structure as JSONB.

**Function Signature:**
```sql
get_category_tree(
    p_business_id UUID
) RETURNS JSONB
```

**Returns:**
```typescript
{
  id: string;
  name: string;
  description: string;
  sort_order: number;
  level: number;
  product_count: number;
  children: CategoryTree[];
}[]
```

**Features:**
- Recursive CTE with path tracking
- Nested JSONB structure
- Product counts at each level
- Prevents circular references
- Ready for tree UI components

---

### 3. Get Category Analytics

Analyzes category performance with sales and inventory metrics.

**Function Signature:**
```sql
get_category_analytics(
    p_business_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
) RETURNS TABLE
```

**Returns:**
```typescript
{
  category_id: string;
  category_name: string;
  product_count: number;
  total_stock: number;
  total_stock_value: number;
  total_sales: number;
  items_sold: number;
  avg_price: number;
  profit_margin: number;
}[]
```

**Parameters:**
- `p_business_id` - Business UUID
- `p_start_date` - Start date (defaults to 30 days ago)
- `p_end_date` - End date (defaults to today)

**Features:**
- Complete category performance metrics
- Sales data aggregation
- Profit margin calculation
- Stock value analysis
- Ordered by total_sales DESC

---

### 4. Get Top Selling Categories

Returns top performing categories by sales with ranking.

**Function Signature:**
```sql
get_top_selling_categories(
    p_business_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
) RETURNS TABLE
```

**Returns:**
```typescript
{
  category_id: string;
  category_name: string;
  total_revenue: number;
  items_sold: number;
  transactions: number;
  avg_order_value: number;
  rank: number;
}[]
```

**Parameters:**
- `p_business_id` - Business UUID
- `p_start_date` - Start date (defaults to 30 days ago)
- `p_end_date` - End date (defaults to today)
- `p_limit` - Maximum results (default 10)

**Features:**
- Window function for ranking
- Revenue and transaction metrics
- Average order value
- Only includes categories with sales
- Handles ties in ranking

---

### 5. Create Category

Creates a new category with validation and auto sort order.

**Function Signature:**
```sql
create_category(
    p_business_id UUID,
    p_name TEXT,
    p_description TEXT DEFAULT NULL,
    p_parent_id UUID DEFAULT NULL,
    p_sort_order INTEGER DEFAULT NULL
) RETURNS JSONB
```

**Returns:**
```typescript
{
  success: boolean;
  category_id: string;
  name: string;
  parent_id: string;
  sort_order: number;
  created_at: string;
}
```

**Parameters:**
- `p_business_id` - Business UUID
- `p_name` - Category name (required)
- `p_description` - Optional description
- `p_parent_id` - Parent category UUID (NULL for root)
- `p_sort_order` - Display order (auto-generated if NULL)

**Validation:**
- Name cannot be empty
- No duplicate names within same parent
- Parent category must exist
- Auto-assigns next sort order if not provided

---

### 6. Update Category

Updates an existing category with duplicate prevention.

**Function Signature:**
```sql
update_category(
    p_business_id UUID,
    p_category_id UUID,
    p_name TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_parent_id UUID DEFAULT NULL,
    p_sort_order INTEGER DEFAULT NULL
) RETURNS JSONB
```

**Returns:**
```typescript
{
  success: boolean;
  category_id: string;
  old_name: string;
  new_name: string;
  product_count: number;
  updated_at: string;
}
```

**Parameters:**
- `p_business_id` - Business UUID
- `p_category_id` - Category to update
- `p_name` - New name (optional)
- `p_description` - New description (optional)
- `p_parent_id` - New parent (optional)
- `p_sort_order` - New sort order (optional)

**Validation:**
- Category must exist
- No duplicate names
- Cannot set self as parent
- Parent category must exist
- Returns product count in category

---

### 7. Delete Category

Deletes a category with optional product migration.

**Function Signature:**
```sql
delete_category(
    p_business_id UUID,
    p_category_id UUID,
    p_move_products_to UUID DEFAULT NULL
) RETURNS JSONB
```

**Returns:**
```typescript
{
  success: boolean;
  category_id: string;
  category_name: string;
  products_moved: number;
  moved_to: string;
  deleted_at: string;
}
```

**Parameters:**
- `p_business_id` - Business UUID
- `p_category_id` - Category to delete
- `p_move_products_to` - Optional target category for products

**Validation:**
- Category must exist
- Cannot delete if has subcategories
- Cannot delete if has products (unless migration target provided)
- Target category must exist
- Safely migrates products before deletion

---

### 8. Reorder Categories

Bulk reorder categories via JSONB array.

**Function Signature:**
```sql
reorder_categories(
    p_business_id UUID,
    p_category_orders JSONB
) RETURNS JSONB
```

**Returns:**
```typescript
{
  success: boolean;
  updated_count: number;
  total_requested: number;
  updated_at: string;
}
```

**Parameters:**
- `p_business_id` - Business UUID
- `p_category_orders` - Array of `{id: UUID, sort_order: INTEGER}`

**Example Input:**
```json
[
  {"id": "uuid-1", "sort_order": 1},
  {"id": "uuid-2", "sort_order": 2},
  {"id": "uuid-3", "sort_order": 3}
]
```

**Features:**
- Bulk update in single transaction
- Validates input array
- Returns count of updated categories
- Efficient for drag-and-drop reordering

---

## Performance Indexes

Three indexes optimize category queries:

```sql
-- Hierarchy queries
CREATE INDEX idx_categories_parent
    ON categories(business_id, parent_id);

-- Sorting operations
CREATE INDEX idx_categories_sort
    ON categories(business_id, sort_order);

-- Name searches
CREATE INDEX idx_categories_name
    ON categories(business_id, name);
```

---

## TypeScript Service Layer

### Complete Service Implementation

```typescript
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type CategoryRow = Database['public']['Functions']['get_business_categories']['Returns'][0];
type CategoryAnalytics = Database['public']['Functions']['get_category_analytics']['Returns'][0];
type TopCategory = Database['public']['Functions']['get_top_selling_categories']['Returns'][0];

export class CategoryService {
  private supabase = createClient();

  /**
   * Get all categories with hierarchy
   */
  async getCategories(
    businessId: string,
    parentId?: string,
    includeInactive = false
  ) {
    const { data, error } = await this.supabase
      .rpc('get_business_categories', {
        p_business_id: businessId,
        p_parent_id: parentId,
        p_include_inactive: includeInactive,
      });

    if (error) throw error;
    return data as CategoryRow[];
  }

  /**
   * Get complete category tree
   */
  async getCategoryTree(businessId: string) {
    const { data, error } = await this.supabase
      .rpc('get_category_tree', {
        p_business_id: businessId,
      });

    if (error) throw error;
    return data;
  }

  /**
   * Get category analytics
   */
  async getCategoryAnalytics(
    businessId: string,
    startDate?: string,
    endDate?: string
  ) {
    const { data, error } = await this.supabase
      .rpc('get_category_analytics', {
        p_business_id: businessId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

    if (error) throw error;
    return data as CategoryAnalytics[];
  }

  /**
   * Get top selling categories
   */
  async getTopSellingCategories(
    businessId: string,
    startDate?: string,
    endDate?: string,
    limit = 10
  ) {
    const { data, error } = await this.supabase
      .rpc('get_top_selling_categories', {
        p_business_id: businessId,
        p_start_date: startDate,
        p_end_date: endDate,
        p_limit: limit,
      });

    if (error) throw error;
    return data as TopCategory[];
  }

  /**
   * Create new category
   */
  async createCategory(params: {
    businessId: string;
    name: string;
    description?: string;
    parentId?: string;
    sortOrder?: number;
  }) {
    const { data, error } = await this.supabase
      .rpc('create_category', {
        p_business_id: params.businessId,
        p_name: params.name,
        p_description: params.description,
        p_parent_id: params.parentId,
        p_sort_order: params.sortOrder,
      });

    if (error) throw error;
    return data;
  }

  /**
   * Update category
   */
  async updateCategory(params: {
    businessId: string;
    categoryId: string;
    name?: string;
    description?: string;
    parentId?: string;
    sortOrder?: number;
  }) {
    const { data, error } = await this.supabase
      .rpc('update_category', {
        p_business_id: params.businessId,
        p_category_id: params.categoryId,
        p_name: params.name,
        p_description: params.description,
        p_parent_id: params.parentId,
        p_sort_order: params.sortOrder,
      });

    if (error) throw error;
    return data;
  }

  /**
   * Delete category
   */
  async deleteCategory(
    businessId: string,
    categoryId: string,
    moveProductsTo?: string
  ) {
    const { data, error } = await this.supabase
      .rpc('delete_category', {
        p_business_id: businessId,
        p_category_id: categoryId,
        p_move_products_to: moveProductsTo,
      });

    if (error) throw error;
    return data;
  }

  /**
   * Reorder categories
   */
  async reorderCategories(
    businessId: string,
    categoryOrders: Array<{ id: string; sort_order: number }>
  ) {
    const { data, error } = await this.supabase
      .rpc('reorder_categories', {
        p_business_id: businessId,
        p_category_orders: categoryOrders,
      });

    if (error) throw error;
    return data;
  }

  /**
   * Helper: Get root categories only
   */
  async getRootCategories(businessId: string) {
    return this.getCategories(businessId, null, false);
  }

  /**
   * Helper: Get subcategories of a parent
   */
  async getSubcategories(businessId: string, parentId: string) {
    return this.getCategories(businessId, parentId, false);
  }
}

export const categoryService = new CategoryService();
```

---

## React Query Hooks

### Complete Hook Implementation

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/category.service';
import { toast } from 'sonner';

/**
 * Get categories with hierarchy
 */
export function useCategories(
  businessId: string,
  parentId?: string,
  includeInactive = false
) {
  return useQuery({
    queryKey: ['categories', businessId, parentId, includeInactive],
    queryFn: () => categoryService.getCategories(businessId, parentId, includeInactive),
    enabled: !!businessId,
  });
}

/**
 * Get category tree
 */
export function useCategoryTree(businessId: string) {
  return useQuery({
    queryKey: ['category-tree', businessId],
    queryFn: () => categoryService.getCategoryTree(businessId),
    enabled: !!businessId,
  });
}

/**
 * Get category analytics
 */
export function useCategoryAnalytics(
  businessId: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['category-analytics', businessId, startDate, endDate],
    queryFn: () => categoryService.getCategoryAnalytics(businessId, startDate, endDate),
    enabled: !!businessId,
  });
}

/**
 * Get top selling categories
 */
export function useTopSellingCategories(
  businessId: string,
  startDate?: string,
  endDate?: string,
  limit = 10
) {
  return useQuery({
    queryKey: ['top-selling-categories', businessId, startDate, endDate, limit],
    queryFn: () => categoryService.getTopSellingCategories(businessId, startDate, endDate, limit),
    enabled: !!businessId,
  });
}

/**
 * Create category mutation
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-tree'] });
      toast.success(`Category "${data.name}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Update category mutation
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoryService.updateCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-tree'] });
      queryClient.invalidateQueries({ queryKey: ['category-analytics'] });
      toast.success(`Category updated to "${data.new_name}"`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Delete category mutation
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      businessId,
      categoryId,
      moveProductsTo
    }: {
      businessId: string;
      categoryId: string;
      moveProductsTo?: string
    }) => categoryService.deleteCategory(businessId, categoryId, moveProductsTo),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-tree'] });
      queryClient.invalidateQueries({ queryKey: ['category-analytics'] });

      if (data.products_moved > 0) {
        toast.success(`Category "${data.category_name}" deleted. ${data.products_moved} products moved.`);
      } else {
        toast.success(`Category "${data.category_name}" deleted`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Reorder categories mutation
 */
export function useReorderCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      businessId,
      categoryOrders,
    }: {
      businessId: string;
      categoryOrders: Array<{ id: string; sort_order: number }>;
    }) => categoryService.reorderCategories(businessId, categoryOrders),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-tree'] });
      toast.success(`${data.updated_count} categories reordered`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
```

---

## Use Cases

### 1. Category Tree UI

Display hierarchical category tree with drag-and-drop reordering:

```typescript
function CategoryTreeView({ businessId }: { businessId: string }) {
  const { data: tree, isLoading } = useCategoryTree(businessId);
  const reorderMutation = useReorderCategories();

  const handleReorder = (newOrder: Array<{ id: string; sort_order: number }>) => {
    reorderMutation.mutate({
      businessId,
      categoryOrders: newOrder,
    });
  };

  if (isLoading) return <Skeleton />;

  return (
    <Tree
      data={tree}
      onReorder={handleReorder}
      renderNode={(node) => (
        <div className="flex items-center justify-between">
          <span>{node.name}</span>
          <Badge>{node.product_count} products</Badge>
        </div>
      )}
    />
  );
}
```

### 2. Category Performance Dashboard

Display category analytics with sales metrics:

```typescript
function CategoryPerformanceDashboard({ businessId }: { businessId: string }) {
  const { data: analytics } = useCategoryAnalytics(
    businessId,
    format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    format(new Date(), 'yyyy-MM-dd')
  );

  const { data: topCategories } = useTopSellingCategories(
    businessId,
    undefined,
    undefined,
    5
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Category Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Stock Value</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics?.map((cat) => (
                <TableRow key={cat.category_id}>
                  <TableCell>{cat.category_name}</TableCell>
                  <TableCell>{cat.product_count}</TableCell>
                  <TableCell>₹{cat.total_stock_value.toFixed(2)}</TableCell>
                  <TableCell>₹{cat.total_sales.toFixed(2)}</TableCell>
                  <TableCell>{cat.profit_margin}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Selling Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {topCategories?.map((cat, idx) => (
            <div key={cat.category_id} className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">#{cat.rank}</Badge>
                <span>{cat.category_name}</span>
              </div>
              <div className="text-right">
                <p className="font-semibold">₹{cat.total_revenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {cat.items_sold} items in {cat.transactions} orders
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

### 3. Category Management Form

Create/edit categories with parent selection:

```typescript
function CategoryForm({
  businessId,
  categoryId
}: {
  businessId: string;
  categoryId?: string
}) {
  const { data: categories } = useCategories(businessId);
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      parentId: '',
    },
  });

  const onSubmit = (values: any) => {
    if (categoryId) {
      updateMutation.mutate({
        businessId,
        categoryId,
        ...values,
      });
    } else {
      createMutation.mutate({
        businessId,
        ...values,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter category name" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Optional description" />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">None (Root Category)</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
          {categoryId ? 'Update' : 'Create'} Category
        </Button>
      </form>
    </Form>
  );
}
```

### 4. Safe Category Deletion

Delete category with product migration:

```typescript
function DeleteCategoryDialog({
  businessId,
  categoryId
}: {
  businessId: string;
  categoryId: string
}) {
  const [moveToCategory, setMoveToCategory] = useState<string>();
  const { data: categories } = useCategories(businessId);
  const deleteMutation = useDeleteCategory();

  const category = categories?.find(c => c.id === categoryId);
  const hasProducts = (category?.product_count || 0) > 0;

  const handleDelete = () => {
    deleteMutation.mutate({
      businessId,
      categoryId,
      moveProductsTo: moveToCategory,
    });
  };

  return (
    <AlertDialog>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{category?.name}"?</AlertDialogTitle>
          <AlertDialogDescription>
            {hasProducts ? (
              <>
                This category has {category?.product_count} products.
                Select a category to move them to:
                <Select onValueChange={setMoveToCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select target category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      ?.filter(c => c.id !== categoryId)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </>
            ) : (
              'This action cannot be undone.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={hasProducts && !moveToCategory}
          >
            Delete Category
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

## Module Summary

**Categories Management Module Complete:**

- **8 Database Functions** - Full CRUD + analytics + tree operations
- **3 Performance Indexes** - Optimized for hierarchy, sorting, and search
- **TypeScript Service Layer** - Type-safe service class
- **React Query Hooks** - Complete query and mutation hooks
- **4 Real-world Use Cases** - Tree view, analytics, forms, safe deletion

**Total Functions Across All Modules: 56**
- Inventory Management: 7 functions
- Sales/POS: 8 functions
- Customer Management: 8 functions
- Expense Management: 9 functions
- Reports & Analytics: 8 functions
- Staff Management: 8 functions
- **Categories Management: 8 functions** ✓

**Key Features:**
- Unlimited hierarchical depth
- Recursive tree queries with CTEs
- Safe deletion with product migration
- Bulk reordering support
- Comprehensive analytics
- Performance optimized indexes
