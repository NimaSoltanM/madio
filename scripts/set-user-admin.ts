import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function setUserAdmin() {
  try {
    console.log('🔐 Authenticating as admin...');

    const adminEmail = process.env.PB_ADMIN_EMAIL;
    const adminPassword = process.env.PB_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('❌ Error: PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD must be set in .env file');
      console.log('\n📝 Steps to fix:');
      console.log('1. Copy .env.example to .env');
      console.log('2. Set PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD in .env file');
      process.exit(1);
    }

    await pb.admins.authWithPassword(adminEmail, adminPassword);
    console.log('✅ Admin authenticated');

    // Get user email from command line argument
    const userEmail = process.argv[2];
    if (!userEmail) {
      console.error('❌ Error: Please provide user email as argument');
      console.log('\n📝 Usage: npm run pb:set-admin <user-email>');
      console.log('   Example: npm run pb:set-admin user@example.com');
      process.exit(1);
    }

    console.log(`\n👤 Fetching user with email: ${userEmail}...`);
    const user = await pb.collection('users').getFirstListItem(`email="${userEmail}"`);

    console.log('Current user data:');
    console.log('  - Name:', user.name);
    console.log('  - Email:', user.email);
    console.log('  - Role:', user.role || 'not set');

    console.log('\n🔧 Setting role to "admin"...');
    await pb.collection('users').update(userId, {
      role: 'admin',
    });

    const updatedUser = await pb.collection('users').getOne(userId);
    console.log('✅ User updated!');
    console.log('  - Name:', updatedUser.name);
    console.log('  - Email:', updatedUser.email);
    console.log('  - Role:', updatedUser.role);

    console.log('\n🎉 Success! You can now access the admin panel.');
    console.log('⚠️  Important: Logout and login again for changes to take effect!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setUserAdmin();
