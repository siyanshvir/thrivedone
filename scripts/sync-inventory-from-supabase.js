/**
 * Sync inventory from Supabase to D1
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Escape string for SQL
function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
}

async function syncInventory() {
  console.log('🚀 Syncing inventory from Supabase to D1...\n');

  // Fetch all inventory from Supabase
  const { data: inventory, error } = await supabase
    .from('inventory')
    .select('*')
    .order('sku');

  if (error) {
    console.error('❌ Failed to fetch inventory:', error);
    process.exit(1);
  }

  console.log(`📦 Found ${inventory.length} inventory items in Supabase\n`);

  // Build SQL file
  let sqlStatements = [];

  for (const item of inventory) {
    const sql = `INSERT OR REPLACE INTO inventory (id, sku, item_name, stock_bought, stock_left, created_at, updated_at, is_active) VALUES (${escapeSql(item.id)}, ${escapeSql(item.sku)}, ${escapeSql(item.item_name)}, ${item.stock_bought || 0}, ${item.stock_left || 0}, ${escapeSql(item.created_at)}, ${escapeSql(item.updated_at)}, ${item.is_active ? 1 : 0});`;

    sqlStatements.push(sql);
    console.log(`✓ Prepared ${item.sku}`);
  }

  // Write SQL file
  const sqlFile = 'scripts/sync-inventory.sql';
  fs.writeFileSync(sqlFile, sqlStatements.join('\n'));
  console.log(`\n📄 SQL file created: ${sqlFile}`);

  // Execute SQL file
  console.log('\n🔄 Executing SQL on remote D1...\n');

  try {
    execSync(`npx wrangler d1 execute thrive-products --remote --file=${sqlFile}`, {
      stdio: 'inherit'
    });
    console.log('\n✅ All inventory synced to D1!');
  } catch (err) {
    console.error('\n❌ Failed to execute SQL:', err.message);
  }
}

syncInventory();
