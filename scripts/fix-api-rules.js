import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// You need to authenticate as admin first
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.PB_ADMIN_PASSWORD || 'admin123456';

async function fixApiRules() {
  try {
    // Authenticate as admin
    console.log('🔐 Authenticating as admin...');
    await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
    console.log('✅ Authenticated successfully!\n');

    // Fix Products collection
    console.log('📦 Updating Products collection rules...');
    await pb.collections.update('products', {
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      updateRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"',
    });
    console.log('✅ Products rules updated');

    // Fix Categories collection
    console.log('🏷️  Updating Categories collection rules...');
    await pb.collections.update('categories', {
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      updateRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"',
    });
    console.log('✅ Categories rules updated');

    // Fix Orders collection
    console.log('🛒 Updating Orders collection rules...');
    await pb.collections.update('orders', {
      listRule: '@request.auth.id != "" && (@request.auth.role = "admin" || @request.auth.id = user)',
      viewRule: '@request.auth.id != "" && (@request.auth.role = "admin" || @request.auth.id = user)',
      createRule: '@request.auth.id != ""',
      updateRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"',
    });
    console.log('✅ Orders rules updated');

    // Fix Users collection
    console.log('👥 Updating Users collection rules...');
    await pb.collections.update('users', {
      listRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      viewRule: '@request.auth.id != "" && (@request.auth.role = "admin" || @request.auth.id = id)',
      createRule: '',
      updateRule: '@request.auth.id != "" && (@request.auth.role = "admin" || @request.auth.id = id)',
      deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"',
    });
    console.log('✅ Users rules updated');

    console.log('\n🎉 All API rules have been fixed successfully!');
    console.log('\nYour admin panel should now work without permission errors.');

  } catch (error) {
    console.error('\n❌ Error fixing API rules:');
    console.error(error.message);
    console.error('\nMake sure:');
    console.error('1. PocketBase is running on http://127.0.0.1:8090');
    console.error('2. You have a PocketBase admin account created');
    console.error('3. Set correct admin credentials:');
    console.error('   - PB_ADMIN_EMAIL environment variable');
    console.error('   - PB_ADMIN_PASSWORD environment variable');
    console.error('\nOr edit the script and set ADMIN_EMAIL and ADMIN_PASSWORD directly.');
    process.exit(1);
  }
}

fixApiRules();
