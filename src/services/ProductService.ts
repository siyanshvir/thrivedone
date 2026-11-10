import { dbClient } from '@/lib/database-client';

// Product type definition (moved from supabase.ts)
export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  status?: string;
  sku: string;
  price: number;
  buy_link?: string;
  image_url?: string;
  group_name?: string;
  color?: string;
  hex_color?: string;
  secondary_hex_color?: string;
  secondary_image_url?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  specifications?: Record<string, any>;
  variant_order?: number;
  clearance_price?: number | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  hero_color?: string; // e.g. 'blue', 'red', or hex
  description?: string; // Hero subtitle
  nav_font?: string;      // 'sans' | 'display' | 'mono'
  nav_font_size?: string; // 'xs' | 'sm' | 'base' | 'lg' | 'xl'
  nav_color?: string;     // hex color e.g. '#31C2F4'
  created_at?: string;
}

/**
 * ProductService - D1 ONLY (Supabase auth/inventory only)
 *
 * Database:
 * - D1 is PRIMARY and ONLY source for reads
 * - NEW products write to BOTH D1 and Supabase (dual-write)
 * - Updates/deletes ONLY write to D1
 */

// Cache configuration
const CACHE_KEY = 'product_cache_v6';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// In-memory layer (fast, session-scoped)
const sessionCache = new Map<string, { data: unknown; ts: number }>();

function cacheGet<T>(key: string): T | null {
  // Check memory first
  const mem = sessionCache.get(key);
  if (mem) {
    if (Date.now() - mem.ts < CACHE_TTL) return mem.data as T;
    sessionCache.delete(key);
  }
  // Fall back to localStorage
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw);
    const entry = store[key];
    if (!entry || Date.now() - entry.ts > CACHE_TTL) return null;
    // Re-hydrate into memory
    sessionCache.set(key, entry);
    return entry.data as T;
  } catch {
    return null;
  }
}

function cacheSet<T>(key: string, data: T): void {
  const entry = { data, ts: Date.now() };
  sessionCache.set(key, entry);
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    const store = raw ? JSON.parse(raw) : {};
    store[key] = entry;
    localStorage.setItem(CACHE_KEY, JSON.stringify(store));
  } catch {
    // localStorage unavailable — memory-only is fine
  }
}

function cacheClear(): void {
  sessionCache.clear();
  try {
    localStorage.removeItem(CACHE_KEY);
    // Also remove old cache versions
    for (const v of ['v1','v2','v3','v4','v5']) {
      localStorage.removeItem(`product_cache_${v}`);
    }
  } catch { /* ignore */ }
}

// Global promises to deduplicate requests
let productsPromise: Promise<Product[]> | null = null;
let categoriesPromise: Map<string, Promise<string[]>> = new Map();

export class ProductService {
  /**
   * Pre-fetches all critical data at once
   */
  static async initialize(): Promise<void> {
    await Promise.all([
      this.getAllProducts(),
      this.getCategories({ includeEmpty: false }),
      this.getCategories({ includeEmpty: true })
    ]);
  }

  static async getAllProducts(): Promise<Product[]> {
    if (productsPromise) return productsPromise;

    const cached = cacheGet<Product[]>('all_products');
    if (cached) return cached;

    productsPromise = (async () => {
      try {
        console.log(`-> Fetching products from D1 API`);
        const { data, error } = await dbClient.getAllProducts();
        if (error) {
          console.error('[ERROR] D1 API failed:', error);
          productsPromise = null;
          return [];
        }
        const products = data || [];
        cacheSet('all_products', products);
        console.log(`[OK] Loaded ${products.length} products from D1`);
        return products;
      } catch (error) {
        console.error('[ERROR] D1 API error:', error);
        productsPromise = null;
        return [];
      } finally {
        productsPromise = null;
      }
    })();

    return productsPromise;
  }

  static async getCategories(options: { includeEmpty?: boolean } = { includeEmpty: false }): Promise<string[]> {
    const cacheKey = `categories_${options.includeEmpty ? 'all' : 'active'}`;

    // Deduplicate requests
    if (categoriesPromise.has(cacheKey)) {
      return categoriesPromise.get(cacheKey)!;
    }

    const cached = cacheGet<string[]>(cacheKey);
    if (cached) return cached;

    // Create and store the promise
    const promise = (async () => {
      // D1 ONLY implementation
      try {
        console.log(`📡 Fetching categories (${options.includeEmpty ? 'all' : 'active'}) from D1 Only`);

        // Fetch dynamic categories from D1
        const { data: dbCategoriesData, error } = await dbClient.getCategories();

        if (error) {
          console.error('Error fetching categories from D1:', error);
          return [];
        }

        const dbCategories = (dbCategoriesData || []).map((c: { name: string }) => c.name);

        let result: string[] = [];

        // If we just want raw categories from DB regardless of products
        if (options.includeEmpty) {
          result = dbCategories;
        } else {
          // If we need to filter based on products (e.g. for Navbar), we still need product list
          const products = await this.getAllProducts();
          const safeProducts = products || [];

          // Filter out empty categories if requested
          result = dbCategories.filter(cat => {
            const catName = cat.trim();
            const catProducts = safeProducts.filter((p: Product) => (p.category || '').trim() === catName);

            if (catProducts.length === 0) return false;

            const allPhasedOut = catProducts.every((p: Product) => {
              const s = (p.status || '');
              return s === 'Phased Out' || s === 'Removal Requested' || s === 'Removal Pending';
            });

            return !allPhasedOut;
          });
        }

        cacheSet(cacheKey, result);
        return result;
      } catch (error) {
        console.error("Error getting categories", error);
        return [];
      } finally {
        categoriesPromise.delete(cacheKey); // Clear promise when done
      }
    })();

    categoriesPromise.set(cacheKey, promise);
    return promise;
  }

  // Get full Category metadata - D1 ONLY
  static async getCategoryMetadata(slugOrName: string): Promise<Category | null> {
    try {
      // Try D1 (by slug) first which is standard
      const { data: d1Data } = await dbClient.getCategoryBySlug(slugOrName);
      if (d1Data) return d1Data;

      // If not found by slug, it might be legacy or passed as name, try to find in list
      // Since we don't have getCategoryByName in dbClient, we'll fetch all and find
      const { data: allCats } = await dbClient.getCategories();
      if (allCats) {
        const match = allCats.find((c: { name: string; slug: string }) => c.name === slugOrName || c.slug === slugOrName);
        if (match) return match;
      }

      return null;
    } catch (e) {
      console.error("Error fetching category metadata", e);
      return null;
    }
  }

  // Get all full category objects with nav_font/nav_font_size - cached
  static async getCategoryObjects(): Promise<Category[]> {
    const cached = cacheGet<Category[]>('category_objects');
    if (cached) return cached;
    try {
      const { data, error } = await dbClient.getCategories();
      if (error || !data) return [];
      cacheSet('category_objects', data as Category[]);
      return data as Category[];
    } catch {
      return [];
    }
  }

  // Add new category - D1 ONLY
  static async addCategory(category: Partial<Category>): Promise<{ data: Category | null; error: Error | null }> {
    try {
      console.log('➕ Adding category to D1');
      const result = await dbClient.createCategory(category);
      this.clearCache();
      return result;
    } catch (e) {
      return { data: null, error: e };
    }
  }

  // Update category - D1 ONLY
  static async updateCategory(id: string, updates: Partial<Category>): Promise<{ data: Category | null; error: Error | null }> {
    try {
      console.log('✏️ Updating category in D1');
      const result = await dbClient.updateCategory(id, updates);
      this.clearCache();
      return result;
    } catch (e) {
      return { data: null, error: e };
    }
  }

  // Delete category - D1 ONLY
  static async deleteCategory(id: string): Promise<{ error: Error | null }> {
    try {
      console.log('🗑️ Deleting category from D1');
      const result = await dbClient.deleteCategory(id);
      this.clearCache();
      return { error: result.error };
    } catch (e) {
      return { error: e };
    }
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    const cacheKey = `category_${category}`;
    const cached = cacheGet<Product[]>(cacheKey);
    if (cached) return cached;

    try {
      console.log(`→ Fetching products for category ${category} from D1 API`);
      const { data, error } = await dbClient.getProductsByCategory(category);
      if (error) {
        console.error('❌ D1 API failed:', error);
        return [];
      }
      const products = data || [];
      cacheSet(cacheKey, products);
      return products;
    } catch (error) {
      console.error('❌ Error fetching products by category:', error);
      return [];
    }
  }

  // Clear all caches (called after add/update/delete)
  static clearCache(): void {
    cacheClear();
    productsPromise = null;
    categoriesPromise.clear();
  }

  // Get current database provider
  static getDatabaseProvider(): string {
    return 'd1-only';
  }

  // Add a new product - D1 ONLY
  static async addProduct(product: Partial<Product>): Promise<{ data: Product | null; error: Error | null }> {
    const result = await dbClient.createProduct(product);
    this.clearCache();
    return result;
  }

  // Update a product (D1 ONLY - no Supabase write)
  static async updateProduct(id: string, updates: Partial<Product>): Promise<{ data: Product | null; error: Error | null }> {
    console.log('✏️  Updating product in D1 ONLY');

    // Write to D1 ONLY
    const result = await dbClient.updateProduct(id, updates);

    // Clear cache after updating
    this.clearCache();

    return result;
  }

  // Delete a product (D1 ONLY - no Supabase write)
  static async deleteProduct(id: string): Promise<{ data: unknown; error: Error | null }> {
    console.log('🗑️  Deleting product from D1 ONLY');

    // Delete from D1 ONLY
    const result = await dbClient.deleteProduct(id);

    // Clear cache after deleting
    this.clearCache();

    return result;
  }
}
