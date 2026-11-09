/**
 * Change Admin Password in Supabase Auth
 * 
 * This script updates the password for the admin user in Supabase Auth.
 * 
 * Usage:
 *   node scripts/change-admin-password.js <new-password>
 * 
 * Example:
 *   node scripts/change-admin-password.js MyNewSecurePassword123!
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.VITE_ADMIN_EMAIL;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!ADMIN_EMAIL) {
  console.error('❌ VITE_ADMIN_EMAIL not set in .env file');
  console.error('   Please set the admin email address');
  process.exit(1);
}

// Get new password from command line argument
const newPassword = process.argv[2];

if (!newPassword) {
  console.error('❌ Usage: node scripts/change-admin-password.js <new-password>');
  console.error('   Example: node scripts/change-admin-password.js MyNewPassword123!');
  process.exit(1);
}

// Validate password strength
if (newPassword.length < 8) {
  console.error('❌ Password must be at least 8 characters long');
  process.exit(1);
}

// Create Supabase admin client (with service role key for admin operations)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function changePassword() {
  console.log('🔐 Changing password for admin user...\n');
  console.log(`Admin Email: ${ADMIN_EMAIL}`);
  console.log(`New Password: ${'*'.repeat(newPassword.length)}\n`);

  try {
    // First, get the user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      process.exit(1);
    }

    const adminUser = users.users.find(u => u.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

    if (!adminUser) {
      console.error(`❌ User not found with email: ${ADMIN_EMAIL}`);
      console.log('\n📋 Available users:');
      users.users.forEach(u => {
        console.log(`   - ${u.email} (ID: ${u.id})`);
      });
      process.exit(1);
    }

    console.log(`✓ Found user: ${adminUser.email} (ID: ${adminUser.id})\n`);

    // Update the user's password
    const { data, error } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { password: newPassword }
    );

    if (error) {
      console.error('❌ Error updating password:', error.message);
      process.exit(1);
    }

    console.log('✅ Password updated successfully!\n');
    console.log('📝 Details:');
    console.log(`   Email: ${data.user.email}`);
    console.log(`   User ID: ${data.user.id}`);
    console.log(`   Updated: ${new Date().toISOString()}\n`);
    console.log('🎉 You can now login with the new password!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

changePassword();
