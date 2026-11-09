/**
 * Manage Supabase Auth Users
 * 
 * This script helps you manage authentication users in Supabase.
 * 
 * Usage:
 *   node scripts/manage-auth-users.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function listUsers() {
  console.log('\n📋 Fetching all auth users...\n');
  
  const { data: users, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error('❌ Error listing users:', error.message);
    return null;
  }

  if (users.users.length === 0) {
    console.log('⚠️  No users found in auth.users table\n');
    return [];
  }

  console.log(`Found ${users.users.length} user(s):\n`);
  users.users.forEach((user, index) => {
    console.log(`${index + 1}. Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
    console.log(`   Last Sign In: ${user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}`);
    console.log('');
  });

  return users.users;
}

async function changePassword(userId, newPassword) {
  const { data, error } = await supabase.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  );

  if (error) {
    console.error('❌ Error updating password:', error.message);
    return false;
  }

  console.log('\n✅ Password updated successfully!');
  console.log(`   Email: ${data.user.email}`);
  console.log(`   Updated: ${new Date().toISOString()}\n`);
  return true;
}

async function createUser(email, password) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (error) {
    console.error('❌ Error creating user:', error.message);
    return false;
  }

  console.log('\n✅ User created successfully!');
  console.log(`   Email: ${data.user.email}`);
  console.log(`   ID: ${data.user.id}\n`);
  return true;
}

async function deleteUser(userId) {
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    console.error('❌ Error deleting user:', error.message);
    return false;
  }

  console.log('\n✅ User deleted successfully!\n');
  return true;
}

async function main() {
  console.log('🔐 Supabase Auth User Management\n');
  console.log('='.repeat(50));

  const users = await listUsers();
  
  if (users === null) {
    rl.close();
    return;
  }

  console.log('What would you like to do?\n');
  console.log('1. Change password for a user');
  console.log('2. Create a new user');
  console.log('3. Delete a user');
  console.log('4. Exit\n');

  const choice = await question('Enter your choice (1-4): ');

  switch (choice.trim()) {
    case '1': {
      if (users.length === 0) {
        console.log('\n⚠️  No users available to update');
        break;
      }

      const userIndex = await question('\nEnter user number: ');
      const selectedUser = users[parseInt(userIndex) - 1];

      if (!selectedUser) {
        console.log('❌ Invalid user number');
        break;
      }

      const newPassword = await question('Enter new password (min 8 characters): ');

      if (newPassword.length < 8) {
        console.log('❌ Password must be at least 8 characters');
        break;
      }

      await changePassword(selectedUser.id, newPassword);
      break;
    }

    case '2': {
      const email = await question('\nEnter email: ');
      const password = await question('Enter password (min 8 characters): ');

      if (password.length < 8) {
        console.log('❌ Password must be at least 8 characters');
        break;
      }

      await createUser(email, password);
      break;
    }

    case '3': {
      if (users.length === 0) {
        console.log('\n⚠️  No users available to delete');
        break;
      }

      const userIndex = await question('\nEnter user number to delete: ');
      const selectedUser = users[parseInt(userIndex) - 1];

      if (!selectedUser) {
        console.log('❌ Invalid user number');
        break;
      }

      const confirm = await question(`⚠️  Delete ${selectedUser.email}? (yes/no): `);
      
      if (confirm.toLowerCase() === 'yes') {
        await deleteUser(selectedUser.id);
      } else {
        console.log('❌ Deletion cancelled');
      }
      break;
    }

    case '4':
      console.log('\n👋 Goodbye!\n');
      break;

    default:
      console.log('❌ Invalid choice');
  }

  rl.close();
}

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  rl.close();
  process.exit(1);
});
