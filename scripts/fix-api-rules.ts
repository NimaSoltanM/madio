import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function fixApiRules() {
  try {
    console.log('🔐 Authenticating as admin...');

    const adminEmail = process.env.PB_ADMIN_EMAIL || 'manimanavi801@gmail.com';
    const adminPassword = process.env.PB_ADMIN_PASSWORD || 'XKewxt4f4WT6tB8';

    await pb.admins.authWithPassword(adminEmail, adminPassword);
    console.log('✅ Admin authenticated');

    // Fix categories API rules
    console.log('📦 Updating categories API rules...');
    const categoriesCollection = await pb.collections.getFirstListItem('name="categories"');
    await pb.collections.update(categoriesCollection.id, {
      listRule: '',
      viewRule: '',
    });
    console.log('✅ Categories are now publicly readable');

    // Fix products API rules
    console.log('📦 Updating products API rules...');
    const productsCollection = await pb.collections.getFirstListItem('name="products"');
    await pb.collections.update(productsCollection.id, {
      listRule: '',
      viewRule: '',
    });
    console.log('✅ Products are now publicly readable');

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
        listRule: 'user = @request.auth.id',
        viewRule: 'user = @request.auth.id',
        createRule: '@request.auth.id != ""',
        updateRule: null,
        deleteRule: null,
      });
      console.log('✅ Orders rules updated');
    } catch (e) {
      console.log('⚠️  Orders collection not found, skipping');
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
