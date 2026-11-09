/**
 * Sync API - Sync D1 to Supabase
 * 
 * This endpoint fetches all data from D1 and syncs it to Supabase
 */

import { createClient } from '@supabase/supabase-js';

export async function onRequest(context: any): Promise<Response> {
  const { request, env } = context;
  const method = request.method;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (method !== 'POST') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const db = env.DB;
  
  if (!db) {
    return new Response(JSON.stringify({
      success: false,
      error: 'D1 binding not configured'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    // Get Supabase credentials from environment
    const supabaseUrl = env.VITE_SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Supabase credentials not configured'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all products from D1
    let d1Products: any[] = [];
    try {
      const { results } = await db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
      d1Products = results || [];
    } catch (error: any) {
      if (!error.message.includes('no such table')) {
        throw error;
      }
    }

    // Fetch all inventory from D1
    let d1Inventory: any[] = [];
    try {
      const { results } = await db.prepare('SELECT * FROM inventory ORDER BY sku ASC').all();
      d1Inventory = results || [];
    } catch (error: any) {
      if (!error.message.includes('no such table')) {
        throw error;
      }
    }

    if (d1Products.length === 0 && d1Inventory.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No data found in D1 to sync',
        stats: {
          products: { synced: 0, errors: 0 },
          inventory: { synced: 0, errors: 0 }
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Sync products
    let productsSynced = 0;
    let productsErrors = 0;

    for (const product of d1Products) {
      try {
        // Parse specifications if it's a string
        let specifications = product.specifications;
        if (typeof specifications === 'string') {
          try {
            specifications = JSON.parse(specifications);
          } catch {
            specifications = {};
          }
        }

        const productData = {
          name: product.name,
          description: product.description,
          category: product.category,
          status: product.status || 'In Store',
          sku: product.sku,
          price: parseFloat(product.price),
          clearance_price: product.clearance_price != null ? parseFloat(product.clearance_price) : null,
          buy_link: product.buy_link,
          image_url: product.image_url,
          secondary_image_url: product.secondary_image_url || null,
          group_name: product.group_name,
          color: product.color,
          hex_color: (product.hex_color || '').trim() || null,
          secondary_hex_color: (product.secondary_hex_color || '').trim() || null,
          variant_order: product.variant_order,
          created_at: product.created_at,
          updated_at: new Date().toISOString(),
          created_by: product.created_by,
          specifications: specifications || {}
        };

        const { error } = await supabase
          .from('products')
          .upsert(productData, { onConflict: 'sku' });

        if (error) {
          console.error(`Failed to sync product ${product.sku}:`, error);
          productsErrors++;
        } else {
          productsSynced++;
        }
      } catch (error) {
        console.error(`Error processing product ${product.sku}:`, error);
        productsErrors++;
      }
    }

    // Sync inventory
    let inventorySynced = 0;
    let inventoryErrors = 0;

    for (const item of d1Inventory) {
      try {
        const inventoryData = {
          sku: item.sku,
          item_name: item.item_name,
          stock_bought: parseInt(item.stock_bought) || 0,
          stock_left: parseInt(item.stock_left) || 0,
          created_at: item.created_at,
          updated_at: new Date().toISOString(),
          is_active: item.is_active !== undefined ? item.is_active : true
        };

        const { error } = await supabase
          .from('inventory')
          .upsert(inventoryData, { onConflict: 'sku' });

        if (error) {
          console.error(`Failed to sync inventory ${item.sku}:`, error);
          inventoryErrors++;
        } else {
          inventorySynced++;
        }
      } catch (error) {
        console.error(`Error processing inventory ${item.sku}:`, error);
        inventoryErrors++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Synced ${productsSynced + inventorySynced} items from D1 to Supabase`,
      stats: {
        products: {
          total: d1Products.length,
          synced: productsSynced,
          errors: productsErrors
        },
        inventory: {
          total: d1Inventory.length,
          synced: inventorySynced,
          errors: inventoryErrors
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Sync error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
