# Zobaze POS - Complete Development Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [System Architecture](#system-architecture)
3. [API Documentation](#api-documentation)
4. [Core Modules](#core-modules)
5. [CRUD Operations](#crud-operations)
6. [User Interface Components](#user-interface-components)
7. [Database Schema](#database-schema)
8. [Integration Guide](#integration-guide)
9. [Best Practices](#best-practices)

---

## 1. Introduction

### About Zobaze POS
Zobaze POS is a comprehensive Point of Sale (POS) system designed for small and medium-sized businesses. It provides a mobile-first solution for managing sales, inventory, staff, customers, and expenses.

### Key Features
- **Offline Functionality**: Works 100% offline with automatic cloud sync
- **Multi-device Support**: Android smartphones and tablets
- **Real-time Inventory Management**: Track stock levels with alerts
- **Staff Management**: Role-based access control
- **Online Store**: Shopfront feature for e-commerce
- **Receipt Printing**: Supports thermal printers (58mm, 80mm) and A4 paper
- **Reports & Analytics**: Comprehensive business insights

### Technical Stack
- **Platform**: Android (Mobile App)
- **Backend**: RESTful API
- **Database**: Cloud-based with local storage
- **Sync**: Automatic cloud synchronization
- **Security**: 256-bit SSL encryption

---

## 2. System Architecture

### Application Layers

```
┌─────────────────────────────────────┐
│     Presentation Layer (UI/UX)     │
│  - Activities, Fragments, Views     │
│  - Material Design Components       │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Business Logic Layer           │
│  - ViewModels, Use Cases            │
│  - Data Validation                  │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│       Data Layer                    │
│  - Repository Pattern               │
│  - Local DB + Cloud Sync            │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      API & Network Layer            │
│  - Retrofit/OkHttp                  │
│  - WebSocket for real-time updates  │
└─────────────────────────────────────┘
```

### Data Flow
1. **User Action** → UI Component triggers event
2. **ViewModel** → Processes business logic
3. **Repository** → Manages data sources (local/remote)
4. **API Service** → Communicates with backend
5. **Database** → Stores data locally
6. **Sync Service** → Syncs with cloud when online

---

## 3. API Documentation

### Base Configuration

```
Base URL: https://api.zobaze.com/v1/
API Documentation: https://apidocs.zobaze.com/
```

### Authentication

#### Request API Access
- Apply for early access: https://forms.gle/upZ9h2yMTXy7stHq9
- Authentication method: API Key (Bearer Token)

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Available API Endpoints

#### StoreFront API

##### 1. Get All Businesses
```http
GET /storefront-api/getAllBusiness
Authorization: Bearer {api_key}
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "businessId": "string",
      "businessName": "string",
      "category": "string",
      "isActive": boolean
    }
  ]
}
```

##### 2. Get Business Details
```http
GET /storefront-api/getBusinessDetail?businessId={id}
Authorization: Bearer {api_key}
```

**Response:**
```json
{
  "businessId": "string",
  "businessName": "string",
  "address": "string",
  "phone": "string",
  "email": "string",
  "settings": {
    "currency": "string",
    "taxRate": number,
    "timezone": "string"
  }
}
```

##### 3. Get Business Items (Public)
```http
GET /storefront-api/getBusinessItem?businessId={id}
```

**Query Parameters:**
- `businessId` (required): Business identifier
- `category` (optional): Filter by category
- `inStock` (optional): Filter available items only

**Response:**
```json
{
  "items": [
    {
      "itemId": "string",
      "name": "string",
      "description": "string",
      "price": number,
      "category": "string",
      "stock": number,
      "imageUrl": "string",
      "sku": "string",
      "barcode": "string",
      "isActive": boolean
    }
  ],
  "total": number
}
```

##### 4. Post Order
```http
POST /storefront-api/postOrder
Authorization: Bearer {api_key}
Content-Type: application/json
```

**Request Body:**
```json
{
  "businessId": "string",
  "customerId": "string",
  "items": [
    {
      "itemId": "string",
      "quantity": number,
      "price": number,
      "discount": number
    }
  ],
  "orderType": "dine-in|takeaway|delivery",
  "paymentMethod": "cash|card|upi",
  "subtotal": number,
  "tax": number,
  "discount": number,
  "total": number,
  "notes": "string"
}
```

**Response:**
```json
{
  "status": "success",
  "orderId": "string",
  "orderNumber": "string",
  "timestamp": "ISO8601",
  "message": "Order placed successfully"
}
```

##### 5. Get Orders
```http
GET /storefront-api/getOrders?businessId={id}
Authorization: Bearer {api_key}
```

**Query Parameters:**
- `businessId` (required)
- `startDate` (optional): ISO8601 format
- `endDate` (optional): ISO8601 format
- `status` (optional): pending|completed|cancelled

**Response:**
```json
{
  "orders": [
    {
      "orderId": "string",
      "orderNumber": "string",
      "customerName": "string",
      "items": [],
      "total": number,
      "status": "string",
      "createdAt": "ISO8601"
    }
  ]
}
```

---

## 4. Core Modules

### 4.1 Inventory Management Module

#### Features
- Add/Edit/Delete items
- Category management
- Stock tracking
- Barcode scanning
- Low stock alerts
- Bulk import/export

#### Item Structure
```json
{
  "itemId": "uuid",
  "name": "string",
  "description": "string",
  "category": "categoryId",
  "price": number,
  "cost": number,
  "stock": {
    "quantity": number,
    "unit": "string",
    "minStock": number,
    "maxStock": number
  },
  "barcode": "string",
  "sku": "string",
  "images": ["url"],
  "variations": [
    {
      "name": "Size",
      "options": ["Small", "Medium", "Large"]
    }
  ],
  "isActive": boolean,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

#### CRUD Operations - Inventory Items

**CREATE Item**
```java
// Local Database
public void createItem(Item item) {
    ContentValues values = new ContentValues();
    values.put("name", item.getName());
    values.put("price", item.getPrice());
    values.put("stock", item.getStock());
    values.put("category", item.getCategory());
    
    long id = db.insert("items", null, values);
    
    // Sync to cloud
    syncService.queueSync("items", id, SyncAction.CREATE);
}

// API Call
public void createItemAPI(Item item, Callback callback) {
    apiService.createItem(item)
        .enqueue(new Callback<ItemResponse>() {
            @Override
            public void onResponse(Call<ItemResponse> call, 
                                 Response<ItemResponse> response) {
                if (response.isSuccessful()) {
                    callback.onSuccess(response.body());
                }
            }
            
            @Override
            public void onFailure(Call<ItemResponse> call, Throwable t) {
                callback.onError(t.getMessage());
            }
        });
}
```

**READ Item**
```java
// Get Single Item
public Item getItem(String itemId) {
    Cursor cursor = db.query("items", 
        null, 
        "id = ?", 
        new String[]{itemId}, 
        null, null, null);
    
    if (cursor.moveToFirst()) {
        return cursorToItem(cursor);
    }
    return null;
}

// Get All Items
public List<Item> getAllItems() {
    List<Item> items = new ArrayList<>();
    Cursor cursor = db.query("items", null, null, null, 
                            null, null, "name ASC");
    
    while (cursor.moveToNext()) {
        items.add(cursorToItem(cursor));
    }
    cursor.close();
    return items;
}

// Search Items
public List<Item> searchItems(String query) {
    String selection = "name LIKE ? OR barcode LIKE ?";
    String[] args = {"%" + query + "%", "%" + query + "%"};
    
    Cursor cursor = db.query("items", null, selection, args, 
                            null, null, null);
    // Process results...
}
```

**UPDATE Item**
```java
public boolean updateItem(Item item) {
    ContentValues values = new ContentValues();
    values.put("name", item.getName());
    values.put("price", item.getPrice());
    values.put("stock", item.getStock());
    values.put("updated_at", System.currentTimeMillis());
    
    int rows = db.update("items", values, 
                        "id = ?", 
                        new String[]{item.getId()});
    
    if (rows > 0) {
        syncService.queueSync("items", item.getId(), 
                             SyncAction.UPDATE);
        return true;
    }
    return false;
}
```

**DELETE Item**
```java
public boolean deleteItem(String itemId) {
    int rows = db.delete("items", "id = ?", 
                        new String[]{itemId});
    
    if (rows > 0) {
        syncService.queueSync("items", itemId, 
                             SyncAction.DELETE);
        return true;
    }
    return false;
}
```

#### Stock Management Operations

**Adjust Stock**
```java
public void adjustStock(String itemId, int quantity, 
                       String reason) {
    // Get current stock
    Item item = getItem(itemId);
    int newStock = item.getStock() + quantity;
    
    // Update stock
    ContentValues values = new ContentValues();
    values.put("stock", newStock);
    db.update("items", values, "id = ?", 
             new String[]{itemId});
    
    // Log stock movement
    logStockMovement(itemId, quantity, reason);
    
    // Check low stock alert
    if (newStock <= item.getMinStock()) {
        triggerLowStockAlert(item);
    }
}

private void logStockMovement(String itemId, int quantity, 
                             String reason) {
    ContentValues log = new ContentValues();
    log.put("item_id", itemId);
    log.put("quantity", quantity);
    log.put("reason", reason);
    log.put("timestamp", System.currentTimeMillis());
    log.put("user_id", getCurrentUserId());
    
    db.insert("stock_movements", null, log);
}
```

---

### 4.2 Sales & Billing Module

#### Features
- Quick billing
- Multiple payment methods
- Discounts and taxes
- Split payments
- Park orders
- Receipt generation

#### Sale Structure
```json
{
  "saleId": "uuid",
  "saleNumber": "string",
  "customerId": "string",
  "items": [
    {
      "itemId": "string",
      "name": "string",
      "quantity": number,
      "price": number,
      "discount": number,
      "tax": number,
      "total": number
    }
  ],
  "subtotal": number,
  "discount": number,
  "tax": number,
  "total": number,
  "payments": [
    {
      "method": "cash|card|upi",
      "amount": number
    }
  ],
  "status": "completed|parked|cancelled",
  "staffId": "string",
  "notes": "string",
  "createdAt": "timestamp"
}
```

#### CRUD Operations - Sales

**CREATE Sale**
```java
public class SaleManager {
    
    public String createSale(Sale sale) {
        // Start transaction
        db.beginTransaction();
        try {
            // Insert sale record
            String saleId = insertSale(sale);
            
            // Insert sale items
            for (SaleItem item : sale.getItems()) {
                insertSaleItem(saleId, item);
                
                // Update inventory
                adjustStock(item.getItemId(), 
                          -item.getQuantity(), 
                          "Sale #" + saleId);
            }
            
            // Insert payments
            for (Payment payment : sale.getPayments()) {
                insertPayment(saleId, payment);
            }
            
            db.setTransactionSuccessful();
            
            // Generate receipt
            generateReceipt(saleId);
            
            // Sync to cloud
            syncService.syncSale(saleId);
            
            return saleId;
            
        } finally {
            db.endTransaction();
        }
    }
    
    private String insertSale(Sale sale) {
        ContentValues values = new ContentValues();
        values.put("sale_number", generateSaleNumber());
        values.put("customer_id", sale.getCustomerId());
        values.put("subtotal", sale.getSubtotal());
        values.put("discount", sale.getDiscount());
        values.put("tax", sale.getTax());
        values.put("total", sale.getTotal());
        values.put("status", sale.getStatus());
        values.put("staff_id", getCurrentStaffId());
        values.put("created_at", System.currentTimeMillis());
        
        long id = db.insert("sales", null, values);
        return String.valueOf(id);
    }
}
```

**Park Order**
```java
public void parkOrder(Sale sale) {
    sale.setStatus("parked");
    String saleId = saveDraftSale(sale);
    
    // Store in temporary storage
    SharedPreferences prefs = getSharedPreferences(
        "parked_orders", MODE_PRIVATE);
    prefs.edit()
         .putString("parked_" + saleId, 
                   gson.toJson(sale))
         .apply();
    
    showToast("Order parked successfully");
}

public List<Sale> getParkedOrders() {
    List<Sale> parkedOrders = new ArrayList<>();
    SharedPreferences prefs = getSharedPreferences(
        "parked_orders", MODE_PRIVATE);
    
    Map<String, ?> allEntries = prefs.getAll();
    for (Map.Entry<String, ?> entry : allEntries.entrySet()) {
        if (entry.getKey().startsWith("parked_")) {
            Sale sale = gson.fromJson(
                (String) entry.getValue(), 
                Sale.class);
            parkedOrders.add(sale);
        }
    }
    return parkedOrders;
}
```

**Calculate Sale Total**
```java
public class SaleCalculator {
    
    public SaleTotal calculateTotal(Sale sale) {
        double subtotal = 0;
        
        // Calculate items subtotal
        for (SaleItem item : sale.getItems()) {
            double itemTotal = item.getPrice() * 
                              item.getQuantity();
            itemTotal -= item.getDiscount();
            subtotal += itemTotal;
        }
        
        // Apply sale-level discount
        double discount = sale.getDiscount();
        if (sale.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = (subtotal * discount) / 100;
        }
        
        // Calculate tax
        double taxableAmount = subtotal - discount;
        double tax = (taxableAmount * sale.getTaxRate()) / 100;
        
        // Calculate total
        double total = taxableAmount + tax;
        
        return new SaleTotal(subtotal, discount, tax, total);
    }
}
```

---

### 4.3 Customer Management Module

#### Features
- Customer database
- Customer history
- Loyalty points
- Credit management
- Customer groups

#### Customer Structure
```json
{
  "customerId": "uuid",
  "name": "string",
  "phone": "string",
  "email": "string",
  "address": "string",
  "loyaltyPoints": number,
  "creditLimit": number,
  "creditBalance": number,
  "group": "string",
  "notes": "string",
  "totalPurchases": number,
  "lastVisit": "timestamp",
  "createdAt": "timestamp"
}
```

#### CRUD Operations - Customers

**CREATE Customer**
```java
public String addCustomer(Customer customer) {
    ContentValues values = new ContentValues();
    values.put("name", customer.getName());
    values.put("phone", customer.getPhone());
    values.put("email", customer.getEmail());
    values.put("address", customer.getAddress());
    values.put("loyalty_points", 0);
    values.put("credit_limit", customer.getCreditLimit());
    values.put("credit_balance", 0);
    values.put("created_at", System.currentTimeMillis());
    
    long id = db.insert("customers", null, values);
    
    syncService.queueSync("customers", 
                         String.valueOf(id), 
                         SyncAction.CREATE);
    
    return String.valueOf(id);
}
```

**READ Customer**
```java
public Customer getCustomer(String customerId) {
    Cursor cursor = db.query("customers", 
        null, 
        "id = ?", 
        new String[]{customerId}, 
        null, null, null);
    
    if (cursor.moveToFirst()) {
        Customer customer = new Customer();
        customer.setId(cursor.getString(
            cursor.getColumnIndex("id")));
        customer.setName(cursor.getString(
            cursor.getColumnIndex("name")));
        customer.setPhone(cursor.getString(
            cursor.getColumnIndex("phone")));
        // ... map other fields
        
        cursor.close();
        return customer;
    }
    return null;
}

public List<Customer> searchCustomers(String query) {
    String sql = "SELECT * FROM customers WHERE " +
                 "name LIKE ? OR phone LIKE ? " +
                 "ORDER BY name ASC";
    
    Cursor cursor = db.rawQuery(sql, 
        new String[]{"%" + query + "%", 
                    "%" + query + "%"});
    
    List<Customer> customers = new ArrayList<>();
    while (cursor.moveToNext()) {
        customers.add(cursorToCustomer(cursor));
    }
    cursor.close();
    
    return customers;
}
```

**UPDATE Customer**
```java
public boolean updateCustomer(Customer customer) {
    ContentValues values = new ContentValues();
    values.put("name", customer.getName());
    values.put("phone", customer.getPhone());
    values.put("email", customer.getEmail());
    values.put("address", customer.getAddress());
    values.put("updated_at", System.currentTimeMillis());
    
    int rows = db.update("customers", values, 
                        "id = ?", 
                        new String[]{customer.getId()});
    
    if (rows > 0) {
        syncService.queueSync("customers", 
                             customer.getId(), 
                             SyncAction.UPDATE);
        return true;
    }
    return false;
}
```

**Loyalty Points Management**
```java
public void addLoyaltyPoints(String customerId, 
                            double saleAmount) {
    // 1 point per currency unit spent
    int pointsEarned = (int) Math.floor(saleAmount);
    
    String sql = "UPDATE customers SET " +
                 "loyalty_points = loyalty_points + ?, " +
                 "total_purchases = total_purchases + ?, " +
                 "last_visit = ? " +
                 "WHERE id = ?";
    
    db.execSQL(sql, new Object[]{
        pointsEarned, 
        saleAmount, 
        System.currentTimeMillis(), 
        customerId
    });
    
    // Log points transaction
    logLoyaltyTransaction(customerId, pointsEarned, 
                         "Purchase");
}

public boolean redeemPoints(String customerId, int points) {
    Customer customer = getCustomer(customerId);
    
    if (customer.getLoyaltyPoints() >= points) {
        String sql = "UPDATE customers SET " +
                     "loyalty_points = loyalty_points - ? " +
                     "WHERE id = ?";
        
        db.execSQL(sql, new Object[]{points, customerId});
        
        logLoyaltyTransaction(customerId, -points, 
                             "Redemption");
        return true;
    }
    return false;
}
```

---

### 4.4 Staff Management Module

#### Features
- Staff roles and permissions
- Shift management
- Performance tracking
- Attendance
- Commission tracking

#### Staff Structure
```json
{
  "staffId": "uuid",
  "name": "string",
  "phone": "string",
  "email": "string",
  "role": "owner|manager|staff|helper",
  "permissions": {
    "canViewReports": boolean,
    "canManageInventory": boolean,
    "canManageStaff": boolean,
    "canGiveDiscount": boolean,
    "maxDiscountPercent": number,
    "canDeleteSales": boolean,
    "canAccessExpenses": boolean
  },
  "salary": number,
  "commission": {
    "enabled": boolean,
    "type": "percentage|fixed",
    "value": number
  },
  "isActive": boolean,
  "createdAt": "timestamp"
}
```

#### CRUD Operations - Staff

**CREATE Staff**
```java
public String addStaff(Staff staff, String pin) {
    ContentValues values = new ContentValues();
    values.put("name", staff.getName());
    values.put("phone", staff.getPhone());
    values.put("role", staff.getRole());
    values.put("permissions", 
              gson.toJson(staff.getPermissions()));
    values.put("pin_hash", hashPin(pin));
    values.put("is_active", true);
    values.put("created_at", System.currentTimeMillis());
    
    long id = db.insert("staff", null, values);
    return String.valueOf(id);
}

private String hashPin(String pin) {
    try {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(pin.getBytes("UTF-8"));
        return Base64.encodeToString(hash, Base64.DEFAULT);
    } catch (Exception e) {
        e.printStackTrace();
        return null;
    }
}
```

**Staff Login**
```java
public Staff authenticateStaff(String staffId, String pin) {
    Cursor cursor = db.query("staff", 
        null, 
        "id = ? AND is_active = 1", 
        new String[]{staffId}, 
        null, null, null);
    
    if (cursor.moveToFirst()) {
        String storedHash = cursor.getString(
            cursor.getColumnIndex("pin_hash"));
        
        if (storedHash.equals(hashPin(pin))) {
            Staff staff = cursorToStaff(cursor);
            
            // Log login
            logStaffActivity(staffId, "login");
            
            cursor.close();
            return staff;
        }
    }
    cursor.close();
    return null;
}
```

**Permission Check**
```java
public boolean checkPermission(String staffId, 
                              String permission) {
    Staff staff = getStaff(staffId);
    
    if (staff.getRole().equals("owner")) {
        return true; // Owner has all permissions
    }
    
    Permissions perms = staff.getPermissions();
    
    switch (permission) {
        case "view_reports":
            return perms.canViewReports();
        case "manage_inventory":
            return perms.canManageInventory();
        case "manage_staff":
            return perms.canManageStaff();
        case "give_discount":
            return perms.canGiveDiscount();
        case "delete_sales":
            return perms.canDeleteSales();
        case "access_expenses":
            return perms.canAccessExpenses();
        default:
            return false;
    }
}
```

**Staff Performance Report**
```java
public StaffPerformance getStaffPerformance(String staffId, 
                                           long startDate, 
                                           long endDate) {
    String sql = "SELECT " +
                 "COUNT(*) as total_sales, " +
                 "SUM(total) as total_revenue, " +
                 "AVG(total) as avg_sale_value " +
                 "FROM sales " +
                 "WHERE staff_id = ? " +
                 "AND created_at BETWEEN ? AND ?";
    
    Cursor cursor = db.rawQuery(sql, 
        new String[]{staffId, 
                    String.valueOf(startDate), 
                    String.valueOf(endDate)});
    
    if (cursor.moveToFirst()) {
        StaffPerformance performance = new StaffPerformance();
        performance.setTotalSales(cursor.getInt(0));
        performance.setTotalRevenue(cursor.getDouble(1));
        performance.setAvgSaleValue(cursor.getDouble(2));
        
        cursor.close();
        return performance;
    }
    return null;
}
```

---

### 4.5 Reports Module

#### Available Reports
1. Sales Report
2. Inventory Report
3. Staff Performance
4. Customer Analysis
5. Profit & Loss
6. Tax Report
7. Payment Methods
8. Category-wise Sales

#### Generate Sales Report
```java
public class ReportGenerator {
    
    public SalesReport generateSalesReport(long startDate, 
                                          long endDate) {
        SalesReport report = new SalesReport();
        
        // Total sales
        String sql = "SELECT " +
                     "COUNT(*) as count, " +
                     "SUM(subtotal) as subtotal, " +
                     "SUM(discount) as discount, " +
                     "SUM(tax) as tax, " +
                     "SUM(total) as total " +
                     "FROM sales " +
                     "WHERE created_at BETWEEN ? AND ? " +
                     "AND status = 'completed'";
        
        Cursor cursor = db.rawQuery(sql, 
            new String[]{String.valueOf(startDate), 
                        String.valueOf(endDate)});
        
        if (cursor.moveToFirst()) {
            report.setTotalSales(cursor.getInt(0));
            report.setSubtotal(cursor.getDouble(1));
            report.setTotalDiscount(cursor.getDouble(2));
            report.setTotalTax(cursor.getDouble(3));
            report.setTotalRevenue(cursor.getDouble(4));
        }
        cursor.close();
        
        // Sales by payment method
        report.setPaymentBreakdown(
            getPaymentBreakdown(startDate, endDate));
        
        // Sales by category
        report.setCategorySales(
            getCategorySales(startDate, endDate));
        
        // Top selling items
        report.setTopItems(
            getTopSellingItems(startDate, endDate, 10));
        
        return report;
    }
    
    private List<PaymentBreakdown> getPaymentBreakdown(
        long startDate, long endDate) {
        
        String sql = "SELECT " +
                     "p.method, " +
                     "COUNT(DISTINCT p.sale_id) as count, " +
                     "SUM(p.amount) as total " +
                     "FROM payments p " +
                     "JOIN sales s ON p.sale_id = s.id " +
                     "WHERE s.created_at BETWEEN ? AND ? " +
                     "GROUP BY p.method";
        
        Cursor cursor = db.rawQuery(sql, 
            new String[]{String.valueOf(startDate), 
                        String.valueOf(endDate)});
        
        List<PaymentBreakdown> breakdown = new ArrayList<>();
        while (cursor.moveToNext()) {
            PaymentBreakdown pb = new PaymentBreakdown();
            pb.setMethod(cursor.getString(0));
            pb.setCount(cursor.getInt(1));
            pb.setTotal(cursor.getDouble(2));
            breakdown.add(pb);
        }
        cursor.close();
        
        return breakdown;
    }
    
    public void exportReportToExcel(SalesReport report, 
                                   File outputFile) {
        try {
            Workbook workbook = new XSSFWorkbook();
            Sheet sheet = workbook.createSheet("Sales Report");
            
            // Create header row
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Metric");
            headerRow.createCell(1).setCellValue("Value");
            
            // Add data rows
            int rowNum = 1;
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue("Total Sales");
            row.createCell(1).setCellValue(
                report.getTotalSales());
            
            // ... add more rows
            
            // Write to file
            FileOutputStream outputStream = 
                new FileOutputStream(outputFile);
            workbook.write(outputStream);
            workbook.close();
            outputStream.close();
            
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

---

## 5. User Interface Components

### 5.1 Activity Structure

```
MainActivity
├── DashboardFragment
├── SalesFragment
│   ├── NewSaleActivity
│   ├── ParkedOrdersActivity
│   └── SaleHistoryActivity
├── InventoryFragment
│   ├── ItemListActivity
│   ├── AddItemActivity
│   └── CategoryManagementActivity
├── CustomersFragment
│   ├── CustomerListActivity
│   ├── AddCustomerActivity
│   └── CustomerDetailActivity
├── ReportsFragment
└── SettingsFragment
```

### 5.2 Key UI Components

#### Sales Counter Layout

```xml
<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent">
    
    <!-- Search Bar -->
    <com.google.android.material.textfield.TextInputLayout
        android:id="@+id/searchLayout"
        style="@style/Widget.MaterialComponents.TextInputLayout.OutlinedBox"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:hint="Search items or scan barcode"
        app:layout_constraintTop_toTopOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toStartOf="@id/scanButton"
        android:layout_margin="16dp">
        
        <com.google.android.material.textfield.TextInputEditText
            android:id="@+id/searchInput"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:inputType="text"/>
    </com.google.android.material.textfield.TextInputLayout>
    
    <Button
        android:id="@+id/scanButton"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Scan"
        app:layout_constraintTop_toTopOf="@id/searchLayout"
        app:layout_constraintEnd_toEndOf="parent"
        android:layout_marginEnd="16dp"/>
    
    <!-- Cart Items -->
    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/cartRecyclerView"
        android:layout_width="0dp"
        android:layout_height="0dp"
        app:layout_constraintTop_toBottomOf="@id/searchLayout"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintBottom_toTopOf="@id/bottomPanel"
        android:layout_margin="16dp"/>
    
    <!-- Bottom Panel with Totals -->
    <LinearLayout
        android:id="@+id/bottomPanel"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:orientation="vertical"
        android:padding="16dp"
        android:background="@color/white"
        android:elevation="4dp"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintEnd_toEndOf="parent">
        
        <!-- Subtotal -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal">
            <TextView
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:text="Subtotal"
                android:textSize="16sp"/>
            <TextView
                android:id="@+id/subtotalText"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="₹0.00"
                android:textSize="16sp"
                android:textStyle="bold"/>
        </LinearLayout>
        
        <!-- Discount -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:layout_marginTop="8dp">
            <TextView
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:text="Discount"
                android:textSize="16sp"/>
            <TextView
                android:id="@+id/discountText"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="-₹0.00"
                android:textSize="16sp"
                android:textColor="@color/green"/>
        </LinearLayout>
        
        <!-- Tax -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:layout_marginTop="8dp">
            <TextView
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:text="Tax"
                android:textSize="16sp"/>
            <TextView
                android:id="@+id/taxText"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="₹0.00"
                android:textSize="16sp"/>
        </LinearLayout>
        
        <!-- Total -->
        <View
            android:layout_width="match_parent"
            android:layout_height="1dp"
            android:background="@color/divider"
            android:layout_marginVertical="8dp"/>
        
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal">
            <TextView
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:text="Total"
                android:textSize="20sp"
                android:textStyle="bold"/>
            <TextView
                android:id="@+id/totalText"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="₹0.00"
                android:textSize="20sp"
                android:textStyle="bold"
                android:textColor="@color/primary"/>
        </LinearLayout>
        
        <!-- Action Buttons -->
        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:layout_marginTop="16dp">
            
            <Button
                android:id="@+id/parkButton"
                style="@style/Widget.MaterialComponents.Button.OutlinedButton"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:text="Park"
                android:layout_marginEnd="8dp"/>
            
            <Button
                android:id="@+id/checkoutButton"
                android:layout_width="0dp"
                android:layout_height="wrap_content"
                android:layout_weight="2"
                android:text="Checkout"
                android:textSize="16sp"
                android:padding="12dp"/>
        </LinearLayout>
    </LinearLayout>
    
</androidx.constraintlayout.widget.ConstraintLayout>
```

#### Button Actions

```java
public class SalesActivity extends AppCompatActivity {
    
    private RecyclerView cartRecyclerView;
    private CartAdapter cartAdapter;
    private Sale currentSale;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sales);
        
        initializeViews();
        setupListeners();
    }
    
    private void initializeViews() {
        // Initialize RecyclerView
        cartRecyclerView = findViewById(R.id.cartRecyclerView);
        cartRecyclerView.setLayoutManager(
            new LinearLayoutManager(this));
        
        cartAdapter = new CartAdapter(currentSale.getItems());
        cartRecyclerView.setAdapter(cartAdapter);
        
        // Set item click listeners
        cartAdapter.setOnItemClickListener(
            new CartAdapter.OnItemClickListener() {
            @Override
            public void onQuantityChanged(SaleItem item) {
                updateTotals();
            }
            
            @Override
            public void onItemRemoved(SaleItem item) {
                removeItemFromCart(item);
            }
        });
    }
    
    private void setupListeners() {
        // Scan Button
        findViewById(R.id.scanButton).setOnClickListener(v -> {
            Intent intent = new Intent(this, 
                                      BarcodeScannerActivity.class);
            startActivityForResult(intent, REQUEST_SCAN);
        });
        
        // Park Button
        findViewById(R.id.parkButton).setOnClickListener(v -> {
            parkOrder();
        });
        
        // Checkout Button
        findViewById(R.id.checkoutButton).setOnClickListener(v -> {
            if (validateSale()) {
                showPaymentDialog();
            }
        });
        
        // Search Input
        TextInputEditText searchInput = 
            findViewById(R.id.searchInput);
        searchInput.addTextChangedListener(new TextWatcher() {
            @Override
            public void afterTextChanged(Editable s) {
                String query = s.toString();
                if (query.length() >= 2) {
                    searchItems(query);
                }
            }
            // ... other methods
        });
    }
    
    private void searchItems(String query) {
        List<Item> results = itemRepository.searchItems(query);
        
        if (results.size() == 1) {
            // Auto-add single result
            addItemToCart(results.get(0));
        } else if (results.size() > 1) {
            // Show selection dialog
            showItemSelectionDialog(results);
        } else {
            Toast.makeText(this, "No items found", 
                         Toast.LENGTH_SHORT).show();
        }
    }
    
    private void addItemToCart(Item item) {
        SaleItem saleItem = new SaleItem();
        saleItem.setItem(item);
        saleItem.setQuantity(1);
        saleItem.setPrice(item.getPrice());
        
        currentSale.addItem(saleItem);
        cartAdapter.notifyDataSetChanged();
        updateTotals();
    }
    
    private void updateTotals() {
        SaleTotal total = saleCalculator.calculateTotal(
            currentSale);
        
        TextView subtotalText = findViewById(R.id.subtotalText);
        TextView discountText = findViewById(R.id.discountText);
        TextView taxText = findViewById(R.id.taxText);
        TextView totalText = findViewById(R.id.totalText);
        
        subtotalText.setText(formatCurrency(total.getSubtotal()));
        discountText.setText("-" + 
            formatCurrency(total.getDiscount()));
        taxText.setText(formatCurrency(total.getTax()));
        totalText.setText(formatCurrency(total.getTotal()));
    }
    
    private void showPaymentDialog() {
        PaymentDialogFragment dialog = 
            PaymentDialogFragment.newInstance(
                currentSale.getTotal());
        
        dialog.setPaymentListener(
            new PaymentDialogFragment.PaymentListener() {
            @Override
            public void onPaymentComplete(
                List<Payment> payments) {
                
                currentSale.setPayments(payments);
                completeSale();
            }
        });
        
        dialog.show(getSupportFragmentManager(), 
                   "payment_dialog");
    }
    
    private void completeSale() {
        currentSale.setStatus("completed");
        String saleId = saleManager.createSale(currentSale);
        
        // Generate receipt
        Receipt receipt = receiptGenerator.generate(saleId);
        
        // Show receipt dialog
        showReceiptDialog(receipt);
        
        // Clear cart
        currentSale = new Sale();
        cartAdapter.clear();
        updateTotals();
    }
    
    private void parkOrder() {
        if (currentSale.getItems().isEmpty()) {
            Toast.makeText(this, "Cart is empty", 
                         Toast.LENGTH_SHORT).show();
            return;
        }
        
        saleManager.parkOrder(currentSale);
        
        // Clear current cart
        currentSale = new Sale();
        cartAdapter.clear();
        updateTotals();
        
        Toast.makeText(this, "Order parked", 
                     Toast.LENGTH_SHORT).show();
    }
}
```

### 5.3 Receipt Printing

```java
public class ReceiptPrinter {
    
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothSocket socket;
    
    public void printReceipt(Receipt receipt, String printerAddress) {
        try {
            // Connect to printer
            connectPrinter(printerAddress);
            
            // Build receipt content
            StringBuilder content = new StringBuilder();
            
            // Header
            content.append(centerText(receipt.getBusinessName()))
                   .append("\n");
            content.append(centerText(receipt.getAddress()))
                   .append("\n");
            content.append(centerText("Phone: " + 
                                    receipt.getPhone()))
                   .append("\n");
            content.append(printLine()).append("\n");
            
            // Invoice details
            content.append(String.format("Invoice: %s\n", 
                                        receipt.getInvoiceNumber()));
            content.append(String.format("Date: %s\n", 
                                        receipt.getFormattedDate()));
            content.append(String.format("Cashier: %s\n", 
                                        receipt.getCashierName()));
            content.append(printLine()).append("\n");
            
            // Items
            for (ReceiptItem item : receipt.getItems()) {
                content.append(String.format("%-20s %3d %8.2f\n",
                    truncate(item.getName(), 20),
                    item.getQuantity(),
                    item.getTotal()));
            }
            content.append(printLine()).append("\n");
            
            // Totals
            content.append(String.format("%-24s %8.2f\n", 
                "Subtotal:", receipt.getSubtotal()));
            
            if (receipt.getDiscount() > 0) {
                content.append(String.format("%-24s -%8.2f\n", 
                    "Discount:", receipt.getDiscount()));
            }
            
            content.append(String.format("%-24s %8.2f\n", 
                "Tax:", receipt.getTax()));
            content.append(printLine()).append("\n");
            content.append(String.format("%-24s %8.2f\n", 
                "TOTAL:", receipt.getTotal()));
            content.append(printLine()).append("\n");
            
            // Payment method
            content.append(String.format("Payment: %s\n", 
                receipt.getPaymentMethod()));
            
            // Footer
            content.append("\n");
            content.append(centerText("Thank you for your business!"))
                   .append("\n");
            content.append(centerText("Visit us again!")).append("\n");
            
            // Print
            OutputStream outputStream = socket.getOutputStream();
            outputStream.write(content.toString().getBytes());
            
            // Cut paper (ESC/POS command)
            outputStream.write(new byte[]{0x1D, 0x56, 0x00});
            
            outputStream.flush();
            
        } catch (IOException e) {
            e.printStackTrace();
            throw new PrinterException("Failed to print receipt");
        } finally {
            disconnectPrinter();
        }
    }
    
    private void connectPrinter(String address) 
        throws IOException {
        
        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        BluetoothDevice device = 
            bluetoothAdapter.getRemoteDevice(address);
        
        UUID uuid = UUID.fromString(
            "00001101-0000-1000-8000-00805F9B34FB");
        
        socket = device.createRfcommSocketToServiceRecord(uuid);
        socket.connect();
    }
    
    private String centerText(String text) {
        int width = 32; // Standard thermal printer width
        int padding = (width - text.length()) / 2;
        return String.format("%" + (padding + text.length()) + "s",
                           text);
    }
    
    private String printLine() {
        return "--------------------------------";
    }
}
```

---

## 6. Database Schema

### Tables Structure

```sql
-- Businesses Table
CREATE TABLE businesses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    tax_rate REAL DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    settings TEXT, -- JSON
    created_at INTEGER,
    updated_at INTEGER
);

-- Items Table
CREATE TABLE items (
    id TEXT PRIMARY KEY,
    business_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    price REAL NOT NULL,
    cost REAL,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER,
    unit TEXT,
    barcode TEXT,
    sku TEXT,
    image_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY(business_id) REFERENCES businesses(id)
);

-- Categories Table
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    business_id TEXT,
    name TEXT NOT NULL,
    parent_id TEXT,
    sort_order INTEGER,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY(business_id) REFERENCES businesses(id)
);

-- Sales Table
CREATE TABLE sales (
    id TEXT PRIMARY KEY,
    business_id TEXT,
    sale_number TEXT NOT NULL,
    customer_id TEXT,
    staff_id TEXT,
    subtotal REAL,
    discount REAL DEFAULT 0,
    discount_type TEXT, -- percentage, fixed
    tax REAL DEFAULT 0,
    total REAL NOT NULL,
    status TEXT, -- completed, parked, cancelled
    notes TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY(business_id) REFERENCES businesses(id),
    FOREIGN KEY(customer_id) REFERENCES customers(id),
    FOREIGN KEY(staff_id) REFERENCES staff(id)
);

-- Sale Items Table
CREATE TABLE sale_items (
    id TEXT PRIMARY KEY,
    sale_id TEXT,
    item_id TEXT,
    name TEXT,
    quantity REAL,
    price REAL,
    discount REAL DEFAULT 0,
    tax REAL DEFAULT 0,
    total REAL,
    FOREIGN KEY(sale_id) REFERENCES sales(id),
    FOREIGN KEY(item_id) REFERENCES items(id)
);

-- Payments Table
CREATE TABLE payments (
    id TEXT PRIMARY KEY,
    sale_id TEXT,
    method TEXT, -- cash, card, upi, wallet
    amount REAL,
    reference TEXT,
    created_at INTEGER,
    FOREIGN KEY(sale_id) REFERENCES sales(id)
);

-- Customers Table
CREATE TABLE customers (
    id TEXT PRIMARY KEY,
    business_id TEXT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    loyalty_points INTEGER DEFAULT 0,
    credit_limit REAL DEFAULT 0,
    credit_balance REAL DEFAULT 0,
    group_id TEXT,
    notes TEXT,
    total_purchases REAL DEFAULT 0,
    last_visit INTEGER,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY(business_id) REFERENCES businesses(id)
);

-- Staff Table
CREATE TABLE staff (
    id TEXT PRIMARY KEY,
    business_id TEXT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    role TEXT, -- owner, manager, staff, helper
    permissions TEXT, -- JSON
    pin_hash TEXT,
    salary REAL,
    commission_type TEXT, -- percentage, fixed
    commission_value REAL,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY(business_id) REFERENCES businesses(id)
);

-- Stock Movements Table
CREATE TABLE stock_movements (
    id TEXT PRIMARY KEY,
    item_id TEXT,
    quantity REAL,
    type TEXT, -- in, out, adjustment
    reason TEXT,
    user_id TEXT,
    reference TEXT,
    created_at INTEGER,
    FOREIGN KEY(item_id) REFERENCES items(id)
);

-- Expenses Table
CREATE TABLE expenses (
    id TEXT PRIMARY KEY,
    business_id TEXT,
    category TEXT,
    amount REAL,
    description TEXT,
    payment_method TEXT,
    staff_id TEXT,
    date INTEGER,
    created_at INTEGER,
    FOREIGN KEY(business_id) REFERENCES businesses(id)
);

-- Sync Queue Table (for offline sync)
CREATE TABLE sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT,
    record_id TEXT,
    action TEXT, -- create, update, delete
    data TEXT, -- JSON
    synced INTEGER DEFAULT 0,
    created_at INTEGER
);

-- Create Indexes
CREATE INDEX idx_items_business ON items(business_id);
CREATE INDEX idx_items_barcode ON items(barcode);
CREATE INDEX idx_sales_business ON sales(business_id);
CREATE INDEX idx_sales_date ON sales(created_at);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_customers_phone ON customers(phone);
```

### Database Helper Class

```java
public class DatabaseHelper extends SQLiteOpenHelper {
    
    private static final String DATABASE_NAME = "zobaze_pos.db";
    private static final int DATABASE_VERSION = 1;
    
    public DatabaseHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }
    
    @Override
    public void onCreate(SQLiteDatabase db) {
        // Create all tables
        db.execSQL(CREATE_BUSINESSES_TABLE);
        db.execSQL(CREATE_ITEMS_TABLE);
        db.execSQL(CREATE_CATEGORIES_TABLE);
        db.execSQL(CREATE_SALES_TABLE);
        db.execSQL(CREATE_SALE_ITEMS_TABLE);
        db.execSQL(CREATE_PAYMENTS_TABLE);
        db.execSQL(CREATE_CUSTOMERS_TABLE);
        db.execSQL(CREATE_STAFF_TABLE);
        db.execSQL(CREATE_STOCK_MOVEMENTS_TABLE);
        db.execSQL(CREATE_EXPENSES_TABLE);
        db.execSQL(CREATE_SYNC_QUEUE_TABLE);
        
        // Create indexes
        createIndexes(db);
    }
    
    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, 
                         int newVersion) {
        // Handle database upgrades
        if (oldVersion < 2) {
            // Add new columns or tables
        }
    }
}
```

---

## 7. Integration Guide

### 7.1 Offline Sync Implementation

```java
public class SyncManager {
    
    private DatabaseHelper dbHelper;
    private ApiService apiService;
    private ConnectivityManager connectivityManager;
    
    public void startSync() {
        if (!isNetworkAvailable()) {
            Log.d("Sync", "No network connection");
            return;
        }
        
        new Thread(() -> {
            syncPendingChanges();
            syncFromServer();
        }).start();
    }
    
    private void syncPendingChanges() {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = db.query("sync_queue", 
            null, 
            "synced = 0", 
            null, null, null, 
            "created_at ASC");
        
        while (cursor.moveToNext()) {
            String table = cursor.getString(
                cursor.getColumnIndex("table_name"));
            String recordId = cursor.getString(
                cursor.getColumnIndex("record_id"));
            String action = cursor.getString(
                cursor.getColumnIndex("action"));
            String data = cursor.getString(
                cursor.getColumnIndex("data"));
            
            try {
                boolean success = false;
                
                switch (action) {
                    case "create":
                        success = syncCreate(table, data);
                        break;
                    case "update":
                        success = syncUpdate(table, recordId, data);
                        break;
                    case "delete":
                        success = syncDelete(table, recordId);
                        break;
                }
                
                if (success) {
                    markSynced(cursor.getLong(
                        cursor.getColumnIndex("id")));
                }
                
            } catch (Exception e) {
                Log.e("Sync", "Failed to sync record", e);
            }
        }
        cursor.close();
    }
    
    private boolean syncCreate(String table, String data) {
        try {
            JSONObject json = new JSONObject(data);
            Response response;
            
            switch (table) {
                case "items":
                    response = apiService.createItem(
                        json).execute();
                    break;
                case "sales":
                    response = apiService.createSale(
                        json).execute();
                    break;
                // ... other tables
                default:
                    return false;
            }
            
            return response.isSuccessful();
            
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
    
    private void syncFromServer() {
        try {
            // Get last sync timestamp
            long lastSync = getLastSyncTimestamp();
            
            // Fetch updates from server
            Response<SyncData> response = 
                apiService.getUpdates(lastSync).execute();
            
            if (response.isSuccessful()) {
                SyncData data = response.body();
                
                // Update local database
                updateLocalData(data);
                
                // Save new sync timestamp
                saveLastSyncTimestamp(
                    System.currentTimeMillis());
            }
            
        } catch (Exception e) {
            Log.e("Sync", "Failed to sync from server", e);
        }
    }
    
    public void queueSync(String table, String recordId, 
                         String action, String data) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        
        ContentValues values = new ContentValues();
        values.put("table_name", table);
        values.put("record_id", recordId);
        values.put("action", action);
        values.put("data", data);
        values.put("synced", 0);
        values.put("created_at", System.currentTimeMillis());
        
        db.insert("sync_queue", null, values);
    }
}
```

### 7.2 Barcode Scanner Integration

```java
public class BarcodeScannerActivity extends AppCompatActivity {
    
    private CodeScannerView scannerView;
    private CodeScanner codeScanner;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_barcode_scanner);
        
        scannerView = findViewById(R.id.scanner_view);
        
        codeScanner = new CodeScanner(this, scannerView);
        codeScanner.setCamera(CodeScanner.CAMERA_BACK);
        codeScanner.setFormats(CodeScanner.ALL_FORMATS);
        codeScanner.setAutoFocusMode(AutoFocusMode.SAFE);
        codeScanner.setScanMode(ScanMode.SINGLE);
        
        codeScanner.setDecodeCallback(result -> {
            runOnUiThread(() -> {
                handleBarcodeScanned(result.getText());
            });
        });
        
        scannerView.setOnClickListener(v -> 
            codeScanner.startPreview());
    }
    
    private void handleBarcodeScanned(String barcode) {
        // Search for item by barcode
        Item item = itemRepository.findByBarcode(barcode);
        
        if (item != null) {
            Intent result = new Intent();
            result.putExtra("item_id", item.getId());
            setResult(RESULT_OK, result);
            finish();
        } else {
            Toast.makeText(this, 
                "Item not found: " + barcode, 
                Toast.LENGTH_SHORT).show();
            
            // Option to add new item
            showAddItemDialog(barcode);
        }
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        codeScanner.startPreview();
    }
    
    @Override
    protected void onPause() {
        codeScanner.releaseResources();
        super.onPause();
    }
}
```

---

## 8. Best Practices

### 8.1 Performance Optimization

1. **Database Optimization**
   - Use indexes on frequently queried columns
   - Implement pagination for large datasets
   - Use transactions for batch operations
   - Cache frequently accessed data

```java
// Example: Batch insert with transaction
public void bulkInsertItems(List<Item> items) {
    SQLiteDatabase db = dbHelper.getWritableDatabase();
    db.beginTransaction();
    try {
        for (Item item : items) {
            ContentValues values = itemToContentValues(item);
            db.insert("items", null, values);
        }
        db.setTransactionSuccessful();
    } finally {
        db.endTransaction();
    }
}
```

2. **Memory Management**
   - Close cursors promptly
   - Use ViewHolder pattern in RecyclerView
   - Load images efficiently with libraries like Glide
   - Avoid memory leaks with WeakReferences

3. **Network Optimization**
   - Implement request caching
   - Use compression for API responses
   - Batch API requests when possible
   - Implement retry logic with exponential backoff

### 8.2 Security Best Practices

1. **Data Encryption**
   - Encrypt sensitive data at rest
   - Use HTTPS for all API communications
   - Implement SSL pinning

2. **Authentication**
   - Use secure PIN/password hashing
   - Implement session management
   - Add biometric authentication option

3. **Access Control**
   - Implement role-based permissions
   - Validate user permissions on every action
   - Log security-related events

### 8.3 Error Handling

```java
public class ErrorHandler {
    
    public static void handleError(Context context, 
                                  Throwable error) {
        if (error instanceof NetworkException) {
            showMessage(context, 
                "No internet connection. " + 
                "Changes will sync when online.");
        } else if (error instanceof DatabaseException) {
            showMessage(context, 
                "Database error. Please restart the app.");
            logError(error);
        } else {
            showMessage(context, 
                "An error occurred. Please try again.");
            logError(error);
        }
    }
    
    private static void logError(Throwable error) {
        // Log to crash reporting service
        FirebaseCrashlytics.getInstance()
            .recordException(error);
    }
}
```

### 8.4 Testing Strategy

1. **Unit Tests**
   - Test business logic
   - Test database operations
   - Test calculations

2. **Integration Tests**
   - Test API integrations
   - Test sync mechanisms
   - Test payment flows

3. **UI Tests**
   - Test critical user flows
   - Test on multiple devices
   - Test offline scenarios

---

## 9. Deployment Checklist

### Pre-Release
- [ ] Complete functional testing
- [ ] Performance testing on various devices
- [ ] Security audit
- [ ] Database migrations tested
- [ ] Offline sync tested
- [ ] Printer integration tested
- [ ] API integration tested

### Release
- [ ] Version number updated
- [ ] Release notes prepared
- [ ] Signed APK generated
- [ ] Google Play listing updated
- [ ] Screenshots updated
- [ ] Beta testing completed

### Post-Release
- [ ] Monitor crash reports
- [ ] Monitor user feedback
- [ ] Track key metrics
- [ ] Plan next iteration

---

## 10. Support & Resources

### Official Documentation
- Knowledge Base: https://zobaze.crunch.help/en
- API Documentation: https://apidocs.zobaze.com
- Web Office: https://zobaze.com/pos/web-office

### API Access
- Apply for API access: https://forms.gle/upZ9h2yMTXy7stHq9

### Contact
- Email: android@zobaze.com
- Website: https://zobaze.com

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Maintained by:** Zobaze Development Team