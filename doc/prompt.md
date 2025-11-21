# Building Custom POS System with Next.js + Supabase using Claude Code

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Initial Setup with Supabase](#initial-setup-with-supabase)
3. [Complete Claude Code Prompts](#complete-claude-code-prompts)
4. [Module-by-Module Development](#module-by-module-development)
5. [Database Setup](#database-setup)
6. [API Integration](#api-integration)
7. [Deployment](#deployment)

---

## 1. Prerequisites

### What You Have
✅ Fresh Next.js installation
✅ Claude Code installed

### What You Need
- Supabase account (free tier available)
- Node.js 18+ installed
- Basic understanding of React/Next.js

---

## 2. Initial Setup with Supabase

### Step 1: Create Supabase Project

Go to https://supabase.com and:
1. Create new account (if needed)
2. Create new project
3. Note down:
   - Project URL
   - Project API Key (anon/public)
   - Service Role Key (for admin operations)

### Step 2: Open Claude Code

```bash
cd /path/to/your/nextjs-project
claude-code
```

---

## 3. Complete Claude Code Prompts

### 🚀 MASTER PROMPT - Start Here

Copy and paste this into Claude Code:

```
I have a fresh Next.js installation and want to build a comprehensive 
Point of Sale (POS) system using Supabase as the backend.

PROJECT DETAILS:
- Business Type: [Retail/Restaurant/Grocery Store/etc.]
- Tech Stack:
  * Frontend: Next.js 14 (App Router)
  * Backend: Supabase (PostgreSQL + Auth + Storage + Realtime)
  * Styling: Tailwind CSS + shadcn/ui
  * State: Zustand
  * Forms: React Hook Form + Zod

CORE FEATURES NEEDED:
1. Authentication (Staff login with roles)
2. Inventory Management (Items, Categories, Stock tracking)
3. Sales & Billing (Quick checkout, cart, payments)
4. Customer Management (Database, loyalty points)
5. Staff Management (Roles & permissions)
6. Reports & Analytics (Sales, inventory, P&L)
7. Receipt Generation (Print & PDF)
8. Barcode Scanning
9. Offline Support (PWA)

SUPABASE SETUP:
- Project URL: [Your Supabase URL]
- Anon Key: [Your anon key]
- I want Row Level Security (RLS) enabled
- Real-time subscriptions for live updates

Let's build this step by step. First:
1. Install all necessary dependencies
2. Set up Supabase client configuration
3. Create the project folder structure
4. Set up environment variables

Start with step 1.
```

---

### 📦 PROMPT 1: Install Dependencies

```
Install all dependencies needed for Next.js + Supabase POS:

Run these commands:

1. Install Supabase client:
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

2. Install UI and form libraries:
npm install zustand react-hook-form @hookform/resolvers zod
npm install date-fns recharts react-hot-toast lucide-react
npm install jspdf jspdf-autotable xlsx html5-qrcode
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu 
  @radix-ui/react-select @radix-ui/react-tabs

3. Install dev dependencies:
npm install -D @types/node

4. Initialize shadcn/ui:
npx shadcn-ui@latest init
# Select: TypeScript, Tailwind CSS, App Router, @/ import alias

5. Add shadcn components:
npx shadcn-ui@latest add button input label card table dialog select 
  badge dropdown-menu sheet tabs separator scroll-area toast alert
  form textarea checkbox radio-group switch calendar

After installation, show me the updated package.json and confirm all packages 
are installed correctly.
```

---

### 📁 PROMPT 2: Project Structure

```
Create the complete Next.js project structure optimized for Supabase:

my-pos/
├── .env.local
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard home
│   │   ├── sales/
│   │   │   ├── page.tsx                # Sales counter
│   │   │   ├── new/page.tsx
│   │   │   └── history/page.tsx
│   │   ├── inventory/
│   │   │   ├── page.tsx                # Items list
│   │   │   ├── add/page.tsx
│   │   │   ├── [id]/page.tsx           # Item details
│   │   │   ├── categories/page.tsx
│   │   │   └── stock/page.tsx          # Stock movements
│   │   ├── customers/
│   │   │   ├── page.tsx
│   │   │   ├── add/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── staff/
│   │   │   ├── page.tsx
│   │   │   └── add/page.tsx
│   │   ├── reports/
│   │   │   ├── page.tsx
│   │   │   ├── sales/page.tsx
│   │   │   ├── inventory/page.tsx
│   │   │   └── profit-loss/page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   └── webhook/
│   │       └── route.ts                # For Supabase webhooks
│   ├── layout.tsx
│   ├── globals.css
│   └── error.tsx
├── components/
│   ├── ui/                             # shadcn components
│   ├── auth/
│   │   ├── login-form.tsx
│   │   └── auth-provider.tsx
│   ├── sales/
│   │   ├── pos-counter.tsx
│   │   ├── cart.tsx
│   │   ├── cart-item.tsx
│   │   ├── item-search.tsx
│   │   ├── payment-modal.tsx
│   │   ├── receipt.tsx
│   │   └── barcode-scanner.tsx
│   ├── inventory/
│   │   ├── item-form.tsx
│   │   ├── item-card.tsx
│   │   ├── stock-adjustment.tsx
│   │   └── category-selector.tsx
│   ├── customers/
│   │   ├── customer-form.tsx
│   │   └── loyalty-points.tsx
│   ├── staff/
│   │   ├── staff-form.tsx
│   │   └── permissions-editor.tsx
│   ├── reports/
│   │   ├── sales-chart.tsx
│   │   ├── revenue-stats.tsx
│   │   └── export-buttons.tsx
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── mobile-nav.tsx
│   │   └── user-menu.tsx
│   └── shared/
│       ├── data-table.tsx
│       ├── loading-spinner.tsx
│       ├── empty-state.tsx
│       └── search-input.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # Browser client
│   │   ├── server.ts                   # Server client
│   │   ├── middleware.ts               # Auth middleware
│   │   └── types.ts                    # Generated types
│   ├── utils/
│   │   ├── cn.ts                       # Tailwind merge
│   │   ├── currency.ts                 # Format currency
│   │   ├── date.ts                     # Date formatting
│   │   └── pdf.ts                      # PDF generation
│   └── validations/
│       ├── item.ts
│       ├── sale.ts
│       ├── customer.ts
│       └── staff.ts
├── hooks/
│   ├── use-supabase-query.ts          # React Query wrapper
│   ├── use-realtime.ts                 # Realtime subscriptions
│   ├── use-cart.ts
│   ├── use-items.ts
│   └── use-auth.ts
├── store/
│   ├── cart-store.ts                   # Zustand cart state
│   ├── user-store.ts
│   └── settings-store.ts
├── types/
│   ├── database.types.ts               # Supabase generated
│   └── index.ts
└── supabase/
    ├── migrations/                     # SQL migrations
    └── seed.sql                        # Seed data

Create all these folders and files with proper structure.
Add "use client" directives for client components.
Create placeholder content for each file with proper TypeScript types.
```

---

### 🔐 PROMPT 3: Environment & Supabase Setup

```
Set up environment variables and Supabase configuration:

1. Create .env.local file:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000

2. Create lib/supabase/client.ts:
- Browser Supabase client
- Use createBrowserClient from @supabase/ssr
- Export singleton instance

3. Create lib/supabase/server.ts:
- Server Supabase client
- Use createServerClient with cookies
- For use in Server Components and API routes

4. Create lib/supabase/middleware.ts:
- Auth middleware for Next.js
- Handle session refresh
- Protect routes

5. Create middleware.ts in root:
- Use Supabase middleware
- Define protected routes
- Redirect logic

6. Update next.config.js:
- Add Supabase domain to images config
- Configure for PWA if needed

Provide complete code for all files with proper TypeScript types and error handling.
```

---

### 🗄️ PROMPT 4: Database Schema (Supabase SQL)

```
Create complete SQL schema for POS system to run in Supabase SQL Editor:

Generate a comprehensive SQL migration file that includes:

1. TABLES (with all constraints and indexes):

   - businesses
     * id (uuid, primary key, default gen_random_uuid())
     * name, address, phone, email
     * tax_rate (decimal), currency
     * settings (jsonb)
     * created_at, updated_at (timestamptz)

   - profiles (extends auth.users)
     * id (uuid, references auth.users)
     * business_id (uuid, references businesses)
     * full_name, phone
     * role (enum: OWNER, MANAGER, STAFF, HELPER)
     * permissions (jsonb)
     * is_active (boolean)
     * created_at, updated_at

   - categories
     * id (uuid), business_id (uuid)
     * name, description
     * parent_id (uuid, self-reference)
     * sort_order (integer)
     * created_at, updated_at

   - items
     * id (uuid), business_id, category_id
     * name, description
     * price (decimal), cost (decimal)
     * stock (integer), min_stock, max_stock
     * unit, barcode, sku
     * image_url (text)
     * is_active (boolean)
     * created_at, updated_at

   - customers
     * id (uuid), business_id
     * name, phone, email, address
     * loyalty_points (integer)
     * credit_limit (decimal), credit_balance (decimal)
     * total_purchases (decimal)
     * last_visit (timestamptz)
     * created_at, updated_at

   - sales
     * id (uuid), business_id
     * sale_number (text, unique)
     * customer_id (uuid)
     * user_id (uuid, references profiles)
     * subtotal, discount, tax, total (decimal)
     * status (enum: COMPLETED, PARKED, CANCELLED)
     * notes (text)
     * created_at, updated_at

   - sale_items
     * id (uuid), sale_id
     * item_id (uuid), name
     * quantity (decimal)
     * price, discount, tax, total (decimal)

   - payments
     * id (uuid), sale_id
     * method (enum: CASH, CARD, UPI, WALLET)
     * amount (decimal)
     * reference (text)
     * created_at

   - stock_movements
     * id (uuid), item_id, business_id
     * quantity (integer)
     * type (enum: IN, OUT, ADJUSTMENT)
     * reason (text)
     * user_id (uuid)
     * reference (text)
     * created_at

   - expenses
     * id (uuid), business_id
     * category (text)
     * amount (decimal)
     * description (text)
     * payment_method (text)
     * user_id (uuid)
     * date (date)
     * created_at

2. INDEXES for performance:
   - items (business_id, barcode, sku, is_active)
   - sales (business_id, customer_id, status, created_at)
   - sale_items (sale_id, item_id)
   - customers (business_id, phone)
   - stock_movements (item_id, created_at)

3. ROW LEVEL SECURITY (RLS) policies:
   Enable RLS on all tables
   
   For each table, create policies:
   - SELECT: Users can only see their business data
   - INSERT: Users can insert for their business
   - UPDATE: Users can update their business data
   - DELETE: Only OWNER/MANAGER can delete

   Example policy pattern:
   ```sql
   CREATE POLICY "Users can view their business items"
   ON items FOR SELECT
   USING (
     business_id IN (
       SELECT business_id FROM profiles 
       WHERE id = auth.uid()
     )
   );
   ```

4. FUNCTIONS:
   - generate_sale_number(): Auto-generate sale numbers
   - update_item_stock(): Trigger to update stock on sale
   - calculate_loyalty_points(): Calculate points on purchase
   - get_sales_report(start_date, end_date): Report function

5. TRIGGERS:
   - Before insert on sales: generate sale_number
   - After insert on sale_items: update item stock
   - After insert on sales: update customer loyalty points
   - Updated_at triggers for all tables

6. STORAGE BUCKETS:
   - item-images (public)
   - receipts (private)
   - reports (private)

Provide the complete SQL file ready to paste into Supabase SQL Editor.
Include comments explaining each section.
```

---

### 📝 PROMPT 5: Generate TypeScript Types from Supabase

```
Set up Supabase TypeScript types generation:

1. Install Supabase CLI:
npm install supabase --save-dev

2. Login to Supabase:
npx supabase login

3. Link to your project:
npx supabase link --project-ref your-project-ref

4. Generate types:
npx supabase gen types typescript --linked > types/database.types.ts

5. Create types/index.ts that exports:
   - Database types
   - Table row types
   - Insert types
   - Update types
   - Helper types for items, sales, customers, etc.

Example type helpers:
```typescript
export type Item = Database['public']['Tables']['items']['Row']
export type ItemInsert = Database['public']['Tables']['items']['Insert']
export type ItemUpdate = Database['public']['Tables']['items']['Update']
```

6. Add script to package.json:
```json
"scripts": {
  "types": "npx supabase gen types typescript --linked > types/database.types.ts"
}
```

Provide complete type definitions and helper types.
```

---

### 🔑 PROMPT 6: Authentication Setup

```
Build complete authentication system with Supabase Auth:

1. Create components/auth/login-form.tsx:
   - Email and password inputs
   - Login button
   - Error handling
   - Use Supabase signInWithPassword
   - Redirect to dashboard on success

2. Create app/(auth)/login/page.tsx:
   - Use LoginForm component
   - Add "Don't have account" link
   - Styled with shadcn components

3. Create app/(auth)/signup/page.tsx:
   - Registration form (email, password, full_name, business_name)
   - Create user in auth.users
   - Create business record
   - Create profile record
   - Handle errors

4. Create hooks/use-auth.ts:
   - useAuth hook with:
     * user data
     * session
     * loading state
     * signIn function
     * signOut function
     * signUp function
   - Use Supabase auth helpers

5. Create app/(dashboard)/layout.tsx:
   - Check authentication
   - Fetch user profile and business
   - Show sidebar and header
   - Protect all dashboard routes

6. Update middleware.ts:
   - Redirect unauthenticated users to /login
   - Redirect authenticated users from /login to /dashboard
   - Refresh session automatically

7. Create components/layout/user-menu.tsx:
   - Show user name and role
   - Business selector (if multiple)
   - Settings link
   - Sign out button

Provide complete code with proper error handling, loading states, 
and TypeScript types.
```

---

### 📦 PROMPT 7: Inventory Management Module (Complete)

```
Build the COMPLETE Inventory Management module with Supabase:

=== BACKEND (Supabase Queries) ===

1. Create lib/supabase/queries/items.ts:

```typescript
// Export these functions:

- getItems(businessId, filters?: {search, category, inStock})
  * Use Supabase select with filters
  * Join with categories
  * Order by name
  * Paginate results

- getItemById(id)
  * Single item with category details

- createItem(data: ItemInsert)
  * Insert new item
  * Handle image upload to storage
  * Return created item

- updateItem(id, data: ItemUpdate)
  * Update item
  * Handle image changes
  * Log stock movement if stock changed

- deleteItem(id)
  * Soft delete (set is_active = false)
  * Or hard delete based on business rules

- adjustStock(itemId, quantity, type, reason)
  * Update item stock
  * Create stock_movement record
  * Return updated item

- getLowStockItems(businessId)
  * Get items where stock <= min_stock
  * For alerts

- searchItemByBarcode(barcode)
  * Quick barcode lookup
  * For sales counter
```

2. Create lib/supabase/queries/categories.ts:
   - getCategories(businessId)
   - createCategory(data)
   - updateCategory(id, data)
   - deleteCategory(id)

=== FRONTEND ===

3. Create app/(dashboard)/inventory/page.tsx:
```typescript
"use client"

Features:
- Data table with items
- Search input (by name, barcode, SKU)
- Category filter select
- Stock status badges (colors: green=in stock, yellow=low, red=out)
- Add Item button (navigate to /inventory/add)
- Actions column: Edit, Delete buttons
- Pagination
- Real-time updates (Supabase realtime subscription)
- Loading skeleton
- Empty state

Use React hooks to fetch items
Use Zustand for filter state
Use shadcn Table component
```

4. Create app/(dashboard)/inventory/add/page.tsx:
```typescript
"use client"

Form with React Hook Form + Zod:
- Item name* (required)
- Description (textarea)
- Category* (select from categories)
- Price* (number, currency format)
- Cost (number, for profit calculation)
- Stock quantity*
- Min stock level (for alerts)
- Max stock level
- Unit (pieces, kg, liters, etc.)
- Barcode (with scan button)
- SKU (auto-generate option)
- Image upload (to Supabase Storage)

Buttons:
- Save (create item and redirect)
- Save & Add Another
- Cancel

Include validation, loading states, error handling
```

5. Create app/(dashboard)/inventory/[id]/page.tsx:
   - View item details
   - Edit button
   - Stock adjustment section
   - Stock movement history
   - Delete option

6. Create components/inventory/item-form.tsx:
   - Reusable form component
   - Used for both add and edit
   - Include image upload with preview

7. Create components/inventory/stock-adjustment.tsx:
   - Modal dialog
   - Input for quantity (+ or -)
   - Reason dropdown (Sale, Purchase, Damage, Adjustment)
   - Notes textarea
   - Submit button

8. Create components/inventory/barcode-scanner.tsx:
   - Use html5-qrcode library
   - Camera scanner UI
   - Return barcode value
   - Works on mobile

9. Create hooks/use-items.ts:
   - useItems() - fetch all items
   - useItem(id) - fetch single item
   - useCreateItem() - mutation
   - useUpdateItem() - mutation
   - useDeleteItem() - mutation
   - useStockAdjustment() - mutation
   - Include loading, error states
   - Optimistic updates

10. Create real-time subscription:
    - Listen to items table changes
    - Update UI automatically when items change
    - Show toast notification on changes

Provide COMPLETE code for all files with:
- TypeScript types
- Error handling
- Loading states
- Form validation
- Responsive design
- Comments explaining key parts
```

---

### 🛒 PROMPT 8: Sales & Billing Module (Complete)

```
Build the COMPLETE Sales/POS Counter module:

=== BACKEND (Supabase Queries) ===

1. Create lib/supabase/queries/sales.ts:

```typescript
- createSale(saleData, saleItems, payments)
  * Begin transaction (use Supabase RPC if needed)
  * Insert sale record
  * Insert sale_items
  * Insert payments
  * Update item stock
  * Update customer loyalty points
  * Return complete sale with items

- getSales(businessId, filters: {status, dateRange, customerId})
  * List sales with pagination
  * Join with customers, profiles
  * Calculate totals

- getSaleById(id)
  * Complete sale details
  * Include items, payments, customer

- updateSale(id, data)
  * Update sale (for parked orders)

- deleteSale(id)
  * Cancel sale
  * Reverse stock changes
  * Update status to CANCELLED

- parkSale(saleData)
  * Save incomplete sale
  * Status = PARKED

- resumeParkedSale(id)
  * Get parked sale
  * Return to active cart

- getSalesReport(businessId, startDate, endDate)
  * Aggregate sales data
  * Group by date, payment method
  * Calculate totals
```

2. Create lib/store/cart-store.ts (Zustand):
```typescript
interface CartStore {
  items: CartItem[]
  customer: Customer | null
  discount: number
  discountType: 'percentage' | 'fixed'
  
  // Actions
  addItem: (item: Item) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  setCustomer: (customer: Customer) => void
  applyDiscount: (amount: number, type: string) => void
  clearCart: () => void
  
  // Computed
  subtotal: () => number
  discountAmount: () => number
  taxAmount: () => number
  total: () => number
}
```

=== FRONTEND ===

3. Create app/(dashboard)/sales/page.tsx:
```typescript
"use client"

Main POS Counter Layout:

<div className="grid grid-cols-12 gap-4 h-screen">
  {/* Left Side - Item Search & Grid */}
  <div className="col-span-7">
    - Search bar with autocomplete
    - Barcode scan button
    - Category filter tabs
    - Items grid (cards with image, name, price)
    - Click item to add to cart
    - Keyboard shortcuts (F1-F12 for quick add)
  </div>
  
  {/* Right Side - Cart & Checkout */}
  <div className="col-span-5 flex flex-col">
    {/* Customer Section */}
    - Customer selector
    - Add new customer quick button
    
    {/* Cart Items */}
    - Scrollable cart items list
    - Each item: name, quantity (+/-), price, total
    - Remove item button
    
    {/* Totals Panel */}
    - Subtotal
    - Discount (with edit button)
    - Tax
    - Total (large, highlighted)
    
    {/* Action Buttons */}
    - Park Order (save for later)
    - Clear Cart
    - Checkout (primary button)
  </div>
</div>

Features:
- Fast keyboard navigation
- Barcode scanner integration
- Real-time search
- Responsive on tablets
```

4. Create components/sales/item-search.tsx:
   - Autocomplete search
   - Search by name, barcode, SKU
   - Debounced search (300ms)
   - Show results dropdown
   - Select item to add to cart

5. Create components/sales/cart.tsx:
   - List of cart items
   - Quantity adjustment
   - Remove item
   - Display totals
   - Use Zustand cart store

6. Create components/sales/payment-modal.tsx:
```typescript
- Dialog with payment form
- Multiple payment methods:
  * Cash (with change calculation)
  * Card
  * UPI
  * Wallet
- Split payment option
- Add multiple payments
- Total paid vs total due
- Complete sale button
- Print receipt checkbox
- Send SMS/Email checkbox
```

7. Create components/sales/receipt.tsx:
   - Receipt preview component
   - Business header
   - Sale details
   - Items table
   - Totals
   - Payment info
   - Footer message
   - Print button
   - Download PDF button
   - Share options

8. Create app/(dashboard)/sales/history/page.tsx:
   - Sales history table
   - Date range filter
   - Status filter
   - Customer filter
   - Search by sale number
   - View receipt action
   - Pagination

9. Create lib/utils/pdf.ts:
   - generateReceiptPDF(sale)
   - Use jsPDF
   - Format receipt nicely
   - Return blob for download

10. Implement keyboard shortcuts:
    - F2: Focus search
    - F3: Scan barcode
    - F4: Add customer
    - F9: Park order
    - F12: Checkout
    - ESC: Clear/Cancel

Provide COMPLETE working code for the entire sales module.
```

---

### 👥 PROMPT 9: Customer Management Module

```
Build the complete Customer Management module:

=== BACKEND ===

1. Create lib/supabase/queries/customers.ts:
```typescript
- getCustomers(businessId, search?)
- getCustomerById(id)
- createCustomer(data)
- updateCustomer(id, data)
- deleteCustomer(id)
- addLoyaltyPoints(customerId, points)
- redeemLoyaltyPoints(customerId, points)
- getCustomerPurchaseHistory(customerId)
- getTopCustomers(businessId, limit)
```

=== FRONTEND ===

2. Create app/(dashboard)/customers/page.tsx:
   - Customers table (name, phone, loyalty points, total purchases)
   - Search by name/phone
   - Add customer button
   - View details action
   - Edit/Delete actions
   - Export to Excel button

3. Create app/(dashboard)/customers/add/page.tsx:
   - Form: name*, phone*, email, address
   - Credit limit
   - Notes
   - Save button

4. Create app/(dashboard)/customers/[id]/page.tsx:
   - Customer details card
   - Loyalty points display
   - Purchase history table
   - Total spent stat
   - Last visit date
   - Edit button

5. Create components/customers/loyalty-card.tsx:
   - Visual loyalty points display
   - Add points button (for manual adjustment)
   - Redeem points button
   - Points history

6. Create components/customers/quick-add-customer.tsx:
   - Dialog with minimal form (name, phone only)
   - For quick add during checkout
   - Returns customer object

Provide complete code with validation and error handling.
```

---

### 👨‍💼 PROMPT 10: Staff Management & Permissions

```
Build Staff Management with role-based access control:

=== BACKEND ===

1. Create lib/supabase/queries/staff.ts:
   - getStaffMembers(businessId)
   - getStaffById(id)
   - createStaff(data) - also creates auth user
   - updateStaff(id, data)
   - updatePermissions(staffId, permissions)
   - deactivateStaff(id)

2. Create lib/permissions.ts:
```typescript
const PERMISSIONS = {
  OWNER: {
    viewReports: true,
    manageInventory: true,
    manageStaff: true,
    giveDiscount: true,
    maxDiscount: 100,
    deleteSales: true,
    accessExpenses: true,
  },
  MANAGER: {
    viewReports: true,
    manageInventory: true,
    manageStaff: false,
    giveDiscount: true,
    maxDiscount: 20,
    deleteSales: false,
    accessExpenses: true,
  },
  STAFF: {
    viewReports: false,
    manageInventory: true,
    manageStaff: false,
    giveDiscount: true,
    maxDiscount: 10,
    deleteSales: false,
    accessExpenses: false,
  },
  HELPER: {
    viewReports: false,
    manageInventory: false,
    manageStaff: false,
    giveDiscount: false,
    maxDiscount: 0,
    deleteSales: false,
    accessExpenses: false,
  },
}

export function checkPermission(userRole, permission) {
  return PERMISSIONS[userRole]?.[permission] || false
}
```

=== FRONTEND ===

3. Create app/(dashboard)/staff/page.tsx:
   - Staff members table
   - Show role, status
   - Add staff button
   - Edit permissions button
   - Deactivate/Activate toggle

4. Create app/(dashboard)/staff/add/page.tsx:
   - Form: name*, email*, phone, role*
   - Password generation
   - Custom permissions toggle
   - Send invite email option

5. Create components/staff/permissions-editor.tsx:
   - Checkboxes for each permission
   - Conditional fields (max discount)
   - Save permissions button

6. Implement permission checks:
   - Wrap UI elements with permission checks
   - Hide/disable features based on role
   - Show permission denied messages

Example:
```typescript
{checkPermission(user.role, 'deleteSales') && (
  <Button onClick={deleteSale}>Delete</Button>
)}
```

Provide complete implementation.
```

---

### 📊 PROMPT 11: Reports & Analytics Module

```
Build comprehensive Reports & Analytics:

=== BACKEND ===

1. Create lib/supabase/queries/reports.ts:
```typescript
- getSalesReport(businessId, startDate, endDate)
  * Total sales, count, average
  * Sales by payment method
  * Sales by day/week/month
  * Top selling items
  * Sales by category

- getInventoryReport(businessId)
  * Current stock levels
  * Low stock items
  * Stock value
  * Stock movements summary

- getProfitLossReport(businessId, startDate, endDate)
  * Revenue (sales total)
  * Cost of goods sold
  * Gross profit
  * Expenses
  * Net profit

- getCustomerReport(businessId)
  * Total customers
  * New customers (period)
  * Top customers by purchases
  * Customer retention metrics

- getStaffPerformanceReport(businessId, startDate, endDate)
  * Sales by staff member
  * Average sale value
  * Number of transactions
```

=== FRONTEND ===

2. Create app/(dashboard)/reports/page.tsx:
   - Dashboard with key metrics cards:
     * Today's sales
     * This week's sales
     * This month's sales
     * Total customers
   - Quick date range selector
   - Links to detailed reports

3. Create app/(dashboard)/reports/sales/page.tsx:
   - Date range picker
   - Sales chart (line chart by date)
   - Payment methods pie chart
   - Category breakdown bar chart
   - Top items table
   - Export buttons (PDF, Excel)

4. Create app/(dashboard)/reports/inventory/page.tsx:
   - Current stock value
   - Low stock alerts table
   - Stock movements table
   - Category-wise stock chart

5. Create app/(dashboard)/reports/profit-loss/page.tsx:
   - P&L statement layout
   - Revenue section
   - Expenses section
   - Profit calculation
   - Month-over-month comparison

6. Create components/reports/sales-chart.tsx:
   - Use recharts library
   - Line chart for sales over time
   - Responsive
   - Interactive tooltips

7. Create components/reports/export-buttons.tsx:
   - Export to PDF button
   - Export to Excel button
   - Use jsPDF and xlsx libraries

8. Create lib/utils/excel.ts:
   - Function to export data to Excel
   - Format columns properly
   - Add totals row

Provide complete code with proper data visualization.
```

---

### 🖨️ PROMPT 12: Receipt Generation & Printing

```
Implement receipt generation and printing:

1. Create lib/utils/receipt-generator.ts:
```typescript
interface ReceiptData {
  business: Business
  sale: Sale
  items: SaleItem[]
  payments: Payment[]
  customer?: Customer
}

function generateReceiptHTML(data: ReceiptData): string {
  // Generate HTML receipt
  // Include: business info, sale details, items, totals, payments
}

function generateReceiptPDF(data: ReceiptData): Blob {
  // Use jsPDF
  // Create formatted PDF receipt
}

function printReceipt(html: string): void {
  // Open print dialog with receipt
}
```

2. Create components/sales/receipt-preview.tsx:
   - Modal with receipt preview
   - Print button (opens print dialog)
   - Download PDF button
   - Send via SMS button
   - Send via Email button
   - Send via WhatsApp button (if applicable)

3. Add print CSS:
   - Create print.css
   - Format receipt for thermal printers (80mm width)
   - Hide unnecessary elements when printing

4. Create receipt template:
```
================================
      [BUSINESS NAME]
    [Address Line 1]
    [Phone Number]
================================
Invoice: #12345
Date: DD/MM/YYYY HH:MM
Cashier: John Doe
Customer: Jane Smith
================================
ITEM          QTY   PRICE  TOTAL
--------------------------------
Product Name   2    $10.00 $20.00
Product Two    1    $15.00 $15.00
--------------------------------
                Subtotal: $35.00
                Discount: -$5.00
                     Tax: $3.00
================================
                   TOTAL: $33.00
================================
Payment: Cash
Paid: $35.00
Change: $2.00
================================
   Loyalty Points Earned: 33
   Total Points: 165
================================
  Thank you for your business!
       Visit us again!
================================
```

Provide complete implementation with multiple receipt formats.
```

---

### 📱 PROMPT 13: Make it a PWA (Progressive Web App)

```
Convert the Next.js app to PWA for offline support:

1. Install next-pwa:
npm install next-pwa

2. Create next.config.js configuration:
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA({
  // existing config
})
```

3. Create public/manifest.json:
   - App name, description
   - Icons (192x192, 512x512)
   - Theme color
   - Display: standalone
   - Start URL

4. Add to app/layout.tsx head:
```tsx
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#000000" />
<link rel="apple-touch-icon" href="/icon-192x192.png" />
```

5. Implement offline functionality:
   - Cache static assets
   - Cache API responses
   - Use IndexedDB for offline cart storage
   - Sync when back online

6. Create hooks/use-online-status.ts:
   - Detect online/offline status
   - Show notification when offline
   - Sync data when back online

7. Add offline indicator:
   - Banner showing "Offline Mode"
   - Sync status indicator
   - Pending syncs counter

Provide complete PWA implementation.
```

---

### 🎨 PROMPT 14: Final UI Polish & Responsive Design

```
Polish the UI and ensure it's fully responsive:

1. Update app/globals.css:
   - Custom CSS variables for theme
   - Dark mode support
   - Print styles
   - Mobile-specific styles

2. Make all pages responsive:
   - Mobile: Single column layouts
   - Tablet: Optimized POS counter
   - Desktop: Full featured

3. Add loading states everywhere:
   - Skeleton loaders for tables
   - Spinner for buttons
   - Loading overlays for forms

4. Add empty states:
   - No items in inventory
   - No customers
   - No sales history
   - Empty cart

5. Add error boundaries:
   - Catch errors gracefully
   - Show user-friendly messages
   - Provide retry options

6. Add toast notifications:
   - Success messages
   - Error messages
   - Info messages
   - Use react-hot-toast

7. Keyboard shortcuts:
   - Document all shortcuts
   - Add keyboard shortcut help modal
   - Implement shortcuts across app

8. Add tooltips:
   - Help text for buttons
   - Explain features
   - Use Radix UI Tooltip

9. Optimize performance:
   - Lazy load heavy components
   - Implement virtual scrolling for long lists
   - Optimize images
   - Code splitting

10. Add animations:
    - Subtle transitions
    - Loading animations
    - Success animations
    - Use Framer Motion or CSS animations

Provide updated code with all polish features.
```

---

### 🧪 PROMPT 15: Testing & Error Handling

```
Add comprehensive error handling and prepare for testing:

1. Create lib/error-handler.ts:
```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
  }
}

export function handleSupabaseError(error: any) {
  // Map Supabase errors to user-friendly messages
  // Log errors
  // Return AppError
}

export function handleError(error: any) {
  // Global error handler
  // Show toast notification
  // Log to error tracking service
}
```

2. Add try-catch to all API calls:
   - Wrap Supabase queries
   - Handle network errors
   - Handle validation errors
   - Handle auth errors

3. Add form validation:
   - Use Zod schemas for all forms
   - Show inline error messages
   - Prevent invalid submissions

4. Add data validation:
   - Validate on client and server
   - Sanitize inputs
   - Prevent SQL injection (Supabase handles this)

5. Add error boundaries:
   - Create app/error.tsx
   - Create app/global-error.tsx
   - Catch rendering errors

6. Add loading states:
   - Show loading during data fetching
   - Disable buttons during submission
   - Show progress for uploads

7. Add confirmation dialogs:
   - Confirm before delete
   - Confirm before canceling sale
   - Confirm before navigation with unsaved changes

8. Add success feedback:
   - Toast on successful actions
   - Redirect after creation
   - Update UI optimistically

Provide complete error handling implementation.
```

---

### 🚀 PROMPT 16: Deployment to Vercel

```
Deploy the Next.js POS app to Vercel:

1. Prepare for deployment:
   - Ensure all environment variables are set
   - Test production build locally:
     npm run build
     npm start

2. Push to GitHub:
   git add .
   git commit -m "Initial POS system"
   git push origin main

3. Deploy to Vercel:
   - Go to vercel.com
   - Import GitHub repository
   - Configure project:
     * Framework: Next.js
     * Root Directory: ./
     * Build Command: npm run build
     * Output Directory: .next

4. Add environment variables in Vercel:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - NEXT_PUBLIC_APP_URL (set to Vercel URL)

5. Deploy and test:
   - Visit deployed URL
   - Test all features
   - Check mobile responsiveness

6. Set up custom domain (optional):
   - Add custom domain in Vercel
   - Update DNS settings
   - Update NEXT_PUBLIC_APP_URL

7. Set up monitoring:
   - Enable Vercel Analytics
   - Set up Sentry for error tracking (optional)
   - Monitor performance

8. Create deployment checklist:
   - ✅ All features working
   - ✅ Forms validated
   - ✅ Authentication working
   - ✅ Database connected
   - ✅ PWA manifest included
   - ✅ SEO meta tags added
   - ✅ Error handling implemented
   - ✅ Loading states added
   - ✅ Mobile responsive
   - ✅ Production build tested

Provide deployment guide and checklist.
```

---

## 4. Quick Reference - Common Claude Code Commands

### During Development

```bash
# Ask Claude to create a component
"Create a new component at components/sales/cart-item.tsx that displays 
a single cart item with quantity controls"

# Ask Claude to fix an error
"I'm getting this error: [paste error]. Please fix it."

# Ask Claude to add a feature
"Add a search filter to the customers page that filters by name or phone"

# Ask Claude to refactor code
"Refactor the sales page to use a custom hook for cart management"

# Ask Claude to add styling
"Make the dashboard cards more visually appealing with gradients and shadows"

# Ask Claude to optimize
"Optimize the items query to load faster and add pagination"

# Ask Claude to debug
"The loyalty points aren't updating. Debug the customer update function"
```

---

## 5. Best Practices for Claude Code Usage

### ✅ DO:
1. **Be Specific**: Clearly describe what you want
2. **Provide Context**: Share relevant file paths and code
3. **Break Down Tasks**: Split large features into smaller prompts
4. **Test Incrementally**: Test each feature before moving on
5. **Use Version Control**: Commit frequently
6. **Reference Documentation**: Point to Zobaze docs when needed

### ❌ DON'T:
1. **Don't be vague**: "Make it better" is too broad
2. **Don't skip steps**: Follow the prompts in order
3. **Don't ignore errors**: Fix errors before continuing
4. **Don't deploy untested code**: Always test locally first

---

## 6. Troubleshooting Common Issues

### Issue: Supabase Connection Error
```
"I'm getting a Supabase connection error. Check my environment variables 
in .env.local and verify the Supabase client configuration in 
lib/supabase/client.ts"
```

### Issue: TypeScript Errors
```
"I have TypeScript errors in [file name]. Please fix the type definitions 
and ensure all types are properly imported"
```

### Issue: Authentication Not Working
```
"Users can't log in. Debug the authentication flow in hooks/use-auth.ts 
and check the Supabase Auth configuration"
```

### Issue: Data Not Loading
```
"Items aren't showing up on the inventory page. Debug the getItems query 
in lib/supabase/queries/items.ts and check the component"
```

### Issue: Real-time Updates Not Working
```
"Real-time subscriptions aren't updating the UI. Check the Supabase 
realtime configuration and the useEffect in [component name]"
```

---

## 7. Final Checklist

Before considering the POS system complete:

- [ ] All database tables created in Supabase
- [ ] RLS policies enabled and tested
- [ ] Authentication working (login/logout)
- [ ] Inventory CRUD operations working
- [ ] Sales counter functional
- [ ] Receipt generation working
- [ ] Customer management working
- [ ] Staff management with permissions
- [ ] Reports displaying correct data
- [ ] Responsive on mobile/tablet/desktop
- [ ] PWA manifest configured
- [ ] Offline support implemented
- [ ] Error handling throughout
- [ ] Loading states on all async operations
- [ ] Form validation on all forms
- [ ] TypeScript types for all data
- [ ] Code formatted and clean
- [ ] Deployed to Vercel
- [ ] Environment variables configured
- [ ] Testing completed
- [ ] User documentation created

---

## 8. Next Steps After Completion

```
Once the basic POS is working, ask Claude to add:

1. "Add barcode label printing for items"
2. "Add SMS notifications for low stock"
3. "Add email receipts feature"
4. "Add dashboard analytics with charts"
5. "Add multi-currency support"
6. "Add tax calculation by region"
7. "Add purchase order management"
8. "Add supplier management"
9. "Add advanced reporting with filters"
10. "Add mobile app using React Native"
```

---

## Summary

This guide provides everything you need to build a complete POS system using:
- **Next.js** (frontend)
- **Supabase** (backend, database, auth, storage)
- **Claude Code** (AI development assistant)

Simply follow the prompts in order, paste them into Claude Code, and it will help you build each component step by step!

**Total Development Time Estimate:** 40-60 hours with Claude Code assistance

**Good luck building your POS system! 🚀**