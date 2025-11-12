import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function fixUsersApiRules() {
  try {
    const adminEmail = process.env.PB_ADMIN_EMAIL;
    const adminPassword = process.env.PB_ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('❌ Error: PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD must be set in .env file');
      console.log('\n📝 Steps to fix:');
      console.log('1. Copy .env.example to .env');
      console.log('2. Set PB_ADMIN_EMAIL and PB_ADMIN_PASSWORD in .env file');
      process.exit(1);
    }

    // Authenticate as admin
    await pb.admins.authWithPassword(adminEmail, adminPassword);

    console.log('✅ Authenticated as admin');

    // Get users collection
    const collections = await pb.collections.getFullList();
    const usersCollection = collections.find((c) => c.name === 'users');

    if (!usersCollection) {
      console.error('❌ Users collection not found');
      return;
    }

    // Update API rules to allow public registration
    await pb.collections.update(usersCollection.id, {
      // Allow anyone to create an account (public registration)
      createRule: '',

      // Only authenticated users can view their own profile
      listRule: '@request.auth.id != ""',
      viewRule: '@request.auth.id = id',

      // Only users can update their own profile
      updateRule: '@request.auth.id = id',

      // Users cannot delete their own account (admin only)
      deleteRule: null,
    });

    console.log('✅ Users collection API rules updated successfully!');
    console.log('   - Public registration: ✅ Enabled');
    console.log('   - View own profile: ✅ Enabled');
    console.log('   - Update own profile: ✅ Enabled');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixUsersApiRules();
