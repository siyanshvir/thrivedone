/**
 * Supabase Migration: Add secondary_image_url column to products table
 * Run: node scripts/migrate-supabase-secondary-image.js
 *
 * If the auto-migration fails, run the SQL manually in:
 * https://supabase.com/dashboard/project/quygevwkhlggdifdqqto/sql/new
 */

const SUPABASE_URL = 'https://quygevwkhlggdifdqqto.supabase.co';
const SUPABASE_PROJECT_ID = 'quygevwkhlggdifdqqto';
const MIGRATION_SQL = `ALTER TABLE products ADD COLUMN IF NOT EXISTS secondary_image_url TEXT;`;

async function runMigration() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_TOKEN;

  if (!key) {
    console.error('No Supabase key found in environment.');
    printManual();
    process.exit(1);
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': key, 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ sql: MIGRATION_SQL }),
    });
    if (res.ok) {
      console.log('Migration complete: secondary_image_url column added.');
      return;
    }
    throw new Error((await res.json().catch(() => ({}))).message || `HTTP ${res.status}`);
  } catch (err) {
    console.error('Auto-migration failed:', err.message);
    printManual();
  }
}

function printManual() {
  console.log('\nRun this SQL in Supabase Dashboard > SQL Editor:');
  console.log(`  https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`);
  console.log('─'.repeat(60));
  console.log(MIGRATION_SQL);
  console.log('─'.repeat(60));
}

runMigration();
