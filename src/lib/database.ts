// Deprecated: site no longer uses D1 or Supabase.
export const db = {
  query: async () => ({ data: null, error: null }),
  getAllProducts: async () => ({ data: [], error: null }),
  getProductBySku: async () => ({ data: [], error: null }),
  getProductsByCategory: async () => ({ data: [], error: null }),
  resetToPrimary: () => {},
  getProvider: () => 'static' as const,
  getSupabaseClient: () => null,
};

export default db;
