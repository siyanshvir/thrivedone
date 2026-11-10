// Supabase stub — no credentials required, all operations are silent no-ops.
// The site no longer depends on Supabase for any runtime functionality.

const noopSubscription = { unsubscribe: () => {} };

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'System closed' } }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: (_callback: unknown) => ({ data: { subscription: noopSubscription } }),
  },
  from: (_table: string) => ({
    insert: async (_data: unknown) => ({ data: null, error: null }),
    select: (_cols?: string) => ({
      eq: (_col: string, _val: unknown) => ({ data: [], error: null }),
    }),
  }),
} as any;

// Keep type exports so existing imports don't break
export interface Database {
  public: { Tables: { products: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> } } }
}
export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
