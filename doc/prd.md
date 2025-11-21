# Product Requirements Document (PRD)
# Zobaze POS Clone - PWA (Progressive Web App) Version

**Document Version**: 3.0 - PWA Architecture
**Last Updated**: 2025-01-21
**Product Owner**: [Your Name]
**Target Launch**: [Target Date]
**Priority**: P0 - Critical Business Initiative
**Architecture**: Progressive Web App (PWA) - Single unified web application

---

## Executive Summary

This PRD outlines the complete requirements to build a **PWA (Progressive Web App) clone** of the Zobaze POS system. Unlike the original which is a native Android app, our version will be a **unified PWA web application** that works across all platforms (Android, iOS, Desktop) from a single codebase.

**Key Architecture Change**:
- **Original Zobaze**: Native Android app + Web back office + Firebase backend (3 separate systems)
- **Our Clone**: **Single PWA application** that serves both mobile POS and back office features + Firebase backend (2 systems)

**PWA Advantages Over Native App**:
1. **Cross-Platform**: Works on Android, iOS, Windows, Mac, Linux from one codebase
2. **No App Store**: Bypass Google Play Store fees (30%) and review delays
3. **Instant Updates**: Push updates instantly without app store approval
4. **Lower Development Cost**: Single codebase instead of Android + iOS + Web
5. **SEO Benefits**: Web-based so discoverable via Google search
6. **Easy Installation**: Users install via browser (Add to Home Screen)
7. **Offline-First**: Just like native app using Service Workers

**Target Metrics** (matching Zobaze):
- 1M+ users within 2 years
- 4.5+ star rating
- Offline-first architecture with cloud sync
- Free tier with premium subscription ($19.99/month or $199/year)
- Cross-platform availability (Android, iOS, Desktop)

---

## Part 1: WHAT TO BUILD (Product Specification)

### 1.1 Problem Statement

**Current Problem**:
Small and medium-sized business owners struggle with managing their daily store operations efficiently because they lack affordable, easy-to-use software that combines billing, inventory management, staff oversight, and financial tracking in one integrated solution. Most existing POS systems are either too expensive (requiring dedicated hardware), too complex (requiring extensive training), platform-specific (Android-only or iOS-only), or too limited in functionality.

**Who is Affected**:
- **Retail Shop Owners**: Need to track inventory, manage sales, and monitor cash flow across devices
- **Restaurant Owners**: Require billing, order management accessible from tablets and phones
- **Salon/Spa Owners**: Need appointment tracking, staff management, service billing
- **Small Business Owners**: Want professional tools accessible from any device
- **Multi-location Operators**: Need centralized control accessible from desktop and mobile

**Why PWA Solves This Better**:
- **Universal Access**: Owner can use from desktop, staff can use from tablet/phone
- **No Platform Lock-in**: Works on Android, iOS, Windows without separate apps
- **Always Updated**: No need to manually update app from store
- **Easy Onboarding**: Share a URL, user clicks "Add to Home Screen" - done!
- **Lower Barrier to Entry**: No app store download friction

---

### 1.2 Core Features (P0 - Must Have)

Based on comprehensive analysis of Zobaze website and YouTube channel, here are the essential features:

#### 1. **Product & Inventory Management**
- Add/edit/delete products with:
  - Product name, SKU, barcode (EAN/UPC)
  - Category, brand, supplier
  - Cost price, selling price, profit margin
  - Stock quantity, unit of measurement (pcs, kg, liter, etc.)
  - Low stock threshold with alerts
  - Product images
  - Variants (size, color, flavor)
  - Expiry date tracking
- Barcode scanning using device camera
- Bulk product import/export (Excel/CSV)
- Product search by name, SKU, or barcode
- Stock adjustment (add/reduce stock manually)
- Stock transfer between branches

#### 2. **Point of Sale (Billing)**
- Touch-optimized sales screen for tablets
- Add products to cart via:
  - Search bar
  - Category browse
  - Barcode scanner
  - Recent/favorite products
- Shopping cart with:
  - Item quantities
  - Price adjustments
  - Discounts (flat amount or percentage)
  - Tax calculation (GST/VAT)
- **Modifiers System** (Restaurant-specific):
  - Product customization (e.g., "Large", "Extra Cheese")
  - Single or multiple selection modifiers
  - Additional pricing per modifier
- Multiple payment methods:
  - Cash
  - Card
  - UPI (India)
  - Digital wallets
  - **Credit sales** (sell on credit to customers)
  - Split payments (partial cash + card)
- Quick checkout with receipt generation
- Hold/resume sales (save cart for later)
- Return/refund processing

#### 3. **Receipt & Printing**
- Receipt formats:
  - Thermal printer (58mm, 80mm ESC/POS protocol)
  - Normal A4 printer
  - Email receipt
  - SMS receipt
  - WhatsApp receipt
  - PDF download
- Receipt customization:
  - Business logo
  - Header/footer text
  - Show/hide tax details
  - Show/hide customer info
  - Custom thank you message
- **GST-compliant invoice** (India market):
  - Tax invoice number (sequential)
  - GSTIN (business and customer)
  - HSN codes
  - Tax breakdown (CGST, SGST, IGST)
- **Delivery Challan** (non-invoice document)
- Printer connection methods:
  - Bluetooth (mobile devices)
  - USB (desktop/tablets)
  - Network/WiFi (shared printers)
  - Cloud printing

#### 4. **Offline Mode & Sync**
- **Complete offline functionality**:
  - Create sales when internet is down
  - Access product catalog
  - View customer data
  - Generate receipts
  - Check inventory levels
- IndexedDB for local data storage
- Service Worker for offline caching
- Background sync when connection restored:
  - Queue offline transactions
  - Auto-upload when online
  - Conflict resolution (latest timestamp wins)
  - Sync status indicator

#### 5. **Customer Management**
- Customer database with:
  - Name, phone, email
  - Address
  - Customer ID (auto-generated or custom)
  - Purchase history
  - Total lifetime value
  - Last visit date
- **Credit sales tracking**:
  - Credit limit per customer
  - Current outstanding balance
  - Credit transaction history
  - Payment due dates
  - Overdue payment alerts
- Customer groups/tags (VIP, Wholesale, Retail)
- Send promotional messages (SMS/WhatsApp)
- Customer loyalty program (points/rewards)

#### 6. **Staff Management**
- Multi-user support with role-based access:
  - **Owner**: Full access to everything
  - **Manager**: Sales, inventory, reports (no settings)
  - **Cashier**: Sales only (no inventory, no reports)
  - **Custom roles**: Define granular permissions
- Staff login via PIN or password
- Staff attendance tracking:
  - Clock in/out
  - Work hours calculation
  - Attendance reports
- Staff performance reports:
  - Sales by staff member
  - Items sold per staff
  - Average bill value per staff
- Commission/incentive tracking

#### 7. **Reports & Analytics**
- **Sales Reports**:
  - Daily/weekly/monthly/yearly sales
  - Sales by product
  - Sales by category
  - Sales by payment method
  - Sales by staff member
  - Sales by customer
  - Hourly sales (identify peak hours)
- **Inventory Reports**:
  - Current stock levels
  - Low stock alert
  - Stock value (cost price × quantity)
  - Stock movement (in/out)
  - Dead stock (not sold in X days)
  - Expiry alert (products nearing expiry)
- **Financial Reports**:
  - Profit & Loss statement
  - Cash flow statement
  - Balance sheet
  - Tax reports (GST returns for India)
  - Expense tracking
- **Customer Reports**:
  - Top customers by revenue
  - Customer purchase frequency
  - Customer segmentation
  - Credit sales report
  - Overdue payments report
- Export all reports as:
  - PDF
  - Excel/CSV
  - Print

#### 8. **Multi-Business Support**
- Single account can manage multiple businesses:
  - Separate inventory per business
  - Separate staff per business
  - Consolidated or separate reports
  - Switch between businesses with dropdown
- Use cases:
  - Multiple store locations
  - Different business types (e.g., retail + restaurant)
  - Franchise management

#### 9. **Settings & Configuration**
- **Business Profile**:
  - Business name, logo, address
  - Phone, email, website
  - GST/Tax registration number
  - Currency and timezone
  - Business hours
- **Receipt Settings**:
  - Default printer
  - Receipt template
  - Header/footer customization
  - Auto-print on sale completion
- **Tax Settings**:
  - Tax rates (GST, VAT, Sales Tax)
  - Tax type by product
  - Tax-inclusive or exclusive pricing
- **Payment Settings**:
  - Enable/disable payment methods
  - UPI ID for QR code
  - Card terminal integration
- **Notification Settings**:
  - Low stock alerts (email/SMS)
  - Daily sales summary
  - Payment due reminders
- **Data Backup**:
  - Auto-backup to cloud
  - Manual backup/restore
  - Export all data

#### 10. **Business Logo Creator** (Onboarding Tool)
- Built-in logo design tool for businesses without a logo:
  - Choose from 50+ templates (retail, food, beauty, services)
  - Customize colors (primary, secondary)
  - Select icons (100+ options)
  - Choose fonts (10+ options)
  - Adjust layout (icon position, text alignment)
  - Preview on receipt mockup
  - Export as PNG (300x300px)
- Option to upload custom logo if available

---

### 1.3 Additional Features (P1 - High Value)

#### 11. **Credit Sales Management** (Critical for B2B)
- Sell on credit to trusted customers
- Set credit limit per customer
- Track outstanding balances
- Generate credit invoices with due dates
- Payment collection workflow:
  - Partial or full payment
  - Multiple payments per invoice
  - Payment history
- Automated reminders:
  - SMS/WhatsApp before due date
  - Escalating reminders for overdue
- Credit aging report (0-30 days, 30-60 days, 60+ days)

#### 12. **GST Compliance** (India Market - Critical)
- GST registration details:
  - GSTIN (15-character unique ID)
  - Business type (regular/composition)
- HSN code management:
  - Assign HSN codes to products
  - HSN-wise sales report
- Tax invoice generation:
  - Sequential invoice numbering
  - CGST/SGST for intra-state sales
  - IGST for inter-state sales
  - Customer GSTIN for B2B invoices
- GST return reports:
  - GSTR-1 (outward supplies)
  - GSTR-3B (summary return)
  - Export to Excel for CA/accountant
- Purchase register (input tax credit tracking)
- Reverse charge mechanism

#### 13. **Delivery Challan** (Logistics Tracking)
- Create delivery challans for:
  - Job work / repair
  - Branch transfers
  - Sample products
  - Goods sent on approval
- Challan details:
  - Challan number (auto-generated)
  - Sender and recipient info
  - Item details (quantity, value)
  - Transport details (vehicle, driver)
  - Purpose of sending
- Track challan status:
  - Dispatched
  - Delivered
  - Returned
  - Converted to invoice
- Convert delivery challan to tax invoice after payment

#### 14. **Expense Management**
- Record business expenses:
  - Rent
  - Salaries
  - Utilities (electricity, water)
  - Marketing
  - Purchases (inventory restocking)
  - Miscellaneous
- Expense categories (customizable)
- Attach receipts (photo upload)
- Payment method tracking
- Expense reports by category and date range
- Expense vs. revenue comparison

#### 15. **Discount & Promotion Management**
- Product-level discounts:
  - Flat amount ($5 off)
  - Percentage (20% off)
  - Buy X Get Y free
- Cart-level discounts:
  - Minimum purchase amount ($50+ gets 10% off)
  - Coupon codes
- Time-based promotions:
  - Happy hour discounts (3 PM - 5 PM)
  - Weekend specials
  - Seasonal sales
- Customer group-based pricing (VIP, wholesale, retail)

---

### 1.4 Advanced Features (P2 - Nice to Have)

#### 16. **Purchase Order Management**
- Create purchase orders to suppliers
- Track order status (pending, received, partial)
- Auto-update inventory on order receipt
- Supplier management (name, contact, terms)
- Purchase history and analytics

#### 17. **Table Management** (Restaurants)
- Visual table layout (drag-and-drop editor)
- Table status (available, occupied, reserved)
- Assign orders to tables
- Split bills by seat or item
- Merge tables for large groups
- Table turnover reports

#### 18. **Kitchen Display System** (Restaurants)
- Send orders to kitchen screen
- Order status (new, preparing, ready)
- Order priority and timing
- Mark items as prepared
- Sync with billing POS

#### 19. **Appointment Scheduling** (Salons/Spas)
- Calendar view of appointments
- Book appointments with customer and staff
- Send appointment reminders (SMS/WhatsApp)
- Recurring appointments
- Service duration tracking
- Staff availability management

#### 20. **E-commerce Integration**
- Sync inventory with online store
- Import online orders into POS
- Fulfill orders from POS
- Unified inventory across channels
- Multi-channel reporting

---

### 1.5 User Stories

#### User Story 1: Retail Shop Owner - Quick Billing
**As a** small retail shop owner
**I want to** bill customers quickly using my tablet
**So that** I can serve more customers during peak hours and reduce checkout time

**Acceptance Criteria**:
- [ ] Owner can add products to cart by searching name or scanning barcode
- [ ] Cart updates automatically with quantity and price
- [ ] Owner can apply discounts (flat or percentage)
- [ ] Owner can select payment method (cash, card, UPI, credit)
- [ ] Receipt generates instantly (print, email, or WhatsApp)
- [ ] Entire checkout completes in under 30 seconds
- [ ] System works offline if internet is down
- [ ] Stock automatically reduces after sale

**Success Metric**: Average checkout time < 30 seconds

---

#### User Story 2: Restaurant Owner - Product Customization
**As a** restaurant owner
**I want to** allow customers to customize menu items
**So that** I can offer personalized orders and increase revenue through add-ons

**Acceptance Criteria**:
- [ ] Owner can create modifiers (e.g., "Size", "Toppings", "Add-ons")
- [ ] Each modifier has multiple options with individual pricing
- [ ] Modifiers can be required or optional
- [ ] When staff adds product to cart, modifier selection modal appears
- [ ] Staff can select multiple modifiers for single item
- [ ] Receipt shows product with all selected modifiers and prices
- [ ] Kitchen receipt shows modifiers prominently
- [ ] Modifier sales appear in reports

**Success Metric**: 30% of menu items use modifiers

---

#### User Story 3: Multi-Store Owner - Centralized Management
**As a** business owner with 3 retail locations
**I want to** view consolidated reports across all stores
**So that** I can track overall business performance and compare store performance

**Acceptance Criteria**:
- [ ] Owner can switch between businesses from dropdown
- [ ] Each business has separate inventory and sales
- [ ] Owner can view consolidated sales report (all businesses combined)
- [ ] Owner can view per-store comparison report
- [ ] Owner can transfer stock between stores
- [ ] Changes sync in real-time across devices
- [ ] Owner can assign staff to specific stores

**Success Metric**: Owner checks consolidated dashboard daily

---

#### User Story 4: Cashier - Credit Sale to Customer
**As a** cashier
**I want to** sell products on credit to regular customers
**So that** trusted customers can buy now and pay later

**Acceptance Criteria**:
- [ ] Cashier can select "Credit" as payment method
- [ ] System prompts to select customer or create new
- [ ] System validates customer's credit limit before approving
- [ ] If approved, sale is recorded as credit transaction
- [ ] Customer's outstanding balance updates automatically
- [ ] Receipt shows "CREDIT SALE" with due date
- [ ] SMS/WhatsApp reminder sent to customer
- [ ] Cashier can collect payment later and update balance

**Success Metric**: 15% of sales are credit sales

---

#### User Story 5: Owner - GST Compliance (India)
**As a** GST-registered business owner in India
**I want to** generate GST-compliant tax invoices
**So that** I can comply with tax regulations and file GST returns easily

**Acceptance Criteria**:
- [ ] Owner can enter GSTIN in business settings
- [ ] Products have HSN codes and GST rates (5%, 12%, 18%, 28%)
- [ ] Invoices show CGST/SGST breakdown for intra-state sales
- [ ] Invoices show IGST for inter-state sales
- [ ] B2B invoices require customer GSTIN
- [ ] Invoice number is sequential and auto-generated
- [ ] Owner can export GSTR-1 and GSTR-3B reports
- [ ] Reports match GST return format

**Success Metric**: 100% of invoices are GST-compliant

---

#### User Story 6: Staff Member - Offline Sales
**As a** staff member in an area with unstable internet
**I want to** continue making sales when offline
**So that** business operations don't stop due to network issues

**Acceptance Criteria**:
- [ ] Staff can make sales completely offline
- [ ] All product data is accessible offline
- [ ] Receipts can be printed offline (Bluetooth printer)
- [ ] Offline indicator shows in UI
- [ ] Sales queue for sync when online
- [ ] Staff receives notification when sync completes
- [ ] Stock levels update after sync
- [ ] No data is lost during offline period

**Success Metric**: 100% uptime regardless of internet connectivity

---

### 1.6 User Flows

#### Flow 1: Making a Sale with Modifiers (Restaurant)

```
SCREEN 1: Sales Dashboard
├─ Grid of product categories (Pizza, Burgers, Beverages, etc.)
├─ Search bar at top
├─ Cart summary on right (0 items, $0.00)
└─ Click "Pizza" category → Go to SCREEN 2

SCREEN 2: Product Selection
├─ Grid of pizzas with images and prices
├─ Click "Margherita Pizza - $12.00" → Go to SCREEN 3

SCREEN 3: Modifier Selection Modal
├─ Title: "Customize Margherita Pizza"
├─ Modifier 1: Size (Required, Single Choice)
│  ├─ ○ Small - $0.00
│  ├─ ● Medium - $0.00 (default selected)
│  └─ ○ Large - $3.00
├─ Modifier 2: Toppings (Optional, Multiple Choice)
│  ├─ ☐ Extra Cheese - $2.00
│  ├─ ☐ Olives - $1.50
│  └─ ☐ Mushrooms - $1.50
├─ Modifier 3: Crust (Required, Single Choice)
│  ├─ ● Regular - $0.00 (default selected)
│  └─ ○ Thin Crust - $1.00
├─ Price Summary:
│  ├─ Base Price: $12.00
│  ├─ Modifiers: $0.00
│  └─ Total: $12.00
└─ Buttons: [Cancel] [Add to Cart]

USER ACTION: Selects "Large" (+$3.00), "Extra Cheese" (+$2.00), "Thin Crust" (+$1.00)
├─ Price Summary updates:
│  ├─ Base Price: $12.00
│  ├─ Modifiers: +$6.00
│  └─ Total: $18.00
└─ Click "Add to Cart" → Go to SCREEN 4

SCREEN 4: Sales Dashboard (Cart Updated)
├─ Cart now shows:
│  └─ 1x Margherita Pizza (Large, Extra Cheese, Thin Crust) - $18.00
├─ Cart total: $18.00
└─ User adds more items or clicks "Checkout" → Go to SCREEN 5

SCREEN 5: Payment Screen
├─ Cart Summary:
│  ├─ 1x Margherita Pizza (Large, Extra Cheese, Thin Crust) - $18.00
│  ├─ 1x Coke - $2.00
│  ├─ Subtotal: $20.00
│  ├─ Tax (10%): $2.00
│  └─ Total: $22.00
├─ Payment Methods:
│  ├─ ● Cash
│  ├─ ○ Card
│  ├─ ○ UPI
│  └─ ○ Credit
├─ Customer (Optional): [Select Customer ▼]
└─ Button: [Complete Sale]

USER ACTION: Selects "Cash", clicks "Complete Sale" → Go to SCREEN 6

SCREEN 6: Receipt & Cash Drawer
├─ Sale completed successfully!
├─ Receipt options:
│  ├─ [Print Receipt] (sends to thermal printer via Bluetooth)
│  ├─ [Email Receipt]
│  ├─ [WhatsApp Receipt]
│  └─ [Download PDF]
├─ Cash drawer opens automatically (if connected)
├─ Receipt preview shown on screen:
│  ├─ ----------------------------------------
│  ├─        [Business Logo]
│  ├─        Pizza Palace
│  ├─        123 Main St, City
│  ├─ ----------------------------------------
│  ├─ Date: 21/01/2025 14:30
│  ├─ Invoice #: INV-2025-0042
│  ├─ ----------------------------------------
│  ├─ 1x Margherita Pizza          $12.00
│  ├─    + Large                    $3.00
│  ├─    + Extra Cheese             $2.00
│  ├─    + Thin Crust               $1.00
│  ├─ 1x Coke                        $2.00
│  ├─ ----------------------------------------
│  ├─ Subtotal                      $20.00
│  ├─ Tax (10%)                      $2.00
│  ├─ ========================================
│  ├─ TOTAL                         $22.00
│  ├─ ========================================
│  ├─ Payment: Cash
│  ├─ Thank you for your order!
│  └─ ----------------------------------------
└─ Button: [New Sale] → Return to SCREEN 1
```

---

#### Flow 2: Credit Sale to Customer

```
SCREEN 1: Sales Dashboard
├─ Add products to cart as usual
├─ Cart: 3 items, $150.00
└─ Click "Checkout" → Go to SCREEN 2

SCREEN 2: Payment Screen
├─ Select payment method: "Credit" ●
└─ Click "Continue" → Go to SCREEN 3

SCREEN 3: Select Customer
├─ Search bar: "Enter customer name or phone"
├─ List of customers:
│  ├─ John's Store - Current Balance: $500
│  └─ Sarah's Boutique - Current Balance: $0
├─ Or: [+ Add New Customer]
└─ USER SELECTS: "John's Store" → Go to SCREEN 4

SCREEN 4: Credit Validation
├─ Customer: John's Store
├─ Credit Limit: $1,000
├─ Current Balance: $500
├─ New Purchase: $150
├─ New Balance: $650
├─ Status: ✓ Within Credit Limit
├─ Payment Terms: 30 days
├─ Due Date: 20/02/2025
└─ Buttons: [Cancel] [Confirm Credit Sale]

USER ACTION: Click "Confirm Credit Sale" → Go to SCREEN 5

SCREEN 5: Credit Sale Receipt
├─ Sale completed successfully!
├─ ========================================
├─         CREDIT SALE INVOICE
├─ ========================================
├─ Customer: John's Store
├─ Phone: +91 98765 43210
├─ Date: 21/01/2025
├─ Invoice #: INV-2025-0043
├─ ----------------------------------------
├─ 3x Product A @ $50 each       $150.00
├─ ----------------------------------------
├─ Total Amount Due              $150.00
├─ Payment Due Date: 20/02/2025
├─ ========================================
├─ Previous Balance              $500.00
├─ This Invoice                  $150.00
├─ NEW BALANCE                   $650.00
├─ ========================================
├─ Options:
│  ├─ [Print Receipt]
│  ├─ [Send SMS Reminder]
│  └─ [Send WhatsApp Receipt]
└─ Button: [Done] → Return to SCREEN 1

BACKGROUND ACTION: SMS sent to customer:
"Dear John's Store, purchase of $150 recorded. Payment due by 20/02/2025. Current balance: $650. Thank you! - Pizza Palace"
```

---

#### Flow 3: Offline Sale & Sync

```
SCENARIO: Internet connection is lost

SCREEN 1: Sales Dashboard (Offline Mode)
├─ 🔴 OFFLINE indicator at top
├─ Toast notification: "You are offline. Sales will sync when online."
├─ All product data still accessible (cached in IndexedDB)
├─ Cart functions normally
└─ Make sale as usual → Go to SCREEN 2

SCREEN 2: Payment Screen (Offline)
├─ All features work normally
├─ Select "Cash" payment
└─ Click "Complete Sale" → Go to SCREEN 3

SCREEN 3: Offline Sale Confirmation
├─ 🔴 Sale completed OFFLINE
├─ Sale ID: OFFLINE-2025-0001
├─ This sale will sync when internet returns
├─ Receipt options:
│  ├─ [Print Receipt] (works via Bluetooth printer)
│  ├─ [Email Receipt] (queued for sending when online)
│  └─ [WhatsApp Receipt] (queued)
└─ Button: [New Sale]

USER MAKES 5 MORE SALES WHILE OFFLINE...

SCREEN 4: Sync Queue
├─ Navigate to Settings → Data Sync
├─ Pending Syncs: 6 sales
│  ├─ OFFLINE-2025-0001 - $50.00 - Pending
│  ├─ OFFLINE-2025-0002 - $35.00 - Pending
│  ├─ OFFLINE-2025-0003 - $120.00 - Pending
│  ├─ OFFLINE-2025-0004 - $80.00 - Pending
│  ├─ OFFLINE-2025-0005 - $45.00 - Pending
│  └─ OFFLINE-2025-0006 - $200.00 - Pending
└─ Button: [Sync Now] (disabled until online)

INTERNET RECONNECTS...

AUTOMATIC SYNC PROCESS:
├─ 🟢 ONLINE indicator appears
├─ Service Worker detects connection
├─ Background sync triggered automatically
├─ Progress notification: "Syncing 6 sales..."
├─ Sales uploaded to Firebase one by one:
│  ├─ ✓ OFFLINE-2025-0001 → INV-2025-0044
│  ├─ ✓ OFFLINE-2025-0002 → INV-2025-0045
│  ├─ ✓ OFFLINE-2025-0003 → INV-2025-0046
│  ├─ ✓ OFFLINE-2025-0004 → INV-2025-0047
│  ├─ ✓ OFFLINE-2025-0005 → INV-2025-0048
│  └─ ✓ OFFLINE-2025-0006 → INV-2025-0049
├─ Stock levels updated in cloud
├─ Invoice numbers assigned
└─ Toast notification: "✓ All sales synced successfully!"

SCREEN 5: Sync Complete
├─ Navigate to Settings → Data Sync
├─ Last Sync: Just now
├─ Pending Syncs: 0
├─ Sync History:
│  └─ 21/01/2025 15:30 - 6 sales synced
└─ All data is now backed up to cloud
```

---

### 1.7 Edge Cases & Error Handling

#### Edge Case 1: Customer Exceeds Credit Limit
**Scenario**: Customer attempts credit purchase that exceeds their credit limit

**Current State**:
- Customer: John's Store
- Credit Limit: $1,000
- Current Balance: $950
- New Purchase: $200
- Would Result In: $1,150 (exceeds limit by $150)

**System Behavior**:
- ❌ Block the sale
- Show error message: "Credit limit exceeded. John's Store has $950 outstanding and $1,000 limit. This purchase would exceed limit by $150."
- Offer options:
  1. "Reduce cart amount to $50 (stay within limit)"
  2. "Collect partial payment now ($150 cash + $50 credit)"
  3. "Customer pays down existing balance first"
  4. "Override limit" (requires manager/owner PIN)

---

#### Edge Case 2: Offline Data Conflict
**Scenario**: Two devices make sales offline, both sync when online

**Device A (Tablet)**: Sold 5 units of Product X while offline
**Device B (Phone)**: Sold 3 units of Product X while offline
**Cloud Stock**: 10 units before both sales

**System Behavior**:
1. Device A reconnects first:
   - Syncs sale: 5 units sold
   - Cloud updates: Stock = 10 - 5 = 5 units
2. Device B reconnects:
   - Syncs sale: 3 units sold
   - Cloud updates: Stock = 5 - 3 = 2 units
3. Final correct stock: 2 units (10 - 5 - 3)
4. If stock goes negative:
   - Alert owner: "Stock for Product X is now -2 units (oversold)"
   - Mark product as "Out of Stock"
   - Suggest stock adjustment

**Conflict Resolution Rule**: Last Write Wins (LWW) with timestamp priority

---

#### Edge Case 3: Printer Not Connected
**Scenario**: Staff completes sale but thermal printer is offline/disconnected

**System Behavior**:
- Sale completes successfully (sale is recorded)
- Attempt to print receipt
- If print fails:
  - Show warning: "⚠ Printer not connected. Receipt not printed."
  - Options:
    1. "Retry Print" (attempts connection again)
    2. "Email Receipt" (send to customer email)
    3. "WhatsApp Receipt" (send to customer phone)
    4. "Print Later" (save to print queue)
    5. "Skip & Continue"
- Sale data is saved regardless
- Receipt can be reprinted later from Sales History

---

#### Edge Case 4: Barcode Not Found
**Scenario**: Staff scans barcode that doesn't exist in system

**System Behavior**:
- Show notification: "⚠ Barcode 1234567890123 not found"
- Options:
  1. "Add New Product" (quick add with this barcode)
     - Pre-fills barcode field
     - Staff enters name, price, stock
     - Product created and added to cart instantly
  2. "Search Manually" (opens search by name)
  3. "Skip" (ignore this product)

---

#### Edge Case 5: Duplicate Product Entry
**Scenario**: User tries to add product with SKU/barcode that already exists

**System Behavior**:
- Validate SKU and barcode on product creation
- If duplicate found:
  - Show error: "❌ Product with SKU 'ABC123' already exists: Product Name"
  - Options:
    1. "Edit Existing Product" (navigate to existing product)
    2. "Use Different SKU"
    3. "Create Variant" (if it's same product, different size/color)

---

#### Edge Case 6: Negative Stock After Sale
**Scenario**: Stock shows 5 units, but 10 sold (due to sync lag or manual error)

**System Behavior**:
- Allow sale to complete (don't block customer transaction)
- Stock goes negative: -5 units
- Show warning to staff: "⚠ Product X is now out of stock (-5 units)"
- Send alert to owner: "Product X oversold by 5 units. Please restock."
- Mark product as "Out of Stock" on sales screen
- Add to "Stock Discrepancy Report" for owner review

---

#### Edge Case 7: Payment Gateway Failure (UPI/Card)
**Scenario**: Customer pays via UPI, but payment gateway times out

**System Behavior**:
- Show loading: "Processing UPI payment..."
- After 30 seconds timeout:
  - Show error: "⚠ Payment not confirmed. Please check payment status."
  - Options:
    1. "Mark as Paid" (if customer shows payment confirmation)
    2. "Retry Payment" (attempt again)
    3. "Switch to Cash" (accept cash instead)
    4. "Cancel Sale" (void transaction)
- If "Mark as Paid":
  - Sale recorded with note: "Payment pending verification"
  - Flagged in daily report for manual reconciliation

---

#### Edge Case 8: Browser Closes Mid-Sale
**Scenario**: Staff is billing customer, browser crashes or closes accidentally

**System Behavior**:
- Cart state saved to localStorage every 2 seconds
- On browser reopen:
  - Show notification: "🔄 Unsaved cart found. Would you like to restore it?"
  - Options:
    1. "Restore Cart" (loads previous cart state)
    2. "Start Fresh" (clears cart)
- Cart restored with exact items, quantities, discounts
- Staff can continue checkout

---

### 1.8 Business Rules

#### Inventory Rules:
1. Stock cannot go below 0 in inventory management (manual editing)
2. Stock CAN go negative during sales (to avoid blocking customer transactions)
3. Low stock alert triggers when stock ≤ threshold (default: 10 units)
4. Products with expiry date show warning 30 days before expiry
5. Stock valuation uses FIFO (First In, First Out) method

#### Pricing Rules:
1. Selling price must be > $0
2. Cost price can be $0 (for services or free items)
3. Discount cannot exceed selling price (prevents negative totals)
4. Tax is calculated on (selling price - discount)
5. Modifiers can have $0 price (e.g., "No onions" modifier)

#### Sales Rules:
1. Minimum sale amount: $0.01 (prevents $0 invoices)
2. Invoice numbers are sequential and cannot have gaps
3. Sales cannot be deleted, only refunded (audit trail)
4. Refund must be done within 30 days (configurable)
5. Partial refunds allowed (refund individual items)

#### Credit Rules:
1. Customer must have credit limit > $0 to enable credit sales
2. Credit sale not allowed if customer has overdue payments (configurable)
3. Payment due date = sale date + credit terms (e.g., 30 days)
4. Overdue interest can be charged (configurable, default: 0%)
5. Credit payments update the oldest unpaid invoice first

#### Tax Rules (India GST):
1. GST invoice number format: [Business Code]-[Financial Year]-[Sequential Number]
2. Financial year in India: April 1 - March 31
3. B2B invoices (sale > ₹2,500 or customer has GSTIN) require customer GSTIN
4. Intra-state sales use CGST + SGST
5. Inter-state sales use IGST only
6. Export sales (0% GST) require export declaration

#### Staff Rules:
1. Cashier role cannot access Settings or Reports
2. Manager role cannot delete businesses or change owner account
3. Each staff member has unique PIN (4-6 digits)
4. Owner can reset staff PINs
5. Staff activity is logged (audit trail)

#### Offline Rules:
1. Offline sales sync in chronological order (oldest first)
2. Product catalog syncs to device every 6 hours (configurable)
3. Maximum offline cache: 30 days of data
4. If offline > 7 days, force sync before allowing new sales
5. Sync conflicts resolved by timestamp (latest wins)

---

### 1.9 UI/UX Specifications

#### Design Principles:
1. **Mobile-First**: Design for smallest screen (320px width) first
2. **Touch-Optimized**: Buttons minimum 44x44px (thumb-friendly)
3. **High Contrast**: WCAG AA compliant for readability
4. **Fast Loading**: First paint < 2 seconds, interactive < 3 seconds
5. **Offline Indicator**: Always visible when offline (red banner)

#### Color Scheme:
```
Primary Color: #4CAF50 (Green) - Success, Primary actions
Secondary Color: #2196F3 (Blue) - Links, Info
Accent Color: #FF9800 (Orange) - Warnings, Alerts
Error Color: #F44336 (Red) - Errors, Destructive actions
Background: #F5F5F5 (Light Gray)
Card Background: #FFFFFF (White)
Text Primary: #212121 (Almost Black)
Text Secondary: #757575 (Gray)
Border: #E0E0E0 (Light Gray)
```

#### Typography:
```
Font Family: 'Inter', 'Roboto', system-ui, sans-serif
Heading 1: 24px, Bold (600)
Heading 2: 20px, Semibold (500)
Heading 3: 18px, Medium (500)
Body: 16px, Regular (400)
Small: 14px, Regular (400)
Caption: 12px, Regular (400)
Line Height: 1.5 (body text), 1.2 (headings)
```

#### Layout (Responsive):
**Mobile (< 768px)**:
- Single column layout
- Bottom navigation (Sales, Inventory, Reports, Settings)
- Full-screen modals
- Swipe gestures enabled

**Tablet (768px - 1024px)**:
- Two-column layout (product grid + cart)
- Side navigation drawer
- Overlay modals
- Touch and click both supported

**Desktop (> 1024px)**:
- Three-column layout (menu + main content + sidebar)
- Persistent sidebar navigation
- Centered modals
- Keyboard shortcuts enabled

#### Sales Screen Layout (Tablet - Primary Use Case):

```
+-----------------------------------------------------+
|  [≡ Menu]  [Search Products...]  [🔔 3]  [User ▼]  |
+-----------------------------------------------------+
|                 |                                    |
|  Categories     |         Product Grid              |
|                 |                                    |
|  All Products   |  [Burger]  [Pizza]   [Pasta]      |
|  Food           |  $8.00     $12.00    $10.00       |
|  Beverages      |                                    |
|  Desserts       |  [Salad]   [Fries]   [Coke]       |
|                 |  $6.00     $4.00     $2.00        |
|  Recent         |                                    |
|  Favorites      |  [Coffee]  [Tea]     [Juice]      |
|                 |  $5.00     $3.00     $4.00        |
+-----------------------------------------------------+
|                 |         Shopping Cart              |
|                 |                                    |
|                 |  1x Burger            $8.00  [×]   |
|                 |  2x Coke              $4.00  [×]   |
|                 |                                    |
|                 |  Subtotal            $12.00        |
|                 |  Tax (10%)            $1.20        |
|                 |  ================================   |
|                 |  TOTAL               $13.20        |
|                 |                                    |
|                 |  [Clear Cart]  [CHECKOUT →]        |
+-----------------------------------------------------+
|  🟢 Online | Synced 2 min ago                       |
+-----------------------------------------------------+
```

#### Receipt Design (Thermal 58mm):

```
        [BUSINESS LOGO]
       Business Name
    123 Main St, City
   Phone: +91 12345 67890
  GSTIN: 29ABCDE1234F1Z5

========================================
       TAX INVOICE
========================================
Invoice: INV-2025-0001
Date: 21/01/2025 14:30
Cashier: John Doe

Customer: Walk-in
Phone: -
========================================
Item              Qty   Rate   Amount
========================================
Burger              1   8.00     8.00
Coke                2   2.00     4.00
----------------------------------------
                  Subtotal      12.00
                  CGST 5%        0.60
                  SGST 5%        0.60
========================================
                  TOTAL         13.20
========================================
Payment: Cash
Received:                      15.00
Change:                         1.80
========================================
      Thank you! Visit again!
    Follow us @businessname
========================================
      Powered by YourPOSName
========================================
```

---

### 1.10 Success Metrics

#### Quantitative Metrics:

**Adoption Metrics**:
- 10,000 active users within 6 months
- 100,000 active users within 12 months
- 1 million users within 24 months
- Daily Active Users (DAU) / Monthly Active Users (MAU) ratio > 40%

**Engagement Metrics**:
- Average sales per business per day: 20+
- Average session time: 15+ minutes (during business hours)
- 7-day retention rate: 70%+
- 30-day retention rate: 50%+

**Revenue Metrics**:
- Free-to-paid conversion rate: 5-10%
- Average revenue per user (ARPU): $10-20/month
- Monthly Recurring Revenue (MRR): $100K within 12 months
- Customer Lifetime Value (LTV): $500+

**Technical Metrics**:
- Page load time (First Contentful Paint): < 2 seconds
- Time to Interactive (TTI): < 3 seconds
- Offline sync success rate: > 99%
- Crash-free rate: > 99.5%
- API response time (p95): < 500ms

**Feature Usage**:
- Offline sales: Used by 80%+ of users
- Barcode scanning: Used in 60%+ of sales
- Receipt printing: 70%+ of sales
- Credit sales: 15%+ of total sales (for B2B businesses)
- Modifiers: 30%+ of restaurants use daily

#### Qualitative Metrics:

**User Satisfaction**:
- Net Promoter Score (NPS): 50+
- App Store rating: 4.5+ stars
- Customer support tickets: < 5% of users per month
- Positive review sentiment: 80%+

**Ease of Use**:
- Time to first sale (new user): < 10 minutes
- Checkout time per transaction: < 30 seconds
- Setup time (product catalog import): < 1 hour for 100 products

**Business Impact**:
- User reports 20%+ time saved on daily operations
- User reports 15%+ reduction in inventory losses
- User reports improved cash flow with credit tracking

---

## Part 2: HOW TO BUILD (Technical Specification)

### 2.1 Technology Stack (PWA Architecture)

#### Frontend (PWA):
**Framework**:
- **React 18** with TypeScript
- Why: Best PWA support, huge ecosystem, performance optimization

**UI Library**:
- **Material-UI (MUI) v5** or **Tailwind CSS**
- Component library for rapid development
- Responsive, accessible components

**State Management**:
- **Redux Toolkit** with Redux Persist
- Manages app state (cart, products, settings)
- Persists to IndexedDB for offline access

**Offline Storage**:
- **IndexedDB** (via Dexie.js)
  - Store products, sales, customers locally
  - 100MB+ storage capacity
  - Structured queries
- **localStorage**:
  - Small data (user preferences, temp cart state)
  - 5-10MB capacity

**PWA Features**:
- **Workbox** (Google's Service Worker library)
  - Precaching static assets
  - Runtime caching strategies
  - Background sync for offline sales
  - Push notifications
- **Web App Manifest** (manifest.json):
  - App name, icons, theme color
  - Display mode: standalone (hides browser UI)
  - Start URL
  - Splash screen

**Barcode Scanning**:
- **ZXing.js** or **QuaggaJS**
  - Browser-based barcode scanning via camera
  - Supports EAN, UPC, Code 128, QR codes
  - Works on mobile and desktop with webcam

**Printing**:
- **Web Bluetooth API**:
  - Connect to Bluetooth thermal printers
  - Send ESC/POS commands
  - Works on Android Chrome, Edge
- **jsPDF** + **html2canvas**:
  - Generate PDF receipts
  - Email or download
- **Printer.js**:
  - Print to browser's print dialog (normal printers)

**Payment Integration**:
- **Stripe** (International): Cards, Apple Pay, Google Pay
- **Razorpay** (India): UPI, Cards, Wallets, Net Banking
- SDK integrated via JavaScript

**Charts & Reports**:
- **Chart.js** or **Recharts**
  - Sales graphs, inventory charts
  - Lightweight, responsive

**Notifications**:
- **Firebase Cloud Messaging (FCM)**:
  - Push notifications for low stock, payment reminders
  - Works in PWA via Service Worker

---

#### Backend (Firebase - BaaS):
**Database**:
- **Firebase Firestore** (NoSQL)
  - Real-time sync across devices
  - Offline persistence built-in
  - Scalable, pay-as-you-go pricing
  - Complex queries supported

**Authentication**:
- **Firebase Authentication**
  - Email/password login
  - Phone OTP login (for India market)
  - Google Sign-In (optional)
  - Multi-user session management

**File Storage**:
- **Firebase Cloud Storage**
  - Product images
  - Business logos
  - Receipt PDFs
  - Backup exports

**Cloud Functions**:
- **Firebase Cloud Functions** (Node.js)
  - Scheduled tasks (daily reports, reminders)
  - Payment processing webhooks
  - Data aggregation (sales totals)
  - Email/SMS sending

**Hosting**:
- **Firebase Hosting**
  - Fast global CDN
  - Free SSL certificate
  - Custom domain support
  - Automatic rollbacks

**Analytics**:
- **Google Analytics 4 (GA4)**
  - User behavior tracking
  - Funnel analysis
  - Retention reports

---

#### Additional Services:

**SMS/WhatsApp**:
- **Twilio** (SMS) - Global
- **Gupshup** or **MSG91** (WhatsApp + SMS) - India-focused
- Send receipts, payment reminders, promotional messages

**Email**:
- **SendGrid** or **Amazon SES**
- Transactional emails (receipts, reports, alerts)

**Payment Gateways**:
- **Stripe**: Credit/debit cards, Apple Pay, Google Pay
- **Razorpay** (India): UPI, cards, wallets, net banking

**Domain & DNS**:
- **Cloudflare** - DNS, CDN, SSL, DDoS protection

**Monitoring & Error Tracking**:
- **Sentry** - Error tracking, performance monitoring
- **LogRocket** - Session replay for debugging

---

### 2.2 System Architecture (PWA + Firebase)

```
┌─────────────────────────────────────────────────────────────┐
│                     USER DEVICES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Android    │  │     iOS      │  │   Desktop    │      │
│  │   Chrome     │  │    Safari    │  │   Chrome     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                  │               │
│         └─────────────────┴──────────────────┘               │
│                          │                                   │
│                          ▼                                   │
│              ┌───────────────────────┐                       │
│              │   PWA WEB APP         │                       │
│              │   (React + TypeScript)│                       │
│              │                       │                       │
│              │  - Sales Screen       │                       │
│              │  - Inventory Mgmt     │                       │
│              │  - Reports            │                       │
│              │  - Settings           │                       │
│              └───────────────────────┘                       │
│                          │                                   │
│         ┌────────────────┼────────────────┐                 │
│         │                │                │                 │
│         ▼                ▼                ▼                 │
│  ┌─────────────┐  ┌────────────┐  ┌────────────┐          │
│  │ IndexedDB   │  │  Service   │  │ Local      │          │
│  │ (Dexie.js)  │  │  Worker    │  │ Storage    │          │
│  │             │  │ (Workbox)  │  │            │          │
│  │ - Products  │  │            │  │ - Settings │          │
│  │ - Sales     │  │ - Caching  │  │ - Cart     │          │
│  │ - Customers │  │ - Sync     │  │ - Auth     │          │
│  │ - Settings  │  │ - Push     │  │            │          │
│  └─────────────┘  └────────────┘  └────────────┘          │
│         │                │                │                 │
│         └────────────────┴────────────────┘                 │
│                          │                                   │
│                 OFFLINE STORAGE                              │
│                 (Works without internet)                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   FIREBASE (Google Cloud)                    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Firebase Hosting (CDN)                    │    │
│  │  - Serves PWA files (HTML, CSS, JS)                │    │
│  │  - SSL certificate (HTTPS)                         │    │
│  │  - Custom domain: yourpos.com                      │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Firebase Authentication                   │    │
│  │  - Email/Password                                  │    │
│  │  - Phone OTP                                       │    │
│  │  - User sessions                                   │    │
│  │  - Multi-business access control                   │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Cloud Firestore (Database)                │    │
│  │                                                     │    │
│  │  Collections:                                       │    │
│  │  - users/{userId}/                                  │    │
│  │  - businesses/{businessId}/                         │    │
│  │    ├── products/{productId}/                        │    │
│  │    ├── sales/{saleId}/                              │    │
│  │    ├── customers/{customerId}/                      │    │
│  │    ├── staff/{staffId}/                             │    │
│  │    └── settings/{settingId}/                        │    │
│  │                                                     │    │
│  │  Features:                                          │    │
│  │  - Real-time sync                                   │    │
│  │  - Offline persistence                              │    │
│  │  - Security rules                                   │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Cloud Functions (Serverless)              │    │
│  │                                                     │    │
│  │  - generateInvoiceNumber()                          │    │
│  │  - processPayment()                                 │    │
│  │  - sendReceiptEmail()                               │    │
│  │  - sendPaymentReminder()                            │    │
│  │  - dailySalesSummary()                              │    │
│  │  - lowStockAlert()                                  │    │
│  │  - exportGSTReport()                                │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Cloud Storage (File Storage)              │    │
│  │  - Product images (/products/)                      │    │
│  │  - Business logos (/logos/)                         │    │
│  │  - Receipt PDFs (/receipts/)                        │    │
│  │  - Backup exports (/backups/)                       │    │
│  └────────────────────────────────────────────────────┘    │
│                           │                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │       Firebase Cloud Messaging (FCM)                │    │
│  │  - Push notifications                               │    │
│  │  - Low stock alerts                                 │    │
│  │  - Payment reminders                                │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ API Calls
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  THIRD-PARTY SERVICES                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Stripe/    │  │   Twilio/    │  │  SendGrid/   │     │
│  │  Razorpay    │  │   Gupshup    │  │   AWS SES    │     │
│  │              │  │              │  │              │     │
│  │  Payment     │  │  SMS/        │  │  Email       │     │
│  │  Processing  │  │  WhatsApp    │  │  Service     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ ESC/POS Commands
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  HARDWARE (Bluetooth/USB/Network)            │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Thermal    │  │   Barcode    │  │   Cash       │     │
│  │   Printer    │  │   Scanner    │  │   Drawer     │     │
│  │              │  │              │  │              │     │
│  │  58mm/80mm   │  │  Camera or   │  │  Auto-open   │     │
│  │  ESC/POS     │  │  USB scanner │  │  via printer │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.3 Database Schema (Firestore)

#### Collection: `users/{userId}`
```javascript
{
  userId: string,                    // Auto-generated by Firebase Auth
  email: string,
  phone: string,
  name: string,
  createdAt: timestamp,
  businessIds: [businessId1, businessId2],  // Businesses owned/managed
  lastLogin: timestamp,
  subscriptionPlan: "free" | "premium",
  subscriptionExpiry: timestamp
}
```

---

#### Collection: `businesses/{businessId}`
```javascript
{
  businessId: string,
  ownerId: string,                   // Reference to users collection
  name: string,
  logo: string,                      // URL from Cloud Storage
  address: {
    street: string,
    city: string,
    state: string,
    postalCode: string,
    country: string
  },
  contact: {
    phone: string,
    email: string,
    website: string
  },
  taxSettings: {
    country: "IN" | "US" | "UK" | etc,
    taxSystem: "GST" | "VAT" | "Sales Tax",
    gstRegistered: boolean,
    gstin: string,                   // GST Identification Number (India)
    gstType: "regular" | "composition",
    taxRates: [
      { name: "GST 5%", rate: 5, cgst: 2.5, sgst: 2.5 },
      { name: "GST 12%", rate: 12, cgst: 6, sgst: 6 },
      { name: "GST 18%", rate: 18, cgst: 9, sgst: 9 },
      { name: "GST 28%", rate: 28, cgst: 14, sgst: 14 }
    ]
  },
  currency: "USD" | "INR" | "EUR" | etc,
  timezone: string,                  // IANA timezone (e.g., "Asia/Kolkata")
  businessHours: {
    monday: { open: "09:00", close: "18:00", closed: false },
    tuesday: { open: "09:00", close: "18:00", closed: false },
    // ... rest of week
  },
  branding: {
    logoUrl: string,
    primaryColor: string,            // Hex color
    secondaryColor: string
  },
  receiptSettings: {
    headerText: string,
    footerText: string,
    showLogo: boolean,
    showTaxDetails: boolean,
    thankYouMessage: string,
    autoPrint: boolean,
    printCopies: number
  },
  invoiceSettings: {
    prefix: string,                  // e.g., "INV-"
    nextInvoiceNumber: number,       // Auto-increment
    financialYearStart: string       // "04-01" for India (April 1)
  },
  createdAt: timestamp,
  updatedAt: timestamp,
  isActive: boolean,
  planType: "free" | "premium"
}
```

---

#### Subcollection: `businesses/{businessId}/products/{productId}`
```javascript
{
  productId: string,
  name: string,
  sku: string,                       // Unique within business
  barcode: string,                   // EAN, UPC, etc.
  category: string,
  brand: string,
  supplier: string,
  description: string,
  imageUrl: string,                  // Cloud Storage URL
  pricing: {
    costPrice: number,
    sellingPrice: number,
    profitMargin: number,            // Auto-calculated
    taxRate: number,                 // 0, 5, 12, 18, 28
    taxIncluded: boolean
  },
  stock: {
    currentStock: number,
    unit: "pcs" | "kg" | "liter" | "meter" | "box" | "custom",
    customUnit: string,              // If unit = "custom"
    lowStockThreshold: number,
    trackInventory: boolean          // False for services
  },
  variants: [
    {
      variantId: string,
      name: string,                  // e.g., "Size", "Color"
      options: [
        {
          optionId: string,
          value: string,             // e.g., "Small", "Red"
          sku: string,
          additionalPrice: number,
          stock: number
        }
      ]
    }
  ],
  modifiers: [                       // For restaurants
    {
      modifierId: string,
      required: boolean
    }
  ],
  taxInfo: {
    taxable: boolean,
    taxRate: number,
    hsnCode: string                  // Harmonized System Nomenclature (India GST)
  },
  expiryDate: timestamp | null,
  isActive: boolean,
  isFavorite: boolean,               // For quick access
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: userId
}
```

---

#### Subcollection: `businesses/{businessId}/modifiers/{modifierId}`
```javascript
{
  modifierId: string,
  businessId: string,
  name: string,                      // e.g., "Size Options", "Toppings"
  type: "single" | "multiple",       // Single choice or multi-select
  required: boolean,
  options: [
    {
      optionId: string,
      name: string,                  // e.g., "Large", "Extra Cheese"
      price: number,                 // Additional price (can be 0)
      isDefault: boolean
    }
  ],
  applicableProducts: [productId1, productId2],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

#### Subcollection: `businesses/{businessId}/sales/{saleId}`
```javascript
{
  saleId: string,
  businessId: string,
  invoiceNumber: string,             // INV-2025-0001
  invoiceType: "B2B" | "B2C",        // For GST (India)
  date: timestamp,
  items: [
    {
      itemId: string,
      productId: string,
      productName: string,
      sku: string,
      quantity: number,
      unit: string,
      costPrice: number,             // For profit calculation
      sellingPrice: number,          // Original price
      discount: number,              // Item-level discount
      selectedModifiers: [           // For restaurants
        {
          modifierId: string,
          modifierName: string,
          optionId: string,
          optionName: string,
          additionalPrice: number
        }
      ],
      taxRate: number,
      taxAmount: number,
      subtotal: number,              // (price + modifiers) * qty
      total: number                  // subtotal - discount + tax
    }
  ],
  summary: {
    subtotal: number,                // Sum of all items before tax/discount
    discount: number,                // Cart-level discount
    taxableAmount: number,
    cgst: number,                    // For India GST
    sgst: number,
    igst: number,                    // For inter-state
    totalTax: number,
    total: number,
    profit: number                   // (selling - cost) for all items
  },
  payment: {
    method: "cash" | "card" | "upi" | "wallet" | "credit" | "split",
    status: "paid" | "pending" | "partial",
    amountPaid: number,
    amountDue: number,
    splitPayments: [                 // If method = "split"
      {
        method: "cash" | "card" | etc,
        amount: number
      }
    ]
  },
  creditSale: {                      // If payment.method = "credit"
    customerId: string,
    customerName: string,
    dueDate: timestamp,
    amountDue: number,
    amountPaid: number,
    status: "pending" | "partially_paid" | "fully_paid" | "overdue",
    payments: [                      // Payment collection history
      {
        paymentId: string,
        date: timestamp,
        amount: number,
        method: "cash" | "card" | etc
      }
    ]
  },
  customer: {                        // Optional
    customerId: string,
    name: string,
    phone: string,
    email: string,
    gstin: string                    // For B2B invoices (India)
  },
  staff: {
    staffId: string,
    staffName: string
  },
  receiptSent: {
    email: boolean,
    sms: boolean,
    whatsapp: boolean,
    printed: boolean
  },
  notes: string,
  status: "completed" | "refunded" | "partially_refunded",
  refundDetails: {                   // If refunded
    refundedAt: timestamp,
    refundedBy: userId,
    reason: string,
    amount: number,
    refundedItems: [itemId1, itemId2]
  },
  syncStatus: "synced" | "pending",  // For offline sales
  createdAt: timestamp,
  createdBy: userId,
  updatedAt: timestamp,
  deviceId: string                   // Which device created the sale
}
```

---

#### Subcollection: `businesses/{businessId}/customers/{customerId}`
```javascript
{
  customerId: string,
  businessId: string,
  name: string,
  phone: string,
  email: string,
  address: {
    street: string,
    city: string,
    state: string,
    postalCode: string,
    country: string
  },
  gstin: string,                     // For B2B (India)
  customerType: "retail" | "wholesale" | "vip",
  tags: [string],                    // e.g., ["Loyal", "Bulk Buyer"]
  creditSettings: {
    creditLimit: number,
    currentCreditBalance: number,
    paymentTermsDays: number,        // e.g., 30 days
    interestRate: number             // Late payment interest (optional)
  },
  creditTransactions: [
    {
      transactionId: string,
      date: timestamp,
      type: "sale" | "payment" | "adjustment",
      amount: number,
      description: string,
      balanceAfter: number
    }
  ],
  purchaseHistory: {
    totalPurchases: number,          // Lifetime value
    totalOrders: number,
    averageOrderValue: number,
    firstPurchase: timestamp,
    lastPurchase: timestamp
  },
  loyaltyPoints: number,
  notes: string,
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

#### Subcollection: `businesses/{businessId}/staff/{staffId}`
```javascript
{
  staffId: string,
  businessId: string,
  userId: string,                    // Link to users collection (optional)
  name: string,
  phone: string,
  email: string,
  pin: string,                       // 4-6 digit PIN (hashed)
  role: "owner" | "manager" | "cashier" | "custom",
  permissions: {
    canMakeSales: boolean,
    canViewInventory: boolean,
    canEditInventory: boolean,
    canViewReports: boolean,
    canManageCustomers: boolean,
    canManageStaff: boolean,
    canAccessSettings: boolean,
    canProcessRefunds: boolean,
    canGiveDiscounts: boolean,
    maxDiscountPercent: number
  },
  attendance: [
    {
      date: timestamp,
      clockIn: timestamp,
      clockOut: timestamp,
      hoursWorked: number
    }
  ],
  salesPerformance: {
    totalSales: number,
    totalRevenue: number,
    averageSaleValue: number
  },
  commission: {
    enabled: boolean,
    rate: number,                    // Percentage
    totalEarned: number
  },
  isActive: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

#### Subcollection: `businesses/{businessId}/expenses/{expenseId}`
```javascript
{
  expenseId: string,
  businessId: string,
  date: timestamp,
  category: "rent" | "salary" | "utilities" | "purchase" | "marketing" | "other",
  subcategory: string,               // e.g., "Facebook Ads" under "Marketing"
  amount: number,
  paymentMethod: "cash" | "bank" | "card",
  description: string,
  attachmentUrl: string,             // Receipt photo in Cloud Storage
  vendor: string,
  recurring: boolean,
  recurringPeriod: "daily" | "weekly" | "monthly" | "yearly",
  createdBy: userId,
  approvedBy: userId,
  status: "pending" | "approved" | "rejected",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

#### Subcollection: `businesses/{businessId}/documents/{documentId}`
```javascript
{
  documentId: string,
  businessId: string,
  documentType: "delivery_challan" | "quotation" | "purchase_order",
  number: string,                    // DC-2025-0001
  date: timestamp,
  items: [/* same structure as sale items */],
  sender: {
    businessName: string,
    address: string,
    gstin: string,
    phone: string
  },
  recipient: {
    name: string,
    address: string,
    gstin: string,
    phone: string
  },
  purpose: "job_work" | "branch_transfer" | "sample" | "approval",
  transportDetails: {
    vehicleNumber: string,
    driverName: string,
    driverPhone: string,
    transporterName: string
  },
  returnExpected: boolean,
  returnDueDate: timestamp,
  status: "dispatched" | "in_transit" | "delivered" | "returned" | "converted_to_invoice",
  convertedToSaleId: string,
  notes: string,
  createdBy: userId,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

---

### 2.4 API Specifications (Cloud Functions)

#### Function 1: `generateInvoiceNumber`
**Trigger**: Called before creating a sale
**Purpose**: Generate sequential invoice number per financial year

**Input**:
```javascript
{
  businessId: string,
  date: timestamp
}
```

**Logic**:
1. Get business invoice settings (prefix, financial year start)
2. Determine current financial year based on date
3. Get `nextInvoiceNumber` from business document
4. Generate invoice: `{prefix}{FY}-{number}`
   - Example: "INV-2025-0001"
5. Increment `nextInvoiceNumber` in business document
6. Return invoice number

**Output**:
```javascript
{
  invoiceNumber: "INV-2025-0001",
  financialYear: "2024-25"
}
```

---

#### Function 2: `processPayment`
**Trigger**: HTTP POST from frontend when customer pays via UPI/Card
**Purpose**: Process payment through gateway (Razorpay/Stripe)

**Input**:
```javascript
{
  businessId: string,
  saleId: string,
  amount: number,
  currency: "INR" | "USD" | etc,
  method: "card" | "upi",
  paymentDetails: {
    cardToken: string | null,      // For card payments
    upiId: string | null           // For UPI payments
  }
}
```

**Logic**:
1. Validate sale exists and amount matches
2. Call payment gateway API (Razorpay/Stripe)
3. If success:
   - Update sale document: `payment.status = "paid"`
   - Send receipt to customer
4. If failure:
   - Return error to frontend

**Output**:
```javascript
{
  success: boolean,
  paymentId: string,
  status: "success" | "failed",
  errorMessage: string | null
}
```

---

#### Function 3: `sendReceiptEmail`
**Trigger**: Called after sale completion
**Purpose**: Send email receipt to customer

**Input**:
```javascript
{
  businessId: string,
  saleId: string,
  customerEmail: string
}
```

**Logic**:
1. Fetch sale details from Firestore
2. Fetch business details (name, logo, address)
3. Generate HTML email using template
4. Send via SendGrid/SES
5. Update sale document: `receiptSent.email = true`

**Output**:
```javascript
{
  success: boolean,
  emailId: string
}
```

---

#### Function 4: `sendPaymentReminder`
**Trigger**: Scheduled (daily at 9 AM) or manual trigger
**Purpose**: Send SMS/WhatsApp reminders for credit payments due

**Input** (from scheduled job):
```javascript
{
  businessId: string,
  daysBeforeDue: number            // e.g., 3 days before due date
}
```

**Logic**:
1. Query all sales where:
   - `payment.method = "credit"`
   - `creditSale.status = "pending" or "partially_paid"`
   - `creditSale.dueDate` is in next X days
2. For each sale:
   - Get customer phone number
   - Generate reminder message:
     - "Reminder: Payment of $X for Invoice INV-2025-0001 is due on [date]. Thank you!"
   - Send via Twilio/Gupshup
   - Log reminder sent

**Output**:
```javascript
{
  remindersSent: number,
  errors: [
    {
      saleId: string,
      errorMessage: string
    }
  ]
}
```

---

#### Function 5: `dailySalesSummary`
**Trigger**: Scheduled (daily at 11 PM)
**Purpose**: Send daily sales report to business owner

**Input** (from scheduled job):
```javascript
{
  businessId: string,
  date: timestamp
}
```

**Logic**:
1. Query all sales for the date
2. Calculate:
   - Total sales count
   - Total revenue
   - Total profit
   - Top-selling products (top 5)
   - Payment method breakdown
3. Generate email/SMS with summary
4. Send to business owner

**Output**:
```javascript
{
  success: boolean,
  summary: {
    date: string,
    totalSales: number,
    totalRevenue: number,
    totalProfit: number,
    topProducts: [
      { name: string, quantity: number, revenue: number }
    ]
  }
}
```

---

#### Function 6: `lowStockAlert`
**Trigger**: Scheduled (daily at 8 AM) or triggered when stock hits threshold
**Purpose**: Alert owner when products are low on stock

**Input**:
```javascript
{
  businessId: string
}
```

**Logic**:
1. Query all products where:
   - `stock.currentStock <= stock.lowStockThreshold`
   - `stock.trackInventory = true`
   - `isActive = true`
2. If any found:
   - Generate alert message listing all low-stock products
   - Send email/SMS to owner
   - Send push notification

**Output**:
```javascript
{
  success: boolean,
  lowStockProducts: [
    { name: string, currentStock: number, threshold: number }
  ]
}
```

---

#### Function 7: `exportGSTReport`
**Trigger**: HTTP POST from frontend when owner clicks "Export GST Report"
**Purpose**: Generate GSTR-1 and GSTR-3B reports for GST filing (India)

**Input**:
```javascript
{
  businessId: string,
  month: number,                   // 1-12
  year: number                     // e.g., 2025
}
```

**Logic**:
1. Query all sales for the month
2. Group by:
   - B2B sales (with customer GSTIN)
   - B2C sales
   - Tax rate (5%, 12%, 18%, 28%)
   - HSN code
3. Calculate:
   - Taxable value
   - CGST, SGST, IGST amounts
4. Generate Excel file with GSTR-1 format
5. Upload to Cloud Storage
6. Return download URL

**Output**:
```javascript
{
  success: boolean,
  reportUrl: string,               // Download link
  summary: {
    totalSales: number,
    totalCGST: number,
    totalSGST: number,
    totalIGST: number,
    b2bSales: number,
    b2cSales: number
  }
}
```

---

### 2.5 File Structure (React PWA)

```
zobaze-pos-pwa/
│
├── public/
│   ├── index.html
│   ├── manifest.json              # PWA manifest
│   ├── robots.txt
│   ├── favicon.ico
│   ├── icons/                     # PWA app icons (192x192, 512x512)
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── maskable-icon-512.png
│   └── offline.html               # Fallback page when offline
│
├── src/
│   ├── index.tsx                  # Entry point
│   ├── App.tsx                    # Root component
│   ├── service-worker.ts          # Service Worker (Workbox)
│   ├── serviceWorkerRegistration.ts
│   │
│   ├── components/                # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Loader.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── BottomNav.tsx     # Mobile bottom navigation
│   │   │   └── Layout.tsx
│   │   ├── sales/
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── CategoryList.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── CartItem.tsx
│   │   │   ├── ModifierModal.tsx
│   │   │   ├── PaymentModal.tsx
│   │   │   └── Receipt.tsx
│   │   ├── inventory/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── BarcodeScanner.tsx
│   │   │   ├── StockAdjustment.tsx
│   │   │   └── VariantManager.tsx
│   │   ├── customers/
│   │   │   ├── CustomerList.tsx
│   │   │   ├── CustomerForm.tsx
│   │   │   ├── CreditLedger.tsx
│   │   │   └── PaymentCollection.tsx
│   │   ├── reports/
│   │   │   ├── SalesChart.tsx
│   │   │   ├── ReportCard.tsx
│   │   │   ├── DateRangePicker.tsx
│   │   │   └── ExportButton.tsx
│   │   └── settings/
│   │       ├── BusinessProfile.tsx
│   │       ├── TaxSettings.tsx
│   │       ├── PrinterSetup.tsx
│   │       ├── StaffManager.tsx
│   │       └── LogoCreator.tsx
│   │
│   ├── pages/                     # Page components (routes)
│   │   ├── Dashboard.tsx
│   │   ├── Sales.tsx
│   │   ├── Inventory.tsx
│   │   ├── Customers.tsx
│   │   ├── Reports.tsx
│   │   ├── Settings.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── Onboarding.tsx
│   │
│   ├── redux/                     # State management
│   │   ├── store.ts               # Redux store
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── businessSlice.ts
│   │   │   ├── productsSlice.ts
│   │   │   ├── cartSlice.ts
│   │   │   ├── customersSlice.ts
│   │   │   ├── salesSlice.ts
│   │   │   ├── staffSlice.ts
│   │   │   └── settingsSlice.ts
│   │   └── middleware/
│   │       ├── syncMiddleware.ts  # Offline sync logic
│   │       └── loggerMiddleware.ts
│   │
│   ├── services/                  # API and Firebase services
│   │   ├── firebase.ts            # Firebase config
│   │   ├── firestore.ts           # Firestore operations
│   │   ├── auth.ts                # Firebase Auth
│   │   ├── storage.ts             # Cloud Storage
│   │   ├── functions.ts           # Cloud Functions calls
│   │   ├── indexeddb.ts           # IndexedDB operations (Dexie)
│   │   ├── sync.ts                # Offline sync logic
│   │   ├── printer.ts             # Bluetooth/USB printer
│   │   ├── barcode.ts             # Barcode scanning
│   │   ├── payment.ts             # Payment gateway integration
│   │   └── notifications.ts       # Push notifications (FCM)
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useFirestore.ts
│   │   ├── useOffline.ts
│   │   ├── useCart.ts
│   │   ├── usePrinter.ts
│   │   ├── useBarcodeScanner.ts
│   │   └── useLocalStorage.ts
│   │
│   ├── utils/                     # Utility functions
│   │   ├── currency.ts            # Format currency
│   │   ├── date.ts                # Date formatting
│   │   ├── invoice.ts             # Generate invoice number
│   │   ├── tax.ts                 # Tax calculations (GST/VAT)
│   │   ├── validation.ts          # Form validation
│   │   ├── export.ts              # Export to Excel/PDF
│   │   └── constants.ts           # App constants
│   │
│   ├── types/                     # TypeScript types
│   │   ├── business.types.ts
│   │   ├── product.types.ts
│   │   ├── sale.types.ts
│   │   ├── customer.types.ts
│   │   ├── staff.types.ts
│   │   └── common.types.ts
│   │
│   ├── styles/                    # Global styles
│   │   ├── globals.css
│   │   ├── theme.ts               # MUI theme or Tailwind config
│   │   └── variables.css
│   │
│   └── assets/                    # Static assets
│       ├── images/
│       ├── icons/
│       └── sounds/                # Beep sounds for barcode scan, etc.
│
├── functions/                     # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts
│   │   ├── invoice.ts
│   │   ├── payment.ts
│   │   ├── email.ts
│   │   ├── sms.ts
│   │   ├── reports.ts
│   │   └── scheduled.ts
│   ├── package.json
│   └── tsconfig.json
│
├── .env                           # Environment variables
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.js             # If using Tailwind
├── firebase.json                  # Firebase config
├── firestore.rules                # Firestore security rules
├── firestore.indexes.json         # Firestore indexes
├── storage.rules                  # Cloud Storage security rules
└── README.md
```

---

### 2.6 PWA Configuration

#### `public/manifest.json`
```json
{
  "name": "Zobaze POS - Point of Sale",
  "short_name": "Zobaze POS",
  "description": "Offline-first Point of Sale system for retail, restaurants, and services",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFFFFF",
  "theme_color": "#4CAF50",
  "orientation": "any",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/maskable-icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/sales-screen.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/desktop-view.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ],
  "categories": ["business", "finance", "productivity"],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "files": [
        {
          "name": "file",
          "accept": ["image/*", "application/pdf"]
        }
      ]
    }
  },
  "shortcuts": [
    {
      "name": "New Sale",
      "short_name": "Sale",
      "description": "Start a new sale",
      "url": "/sales",
      "icons": [{ "src": "/icons/sale-icon.png", "sizes": "96x96" }]
    },
    {
      "name": "Reports",
      "short_name": "Reports",
      "description": "View sales reports",
      "url": "/reports",
      "icons": [{ "src": "/icons/reports-icon.png", "sizes": "96x96" }]
    }
  ]
}
```

---

#### `src/service-worker.ts` (Workbox)
```typescript
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// Precache all assets generated by build process
precacheAndRoute(self.__WB_MANIFEST);

// App Shell (index.html) - Cache First
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }: { request: Request; url: URL }) => {
    if (request.mode !== 'navigate') return false;
    if (url.pathname.startsWith('/_')) return false;
    if (url.pathname.match(fileExtensionRegexp)) return false;
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Static Assets (JS, CSS, Images) - Cache First
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Product Images - Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      }),
    ],
  })
);

// Firebase Firestore API - Network First (with offline fallback)
registerRoute(
  ({ url }) =>
    url.origin === 'https://firestore.googleapis.com' ||
    url.hostname.includes('firebaseio.com'),
  new NetworkFirst({
    cacheName: 'firestore-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  })
);

// Background Sync for Offline Sales
const bgSyncPlugin = new BackgroundSyncPlugin('offlineSalesQueue', {
  maxRetentionTime: 7 * 24 * 60, // Retry for up to 7 days (in minutes)
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
        console.log('Offline sale synced:', entry.request.url);
      } catch (error) {
        console.error('Sync failed, will retry:', error);
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  },
});

// POST requests to /api/sales - Background Sync
registerRoute(
  ({ url, request }) =>
    url.pathname.startsWith('/api/sales') && request.method === 'POST',
  new NetworkFirst({
    cacheName: 'sales-api',
    plugins: [bgSyncPlugin],
  }),
  'POST'
);

// Skip waiting and activate immediately
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push Notification Handler
self.addEventListener('push', (event: PushEvent) => {
  const data = event.data?.json() || {};
  const title = data.title || 'Zobaze POS';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: data.url || '/',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification Click Handler
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});
```

---

### 2.7 Security & Permissions

#### Firestore Security Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(businessId) {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/businesses/$(businessId)).data.ownerId == request.auth.uid;
    }

    function isStaffMember(businessId) {
      return isAuthenticated() &&
             exists(/databases/$(database)/documents/businesses/$(businessId)/staff/$(request.auth.uid));
    }

    function hasPermission(businessId, permission) {
      let staff = get(/databases/$(database)/documents/businesses/$(businessId)/staff/$(request.auth.uid)).data;
      return staff[permission] == true;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && request.auth.uid == userId;
      allow delete: if false; // Users cannot delete their own accounts
    }

    // Businesses collection
    match /businesses/{businessId} {
      allow read: if isAuthenticated() && (isOwner(businessId) || isStaffMember(businessId));
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && isOwner(businessId);
      allow delete: if isAuthenticated() && isOwner(businessId);

      // Products subcollection
      match /products/{productId} {
        allow read: if isAuthenticated() && (isOwner(businessId) || isStaffMember(businessId));
        allow create: if isAuthenticated() && (isOwner(businessId) || hasPermission(businessId, 'canEditInventory'));
        allow update: if isAuthenticated() && (isOwner(businessId) || hasPermission(businessId, 'canEditInventory'));
        allow delete: if isAuthenticated() && (isOwner(businessId) || hasPermission(businessId, 'canEditInventory'));
      }

      // Sales subcollection
      match /sales/{saleId} {
        allow read: if isAuthenticated() && (isOwner(businessId) || isStaffMember(businessId));
        allow create: if isAuthenticated() && (isOwner(businessId) || hasPermission(businessId, 'canMakeSales'));
        allow update: if isAuthenticated() && (isOwner(businessId) || hasPermission(businessId, 'canProcessRefunds'));
        allow delete: if false; // Sales cannot be deleted, only refunded
      }

      // Customers subcollection
      match /customers/{customerId} {
        allow read: if isAuthenticated() && (isOwner(businessId) || isStaffMember(businessId));
        allow create: if isAuthenticated() && (isOwner(businessId) || hasPermission(businessId, 'canManageCustomers'));
        allow update: if isAuthenticated() && (isOwner(businessId) || hasPermission(businessId, 'canManageCustomers'));
        allow delete: if isAuthenticated() && isOwner(businessId);
      }

      // Staff subcollection
      match /staff/{staffId} {
        allow read: if isAuthenticated() && (isOwner(businessId) || isStaffMember(businessId));
        allow create: if isAuthenticated() && isOwner(businessId);
        allow update: if isAuthenticated() && isOwner(businessId);
        allow delete: if isAuthenticated() && isOwner(businessId);
      }

      // Modifiers subcollection
      match /modifiers/{modifierId} {
        allow read: if isAuthenticated() && (isOwner(businessId) || isStaffMember(businessId));
        allow write: if isAuthenticated() && (isOwner(businessId) || hasPermission(businessId, 'canEditInventory'));
      }

      // Expenses subcollection
      match /expenses/{expenseId} {
        allow read: if isAuthenticated() && (isOwner(businessId) || hasPermission(businessId, 'canViewReports'));
        allow create: if isAuthenticated() && (isOwner(businessId) || hasPermission(businessId, 'canAccessSettings'));
        allow update: if isAuthenticated() && isOwner(businessId);
        allow delete: if isAuthenticated() && isOwner(businessId);
      }

      // Documents subcollection (delivery challan, etc.)
      match /documents/{documentId} {
        allow read: if isAuthenticated() && (isOwner(businessId) || isStaffMember(businessId));
        allow write: if isAuthenticated() && (isOwner(businessId) || hasPermission(businessId, 'canMakeSales'));
      }
    }
  }
}
```

---

#### Cloud Storage Security Rules (`storage.rules`)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Product images
    match /products/{businessId}/{imageId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                     request.resource.size < 5 * 1024 * 1024 && // Max 5MB
                     request.resource.contentType.matches('image/.*');
    }

    // Business logos
    match /logos/{businessId}/{logoId} {
      allow read: if true; // Public (shown on receipts)
      allow write: if request.auth != null &&
                     request.resource.size < 2 * 1024 * 1024 && // Max 2MB
                     request.resource.contentType.matches('image/.*');
    }

    // Receipts
    match /receipts/{businessId}/{receiptId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                     request.resource.size < 1 * 1024 * 1024; // Max 1MB
    }

    // Backup exports
    match /backups/{businessId}/{backupId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                     request.resource.size < 50 * 1024 * 1024; // Max 50MB
    }
  }
}
```

---

### 2.8 Offline Sync Strategy

#### IndexedDB Schema (Dexie.js)
```typescript
import Dexie, { Table } from 'dexie';

export interface Product {
  id: string;
  businessId: string;
  name: string;
  sku: string;
  barcode: string;
  price: number;
  stock: number;
  // ... other fields
  lastSynced: Date;
}

export interface Sale {
  id: string;
  businessId: string;
  invoiceNumber: string;
  items: any[];
  total: number;
  // ... other fields
  syncStatus: 'synced' | 'pending';
  createdAt: Date;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  // ... other fields
  lastSynced: Date;
}

export class POSDatabase extends Dexie {
  products!: Table<Product>;
  sales!: Table<Sale>;
  customers!: Table<Customer>;
  settings!: Table<any>;

  constructor() {
    super('POSDatabase');
    this.version(1).stores({
      products: 'id, businessId, sku, barcode, [businessId+sku]',
      sales: 'id, businessId, syncStatus, createdAt',
      customers: 'id, businessId, phone, [businessId+phone]',
      settings: 'key'
    });
  }
}

export const db = new POSDatabase();
```

#### Sync Logic
```typescript
// services/sync.ts
import { db } from './indexeddb';
import { firestore } from './firebase';
import { collection, getDocs, doc, setDoc, query, where } from 'firebase/firestore';

export class SyncService {
  private syncInProgress = false;

  /**
   * Sync products from Firestore to IndexedDB
   */
  async syncProductsDown(businessId: string): Promise<void> {
    try {
      const productsRef = collection(firestore, `businesses/${businessId}/products`);
      const snapshot = await getDocs(productsRef);

      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastSynced: new Date()
      }));

      // Bulk insert/update to IndexedDB
      await db.products.bulkPut(products);

      console.log(`Synced ${products.length} products down`);
    } catch (error) {
      console.error('Error syncing products down:', error);
      throw error;
    }
  }

  /**
   * Sync pending sales from IndexedDB to Firestore
   */
  async syncSalesUp(businessId: string): Promise<void> {
    try {
      if (this.syncInProgress) {
        console.log('Sync already in progress, skipping...');
        return;
      }

      this.syncInProgress = true;

      // Get all pending sales
      const pendingSales = await db.sales
        .where('syncStatus')
        .equals('pending')
        .toArray();

      if (pendingSales.length === 0) {
        console.log('No pending sales to sync');
        this.syncInProgress = false;
        return;
      }

      console.log(`Syncing ${pendingSales.length} pending sales...`);

      // Sync each sale
      for (const sale of pendingSales) {
        try {
          // Upload to Firestore
          const saleRef = doc(firestore, `businesses/${businessId}/sales/${sale.id}`);
          await setDoc(saleRef, {
            ...sale,
            syncStatus: 'synced',
            syncedAt: new Date()
          });

          // Update local IndexedDB
          await db.sales.update(sale.id, {
            syncStatus: 'synced',
            syncedAt: new Date()
          });

          console.log(`Sale ${sale.id} synced successfully`);
        } catch (error) {
          console.error(`Failed to sync sale ${sale.id}:`, error);
          // Continue with next sale instead of stopping
        }
      }

      this.syncInProgress = false;
      console.log('Sales sync complete');
    } catch (error) {
      this.syncInProgress = false;
      console.error('Error syncing sales up:', error);
      throw error;
    }
  }

  /**
   * Full sync: products down, sales up
   */
  async fullSync(businessId: string): Promise<void> {
    try {
      await this.syncProductsDown(businessId);
      await this.syncSalesUp(businessId);

      // Update last sync timestamp
      await db.settings.put({
        key: 'lastSync',
        value: new Date().toISOString()
      });

      console.log('Full sync complete');
    } catch (error) {
      console.error('Full sync failed:', error);
      throw error;
    }
  }

  /**
   * Auto-sync on network reconnection
   */
  setupAutoSync(businessId: string): void {
    window.addEventListener('online', async () => {
      console.log('Network reconnected, starting auto-sync...');
      try {
        await this.fullSync(businessId);
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    });
  }
}

export const syncService = new SyncService();
```

---

### 2.9 Testing Strategy

#### Unit Tests:
- **Tools**: Jest, React Testing Library
- **Coverage**: All utility functions, Redux reducers, hooks
- **Examples**:
  - Test tax calculation (GST CGST/SGST split)
  - Test invoice number generation
  - Test discount calculations
  - Test stock reduction after sale

#### Integration Tests:
- **Tools**: Cypress or Playwright
- **Coverage**: Full user flows
- **Examples**:
  - Complete a sale from product selection to receipt
  - Add product with modifiers
  - Process credit sale and payment collection
  - Offline sale and sync

#### E2E Tests:
- **Tools**: Cypress
- **Coverage**: Critical business flows
- **Examples**:
  - New user onboarding (signup → business setup → first sale)
  - Daily operations (login → 10 sales → reports → logout)
  - Multi-device sync (make sale on tablet, view on desktop)

#### Performance Tests:
- **Tools**: Lighthouse, WebPageTest
- **Metrics**:
  - First Contentful Paint < 2s
  - Time to Interactive < 3s
  - Largest Contentful Paint < 2.5s
  - Cumulative Layout Shift < 0.1
  - Total Blocking Time < 300ms

#### Offline Tests:
- **Scenarios**:
  - Make sale while offline, go online, verify sync
  - Offline for 7 days, verify data integrity
  - Conflict resolution (two devices edit same product)

---

### 2.10 Deployment

#### Build & Deploy Process:

1. **Build PWA**:
```bash
npm run build
# Generates optimized production build in /build folder
```

2. **Deploy to Firebase Hosting**:
```bash
firebase deploy --only hosting
# Deploys to Firebase CDN
# URL: https://yourpos.web.app or custom domain
```

3. **Deploy Cloud Functions**:
```bash
firebase deploy --only functions
# Deploys serverless functions
```

4. **Deploy Firestore Rules**:
```bash
firebase deploy --only firestore:rules
```

#### CI/CD Pipeline (GitHub Actions):

```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build PWA
        run: npm run build

      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only hosting,functions
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

---

## Part 3: LAUNCH PLAN

### 3.1 Development Phases

#### Phase 1: MVP (Weeks 1-8)
**Goal**: Core POS functionality with offline support

**Features**:
- User authentication (email/password)
- Business setup
- Product management (add/edit/delete)
- Sales screen with cart
- Basic receipt (print, email)
- Offline mode with IndexedDB
- Background sync
- Basic reports (daily sales)

**Team**: 2 developers + 1 designer
**Deliverable**: Working PWA installable on mobile/desktop

---

#### Phase 2: Market-Fit Features (Weeks 9-14)
**Goal**: Add features critical for target markets

**Features**:
- **Modifiers system** (restaurants)
- **Credit sales management**
- **GST compliance** (India market)
- Barcode scanning
- Customer management
- Staff management with permissions
- Advanced reports (inventory, profit)
- Business logo creator

**Team**: 2 developers + 1 designer
**Deliverable**: Feature-complete for Indian small business market

---

#### Phase 3: Professional Features (Weeks 15-20)
**Goal**: Enterprise-grade features

**Features**:
- Delivery challan
- Expense tracking
- Purchase orders
- Tally-like accounting (P&L, Balance Sheet)
- Financial year closing
- Multi-currency support
- Payment gateway integration (Razorpay, Stripe)
- SMS/WhatsApp receipts
- Email receipts
- Push notifications

**Team**: 3 developers + 1 designer
**Deliverable**: Production-ready for global markets

---

#### Phase 4: Scale & Optimize (Weeks 21-24)
**Goal**: Performance optimization and scale testing

**Features**:
- Performance optimization (code splitting, lazy loading)
- PWA optimization (Service Worker caching strategies)
- Database indexing and query optimization
- Load testing (1000+ concurrent users)
- Security audit
- Accessibility (WCAG AA compliance)
- Multi-language support (Hindi, Spanish, etc.)

**Team**: 2 developers + 1 DevOps
**Deliverable**: Scalable, performant, secure PWA

---

### 3.2 Success Metrics (12-Month Targets)

#### User Acquisition:
- Month 1-3: 1,000 users (beta launch)
- Month 4-6: 10,000 users (public launch)
- Month 7-9: 50,000 users (growth phase)
- Month 10-12: 100,000 users (scale phase)

#### Revenue:
- Free-to-Paid Conversion: 5-10%
- Month 6: $5,000 MRR
- Month 12: $50,000 MRR
- Target: 5,000 paying users @ $10/month average

#### Engagement:
- DAU/MAU Ratio: 40%+
- 7-day retention: 70%+
- 30-day retention: 50%+
- Average session time: 15+ minutes

#### Technical:
- 99.9% uptime
- <2s page load time (p95)
- <3s time to interactive (p95)
- 99%+ offline sync success rate

---

### 3.3 Risks & Mitigation

#### Risk 1: Browser Compatibility
**Issue**: PWA features (Service Worker, Web Bluetooth) not supported on all browsers
**Impact**: Limited functionality on Safari (iOS), older browsers
**Mitigation**:
- Polyfills for missing features
- Graceful degradation (fall back to basic mode if Service Worker unavailable)
- Clear messaging: "For best experience, use Chrome/Edge"
- Prioritize Android (Chrome) market initially

#### Risk 2: Offline Sync Conflicts
**Issue**: Two devices edit same data offline, conflict on sync
**Impact**: Data loss or inconsistency
**Mitigation**:
- Implement Last Write Wins (LWW) with timestamps
- Show conflict resolution UI to user if critical data
- Log all conflicts for manual review
- Test extensively with multi-device scenarios

#### Risk 3: Thermal Printer Compatibility
**Issue**: Web Bluetooth API doesn't work with all printers
**Impact**: User can't print receipts
**Mitigation**:
- Provide list of tested compatible printers
- Offer alternatives (email, SMS, PDF download)
- Partner with printer manufacturers for certification
- Provide USB/network printing as backup

#### Risk 4: Payment Gateway Integration
**Issue**: Payment failures, webhook issues, refunds
**Impact**: Lost revenue, customer dissatisfaction
**Mitigation**:
- Use well-tested SDKs (Razorpay, Stripe)
- Implement retry logic for failures
- Manual reconciliation reports
- 24/7 payment monitoring

#### Risk 5: Data Loss (Offline)
**Issue**: User clears browser cache, loses local data
**Impact**: Loss of offline sales, inventory data
**Mitigation**:
- Warn user before cache clear
- Auto-sync every 30 minutes when online
- Daily cloud backup
- Export data feature

---

### 3.4 Cost Estimate

#### Development Costs:
- Phase 1 (8 weeks): $40,000 (2 devs @ $50/hr × 40 hrs/week × 8 weeks)
- Phase 2 (6 weeks): $30,000
- Phase 3 (6 weeks): $45,000 (3 devs)
- Phase 4 (4 weeks): $20,000
- **Total Development**: $135,000

#### Infrastructure Costs (Monthly):
- Firebase (Blaze Plan):
  - Firestore: $200 (50GB storage, 10M reads/day)
  - Hosting: $50
  - Cloud Functions: $100
  - Cloud Storage: $50
  - Authentication: Free (up to 50K MAU)
- Razorpay/Stripe: 2% per transaction (revenue-based)
- Twilio/Gupshup (SMS/WhatsApp): $500
- SendGrid (Email): $100
- Domain & SSL: $20
- Monitoring (Sentry, LogRocket): $100
- **Total Infrastructure**: ~$1,120/month at scale

#### Marketing Costs (12 months):
- Google Ads: $10,000
- Content Marketing: $5,000
- SEO: $3,000
- Social Media: $2,000
- **Total Marketing**: $20,000

#### **Grand Total (Year 1)**: $135,000 + $13,440 + $20,000 = **$168,440**

---

### 3.5 Go-to-Market Strategy

#### Target Markets (Priority Order):

1. **India** (Primary):
   - 50M+ small businesses
   - High mobile adoption (Android)
   - GST compliance mandatory
   - Languages: English, Hindi, Tamil, Telugu
   - Payment: UPI dominant

2. **Southeast Asia** (Secondary):
   - Indonesia, Philippines, Thailand, Vietnam
   - Growing SMB market
   - Mobile-first population
   - Price-sensitive

3. **Latin America** (Tertiary):
   - Mexico, Brazil, Colombia
   - Large informal retail sector
   - Languages: Spanish, Portuguese

4. **Global** (Long-term):
   - English-speaking markets (US, UK, Canada, Australia)
   - Higher price point ($25-50/month)

#### Marketing Channels:

1. **SEO & Content Marketing**:
   - Blog: "Best POS for Small Retail", "How to Use POS", "GST Billing Guide"
   - YouTube: Tutorial videos (Hindi + English)
   - Rank for keywords: "free POS", "GST billing app", "offline POS"

2. **Google Ads**:
   - Target: "POS software", "billing app", "inventory management"
   - Geo: India cities (Mumbai, Delhi, Bengaluru, Hyderabad)
   - Budget: $500/month initially

3. **Social Media**:
   - Facebook/Instagram: Small business owner groups
   - WhatsApp: Business communities
   - LinkedIn: B2B connections

4. **Partnerships**:
   - Thermal printer manufacturers (bundle offer)
   - Accounting software (Tally, Zoho Books) integrations
   - Small business associations

5. **Referral Program**:
   - Give 1 month free premium for each referral
   - Referee also gets 1 month free

---

## Conclusion

This PWA-based Zobaze POS clone offers several advantages over the original native Android app:

### Key Differentiators:
1. **Cross-Platform**: Works on Android, iOS, Desktop from one codebase
2. **No App Store Dependency**: Instant updates, no 30% fee
3. **Lower Development Cost**: Single codebase vs. Android + iOS + Web
4. **Better SEO**: Web-based, discoverable via search engines
5. **Easy Distribution**: Share a URL vs. app store download

### Technical Highlights:
- **Offline-First Architecture**: IndexedDB + Service Worker + Background Sync
- **Modern Tech Stack**: React 18, TypeScript, Firebase, Workbox
- **Scalable**: Firebase handles millions of users
- **Secure**: Firestore rules, authentication, encrypted data

### Business Value:
- **Fast Time-to-Market**: 20-24 weeks to production
- **Lower TCO**: $168K Year 1 vs. $250K+ for native apps
- **Global Reach**: Deploy once, available worldwide
- **Revenue Potential**: $50K MRR at 5,000 premium users

### Next Steps:
1. Review and approve PRD
2. Finalize technology stack choices
3. Set up development environment
4. Start Phase 1 development
5. Beta launch in 8 weeks

---

**Document End**

**Prepared By**: [Your Name]
**Date**: 2025-01-21
**Version**: 3.0 - PWA Architecture
**Status**: Ready for Development



