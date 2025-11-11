import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function listUsers() {
  try {
    console.log('🔐 Authenticating as admin...');

    const adminEmail = process.env.PB_ADMIN_EMAIL || 'manimanavi801@gmail.com';
    const adminPassword = process.env.PB_ADMIN_PASSWORD || 'XKewxt4f4WT6tB8';

    await pb.admins.authWithPassword(adminEmail, adminPassword);
    console.log('✅ Admin authenticated\n');

    console.log('👥 Fetching all users...');
    const users = await pb.collection('users').getFullList({
      sort: '-created',
    });

    console.log(`\nFound ${users.length} users:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role || 'not set'}`);
      console.log('');
    });

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listUsers();
