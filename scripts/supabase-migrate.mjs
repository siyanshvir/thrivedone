/**
 * One-time Supabase migration script.
 * Adds clearance_price column to the products table.
 *
 * Usage:
 *   SUPABASE_DB_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" node scripts/supabase-migrate.mjs
 *
 * The connection string is in your Supabase dashboard:
 *   Project Settings > Database > Connection string > URI (Transaction pooler)
 */

import pg from 'pg';
const { Client } = pg;

const url = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

if (!url) {
  console.error('❌ Set SUPABASE_DB_URL to your Supabase Postgres connection string.');
  console.error('   Find it in: Supabase Dashboard > Project Settings > Database > Connection string');
  process.exit(1);
}

const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('✅ Connected to Supabase Postgres');

  await client.query(`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS clearance_price REAL
  `);
  console.log('✅ clearance_price column added (or already existed)');

} catch (err) {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
} finally {
  await client.end();
}

console.log('✅ Supabase migration complete');
