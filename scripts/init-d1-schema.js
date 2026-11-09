/**
 * Initialize Cloudflare D1 Database Schema
 * Run: node scripts/init-d1-schema.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const DATABASE_ID = process.env.Database;

if (!ACCOUNT_ID || !API_TOKEN || !DATABASE_ID) {
  console.error('❌ Missing required environment variables:');
  console.error('   CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, Database');
  process.exit(1);
}

async function initD1Schema() {
  console.log('🚀 Initializing Cloudflare D1 Database Schema...\n');

  // Read SQL schema file
  const schemaPath = join(__dirname, '..', 'sql', 'd1_schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');

  // Split into individual statements (SQLite doesn't support multiple statements in one API call)
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sql: statement
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        successCount++;
        console.log(`✅ [${i + 1}/${statements.length}] Statement executed successfully`);
      } else {
        errorCount++;
        console.error(`❌ [${i + 1}/${statements.length}] Failed:`, result.errors);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ [${i + 1}/${statements.length}] Error:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Success: ${successCount} statements`);
  console.log(`❌ Errors: ${errorCount} statements`);
  console.log('='.repeat(50));

  if (errorCount === 0) {
    console.log('\n🎉 D1 Database schema initialized successfully!');
  } else {
    console.log('\n⚠️  Some statements failed. Check errors above.');
  }
}

initD1Schema().catch(console.error);
