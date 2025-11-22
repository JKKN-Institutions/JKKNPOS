# Discounts & Promotions Module - Complete Backend Documentation

## Module Overview

The **Discounts & Promotions Module** provides comprehensive promotion management and discount calculation for the JKKN POS system. This module supports multiple discount types, promotional campaigns, usage tracking, and performance analytics.

**Module ID:** Module 10
**Priority:** P0 (Critical)
**Database Functions:** 8
**Tables:** 2 (promotions, promotion_usage)

---

## Key Features

### 1. Promotion Types
- **PERCENTAGE** - Percentage-based discounts (e.g., "20% off")
- **FIXED_AMOUNT** - Fixed amount off (e.g., "₹50 off")
- **BUY_X_GET_Y** - Buy X, get Y free (e.g., "Buy 2 Get 1 Free")
- **BUNDLE** - Bundle pricing (e.g., "3 items for ₹100")

### 2. Applicability Modes
- **ALL** - Applies to all products
- **CATEGORIES** - Specific categories only
- **ITEMS** - Specific products only
- **CUSTOMERS** - Specific customers only

### 3. Usage Controls
- Total usage limits per promotion
- Per-customer usage limits
- Minimum purchase requirements
- Maximum discount caps (for percentage discounts)

### 4. Analytics & Tracking
- Real-time usage tracking
- Performance analytics
- Revenue impact measurement
- Customer engagement metrics

---

## Database Schema

### Table: `promotions`

Stores promotion configurations and metadata.

```sql
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    code TEXT,  -- Optional promo code for customer entry
    type TEXT NOT NULL CHECK (type IN ('PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'BUNDLE')),
    value NUMERIC NOT NULL,  -- Percentage or fixed amount
    min_purchase_amount NUMERIC DEFAULT 0,
    max_discount_amount NUMERIC,  -- Cap for percentage discounts
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    applicable_to TEXT NOT NULL CHECK (applicable_to IN ('ALL', 'CATEGORIES', 'ITEMS', 'CUSTOMERS')),
    applicable_ids UUID[],  -- Array of category/item/customer IDs
    buy_quantity INTEGER,  -- For BUY_X_GET_Y type
    get_quantity INTEGER,  -- For BUY_X_GET_Y type
    usage_limit INTEGER,  -- Total usage limit
    usage_count INTEGER DEFAULT 0,
    customer_usage_limit INTEGER DEFAULT 1,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_promo_code UNIQUE(business_id, code)
);
```

**Key Fields:**
- `type` - Determines calculation logic (PERCENTAGE, FIXED_AMOUNT, BUY_X_GET_Y, BUNDLE)
- `value` - The discount value (percentage 0-100 or fixed amount)
- `applicable_to` / `applicable_ids` - Controls which products/customers are eligible
- `usage_count` / `usage_limit` - Prevents over-redemption
- `code` - Optional promotional code for customer entry

### Table: `promotion_usage`

Tracks individual promotion redemptions for analytics and limit enforcement.

```sql
CREATE TABLE IF NOT EXISTS public.promotion_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES public.sales(id),
    customer_id UUID REFERENCES public.customers(id),
    discount_amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Fields:**
- `promotion_id` - Links to the promotion used
- `sale_id` - Links to the sale where promotion was applied
- `customer_id` - Tracks which customer used the promotion
- `discount_amount` - Actual discount given in this transaction

### Indexes

Performance-optimized indexes for common queries:

```sql
CREATE INDEX idx_promotions_business_active ON public.promotions(business_id, is_active);
CREATE INDEX idx_promotions_dates ON public.promotions(business_id, start_date, end_date);
CREATE INDEX idx_promotions_code ON public.promotions(business_id, code) WHERE code IS NOT NULL;
CREATE INDEX idx_promotion_usage_promotion ON public.promotion_usage(promotion_id, created_at);
CREATE INDEX idx_promotion_usage_customer ON public.promotion_usage(customer_id, promotion_id);
```

---

## Database Functions

### 1. `get_active_promotions`

**Purpose:** List all active promotions valid for a specific date and customer.

**Use Case:** POS checkout screen showing available promotions.

**Function Signature:**
```sql
FUNCTION public.get_active_promotions(
    p_business_id UUID,
    p_date DATE,
    p_customer_id UUID
)
RETURNS TABLE (...)
```

**TypeScript Types:**
```typescript
// Request
interface GetActivePromotionsRequest {
  businessId: string;
  date?: string; // YYYY-MM-DD format, defaults to today
  customerId?: string; // Optional, filters to customer-specific promos
}

// Response (array of promotions)
interface ActivePromotion {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'BUNDLE';
  value: number;
  min_purchase_amount: number;
  max_discount_amount: number | null;
  applicable_to: 'ALL' | 'CATEGORIES' | 'ITEMS' | 'CUSTOMERS';
  applicable_ids: string[] | null;
  buy_quantity: number | null;
  get_quantity: number | null;
  usage_count: number;
  usage_limit: number | null;
  customer_usage_limit: number;
  customer_usage_count: number;
  start_date: string;
  end_date: string;
  created_at: string;
}
```

**Service Layer:**
```typescript
// services/promotionService.ts
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type ActivePromotion = Database['public']['Functions']['get_active_promotions']['Returns'][0];

export const promotionService = {
  getActivePromotions: async (params: {
    businessId: string;
    date?: string;
    customerId?: string;
  }): Promise<ActivePromotion[]> => {
    const { data, error } = await supabase
      .rpc('get_active_promotions', {
        p_business_id: params.businessId,
        p_date: params.date || new Date().toISOString().split('T')[0],
        p_customer_id: params.customerId || '',
      });

    if (error) throw error;
    return data || [];
  },
};
```

**React Query Hook:**
```typescript
// hooks/promotions/useActivePromotions.ts
import { useQuery } from '@tanstack/react-query';
import { promotionService } from '@/services/promotionService';

export function useActivePromotions(businessId: string, customerId?: string) {
  return useQuery({
    queryKey: ['promotions', 'active', businessId, customerId],
    queryFn: () => promotionService.getActivePromotions({
      businessId,
      customerId,
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

---

### 2. `get_applicable_promotions`

**Purpose:** Find promotions applicable to specific items and categories in the current cart.

**Use Case:** Real-time promotion suggestions as customer adds items to cart.

**Function Signature:**
```sql
FUNCTION public.get_applicable_promotions(
    p_business_id UUID,
    p_item_ids UUID[],
    p_category_ids UUID[],
    p_customer_id UUID,
    p_date DATE
)
RETURNS TABLE (...)
```

**TypeScript Types:**
```typescript
// Request
interface GetApplicablePromotionsRequest {
  businessId: string;
  itemIds: string[];
  categoryIds: string[];
  customerId?: string;
  date?: string;
}

// Response
interface ApplicablePromotion {
  id: string;
  name: string;
  description: string | null;
  code: string | null;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'BUNDLE';
  value: number;
  min_purchase_amount: number;
  max_discount_amount: number | null;
  applicable_to: 'ALL' | 'CATEGORIES' | 'ITEMS' | 'CUSTOMERS';
  buy_quantity: number | null;
  get_quantity: number | null;
}
```

**Service Layer:**
```typescript
export const promotionService = {
  getApplicablePromotions: async (params: GetApplicablePromotionsRequest) => {
    const { data, error } = await supabase
      .rpc('get_applicable_promotions', {
        p_business_id: params.businessId,
        p_item_ids: params.itemIds,
        p_category_ids: params.categoryIds,
        p_customer_id: params.customerId || '',
        p_date: params.date || new Date().toISOString().split('T')[0],
      });

    if (error) throw error;
    return data || [];
  },
};
```

**React Query Hook:**
```typescript
export function useApplicablePromotions(
  businessId: string,
  cartItems: { itemId: string; categoryId: string }[]
) {
  const itemIds = cartItems.map(item => item.itemId);
  const categoryIds = [...new Set(cartItems.map(item => item.categoryId))];

  return useQuery({
    queryKey: ['promotions', 'applicable', businessId, itemIds, categoryIds],
    queryFn: () => promotionService.getApplicablePromotions({
      businessId,
      itemIds,
      categoryIds,
    }),
    enabled: itemIds.length > 0,
  });
}
```

---

### 3. `calculate_promotion_discount`

**Purpose:** Calculate the exact discount amount for a specific promotion and cart.

**Use Case:** Real-time discount calculation at checkout.

**Function Signature:**
```sql
FUNCTION public.calculate_promotion_discount(
    p_business_id UUID,
    p_promotion_id UUID,
    p_items JSONB,  -- Array of {item_id, quantity, price, category_id}
    p_subtotal NUMERIC
)
RETURNS JSONB
```

**TypeScript Types:**
```typescript
// Request
interface CartItem {
  item_id: string;
  quantity: number;
  price: number;
  category_id: string;
}

interface CalculateDiscountRequest {
  businessId: string;
  promotionId: string;
  items: CartItem[];
  subtotal: number;
}

// Response
interface DiscountCalculation {
  eligible: boolean;
  discount_amount: number;
  promotion_id: string;
  promotion_name: string;
  promotion_type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'BUNDLE';
  message: string;
}
```

**Service Layer:**
```typescript
export const promotionService = {
  calculateDiscount: async (params: CalculateDiscountRequest): Promise<DiscountCalculation> => {
    const { data, error } = await supabase
      .rpc('calculate_promotion_discount', {
        p_business_id: params.businessId,
        p_promotion_id: params.promotionId,
        p_items: params.items,
        p_subtotal: params.subtotal,
      });

    if (error) throw error;
    return data as DiscountCalculation;
  },
};
```

**React Query Hook:**
```typescript
export function useCalculateDiscount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: promotionService.calculateDiscount,
    onSuccess: (data) => {
      // Optionally update cart state with discount
      if (data.eligible) {
        queryClient.setQueryData(['cart', 'discount'], data);
      }
    },
  });
}
```

---

### 4. `create_promotion`

**Purpose:** Create a new promotion with full configuration.

**Use Case:** Admin panel - create promotional campaign.

**Function Signature:**
```sql
FUNCTION public.create_promotion(
    p_business_id UUID,
    p_name TEXT,
    p_description TEXT,
    p_code TEXT,
    p_type TEXT,
    p_value NUMERIC,
    p_min_purchase_amount NUMERIC,
    p_max_discount_amount NUMERIC,
    p_start_date DATE,
    p_end_date DATE,
    p_applicable_to TEXT,
    p_applicable_ids UUID[],
    p_buy_quantity INTEGER,
    p_get_quantity INTEGER,
    p_usage_limit INTEGER,
    p_customer_usage_limit INTEGER,
    p_user_id UUID
)
RETURNS JSONB
```

**TypeScript Types:**
```typescript
interface CreatePromotionRequest {
  businessId: string;
  name: string;
  description?: string;
  code?: string; // Promo code (optional, must be unique)
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'BUNDLE';
  value: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  applicableTo: 'ALL' | 'CATEGORIES' | 'ITEMS' | 'CUSTOMERS';
  applicableIds?: string[];
  buyQuantity?: number; // Required for BUY_X_GET_Y
  getQuantity?: number; // Required for BUY_X_GET_Y
  usageLimit?: number;
  customerUsageLimit?: number;
  userId: string;
}

interface CreatePromotionResponse {
  success: boolean;
  promotion_id: string;
  name: string;
  created_at: string;
}
```

**Service Layer:**
```typescript
export const promotionService = {
  createPromotion: async (params: CreatePromotionRequest) => {
    const { data, error } = await supabase
      .rpc('create_promotion', {
        p_business_id: params.businessId,
        p_name: params.name,
        p_description: params.description || '',
        p_code: params.code || '',
        p_type: params.type,
        p_value: params.value,
        p_min_purchase_amount: params.minPurchaseAmount || 0,
        p_max_discount_amount: params.maxDiscountAmount || 0,
        p_start_date: params.startDate,
        p_end_date: params.endDate,
        p_applicable_to: params.applicableTo,
        p_applicable_ids: params.applicableIds || [],
        p_buy_quantity: params.buyQuantity || 0,
        p_get_quantity: params.getQuantity || 0,
        p_usage_limit: params.usageLimit || 0,
        p_customer_usage_limit: params.customerUsageLimit || 1,
        p_user_id: params.userId,
      });

    if (error) throw error;
    return data as CreatePromotionResponse;
  },
};
```

**React Query Hook:**
```typescript
export function useCreatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: promotionService.createPromotion,
    onSuccess: () => {
      // Invalidate promotions list
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
}
```

---

### 5. `update_promotion`

**Purpose:** Update an existing promotion's configuration.

**Use Case:** Admin panel - edit active promotion.

**Function Signature:**
```sql
FUNCTION public.update_promotion(
    p_business_id UUID,
    p_promotion_id UUID,
    p_name TEXT,
    p_description TEXT,
    p_value NUMERIC,
    p_min_purchase_amount NUMERIC,
    p_max_discount_amount NUMERIC,
    p_start_date DATE,
    p_end_date DATE,
    p_is_active BOOLEAN,
    p_usage_limit INTEGER,
    p_customer_usage_limit INTEGER
)
RETURNS JSONB
```

**TypeScript Types:**
```typescript
interface UpdatePromotionRequest {
  businessId: string;
  promotionId: string;
  name?: string;
  description?: string;
  value?: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  usageLimit?: number;
  customerUsageLimit?: number;
}

interface UpdatePromotionResponse {
  success: boolean;
  promotion_id: string;
  updated_at: string;
}
```

**Service Layer:**
```typescript
export const promotionService = {
  updatePromotion: async (params: UpdatePromotionRequest) => {
    const { data, error } = await supabase
      .rpc('update_promotion', {
        p_business_id: params.businessId,
        p_promotion_id: params.promotionId,
        p_name: params.name || '',
        p_description: params.description || '',
        p_value: params.value || 0,
        p_min_purchase_amount: params.minPurchaseAmount || 0,
        p_max_discount_amount: params.maxDiscountAmount || 0,
        p_start_date: params.startDate || '',
        p_end_date: params.endDate || '',
        p_is_active: params.isActive ?? true,
        p_usage_limit: params.usageLimit || 0,
        p_customer_usage_limit: params.customerUsageLimit || 1,
      });

    if (error) throw error;
    return data as UpdatePromotionResponse;
  },
};
```

**React Query Hook:**
```typescript
export function useUpdatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: promotionService.updatePromotion,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      queryClient.invalidateQueries({
        queryKey: ['promotion', variables.promotionId]
      });
    },
  });
}
```

---

### 6. `deactivate_promotion`

**Purpose:** Deactivate a promotion (soft delete).

**Use Case:** End a promotion campaign early.

**Function Signature:**
```sql
FUNCTION public.deactivate_promotion(
    p_business_id UUID,
    p_promotion_id UUID
)
RETURNS JSONB
```

**TypeScript Types:**
```typescript
interface DeactivatePromotionRequest {
  businessId: string;
  promotionId: string;
}

interface DeactivatePromotionResponse {
  success: boolean;
  promotion_id: string;
  deactivated_at: string;
}
```

**Service Layer:**
```typescript
export const promotionService = {
  deactivatePromotion: async (params: DeactivatePromotionRequest) => {
    const { data, error } = await supabase
      .rpc('deactivate_promotion', {
        p_business_id: params.businessId,
        p_promotion_id: params.promotionId,
      });

    if (error) throw error;
    return data as DeactivatePromotionResponse;
  },
};
```

**React Query Hook:**
```typescript
export function useDeactivatePromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: promotionService.deactivatePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
}
```

---

### 7. `apply_promotion_to_sale`

**Purpose:** Record promotion usage when a sale is completed.

**Use Case:** Finalize checkout with applied promotion.

**Function Signature:**
```sql
FUNCTION public.apply_promotion_to_sale(
    p_business_id UUID,
    p_promotion_id UUID,
    p_sale_id UUID,
    p_customer_id UUID,
    p_discount_amount NUMERIC
)
RETURNS JSONB
```

**TypeScript Types:**
```typescript
interface ApplyPromotionRequest {
  businessId: string;
  promotionId: string;
  saleId: string;
  customerId?: string;
  discountAmount: number;
}

interface ApplyPromotionResponse {
  success: boolean;
  usage_id: string;
  promotion_id: string;
  promotion_name: string;
  discount_amount: number;
  created_at: string;
}
```

**Service Layer:**
```typescript
export const promotionService = {
  applyPromotionToSale: async (params: ApplyPromotionRequest) => {
    const { data, error } = await supabase
      .rpc('apply_promotion_to_sale', {
        p_business_id: params.businessId,
        p_promotion_id: params.promotionId,
        p_sale_id: params.saleId,
        p_customer_id: params.customerId || '',
        p_discount_amount: params.discountAmount,
      });

    if (error) throw error;
    return data as ApplyPromotionResponse;
  },
};
```

**React Query Hook:**
```typescript
export function useApplyPromotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: promotionService.applyPromotionToSale,
    onSuccess: (_, variables) => {
      // Invalidate promotion analytics
      queryClient.invalidateQueries({
        queryKey: ['promotion', variables.promotionId, 'performance']
      });
    },
  });
}
```

---

### 8. `get_promotion_performance`

**Purpose:** Analyze promotion performance metrics for date range.

**Use Case:** Admin dashboard - promotion analytics.

**Function Signature:**
```sql
FUNCTION public.get_promotion_performance(
    p_business_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (...)
```

**TypeScript Types:**
```typescript
// Request
interface GetPromotionPerformanceRequest {
  businessId: string;
  startDate?: string; // Defaults to 30 days ago
  endDate?: string; // Defaults to today
}

// Response (array of performance metrics)
interface PromotionPerformance {
  promotion_id: string;
  promotion_name: string;
  promotion_type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'BUNDLE';
  total_usage: number;
  total_discount_given: number;
  total_revenue: number;
  avg_discount_per_use: number;
  unique_customers: number;
  is_active: boolean;
  start_date: string;
  end_date: string;
}
```

**Service Layer:**
```typescript
export const promotionService = {
  getPromotionPerformance: async (params: GetPromotionPerformanceRequest) => {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    const { data, error } = await supabase
      .rpc('get_promotion_performance', {
        p_business_id: params.businessId,
        p_start_date: params.startDate || thirtyDaysAgo,
        p_end_date: params.endDate || today,
      });

    if (error) throw error;
    return data || [];
  },
};
```

**React Query Hook:**
```typescript
export function usePromotionPerformance(
  businessId: string,
  dateRange?: { start: string; end: string }
) {
  return useQuery({
    queryKey: ['promotions', 'performance', businessId, dateRange],
    queryFn: () => promotionService.getPromotionPerformance({
      businessId,
      startDate: dateRange?.start,
      endDate: dateRange?.end,
    }),
    staleTime: 1000 * 60 * 5,
  });
}
```

---

## Complete Workflow Examples

### Example 1: POS Checkout with Promotion

```typescript
// 1. Customer adds items to cart
const cartItems = [
  { item_id: 'item-1', quantity: 2, price: 100, category_id: 'cat-1' },
  { item_id: 'item-2', quantity: 1, price: 50, category_id: 'cat-1' },
];

// 2. Get applicable promotions
const { data: applicablePromos } = useApplicablePromotions(businessId, cartItems);

// 3. User selects a promotion
const selectedPromo = applicablePromos[0];

// 4. Calculate discount
const { mutateAsync: calculateDiscount } = useCalculateDiscount();
const discount = await calculateDiscount({
  businessId,
  promotionId: selectedPromo.id,
  items: cartItems,
  subtotal: 250,
});

// 5. Complete sale with discount
const { mutateAsync: createSale } = useCreateSale();
const sale = await createSale({
  businessId,
  items: cartItems,
  discount: discount.discount_amount,
  total: 250 - discount.discount_amount,
});

// 6. Record promotion usage
const { mutateAsync: applyPromotion } = useApplyPromotion();
await applyPromotion({
  businessId,
  promotionId: selectedPromo.id,
  saleId: sale.sale_id,
  customerId: customer?.id,
  discountAmount: discount.discount_amount,
});
```

### Example 2: Admin Creates "Buy 2 Get 1 Free" Promotion

```typescript
const { mutateAsync: createPromotion } = useCreatePromotion();

await createPromotion({
  businessId,
  name: "Buy 2 Get 1 Free - Summer Sale",
  description: "Purchase any 2 items, get the 3rd item free!",
  code: "SUMMER2024",
  type: "BUY_X_GET_Y",
  value: 0, // Not used for BUY_X_GET_Y
  startDate: "2024-06-01",
  endDate: "2024-08-31",
  applicableTo: "CATEGORIES",
  applicableIds: ['category-summer-collection'],
  buyQuantity: 2,
  getQuantity: 1,
  usageLimit: 1000, // Total 1000 redemptions
  customerUsageLimit: 5, // Each customer can use 5 times
  userId: currentUser.id,
});
```

### Example 3: Analytics Dashboard Component

```typescript
// components/PromotionAnalytics.tsx
export function PromotionAnalytics({ businessId }: { businessId: string }) {
  const [dateRange, setDateRange] = useState({
    start: thirtyDaysAgo(),
    end: today(),
  });

  const { data: performance, isLoading } = usePromotionPerformance(
    businessId,
    dateRange
  );

  if (isLoading) return <Skeleton />;

  return (
    <div className="space-y-6">
      <DateRangePicker value={dateRange} onChange={setDateRange} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {performance?.map((promo) => (
          <Card key={promo.promotion_id}>
            <CardHeader>
              <CardTitle>{promo.promotion_name}</CardTitle>
              <CardDescription>
                {promo.promotion_type} • {promo.is_active ? 'Active' : 'Inactive'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Uses</span>
                  <span className="font-medium">{promo.total_usage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Discount Given</span>
                  <span className="font-medium">₹{promo.total_discount_given.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Revenue Generated</span>
                  <span className="font-medium">₹{promo.total_revenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Discount</span>
                  <span className="font-medium">₹{promo.avg_discount_per_use.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Unique Customers</span>
                  <span className="font-medium">{promo.unique_customers}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## Business Logic & Validation

### Promotion Type Validations

#### PERCENTAGE Type
- `value` must be between 0 and 100
- `max_discount_amount` is optional cap
- Calculation: `(subtotal * value / 100)`, capped by `max_discount_amount`

#### FIXED_AMOUNT Type
- `value` is the fixed discount amount
- Discount cannot exceed subtotal
- Calculation: `min(value, subtotal)`

#### BUY_X_GET_Y Type
- `buy_quantity` and `get_quantity` are required
- Eligible items determined by `applicable_to` and `applicable_ids`
- Free items = cheapest items in eligible set
- Calculation: Sum of cheapest Y items when X items purchased

#### BUNDLE Type
- `value` is the bundle price
- Discount = `max(0, subtotal - value)`

### Usage Limit Enforcement

```typescript
// Function checks limits before allowing promotion application:
// 1. Total usage: usage_count < usage_limit
// 2. Customer usage: per-customer count < customer_usage_limit
// 3. Date range: CURRENT_DATE between start_date and end_date
// 4. Active status: is_active = true
// 5. Minimum purchase: subtotal >= min_purchase_amount
```

---

## Security & Performance

### Row Level Security (RLS)

Both tables have RLS enabled for multi-tenant isolation:

```sql
-- Users can only access promotions for their business
CREATE POLICY promotions_business_isolation ON promotions
  FOR ALL USING (business_id IN (
    SELECT business_id FROM profiles WHERE id = auth.uid()
  ));

CREATE POLICY promotion_usage_business_isolation ON promotion_usage
  FOR ALL USING (
    promotion_id IN (
      SELECT id FROM promotions WHERE business_id IN (
        SELECT business_id FROM profiles WHERE id = auth.uid()
      )
    )
  );
```

### Performance Optimizations

1. **Indexed Queries:** All common queries use composite indexes
2. **Array Overlap:** PostgreSQL `&&` operator for fast array filtering
3. **Date Range Indexes:** B-tree indexes on date columns for range queries
4. **Usage Tracking:** Incremental counter updates instead of COUNT queries

### Security Patterns

- **SECURITY INVOKER:** All functions run with caller's RLS permissions
- **SET search_path = '':** Prevents schema injection attacks
- **NULLIF Pattern:** Handles empty string parameters securely
- **Unique Constraints:** Prevents duplicate promo codes

---

## Migration Information

**Migration File:** `supabase/migrations/013_discounts_promotions_module.sql`
**Applied:** 2025-11-22
**Functions:** 8
**Tables:** 2
**Indexes:** 5

---

## Summary

The **Discounts & Promotions Module** provides:

✅ **8 Database Functions** - Complete promotion lifecycle management
✅ **4 Promotion Types** - PERCENTAGE, FIXED_AMOUNT, BUY_X_GET_Y, BUNDLE
✅ **4 Applicability Modes** - ALL, CATEGORIES, ITEMS, CUSTOMERS
✅ **Usage Tracking** - Real-time tracking with limit enforcement
✅ **Performance Analytics** - Revenue impact and customer engagement metrics
✅ **TypeScript Support** - Full type safety with generated types
✅ **React Query Hooks** - Ready-to-use hooks for all operations

**Total Backend Functions:** 88 (80 previous + 8 promotions)
**Module Status:** ✅ Complete
