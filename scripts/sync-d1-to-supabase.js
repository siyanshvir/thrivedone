/**
 * Sync D1 to Supabase - Complete Copy
 * 
 * This script fetches ALL data from D1 (via API) and syncs it to Supabase
 * including products, inventory, and image URLs
 * 
 * Usage: npm run sync:d1-to-supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Your deployed site URL or local dev URL
// Default to production if not specified
const API_BASE_URL = process.env.VITE_API_URL || 'https://thrive-ve.com';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Fetch all products from D1 via API
 */
async function fetchD1Products() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch products from D1');
    }
    
    return result.data || [];
  } catch (error) {
    console.error('❌ Error fetching D1 products:', error.message);
    return [];
  }
}

/**
 * Fetch all inventory from D1 via API
 */
async function fetchD1Inventory() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/inventory`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch inventory from D1');
    }
    
    return result.data || [];
  } catch (error) {
    console.error('❌ Error fetching D1 inventory:', error.message);
    return [];
  }
}

/**
 * Sync products from D1 to Supabase
 */
async function syncProducts(d1Products) {
  console.log(`\n📦 Syncing ${d1Products.length} products to Supabase...`);
  
  let successCount = 0;
  let errorCount = 0;
  
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
      
      // Prepare product data for Supabase (exclude id for upsert by SKU)
      const productData = {
        name: product.name,
        description: product.description,
        category: product.category,
        status: product.status || 'In Store',
        sku: product.sku,
        price: parseFloat(product.price),
        buy_link: product.buy_link,
        image_url: product.image_url,
        group_name: product.group_name,
        color: product.color,
        hex_color: product.hex_color,
        secondary_hex_color: product.secondary_hex_color,
        variant_order: product.variant_order,
        created_at: product.created_at,
        updated_at: new Date().toISOString(),
        created_by: product.created_by,
        specifications: specifications || {}
      };
      
      // Upsert to Supabase (insert or update if exists)
      const { error } = await supabase
        .from('products')
        .upsert(productData, { onConflict: 'sku' });
      
      if (error) {
        console.error(`  ❌ Failed to sync product ${product.sku}:`, error.message);
        errorCount++;
      } else {
        console.log(`  ✅ Synced product: ${product.sku} - ${product.name}`);
        successCount++;
      }
    } catch (error) {
      console.error(`  ❌ Error processing product ${product.sku}:`, error.message);
      errorCount++;
    }
  }
  
  return { successCount, errorCount };
}

/**
 * Sync inventory from D1 to Supabase
 */
async function syncInventory(d1Inventory) {
  console.log(`\n📊 Syncing ${d1Inventory.length} inventory items to Supabase...`);
  
  let successCount = 0;
  let errorCount = 0;
  
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
      
      // Upsert to Supabase
      const { error } = await supabase
        .from('inventory')
        .upsert(inventoryData, { onConflict: 'sku' });
      
      if (error) {
        console.error(`  ❌ Failed to sync inventory ${item.sku}:`, error.message);
        errorCount++;
      } else {
        console.log(`  ✅ Synced inventory: ${item.sku} (${item.stock_left} left)`);
        successCount++;
      }
    } catch (error) {
      console.error(`  ❌ Error processing inventory ${item.sku}:`, error.message);
      errorCount++;
    }
  }
  
  return { successCount, errorCount };
}

/**
 * Main sync function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('🔄 D1 → SUPABASE SYNC');
  console.log('='.repeat(60));
  console.log(`📡 API URL: ${API_BASE_URL}`);
  console.log(`🗄️  Supabase URL: ${SUPABASE_URL}`);
  console.log('='.repeat(60));
  
  try {
    // Fetch data from D1
    console.log('\n📥 Fetching data from D1...');
    const [d1Products, d1Inventory] = await Promise.all([
      fetchD1Products(),
      fetchD1Inventory()
    ]);
    
    console.log(`\n✅ Fetched from D1:`);
    console.log(`   • ${d1Products.length} products`);
    console.log(`   • ${d1Inventory.length} inventory items`);
    
    if (d1Products.length === 0 && d1Inventory.length === 0) {
      console.log('\n⚠️  No data found in D1. Nothing to sync.');
      return;
    }
    
    // Sync products
    const productResults = await syncProducts(d1Products);
    
    // Sync inventory
    const inventoryResults = await syncInventory(d1Inventory);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SYNC SUMMARY');
    console.log('='.repeat(60));
    console.log(`Products:`);
    console.log(`  ✅ Success: ${productResults.successCount}`);
    console.log(`  ❌ Errors: ${productResults.errorCount}`);
    console.log(`\nInventory:`);
    console.log(`  ✅ Success: ${inventoryResults.successCount}`);
    console.log(`  ❌ Errors: ${inventoryResults.errorCount}`);
    console.log('='.repeat(60));
    
    const totalSuccess = productResults.successCount + inventoryResults.successCount;
    const totalErrors = productResults.errorCount + inventoryResults.errorCount;
    
    if (totalErrors === 0) {
      console.log('\n🎉 All data synced successfully from D1 to Supabase!');
    } else {
      console.log(`\n⚠️  Sync completed with ${totalErrors} errors. Check logs above.`);
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error during sync:', error);
    process.exit(1);
  }
}

main();
