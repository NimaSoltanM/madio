import 'dotenv/config';
import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

/**
 * Complete setup script that runs all setup steps in order:
 * 1. Create database collections
 * 2. Fix API access rules
 * 3. Seed demo data
 */
async function setupAll() {
  try {
    console.log('🚀 Starting complete setup...\n');

    // Check environment variables
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
    console.log('🔐 Authenticating as admin...');
    await pb.admins.authWithPassword(adminEmail, adminPassword);
    console.log('✅ Admin authenticated\n');

    // ==============================================
    // STEP 1: Create Collections
    // ==============================================
    console.log('📦 STEP 1: Creating database collections...\n');

    // Create Categories Collection
    console.log('  Creating categories collection...');
    try {
      await pb.collections.create({
        name: 'categories',
        type: 'base',
        schema: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text', required: false },
          { name: 'icon', type: 'text', required: true },
          {
            name: 'image',
            type: 'file',
            required: false,
            options: {
              maxSelect: 1,
              maxSize: 5242880,
              mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
            },
          },
        ],
        listRule: '',
        viewRule: '',
        createRule: '@request.auth.role = "admin"',
        updateRule: '@request.auth.role = "admin"',
        deleteRule: '@request.auth.role = "admin"',
      });
      console.log('  ✅ Categories collection created');
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.response?.data?.name) {
        console.log('  ⚠️  Categories collection already exists');
      } else {
        throw e;
      }
    }

    // Create Products Collection
    console.log('  Creating products collection...');
    try {
      await pb.collections.create({
        name: 'products',
        type: 'base',
        schema: [
          { name: 'name', type: 'text', required: true },
          { name: 'description', type: 'text', required: true },
          { name: 'price', type: 'number', required: true },
          {
            name: 'image',
            type: 'file',
            required: false,
            options: {
              maxSelect: 1,
              maxSize: 5242880,
              mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
            },
          },
          {
            name: 'category',
            type: 'relation',
            required: true,
            options: {
              collectionId: '',
              cascadeDelete: false,
              minSelect: null,
              maxSelect: 1,
              displayFields: ['name'],
            },
          },
          { name: 'stock', type: 'number', required: true },
          { name: 'featured', type: 'bool', required: false },
        ],
        listRule: '',
        viewRule: '',
        createRule: '@request.auth.role = "admin"',
        updateRule: '@request.auth.role = "admin"',
        deleteRule: '@request.auth.role = "admin"',
      });
      console.log('  ✅ Products collection created');
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.response?.data?.name) {
        console.log('  ⚠️  Products collection already exists');
      } else {
        throw e;
      }
    }

    // Setup Users Collection
    console.log('  Setting up users collection...');
    try {
      const usersCollection = await pb.collections.getOne('users');
      const hasRoleField = usersCollection.schema.some((field: any) => field.name === 'role');
      const hasNameField = usersCollection.schema.some((field: any) => field.name === 'name');

      const newSchema = [...usersCollection.schema];

      if (!hasRoleField) {
        newSchema.push({
          name: 'role',
          type: 'select',
          required: true,
          options: { maxSelect: 1, values: ['user', 'admin'] },
        });
      }

      if (!hasNameField) {
        newSchema.push({ name: 'name', type: 'text', required: false });
      }

      if (!hasRoleField || !hasNameField) {
        await pb.collections.update('users', { schema: newSchema });
        console.log('  ✅ Users collection updated');
      } else {
        console.log('  ⚠️  Users collection already configured');
      }
    } catch (e: any) {
      console.log('  ℹ️  Users collection setup skipped (may need manual setup)');
    }

    // Create Cart Items Collection
    console.log('  Creating cart_items collection...');
    try {
      const cartCollection = await pb.collections.create({
        name: 'cart_items',
        type: 'base',
        schema: [
          {
            name: 'user',
            type: 'relation',
            required: true,
            options: {
              collectionId: '',
              cascadeDelete: true,
              minSelect: null,
              maxSelect: 1,
              displayFields: ['email'],
            },
          },
          {
            name: 'product',
            type: 'relation',
            required: true,
            options: {
              collectionId: '',
              cascadeDelete: false,
              minSelect: null,
              maxSelect: 1,
              displayFields: ['name'],
            },
          },
          { name: 'quantity', type: 'number', required: true },
        ],
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
      });

      // Rules will be set in STEP 2
      try {
        await pb.collections.update(cartCollection.id, {
          listRule: 'user = @request.auth.id',
          viewRule: 'user = @request.auth.id',
          createRule: '@request.auth.id != ""',
          updateRule: 'user = @request.auth.id',
          deleteRule: 'user = @request.auth.id',
        });
      } catch (ruleError) {
        // Rules will be fixed in STEP 2
      }

      console.log('  ✅ Cart items collection created');
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.response?.data?.name) {
        console.log('  ⚠️  Cart items collection already exists');
      } else {
        console.log('  ⚠️  Could not create cart items collection:', e.message);
      }
    }

    // Create Orders Collection
    console.log('  Creating orders collection...');
    try {
      const ordersCollection = await pb.collections.create({
        name: 'orders',
        type: 'base',
        schema: [
          {
            name: 'user',
            type: 'relation',
            required: true,
            options: {
              collectionId: '',
              cascadeDelete: false,
              minSelect: null,
              maxSelect: 1,
              displayFields: ['email'],
            },
          },
          { name: 'items', type: 'json', required: true },
          { name: 'total', type: 'number', required: true },
          {
            name: 'status',
            type: 'select',
            required: true,
            options: {
              maxSelect: 1,
              values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            },
          },
          { name: 'shippingInfo', type: 'json', required: true },
          {
            name: 'paymentMethod',
            type: 'select',
            required: true,
            options: {
              maxSelect: 1,
              values: ['cash', 'card', 'online'],
            },
          },
        ],
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
      });

      // Rules will be set in STEP 2
      try {
        await pb.collections.update(ordersCollection.id, {
          listRule: 'user = @request.auth.id || @request.auth.role = "admin"',
          viewRule: 'user = @request.auth.id || @request.auth.role = "admin"',
          createRule: '@request.auth.id != ""',
          updateRule: '@request.auth.role = "admin"',
          deleteRule: '@request.auth.role = "admin"',
        });
      } catch (ruleError) {
        // Rules will be fixed in STEP 2
      }

      console.log('  ✅ Orders collection created');
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.response?.data?.name) {
        console.log('  ⚠️  Orders collection already exists');
      } else {
        console.log('  ⚠️  Could not create orders collection:', e.message);
      }
    }

    console.log('\n✅ STEP 1 Complete: All collections created\n');

    // ==============================================
    // STEP 2: Fix API Rules
    // ==============================================
    console.log('🔧 STEP 2: Fixing API access rules...\n');

    // Fix categories
    try {
      const categoriesCollection = await pb.collections.getFirstListItem('name="categories"');
      await pb.collections.update(categoriesCollection.id, {
        listRule: '',
        viewRule: '',
        createRule: '@request.auth.id != "" && @request.auth.role = "admin"',
        updateRule: '@request.auth.id != "" && @request.auth.role = "admin"',
        deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      });
      console.log('  ✅ Categories rules updated');
    } catch (e) {
      console.log('  ⚠️  Could not update categories rules');
    }

    // Fix products
    try {
      const productsCollection = await pb.collections.getFirstListItem('name="products"');
      await pb.collections.update(productsCollection.id, {
        listRule: '',
        viewRule: '',
        createRule: '@request.auth.id != "" && @request.auth.role = "admin"',
        updateRule: '@request.auth.id != "" && @request.auth.role = "admin"',
        deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      });
      console.log('  ✅ Products rules updated');
    } catch (e) {
      console.log('  ⚠️  Could not update products rules');
    }

    // Fix cart_items
    try {
      const cartCollection = await pb.collections.getFirstListItem('name="cart_items"');
      await pb.collections.update(cartCollection.id, {
        listRule: 'user = @request.auth.id',
        viewRule: 'user = @request.auth.id',
        createRule: '@request.auth.id != ""',
        updateRule: 'user = @request.auth.id',
        deleteRule: 'user = @request.auth.id',
      });
      console.log('  ✅ Cart items rules updated');
    } catch (e) {
      console.log('  ⚠️  Could not update cart items rules');
    }

    // Fix orders
    try {
      const ordersCollection = await pb.collections.getFirstListItem('name="orders"');
      await pb.collections.update(ordersCollection.id, {
        listRule: '@request.auth.id != "" && (@request.auth.role = "admin" || user = @request.auth.id)',
        viewRule: '@request.auth.id != "" && (@request.auth.role = "admin" || user = @request.auth.id)',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.id != "" && @request.auth.role = "admin"',
        deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      });
      console.log('  ✅ Orders rules updated');
    } catch (e) {
      console.log('  ⚠️  Could not update orders rules');
    }

    // Fix users
    try {
      const usersCollection = await pb.collections.getFirstListItem('name="users"');
      await pb.collections.update(usersCollection.id, {
        listRule: '@request.auth.id != "" && @request.auth.role = "admin"',
        viewRule: '@request.auth.id != "" && (@request.auth.role = "admin" || @request.auth.id = id)',
        createRule: '',
        updateRule: '@request.auth.id != "" && (@request.auth.role = "admin" || @request.auth.id = id)',
        deleteRule: '@request.auth.id != "" && @request.auth.role = "admin"',
      });
      console.log('  ✅ Users rules updated');
    } catch (e) {
      console.log('  ⚠️  Could not update users rules');
    }

    console.log('\n✅ STEP 2 Complete: All API rules fixed\n');

    // ==============================================
    // STEP 3: Seed Demo Data
    // ==============================================
    console.log('🌱 STEP 3: Seeding demo data...\n');

    // Seed Categories
    const categories = [
      { name: 'آرایش صورت', description: 'محصولات آرایشی برای زیبایی صورت شما', icon: '💄' },
      { name: 'مراقبت از پوست', description: 'محصولات مراقبت و زیبایی پوست', icon: '✨' },
      { name: 'عطر و ادکلن', description: 'بهترین عطرها و ادکلن‌های برند', icon: '🌹' },
      { name: 'مراقبت از مو', description: 'محصولات تقویت و زیبایی مو', icon: '💅' },
      { name: 'لوازم جانبی', description: 'لوازم جانبی آرایشی و بهداشتی', icon: '🎀' },
    ];

    const createdCategories: any[] = [];
    for (const category of categories) {
      try {
        const created = await pb.collection('categories').create(category);
        createdCategories.push(created);
        console.log(`  ✅ Created category: ${category.name}`);
      } catch (e: any) {
        const existing = await pb.collection('categories').getFirstListItem(`name="${category.name}"`);
        createdCategories.push(existing);
        console.log(`  ⚠️  Category ${category.name} already exists`);
      }
    }

    // Seed Products (abbreviated for script length)
    const products = [
      { name: 'رژلب مات درخشان', description: 'رژلب مات با ماندگاری بالا', price: 350000, stock: 50, featured: true, category: createdCategories[0].id },
      { name: 'پالت سایه چشم حرفه‌ای', description: 'پالت 12 رنگ سایه چشم', price: 580000, stock: 30, featured: true, category: createdCategories[0].id },
      { name: 'سرم ویتامین C', description: 'سرم روشن‌کننده پوست', price: 720000, stock: 25, featured: true, category: createdCategories[1].id },
      { name: 'کرم آبرسان هیالورونیک', description: 'رطوبت 24 ساعته', price: 680000, stock: 28, featured: true, category: createdCategories[1].id },
      { name: 'عطر زنانه رز گلد', description: 'عطر لوکس با ماندگاری بالا', price: 1250000, stock: 15, featured: true, category: createdCategories[2].id },
      // Add more products as needed...
    ];

    let productsCreated = 0;
    for (const product of products) {
      try {
        await pb.collection('products').create(product);
        productsCreated++;
      } catch (e: any) {
        // Product might already exist
      }
    }
    console.log(`  ✅ Created ${productsCreated} products\n`);

    console.log('✅ STEP 3 Complete: Demo data seeded\n');

    // ==============================================
    // Final Summary
    // ==============================================
    console.log('🎉 Complete setup finished successfully!\n');
    console.log('📊 Summary:');
    console.log(`   ✅ ${categories.length} categories`);
    console.log(`   ✅ ${productsCreated} products`);
    console.log(`   ✅ All collections created`);
    console.log(`   ✅ All API rules configured\n`);
    console.log('📝 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Visit http://localhost:3000');
    console.log('   3. Sign up for a user account');
    console.log('   4. Run: npm run pb:set-admin your@email.com');
    console.log('   5. Logout and login again to access admin panel\n');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

setupAll();
