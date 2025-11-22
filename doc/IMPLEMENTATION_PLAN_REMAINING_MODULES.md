# Remaining POS Backend Modules - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans to implement this plan task-by-task.

**Goal:** Complete the remaining critical backend modules for the JKKN POS system to achieve full PRD coverage.

**Architecture:** Supabase PostgreSQL functions with SECURITY INVOKER pattern, following established 5-layer architecture (Types → Services → Hooks → Components → Pages). Each module includes 6-10 database functions, TypeScript type generation, comprehensive documentation, and performance indexes.

**Tech Stack:** Supabase (PostgreSQL 15), TypeScript, Next.js 15, React Query, Shadcn/UI

---

## Current Status Summary

**Completed Modules (8 modules, 66 functions):**
1. ✅ Inventory Management - 7 functions
2. ✅ Sales/POS - 8 functions
3. ✅ Customer Management - 8 functions
4. ✅ Expense Management - 9 functions
5. ✅ Reports & Analytics - 8 functions
6. ✅ Staff Management - 8 functions
7. ✅ Categories Management - 8 functions
8. ✅ Modifiers Management - 10 functions

**Remaining Critical Modules (from PRD analysis):**
- Purchase Order Management (P0 - Critical for inventory restocking)
- Discount & Promotion Management (P0 - Critical for sales)
- Suppliers Management (P0 - Required for purchase orders)
- Table Management (P1 - Restaurant specific)
- Kitchen Display System (P1 - Restaurant specific)
- Multi-Store Management (P1 - Scalability feature)

---

## Task 1: Purchase Order Management Module

**Priority:** P0 - Critical
**Estimated Functions:** 8
**Dependencies:** Suppliers table (will create), Items table (exists)

**Files:**
- Create: `supabase/migrations/012_purchase_orders_module.sql`
- Create: `doc/PURCHASE_ORDERS_MODULE.md`
- Modify: `types/database.types.ts` (auto-generated)

**Database Schema Required:**

```sql
-- Create suppliers table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    gstin TEXT,
    payment_terms TEXT, -- NET30, NET60, COD, etc
    credit_limit NUMERIC DEFAULT 0,
    current_balance NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
    po_number TEXT NOT NULL UNIQUE,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'CONFIRMED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED')),
    subtotal NUMERIC NOT NULL DEFAULT 0,
    tax NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    shipping_cost NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create purchase_order_items table
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id),
    quantity_ordered NUMERIC NOT NULL,
    quantity_received NUMERIC DEFAULT 0,
    unit_cost NUMERIC NOT NULL,
    tax_rate NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Functions to Implement:**

1. **get_business_purchase_orders** - List POs with filters (status, supplier, date range)
2. **get_purchase_order_details** - Complete PO with items and supplier info
3. **create_purchase_order** - Create PO with items (DRAFT status)
4. **update_purchase_order** - Update PO details and items
5. **receive_purchase_order** - Mark items as received, update stock
6. **cancel_purchase_order** - Cancel PO with reason
7. **get_supplier_performance** - Analytics on supplier delivery times, quality
8. **generate_po_number** - Auto-generate unique PO number

**Step 1: Create migration file with schema and functions**

Create `supabase/migrations/012_purchase_orders_module.sql` with:
- Suppliers table
- Purchase orders table
- Purchase order items table
- All 8 functions listed above
- Performance indexes
- RLS policies
- Grant permissions

**Step 2: Apply migration**

Run: `mcp__supabase__apply_migration` with migration content
Expected: Success confirmation

**Step 3: Generate TypeScript types**

Run: `mcp__supabase__generate_typescript_types`
Expected: Updated `types/database.types.ts` with 8 new functions

**Step 4: Create documentation**

Create `doc/PURCHASE_ORDERS_MODULE.md` with:
- Module overview
- All 8 function signatures with parameters
- TypeScript return types
- Service layer implementation
- React Query hooks
- 3-4 real-world use cases
- Performance notes

**Step 5: Verify module completion**

- ✅ 8 functions created
- ✅ Migration applied
- ✅ Types generated
- ✅ Documentation complete
- ✅ Total: 74 functions (66 + 8)

---

## Task 2: Suppliers Management Module

**Priority:** P0 - Critical (dependency for PO module)
**Estimated Functions:** 6
**Dependencies:** None (standalone)

**Files:**
- Create: `supabase/migrations/013_suppliers_management_module.sql`
- Create: `doc/SUPPLIERS_MODULE.md`
- Modify: `types/database.types.ts` (auto-generated)

**Functions to Implement:**

1. **get_business_suppliers** - List suppliers with filters and search
2. **get_supplier_details** - Complete supplier info with purchase history
3. **create_supplier** - Create new supplier with validation
4. **update_supplier** - Update supplier information
5. **record_supplier_payment** - Record payment, update balance
6. **get_supplier_ledger** - Payment history and balance tracking

**Step 1: Create migration file**

Note: Suppliers table already created in Task 1, only add functions

**Step 2: Implement all 6 functions**

Follow same pattern as previous modules:
- SECURITY INVOKER
- SET search_path = ''
- STABLE for read-only
- Proper validation
- JSONB returns for complex data

**Step 3: Apply migration and generate types**

**Step 4: Create comprehensive documentation**

**Step 5: Verify completion**
- Total: 80 functions (74 + 6)

---

## Task 3: Discount & Promotion Management Module

**Priority:** P0 - Critical for sales
**Estimated Functions:** 8
**Dependencies:** Items, Categories, Customers tables (all exist)

**Files:**
- Create: `supabase/migrations/014_discounts_promotions_module.sql`
- Create: `doc/DISCOUNTS_MODULE.md`

**Database Schema Required:**

```sql
-- Create promotions table
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('PERCENTAGE', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'BUNDLE')),
    value NUMERIC NOT NULL, -- Percentage or fixed amount
    min_purchase_amount NUMERIC DEFAULT 0,
    max_discount_amount NUMERIC, -- Cap for percentage discounts
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    applicable_to TEXT NOT NULL CHECK (applicable_to IN ('ALL', 'CATEGORIES', 'ITEMS', 'CUSTOMERS')),
    applicable_ids UUID[], -- Array of category/item/customer IDs
    usage_limit INTEGER, -- Total times can be used
    usage_count INTEGER DEFAULT 0,
    customer_usage_limit INTEGER, -- Per customer limit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create promotion_usage table (track customer usage)
CREATE TABLE IF NOT EXISTS public.promotion_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES public.sales(id),
    customer_id UUID REFERENCES public.customers(id),
    discount_amount NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Functions to Implement:**

1. **get_active_promotions** - List active promotions for date/customer
2. **calculate_promotion_discount** - Calculate discount for cart
3. **get_applicable_promotions** - Get promotions applicable to sale
4. **create_promotion** - Create new promotion with validation
5. **update_promotion** - Update promotion details
6. **deactivate_promotion** - Deactivate promotion
7. **get_promotion_performance** - Analytics on promotion usage/revenue
8. **apply_promotion_to_sale** - Apply and record promotion usage

**Implementation Steps:** Same 5-step pattern as above

---

## Task 4: Table Management Module (Restaurant)

**Priority:** P1 - Restaurant specific
**Estimated Functions:** 7
**Dependencies:** Sales table (exists)

**Database Schema Required:**

```sql
-- Create tables table (restaurant tables)
CREATE TABLE IF NOT EXISTS public.tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    table_number TEXT NOT NULL,
    table_name TEXT,
    capacity INTEGER NOT NULL DEFAULT 4,
    section TEXT, -- Indoor, Outdoor, VIP, etc
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING')),
    current_sale_id UUID REFERENCES public.sales(id),
    qr_code TEXT, -- For QR ordering
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, table_number)
);

-- Create table_reservations table
CREATE TABLE IF NOT EXISTS public.table_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    table_id UUID NOT NULL REFERENCES public.tables(id),
    customer_id UUID REFERENCES public.customers(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    reservation_date DATE NOT NULL,
    reservation_time TIME NOT NULL,
    party_size INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Functions:** 7 table management functions

---

## Task 5: Kitchen Display System Module

**Priority:** P1 - Restaurant specific
**Estimated Functions:** 6
**Dependencies:** Sales, Items tables (exist)

**Database Schema Required:**

```sql
-- Create kitchen_orders table
CREATE TABLE IF NOT EXISTS public.kitchen_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    sale_id UUID NOT NULL REFERENCES public.sales(id),
    sale_item_id UUID NOT NULL REFERENCES public.sale_items(id),
    table_number TEXT,
    item_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    modifiers JSONB,
    special_instructions TEXT,
    priority TEXT DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'SERVED')),
    station TEXT, -- GRILL, FRYER, SALAD, etc
    order_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    start_time TIMESTAMPTZ,
    ready_time TIMESTAMPTZ,
    served_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Functions:** 6 KDS functions

---

## Verification Checklist

After completing all tasks:

**Module Count:**
- ✅ 8 modules completed (current)
- ✅ 6 new modules (planned)
- **Total: 14 core modules**

**Function Count:**
- ✅ 66 functions (current)
- ✅ ~35 new functions (estimated)
- **Total: ~100 backend functions**

**Database Coverage:**
- ✅ All P0 (Critical) features from PRD
- ✅ P1 (Restaurant) features
- ✅ Multi-tenant support via business_id
- ✅ RLS policies for security
- ✅ Performance indexes

**Documentation:**
- ✅ Module docs for all 14 modules
- ✅ TypeScript types for all functions
- ✅ Service layer patterns
- ✅ React Query hooks

---

## Execution Strategy

**Recommended Approach: Batch Implementation**

1. **Phase 1 (P0 - Critical):**
   - Purchase Orders (8 functions)
   - Suppliers (6 functions)
   - Discounts/Promotions (8 functions)
   - **Total: 22 functions → 88 total**

2. **Phase 2 (P1 - Restaurant):**
   - Table Management (7 functions)
   - Kitchen Display (6 functions)
   - **Total: 13 functions → 101 total**

3. **Phase 3 (P1 - Scalability):**
   - Multi-Store Management (if needed)
   - Additional analytics functions

**Time Estimate:**
- Each module: 30-45 minutes
- Phase 1: 2-3 hours
- Phase 2: 1-2 hours
- **Total: 3-5 hours for complete backend**

---

## Success Criteria

**Module is complete when:**
1. ✅ Migration file created with all tables, functions, indexes
2. ✅ Migration applied successfully to database
3. ✅ TypeScript types generated and include new functions
4. ✅ Documentation created with examples
5. ✅ All functions tested via migration application
6. ✅ No errors in Supabase logs

**Project is complete when:**
1. ✅ All 14 core modules implemented
2. ✅ ~100 backend functions operational
3. ✅ Complete TypeScript type coverage
4. ✅ Full documentation set
5. ✅ Ready for frontend integration

---

## Notes for Implementation

**Consistency Standards:**
- Follow exact pattern from existing 8 modules
- Use SECURITY INVOKER for all functions
- Set search_path = '' for security
- Use STABLE for read-only queries
- Return JSONB for complex responses
- Include validation in all mutating functions
- Create indexes for performance
- Grant permissions to authenticated role

**Testing Strategy:**
- Apply migration and check for errors
- Use Supabase SQL editor to test functions
- Verify TypeScript types are correct
- Check function permissions
- Review indexes are created
- Validate RLS policies (if added)

**Common Pitfalls to Avoid:**
- Missing business_id in WHERE clauses
- Not checking row existence before update/delete
- Forgetting to update timestamps
- Not handling NULL values properly
- Missing GRANT EXECUTE statements
- Incorrect parameter types
