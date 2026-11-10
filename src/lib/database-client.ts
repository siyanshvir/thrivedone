import { products as staticProducts } from '@/data/products';

// Map camelCase (data/products.ts) → snake_case (ProductService interface)
function mapProduct(p: typeof staticProducts[0]) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    status: p.status,
    sku: p.sku,
    price: p.price,
    buy_link: p.buyLink,
    image_url: p.image,
    group_name: p.groupName,
    color: p.color,
    hex_color: p.hexColor,
  };
}

const mappedProducts = staticProducts.map(mapProduct);

function getUniqueCategories() {
  const names = [...new Set(mappedProducts.map(p => p.category))];
  return names.map((name, idx) => ({
    id: `cat-${idx}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
  }));
}

class DatabaseClientService {
  async getAllProducts() {
    return { data: mappedProducts, error: null };
  }

  async getProductBySku(sku: string) {
    const product = mappedProducts.find(p => p.sku === sku) || null;
    return { data: product, error: null };
  }

  async getProductsByCategory(category: string) {
    return { data: mappedProducts.filter(p => p.category === category), error: null };
  }

  async createProduct(_product: unknown) {
    return { data: null, error: new Error('Product management is disabled') };
  }

  async updateProduct(_id: string, _updates: unknown) {
    return { data: null, error: new Error('Product management is disabled') };
  }

  async deleteProduct(_id: string) {
    return { data: null, error: new Error('Product management is disabled') };
  }

  getProvider() {
    return 'static';
  }

  getSupabaseClient() {
    return null;
  }

  async getCategories() {
    return { data: getUniqueCategories(), error: null };
  }

  async getCategoryBySlug(slug: string) {
    const found = getUniqueCategories().find(c => c.slug === slug) || null;
    return { data: found, error: null };
  }

  async createCategory(_category: unknown) {
    return { data: null, error: new Error('Category management is disabled') };
  }

  async updateCategory(_id: string, _updates: unknown) {
    return { data: null, error: new Error('Category management is disabled') };
  }

  async deleteCategory(_id: string) {
    return { data: null, error: new Error('Category management is disabled') };
  }
}

export const dbClient = new DatabaseClientService();
export default dbClient;
