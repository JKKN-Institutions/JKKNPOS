# Multi-Store Management Module - Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** November 2024  
**Priority:** HIGH (Core Feature)  
**Module:** Multi-Store Support

---

## 1. Executive Summary

### Overview
Enable businesses to manage multiple store locations from a single POS system. This module allows a company with multiple branches to operate efficiently with centralized management and store-specific operations.

### Example Use Case
**ABC Retail** operates:
- Main Store (Downtown) - Flagship location
- Branch Store (Mall) - Shopping center kiosk
- Warehouse Store (Industrial Area) - Bulk sales

All three locations need:
- Separate inventory tracking
- Individual sales records
- Dedicated staff
- Combined reporting for management

---

## 2. Core Features

### ✅ What You Can Do

1. **Manage Multiple Stores**
   - Create unlimited stores
   - Each store has unique identity
   - Switch between stores easily
   
2. **Store-Specific Data**
   - Separate inventory per store
   - Individual sales records
   - Store-specific customers
   - Dedicated staff per location

3. **Centralized Control**
   - View all stores from one dashboard
   - Compare performance across stores
   - Consolidated reports
   - Central user management

4. **Role-Based Access**
   - Admin sees all stores
   - Manager sees specific stores
   - Staff works at assigned store

---

## 3. Sample Store Example

### ABC Retail - Main Store

**Store Information:**
```
Store Name: ABC Retail - Main Store
Store Code: MAIN-001
Type: Retail Store
Location: 123 Downtown Street, City
Manager: John Smith
Phone: +1-555-0100
Email: main@abcretail.com
Tax Rate: 8.5%
Operating Hours: 9 AM - 9 PM
```

**Store Stats:**
- Inventory: 5,000 items
- Today's Sales: $12,450
- Active Staff: 8 employees
- Customers: 2,340 registered

---

## 4. CRUD Operations

### CREATE - Add New Store

**Screen: Add Store**
```
┌─────────────────────────────────────┐
│  Add New Store               [Save] │
├─────────────────────────────────────┤
│                                     │
│  Store Name *                       │
│  [ABC Retail - Branch Store......]  │
│                                     │
│  Store Code *                       │
│  [BRANCH-002.....................]   │
│                                     │
│  Store Type                         │
│  [Select: Retail/Warehouse/Kiosk ▼] │
│                                     │
│  Location/Address                   │
│  [456 Mall Road, City............]  │
│                                     │
│  Manager Name                       │
│  [Jane Doe........................]  │
│                                     │
│  Contact                            │
│  Phone: [+1-555-0200..........]     │
│  Email: [branch@abcretail.com..]    │
│                                     │
│  Tax Rate (%)                       │
│  [8.5...........................]    │
│                                     │
│  Operating Hours                    │
│  [10 AM - 8 PM...................]   │
│                                     │
│  [Cancel]              [Save Store] │
└─────────────────────────────────────┘
```

**API Request:**
```http
POST /api/stores

{
  "name": "ABC Retail - Branch Store",
  "code": "BRANCH-002",
  "type": "retail",
  "address": "456 Mall Road, City",
  "manager": "Jane Doe",
  "phone": "+1-555-0200",
  "email": "branch@abcretail.com",
  "tax_rate": 8.5,
  "hours": "10 AM - 8 PM",
  "is_active": true
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "store-uuid-123",
    "name": "ABC Retail - Branch Store",
    "code": "BRANCH-002",
    "created_at": "2024-11-21T10:30:00Z"
  }
}
```

---

### READ - View Stores

#### List All Stores

**Screen: Store List**
```
┌──────────────────────────────────────────────────────────┐
│  Stores                              [+ Add New Store]   │
├──────────────────────────────────────────────────────────┤
│  Search: [...................] [Type ▼] [Status ▼]      │
├──────────────────────────────────────────────────────────┤
│  Store Name           │ Manager    │ Today's Sales │ Actions│
├──────────────────────────────────────────────────────────┤
│  🏪 Main Store        │ John Smith │ $12,450      │ [View]│
│     Downtown          │ ● Active   │ 87 orders    │ [Edit]│
├──────────────────────────────────────────────────────────┤
│  🏬 Branch Store      │ Jane Doe   │ $8,230       │ [View]│
│     Mall Location     │ ● Active   │ 56 orders    │ [Edit]│
├──────────────────────────────────────────────────────────┤
│  📦 Warehouse         │ Bob Wilson │ $25,600      │ [View]│
│     Industrial Area   │ ● Active   │ 12 orders    │ [Edit]│
└──────────────────────────────────────────────────────────┘
```

**API Request:**
```http
GET /api/stores?search=&type=all&status=active
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "store-uuid-001",
      "name": "ABC Retail - Main Store",
      "code": "MAIN-001",
      "type": "retail",
      "manager": "John Smith",
      "status": "active",
      "today_sales": 12450.00,
      "today_orders": 87
    },
    {
      "id": "store-uuid-002",
      "name": "ABC Retail - Branch Store",
      "code": "BRANCH-002",
      "type": "retail",
      "manager": "Jane Doe",
      "status": "active",
      "today_sales": 8230.00,
      "today_orders": 56
    }
  ]
}
```

---

#### View Single Store

**Screen: Store Details**
```
┌──────────────────────────────────────────────────────────┐
│  ← Back          ABC Retail - Main Store    [Edit] [⋮]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📊 Performance Today                                    │
│  ┌────────────┬────────────┬────────────┬────────────┐  │
│  │ Sales      │ Orders     │ Items Sold │ Customers  │  │
│  │ $12,450    │ 87         │ 342        │ 65         │  │
│  │ +15% ↑     │ +8% ↑      │ +12% ↑     │ +5% ↑      │  │
│  └────────────┴────────────┴────────────┴────────────┘  │
│                                                          │
│  📍 Store Information                                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Code:         MAIN-001                             │ │
│  │ Type:         Retail Store                         │ │
│  │ Location:     123 Downtown Street, City            │ │
│  │ Manager:      John Smith                           │ │
│  │ Phone:        +1-555-0100                          │ │
│  │ Email:        main@abcretail.com                   │ │
│  │ Hours:        9 AM - 9 PM                          │ │
│  │ Tax Rate:     8.5%                                 │ │
│  │ Status:       ● Active                             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  👥 Staff (8 members)                   [Manage Staff]  │
│  ┌────────────────────────────────────────────────────┐ │
│  │ John Smith      Manager    ● Online   Now          │ │
│  │ Sarah Johnson   Cashier    ● Online   2 mins ago  │ │
│  │ Mike Davis      Cashier    ○ Offline  2 hours ago │ │
│  │ ... 5 more                                         │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  📦 Inventory Summary                                    │
│  • Total Items: 5,000                                   │
│  • Low Stock: 45 items                                  │
│  • Out of Stock: 8 items                                │
│  • Total Value: $125,000                                │
│                                                          │
│  [View Inventory] [View Sales] [View Reports]           │
└──────────────────────────────────────────────────────────┘
```

**API Request:**
```http
GET /api/stores/store-uuid-001
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "store-uuid-001",
    "name": "ABC Retail - Main Store",
    "code": "MAIN-001",
    "type": "retail",
    "address": "123 Downtown Street, City",
    "manager": "John Smith",
    "phone": "+1-555-0100",
    "email": "main@abcretail.com",
    "tax_rate": 8.5,
    "hours": "9 AM - 9 PM",
    "is_active": true,
    "stats": {
      "today_sales": 12450.00,
      "today_orders": 87,
      "items_sold": 342,
      "customers": 65,
      "staff_count": 8,
      "inventory_items": 5000,
      "low_stock_items": 45,
      "out_of_stock": 8,
      "inventory_value": 125000.00
    },
    "staff": [
      {
        "id": "user-001",
        "name": "John Smith",
        "role": "manager",
        "status": "online"
      }
    ]
  }
}
```

---

### UPDATE - Edit Store

**Screen: Edit Store**
```
┌─────────────────────────────────────┐
│  Edit Store                  [Save] │
├─────────────────────────────────────┤
│                                     │
│  Store Name                         │
│  [ABC Retail - Main Store.......]   │
│                                     │
│  Manager Name                       │
│  [John Smith....................]   │
│                                     │
│  Phone                              │
│  [+1-555-0100...................]   │
│                                     │
│  Email                              │
│  [main@abcretail.com............]   │
│                                     │
│  Operating Hours                    │
│  [9 AM - 9 PM...................]    │
│                                     │
│  Tax Rate (%)                       │
│  [8.5...........................]    │
│                                     │
│  Store Status                       │
│  (•) Active  ( ) Inactive           │
│                                     │
│  [Cancel]              [Save Changes]│
└─────────────────────────────────────┘
```

**API Request:**
```http
PUT /api/stores/store-uuid-001

{
  "phone": "+1-555-0101",
  "hours": "8 AM - 10 PM",
  "tax_rate": 9.0
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Store updated successfully",
  "data": {
    "id": "store-uuid-001",
    "phone": "+1-555-0101",
    "hours": "8 AM - 10 PM",
    "tax_rate": 9.0,
    "updated_at": "2024-11-21T11:00:00Z"
  }
}
```

---

### DELETE - Deactivate Store

**Screen: Delete Confirmation**
```
┌─────────────────────────────────────┐
│  ⚠️  Deactivate Store?              │
├─────────────────────────────────────┤
│                                     │
│  Are you sure you want to           │
│  deactivate this store?             │
│                                     │
│  Store: ABC Retail - Branch Store   │
│                                     │
│  This will:                         │
│  • Hide store from active lists     │
│  • Prevent new sales                │
│  • Preserve historical data         │
│  • Notify assigned staff            │
│                                     │
│  ⚠️ Cannot deactivate if:           │
│  • Active sales in last 30 days     │
│  • Pending orders exist             │
│                                     │
│  [Cancel]            [Yes, Deactivate]│
└─────────────────────────────────────┘
```

**API Request:**
```http
DELETE /api/stores/store-uuid-002
```

**Response:**
```json
{
  "status": "success",
  "message": "Store deactivated successfully"
}
```

**Error Response (if has recent sales):**
```json
{
  "status": "error",
  "message": "Cannot deactivate store with recent activity",
  "details": {
    "recent_sales": 24,
    "last_sale": "2024-11-21T09:30:00Z",
    "pending_orders": 3
  }
}
```

---

## 5. Store Switching Feature

### Store Selector Component

**Location:** Top navigation bar (always visible)

**Desktop View:**
```
┌──────────────────────────────────────────────────────┐
│ 🏪 ABC POS    📍 [Main Store ▼]    👤 John [▼]     │
└──────────────────────────────────────────────────────┘
```

**Dropdown Opened:**
```
┌─────────────────────────────────────┐
│ Current Store                       │
├─────────────────────────────────────┤
│ ✓ 🏪 ABC Retail - Main Store       │
│   Downtown • Manager                │
│   Today: $12,450                    │
├─────────────────────────────────────┤
│   🏬 ABC Retail - Branch Store     │
│   Mall • Manager                    │
│   Today: $8,230                     │
├─────────────────────────────────────┤
│   📦 ABC Retail - Warehouse        │
│   Industrial • Viewer               │
│   Today: $25,600                    │
└─────────────────────────────────────┘
```

**Mobile View:**
```
┌───────────────────┐
│ 📍 Main Store [▼]│
└───────────────────┘
```

---

### Switch Store Workflow

**Step 1: User clicks store selector**
```
Current Store: Main Store
User clicks dropdown
↓
Shows list of accessible stores
```

**Step 2: User selects different store**
```
User clicks "Branch Store"
↓
System checks if cart has items
```

**Step 3: Warning if cart has items**
```
┌─────────────────────────────────────┐
│  ⚠️  Switch Store?                  │
├─────────────────────────────────────┤
│  You have 3 items in your cart.     │
│  Switching stores will clear cart.  │
│                                     │
│  Continue?                          │
│                                     │
│  [Cancel]        [Yes, Switch Store]│
└─────────────────────────────────────┘
```

**Step 4: Switch complete**
```
✓ Cart cleared
✓ Store changed to "Branch Store"
✓ All data now shows Branch Store inventory
✓ All sales will be for Branch Store
✓ Success notification shown
```

**API Request:**
```http
POST /api/user/switch-store

{
  "store_id": "store-uuid-002"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Switched to Branch Store",
  "data": {
    "current_store": {
      "id": "store-uuid-002",
      "name": "ABC Retail - Branch Store"
    }
  }
}
```

---

## 6. User-Store Assignment

### Assign Staff to Store

**Screen: Assign User**
```
┌─────────────────────────────────────┐
│  Assign Staff to Store              │
├─────────────────────────────────────┤
│                                     │
│  Staff Member                       │
│  [Select: Sarah Johnson........▼]   │
│                                     │
│  Store                              │
│  [Select: Main Store...........▼]   │
│                                     │
│  Role at this Store                 │
│  ( ) Manager                        │
│  (•) Cashier                        │
│  ( ) Viewer (Reports only)          │
│                                     │
│  Access Level                       │
│  [✓] Can make sales                 │
│  [✓] Can manage inventory           │
│  [ ] Can view reports               │
│  [ ] Can manage staff               │
│                                     │
│  Set as Primary Store               │
│  [✓] This is their default store    │
│                                     │
│  [Cancel]                  [Assign] │
└─────────────────────────────────────┘
```

**API Request:**
```http
POST /api/user-store-access

{
  "user_id": "user-uuid-sarah",
  "store_id": "store-uuid-001",
  "role": "cashier",
  "is_primary": true,
  "permissions": {
    "can_make_sales": true,
    "can_manage_inventory": true,
    "can_view_reports": false,
    "can_manage_staff": false
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Staff assigned successfully",
  "data": {
    "id": "assignment-uuid-123",
    "user_id": "user-uuid-sarah",
    "store_id": "store-uuid-001",
    "role": "cashier",
    "is_primary": true
  }
}
```

---

### View User's Store Access

**Screen: Staff Store Access**
```
┌──────────────────────────────────────────────────────────┐
│  Sarah Johnson > Store Access        [+ Assign to Store] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Current Assignments (2 stores)                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Store             │ Role    │ Primary │ Actions    │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Main Store        │ Cashier │   ★     │ [Edit][🗑]│ │
│  │ Downtown          │         │         │            │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Branch Store      │ Cashier │   ☆     │ [Edit][🗑]│ │
│  │ Mall              │         │         │            │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ★ = Primary Store (auto-selected on login)             │
└──────────────────────────────────────────────────────────┘
```

**API Request:**
```http
GET /api/users/user-uuid-sarah/stores
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "store_id": "store-uuid-001",
      "store_name": "ABC Retail - Main Store",
      "role": "cashier",
      "is_primary": true
    },
    {
      "store_id": "store-uuid-002",
      "store_name": "ABC Retail - Branch Store",
      "role": "cashier",
      "is_primary": false
    }
  ]
}
```

---

## 7. Multi-Store Reports

### Consolidated Sales Report

**Screen: All Stores Performance**
```
┌──────────────────────────────────────────────────────────┐
│  Reports > All Stores                                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Date Range: [Last 30 Days ▼]  [Apply]                  │
│                                                          │
│  📊 Total Performance (All Stores)                       │
│  ┌────────────┬────────────┬────────────┬────────────┐  │
│  │ Total Sales│ Orders     │ Avg Order  │ Items Sold │  │
│  │ $1,245,000 │ 3,847      │ $324       │ 15,240     │  │
│  │ +12% ↑     │ +8% ↑      │ +3% ↑      │ +15% ↑     │  │
│  └────────────┴────────────┴────────────┴────────────┘  │
│                                                          │
│  📈 Sales by Store (Bar Chart)                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │         ║▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓║ Main Store $485K     │ │
│  │ $485K   ║▓▓▓▓▓▓▓▓▓▓▓▓▓║ Branch Store $315K         │ │
│  │ $315K   ║▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓║ Warehouse $445K  │ │
│  │ $445K                                              │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  📋 Store Breakdown                                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Store        │ Sales    │ Orders │ Avg  │ % Share │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Main Store   │ $485,000 │ 1,587  │ $306 │  39%   │ │
│  │ Warehouse    │ $445,000 │   812  │ $548 │  36%   │ │
│  │ Branch Store │ $315,000 │ 1,448  │ $218 │  25%   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  [Export Excel] [Export PDF] [Print]                    │
└──────────────────────────────────────────────────────────┘
```

**API Request:**
```http
GET /api/reports/consolidated?start_date=2024-10-22&end_date=2024-11-21
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "summary": {
      "total_sales": 1245000.00,
      "total_orders": 3847,
      "avg_order_value": 324.00,
      "items_sold": 15240
    },
    "by_store": [
      {
        "store_id": "store-uuid-001",
        "store_name": "Main Store",
        "sales": 485000.00,
        "orders": 1587,
        "avg_order": 306.00,
        "percentage": 39
      },
      {
        "store_id": "store-uuid-003",
        "store_name": "Warehouse",
        "sales": 445000.00,
        "orders": 812,
        "avg_order": 548.00,
        "percentage": 36
      },
      {
        "store_id": "store-uuid-002",
        "store_name": "Branch Store",
        "sales": 315000.00,
        "orders": 1448,
        "avg_order": 218.00,
        "percentage": 25
      }
    ]
  }
}
```

---

### Store Comparison

**Screen: Compare 2 Stores**
```
┌──────────────────────────────────────────────────────────┐
│  Compare Stores                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Store 1: [Main Store ▼]   vs   Store 2: [Branch ▼]    │
│  Period: [Last 30 Days ▼]                                │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Metric         │ Main Store    │ Branch Store    │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ Sales          │ $485,000      │ $315,000        │   │
│  │                │ +12% ↑        │ +8% ↑           │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ Orders         │ 1,587         │ 1,448           │   │
│  │                │ +15% ↑        │ +10% ↑          │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ Avg Order      │ $306          │ $218            │   │
│  │                │ -2% ↓         │ -1% ↓           │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ Customers      │ 1,245         │ 987             │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ Staff          │ 8             │ 5               │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ Inventory Value│ $125,000      │ $85,000         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  📊 Winner: Main Store (65% better performance)          │
│                                                          │
│  [Export] [Print]                                        │
└──────────────────────────────────────────────────────────┘
```

---

## 8. Database Schema

### stores table
```sql
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(50),
    address TEXT,
    manager VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    tax_rate DECIMAL(5,2) DEFAULT 0,
    hours VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stores_code ON stores(code);
CREATE INDEX idx_stores_active ON stores(is_active);
```

### user_store_access table
```sql
CREATE TABLE user_store_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    store_id UUID NOT NULL REFERENCES stores(id),
    role VARCHAR(50) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, store_id)
);

CREATE INDEX idx_usa_user ON user_store_access(user_id);
CREATE INDEX idx_usa_store ON user_store_access(store_id);
```

### Update existing tables
```sql
-- Add store_id to all business tables
ALTER TABLE items ADD COLUMN store_id UUID NOT NULL REFERENCES stores(id);
ALTER TABLE sales ADD COLUMN store_id UUID NOT NULL REFERENCES stores(id);
ALTER TABLE customers ADD COLUMN store_id UUID NOT NULL REFERENCES stores(id);

CREATE INDEX idx_items_store ON items(store_id);
CREATE INDEX idx_sales_store ON sales(store_id);
CREATE INDEX idx_customers_store ON customers(store_id);
```

---

## 9. Access Control

### Permission Matrix

| Action              | Admin | Manager | Cashier | Viewer |
|---------------------|-------|---------|---------|--------|
| Create store        | ✅    | ❌      | ❌      | ❌     |
| View all stores     | ✅    | ❌      | ❌      | ❌     |
| View assigned store | ✅    | ✅      | ✅      | ✅     |
| Edit any store      | ✅    | ❌      | ❌      | ❌     |
| Edit assigned store | ✅    | ✅      | ❌      | ❌     |
| Deactivate store    | ✅    | ❌      | ❌      | ❌     |
| Assign users        | ✅    | ✅      | ❌      | ❌     |
| Switch stores       | ✅    | ✅      | ✅      | ✅     |
| View all reports    | ✅    | ❌      | ❌      | ❌     |
| View store reports  | ✅    | ✅      | ✅      | ✅     |

---

## 10. Technical Implementation

### Store Context (React)

```typescript
// contexts/store-context.tsx
import { createContext, useContext, useState } from 'react'

interface Store {
  id: string
  name: string
  code: string
}

interface StoreContextType {
  currentStore: Store | null
  stores: Store[]
  switchStore: (storeId: string) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }) {
  const [currentStore, setCurrentStore] = useState<Store | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  
  const switchStore = async (storeId: string) => {
    const store = stores.find(s => s.id === storeId)
    if (store) {
      setCurrentStore(store)
      localStorage.setItem('currentStoreId', storeId)
      window.location.reload() // Refresh to load new store data
    }
  }
  
  return (
    <StoreContext.Provider value={{ currentStore, stores, switchStore }}>
      {children}
    </StoreContext.Provider>
  )
}

export const useStore = () => useContext(StoreContext)
```

### Store Selector Component

```typescript
// components/store-selector.tsx
import { useStore } from '@/contexts/store-context'

export function StoreSelector() {
  const { currentStore, stores, switchStore } = useStore()
  
  return (
    <select 
      value={currentStore?.id} 
      onChange={(e) => switchStore(e.target.value)}
      className="store-selector"
    >
      {stores.map(store => (
        <option key={store.id} value={store.id}>
          {store.name}
        </option>
      ))}
    </select>
  )
}
```

### API Query with Store Filter

```typescript
// All queries automatically filtered by current store
export async function getItems() {
  const { currentStore } = useStore()
  
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('store_id', currentStore.id) // Auto-filter by store
    .order('name')
  
  return data
}
```

---

## 11. Testing Checklist

### Functional Tests
- [ ] ✅ Create new store with all required fields
- [ ] ✅ View list of all stores
- [ ] ✅ View single store details
- [ ] ✅ Update store information
- [ ] ✅ Deactivate store
- [ ] ✅ Assign user to store
- [ ] ✅ Remove user from store
- [ ] ✅ Switch between stores
- [ ] ✅ Cart clears on store switch
- [ ] ✅ Data filters by current store
- [ ] ✅ Generate consolidated report
- [ ] ✅ Compare store performance

### Security Tests
- [ ] ✅ Users can only see their assigned stores
- [ ] ✅ Non-admin cannot create stores
- [ ] ✅ Non-admin cannot delete stores
- [ ] ✅ RLS policies enforce store access
- [ ] ✅ Cannot bypass store filtering

### Performance Tests
- [ ] ✅ Store list loads in < 2 seconds
- [ ] ✅ Store switch completes in < 3 seconds
- [ ] ✅ Reports generate in < 5 seconds
- [ ] ✅ Works with 50+ stores

---

## 12. Success Metrics

### Key Performance Indicators (KPIs)

**Adoption:**
- 100% of stores using the system within 3 months
- 90%+ user satisfaction rating

**Efficiency:**
- 50% reduction in time to generate multi-store reports
- 30% faster store switching vs manual login/logout

**Data Quality:**
- 100% data accuracy across stores
- Zero cross-store data leaks
- Real-time sync across all stores

**Business Value:**
- Consolidated view saves 5+ hours per week
- Better inventory distribution between stores
- Identify best practices from top-performing stores

---

## 13. Future Enhancements (Phase 2)

1. **Inventory Transfer**
   - Move items between stores
   - Track transfers
   - Approval workflow

2. **Store Groups/Regions**
   - Group stores by region
   - Regional manager role
   - Regional reports

3. **Store-Specific Pricing**
   - Different prices per store
   - Promotional pricing per location
   - Bulk pricing rules

4. **Inter-Store Analytics**
   - Customer behavior across stores
   - Product performance by location
   - Optimal inventory distribution

5. **Mobile App**
   - Native iOS/Android app
   - Store manager dashboard
   - Push notifications

---

## 14. Summary

**Multi-Store Support allows:**
- ✅ Managing multiple locations from one system
- ✅ Store-specific data (inventory, sales, staff)
- ✅ Easy switching between stores
- ✅ Consolidated reporting across all locations
- ✅ Role-based access per store
- ✅ Centralized management with local control

**Perfect for businesses with:**
- Multiple retail locations
- Chain stores
- Franchises
- Regional branches
- Warehouse + retail

**Development Time:** 2-3 weeks  
**Priority:** HIGH (Core feature for multi-location businesses)

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Status:** Ready for Development