/**
 * Check Sync Status - Compare D1 and Supabase
 * 
 * This script compares data between D1 and Supabase to show
 * what's different and what needs syncing
 * 
 * Usage: node scripts/check-sync-status.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8788';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fetchD1Data() {
  try {
    const [productsRes, inventoryRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/products`),
      fetch(`${API_BASE_URL}/api/inventory`)
    ]);
    
    const products = await productsRes.json();
    const inventory = await inventoryRes.json();
    
    return {
      products: products.success ? products.data : [],
      inventory: inventory.success ? inventory.data : []
    };
  } catch (error) {
    console.error('❌ Error fetching D1 data:', error.message);
    return { products: [], inventory: [] };
  }
}

async function fetchSupabaseData() {
  try {
    const [productsRes, inventoryRes] = await Promise.all([
      supabase.from('products').select('*'),
      supabase.from('inventory').select('*')
    ]);
    
    return {
      products: productsRes.data || [],
      inventory: inventoryRes.data || []
    };
  } catch (error) {
    console.error('❌ Error fetching Supabase data:', error.message);
    return { products: [], inventory: [] };
  }
}

function compareData(d1Data, supabaseData) {
  const d1ProductSkus = new Set(d1Data.products.map(p => p.sku));
  const supabaseProductSkus = new Set(supabaseData.products.map(p => p.sku));
  
  const d1InventorySkus = new Set(d1Data.inventory.map(i => i.sku));
  const supabaseInventorySkus = new Set(supabaseData.inventory.map(i => i.sku));
  
  // Products only in D1
  const productsOnlyInD1 = d1Data.products.filter(p => !supabaseProductSkus.has(p.sku));
  
  // Products only in Supabase
  const productsOnlyInSupabase = supabaseData.products.filter(p => !d1ProductSkus.has(p.sku));
  
  // Inventory only in D1
  const inventoryOnlyInD1 = d1Data.inventory.filter(i => !supabaseInventorySkus.has(i.sku));
  
  // Inventory only in Supabase
  const inventoryOnlyInSupabase = supabaseData.inventory.filter(i => !d1InventorySkus.has(i.sku));
  
  // Check for image URL differences
  const imageUrlDifferences = [];
  d1Data.products.forEach(d1Product => {
    const supabaseProduct = supabaseData.products.find(p => p.sku === d1Product.sku);
    if (supabaseProduct && d1Product.image_url !== supabaseProduct.image_url) {
      imageUrlDifferences.push({
        sku: d1Product.sku,
        d1_url: d1Product.image_url,
        supabase_url: supabaseProduct.image_url
      });
    }
  });
  
  return {
    productsOnlyInD1,
    productsOnlyInSupabase,
    inventoryOnlyInD1,
    inventoryOnlyInSupabase,
    imageUrlDifferences
  };
}

async function main() {
  console.log('='.repeat(60));
  console.log('🔍 SYNC STATUS CHECK');
  console.log('='.repeat(60));
  console.log(`📡 D1 API: ${API_BASE_URL}`);
  console.log(`🗄️  Supabase: ${SUPABASE_URL}`);
  console.log('='.repeat(60));
  
  console.log('\n📥 Fetching data from both databases...\n');
  
  const [d1Data, supabaseData] = await Promise.all([
    fetchD1Data(),
    fetchSupabaseData()
  ]);
  
  console.log('📊 Data Counts:');
  console.log(`   D1 Products: ${d1Data.products.length}`);
  console.log(`   Supabase Products: ${supabaseData.products.length}`);
  console.log(`   D1 Inventory: ${d1Data.inventory.length}`);
  console.log(`   Supabase Inventory: ${supabaseData.inventory.length}`);
  
  const comparison = compareData(d1Data, supabaseData);
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 COMPARISON RESULTS');
  console.log('='.repeat(60));
  
  // Products comparison
  if (comparison.productsOnlyInD1.length > 0) {
    console.log(`\n⚠️  ${comparison.productsOnlyInD1.length} products ONLY in D1:`);
    comparison.productsOnlyInD1.forEach(p => {
      console.log(`   • ${p.sku} - ${p.name}`);
    });
  }
  
  if (comparison.productsOnlyInSupabase.length > 0) {
    console.log(`\n⚠️  ${comparison.productsOnlyInSupabase.length} products ONLY in Supabase:`);
    comparison.productsOnlyInSupabase.forEach(p => {
      console.log(`   • ${p.sku} - ${p.name}`);
    });
  }
  
  // Inventory comparison
  if (comparison.inventoryOnlyInD1.length > 0) {
    console.log(`\n⚠️  ${comparison.inventoryOnlyInD1.length} inventory items ONLY in D1:`);
    comparison.inventoryOnlyInD1.forEach(i => {
      console.log(`   • ${i.sku}`);
    });
  }
  
  if (comparison.inventoryOnlyInSupabase.length > 0) {
    console.log(`\n⚠️  ${comparison.inventoryOnlyInSupabase.length} inventory items ONLY in Supabase:`);
    comparison.inventoryOnlyInSupabase.forEach(i => {
      console.log(`   • ${i.sku}`);
    });
  }
  
  // Image URL differences
  if (comparison.imageUrlDifferences.length > 0) {
    console.log(`\n⚠️  ${comparison.imageUrlDifferences.length} products with DIFFERENT image URLs:`);
    comparison.imageUrlDifferences.forEach(diff => {
      console.log(`\n   SKU: ${diff.sku}`);
      console.log(`   D1:       ${diff.d1_url || '(null)'}`);
      console.log(`   Supabase: ${diff.supabase_url || '(null)'}`);
    });
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  
  const totalDifferences = 
    comparison.productsOnlyInD1.length +
    comparison.productsOnlyInSupabase.length +
    comparison.inventoryOnlyInD1.length +
    comparison.inventoryOnlyInSupabase.length +
    comparison.imageUrlDifferences.length;
  
  if (totalDifferences === 0) {
    console.log('✅ Databases are IN SYNC! No differences found.');
  } else {
    console.log(`⚠️  Found ${totalDifferences} differences between databases.`);
    console.log('\n💡 To sync D1 → Supabase, run:');
    console.log('   npm run sync:d1-to-supabase');
  }
  
  console.log('='.repeat(60));
}

main();
