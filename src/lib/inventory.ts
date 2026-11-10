import { supabase } from './supabase'

export interface InventoryItem {
  id: string
  product_id: string
  sku: string
  stock_bought: number
  stock_left: number
  status: string
  item_name: string
  last_updated_from_invoice: string | null
  invoice_date: string | null
  due_date: string | null
  created_at: string
  updated_at: string
}

export interface InventorySummary {
  id: string
  total_products: number
  total_quantity: number
  backordered_count: number
  in_stock_count: number
  low_stock_count: number
  out_of_stock_count: number
  last_updated: string
}

export function getInventoryStatus(stockLeft: number): string {
  const stock = parseInt(String(stockLeft)) || 0
  
  if (stock < 0) return 'Backordered'
  if (stock === 0) return 'Out of stock'
  if (stock <= 10) return 'Low stock'
  return 'In stock'
}

export class InventoryService {
  static async getInventoryByProductId(productId: string): Promise<InventoryItem | null> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', productId)
      .single()

    if (error) {
      console.error('Error fetching inventory:', error)
      return null
    }

    return data
  }

  static async getAllInventory(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('sku', { ascending: true })

    if (error) {
      console.error('Error fetching inventory:', error)
      return []
    }

    return data || []
  }

  static async getInventorySummary(): Promise<InventorySummary | null> {
    const { data, error } = await supabase
      .from('inventory_summary')
      .select('*')
      .single()

    if (error) {
      console.error('Error fetching inventory summary:', error)
      return null
    }

    return data
  }

  static async updateInventory(
    productId: string,
    updates: Partial<InventoryItem>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('inventory')
      .update(updates)
      .eq('product_id', productId)

    if (error) {
      console.error('Error updating inventory:', error)
      return false
    }

    return true
  }

  static async createInventory(inventory: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem | null> {
    const { data, error } = await supabase
      .from('inventory')
      .insert(inventory)
      .select()
      .single()

    if (error) {
      console.error('Error creating inventory:', error)
      return null
    }

    return data
  }

  static subscribeToInventoryChanges(callback: (payload: any) => void) {
    return supabase
      .channel('inventory-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        callback
      )
      .subscribe()
  }

  static subscribeToInventorySummaryChanges(callback: (payload: any) => void) {
    return supabase
      .channel('inventory-summary-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_summary' },
        callback
      )
      .subscribe()
  }
}
