import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function fixApiRules() {
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

    // Fix categories API rules
    console.log('📦 Updating categories API rules...');
    const categoriesCollection = await pb.collections.getFirstListItem('name="categories"');
    await pb.collections.update(categoriesCollection.id, {
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      updateRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"',
    });
    console.log('✅ Categories are publicly readable, admins can CRUD');

    // Fix products API rules
    console.log('📦 Updating products API rules...');
    const productsCollection = await pb.collections.getFirstListItem('name="products"');
    await pb.collections.update(productsCollection.id, {
      listRule: '',
      viewRule: '',
      createRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      updateRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"',
    });
    console.log('✅ Products are publicly readable, admins can CRUD');

    // Fix cart_items API rules (authenticated users only)
    console.log('📦 Updating cart_items API rules...');
    try {
      const cartCollection = await pb.collections.getFirstListItem('name="cart_items"');
      await pb.collections.update(cartCollection.id, {
        listRule: 'user = @request.auth.id',
        viewRule: 'user = @request.auth.id',
        createRule: '@request.auth.id != ""',
        updateRule: 'user = @request.auth.id',
        deleteRule: 'user = @request.auth.id',
      });
      console.log('✅ Cart items rules updated');
    } catch (e) {
      console.log('⚠️  Cart items collection not found, skipping');
    }

    // Fix orders API rules
    console.log('📦 Updating orders API rules...');
    try {
      const ordersCollection = await pb.collections.getFirstListItem('name="orders"');
      await pb.collections.update(ordersCollection.id, {
        listRule: '@request.auth.id != "" && (@request.auth.role = "admin" || user = @request.auth.id)',
        viewRule: '@request.auth.id != "" && (@request.auth.role = "admin" || user = @request.auth.id)',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != "" && @request.auth.role = "admin"',
        deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      });
      console.log('✅ Orders rules updated - admins can manage, users can view their own');
    } catch (e) {
      console.log('⚠️  Orders collection not found, skipping');
    }

    // Fix users API rules
    console.log('📦 Updating users API rules...');
    try {
      const usersCollection = await pb.collections.getFirstListItem('name="users"');
      await pb.collections.update(usersCollection.id, {
        listRule: '@request.auth.id != "" && @request.auth.role = "admin"',
        viewRule: '@request.auth.id != "" && (@request.auth.role = "admin" || @request.auth.id = id)',
        createRule: '',
        updateRule: '@request.auth.id != "" && (@request.auth.role = "admin" || @request.auth.id = id)',
        deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      });
      console.log('✅ Users rules updated - admins can manage, users can view/edit themselves');
    } catch (e) {
      console.log('⚠️  Users collection not found, skipping');
    }

    console.log('\n🎉 All API rules fixed!');
    console.log('\n✅ Categories and Products are now publicly readable');
    console.log('✅ Cart and Orders require authentication');

  } catch (error) {
    console.error('❌ Error fixing API rules:', error);
    process.exit(1);
  }
}

fixApiRules();
