// IndexedDB setup using Dexie.js for offline storage
import Dexie, { Table } from 'dexie';

// Define types for offline data
export interface OfflineSale {
  id: string;
  sale_number: string;
  customer_id?: string;
  items: Array<{
    item_id: string;
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: string;
  status: string;
  created_at: string;
  synced: boolean;
}

export interface CachedProduct {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  cost_price?: number;
  stock: number;
  min_stock: number;
  category_id?: string;
  image_url?: string;
  is_active: boolean;
  updated_at: string;
}

export interface CachedCustomer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  credit_limit: number;
  outstanding_balance: number;
  updated_at: string;
}

export interface SyncQueue {
  id: string;
  type: 'sale' | 'product' | 'customer' | 'stock_adjustment';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  attempts: number;
  lastError?: string;
}

// Database class
export class JKKN_POS_DB extends Dexie {
  offlineSales!: Table<OfflineSale, string>;
  cachedProducts!: Table<CachedProduct, string>;
  cachedCustomers!: Table<CachedCustomer, string>;
  syncQueue!: Table<SyncQueue, string>;

  constructor() {
    super('jkkn-pos-offline');

    // Define schema
    this.version(1).stores({
      offlineSales: 'id, sale_number, customer_id, created_at, synced',
      cachedProducts: 'id, name, sku, barcode, category_id, updated_at',
      cachedCustomers: 'id, name, phone, email, updated_at',
      syncQueue: 'id, type, action, timestamp, attempts'
    });
  }
}

// Create database instance
export const db = new JKKN_POS_DB();

// Helper functions for offline sales
export async function saveOfflineSale(sale: Omit<OfflineSale, 'synced'>) {
  return await db.offlineSales.add({
    ...sale,
    synced: false
  });
}

export async function getUnsyncedSales(): Promise<OfflineSale[]> {
  return await db.offlineSales.where('synced').equals(0).toArray();
}

export async function markSaleAsSynced(saleId: string) {
  return await db.offlineSales.update(saleId, { synced: true });
}

// Helper functions for product cache
export async function cacheProducts(products: CachedProduct[]) {
  return await db.cachedProducts.bulkPut(products);
}

export async function getCachedProduct(productId: string) {
  return await db.cachedProducts.get(productId);
}

export async function searchCachedProducts(query: string): Promise<CachedProduct[]> {
  const lowerQuery = query.toLowerCase();
  return await db.cachedProducts
    .filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      (product.sku?.toLowerCase().includes(lowerQuery) ?? false) ||
      (product.barcode?.toLowerCase().includes(lowerQuery) ?? false)
    )
    .toArray();
}

export async function getCachedProductsByCategory(categoryId: string) {
  return await db.cachedProducts
    .where('category_id')
    .equals(categoryId)
    .toArray();
}

// Helper functions for customer cache
export async function cacheCustomers(customers: CachedCustomer[]) {
  return await db.cachedCustomers.bulkPut(customers);
}

export async function getCachedCustomer(customerId: string) {
  return await db.cachedCustomers.get(customerId);
}

export async function searchCachedCustomers(query: string): Promise<CachedCustomer[]> {
  const lowerQuery = query.toLowerCase();
  return await db.cachedCustomers
    .filter(customer =>
      customer.name.toLowerCase().includes(lowerQuery) ||
      (customer.phone?.includes(query) ?? false) ||
      (customer.email?.toLowerCase().includes(lowerQuery) ?? false)
    )
    .toArray();
}

// Helper functions for sync queue
export async function addToSyncQueue(item: Omit<SyncQueue, 'id' | 'attempts' | 'timestamp'>) {
  return await db.syncQueue.add({
    ...item,
    id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    attempts: 0
  });
}

export async function getSyncQueue(): Promise<SyncQueue[]> {
  return await db.syncQueue.orderBy('timestamp').toArray();
}

export async function removeSyncQueueItem(itemId: string) {
  return await db.syncQueue.delete(itemId);
}

export async function incrementSyncAttempts(itemId: string, error: string) {
  const item = await db.syncQueue.get(itemId);
  if (item) {
    return await db.syncQueue.update(itemId, {
      attempts: item.attempts + 1,
      lastError: error
    });
  }
}

// Database statistics
export async function getDatabaseStats() {
  const [
    unsyncedSalesCount,
    cachedProductsCount,
    cachedCustomersCount,
    syncQueueCount
  ] = await Promise.all([
    db.offlineSales.where('synced').equals(0).count(),
    db.cachedProducts.count(),
    db.cachedCustomers.count(),
    db.syncQueue.count()
  ]);

  return {
    unsyncedSalesCount,
    cachedProductsCount,
    cachedCustomersCount,
    syncQueueCount
  };
}

// Clear all offline data (use with caution!)
export async function clearOfflineData() {
  await db.offlineSales.clear();
  await db.cachedProducts.clear();
  await db.cachedCustomers.clear();
  await db.syncQueue.clear();
}

// Initialize database and cache essential data
export async function initializeOfflineDatabase() {
  try {
    // Check if service worker is available
    if ('serviceWorker' in navigator) {
      // Database is ready
      console.log('[IndexedDB] Database initialized');

      // Get stats
      const stats = await getDatabaseStats();
      console.log('[IndexedDB] Stats:', stats);

      return true;
    }
    return false;
  } catch (error) {
    console.error('[IndexedDB] Initialization error:', error);
    return false;
  }
}
