import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function setUserAdmin() {
  try {
    console.log('🔐 Authenticating as admin...');

    const adminEmail = process.env.PB_ADMIN_EMAIL || 'manimanavi801@gmail.com';
    const adminPassword = process.env.PB_ADMIN_PASSWORD || 'XKewxt4f4WT6tB8';

    await pb.admins.authWithPassword(adminEmail, adminPassword);
    console.log('✅ Admin authenticated');

    const userId = 'yej90tktrjo8ya0';

    console.log(`\n👤 Fetching user ${userId}...`);
    const user = await pb.collection('users').getOne(userId);

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
