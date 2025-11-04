import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function setupCollections() {
  try {
    console.log('🔐 Authenticating as admin...');

    // You'll need to replace these with your admin credentials
    // First time: create admin via PocketBase UI at http://127.0.0.1:8090/_/
    const adminEmail = process.env.PB_ADMIN_EMAIL || 'admin@madio.com';
    const adminPassword = process.env.PB_ADMIN_PASSWORD || 'admin123456';

    await pb.admins.authWithPassword(adminEmail, adminPassword);
    console.log('✅ Admin authenticated');

    // Create Categories Collection
    console.log('📦 Creating categories collection...');
    try {
      await pb.collections.create({
        name: 'categories',
        type: 'base',
        schema: [
          {
            name: 'name',
            type: 'text',
            required: true,
          },
          {
            name: 'description',
            type: 'text',
            required: false,
          },
          {
            name: 'icon',
            type: 'text',
            required: true,
          },
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
      console.log('✅ Categories collection created');
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.response?.data?.name) {
        console.log('⚠️  Categories collection already exists');
      } else {
        console.error('Error creating categories:', e.response || e.message);
        throw e;
      }
    }

    // Create Products Collection
    console.log('📦 Creating products collection...');
    try {
      await pb.collections.create({
        name: 'products',
        type: 'base',
        schema: [
          {
            name: 'name',
            type: 'text',
            required: true,
          },
          {
            name: 'description',
            type: 'text',
            required: true,
          },
          {
            name: 'price',
            type: 'number',
            required: true,
          },
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
              collectionId: '', // Will be auto-filled
              cascadeDelete: false,
              minSelect: null,
              maxSelect: 1,
              displayFields: ['name'],
            },
          },
          {
            name: 'stock',
            type: 'number',
            required: true,
          },
          {
            name: 'featured',
            type: 'bool',
            required: false,
          },
        ],
        listRule: '',
        viewRule: '',
        createRule: '@request.auth.role = "admin"',
        updateRule: '@request.auth.role = "admin"',
        deleteRule: '@request.auth.role = "admin"',
      });
      console.log('✅ Products collection created');
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.response?.data?.name) {
        console.log('⚠️  Products collection already exists');
      } else {
        console.error('Error creating products:', e.response || e.message);
        throw e;
      }
    }

    // Create or update users collection
    console.log('📦 Setting up users collection...');
    try {
      // Try to get existing users collection
      const usersCollection = await pb.collections.getOne('users');

      // Check if role field exists
      const hasRoleField = usersCollection.schema.some((field: any) => field.name === 'role');
      const hasNameField = usersCollection.schema.some((field: any) => field.name === 'name');

      const newSchema = [...usersCollection.schema];

      if (!hasRoleField) {
        newSchema.push({
          name: 'role',
          type: 'select',
          required: true,
          options: {
            maxSelect: 1,
            values: ['user', 'admin'],
          },
        });
      }

      if (!hasNameField) {
        newSchema.push({
          name: 'name',
          type: 'text',
          required: false,
        });
      }

      if (!hasRoleField || !hasNameField) {
        await pb.collections.update('users', {
          schema: newSchema,
        });
        console.log('✅ Users collection updated');
      } else {
        console.log('⚠️  Users collection already configured');
      }
    } catch (e: any) {
      // Users collection doesn't exist, create it
      console.log('Creating users auth collection...');
      try {
        await pb.collections.create({
          name: 'users',
          type: 'auth',
          schema: [
            {
              name: 'name',
              type: 'text',
              required: false,
            },
            {
              name: 'role',
              type: 'select',
              required: true,
              options: {
                maxSelect: 1,
                values: ['user', 'admin'],
              },
            },
          ],
          options: {
            allowEmailAuth: true,
            allowOAuth2Auth: false,
            allowUsernameAuth: false,
            requireEmail: true,
          },
          listRule: '',
          viewRule: '',
          createRule: '',
          updateRule: '@request.auth.id = id',
          deleteRule: '@request.auth.id = id',
        });
        console.log('✅ Users collection created');
      } catch (createError: any) {
        console.log('⚠️  Could not create users collection:', createError.message);
      }
    }

    // Create Cart Items Collection
    console.log('📦 Creating cart_items collection...');
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
              collectionId: '', // Will be auto-filled
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
              collectionId: '', // Will be auto-filled
              cascadeDelete: false,
              minSelect: null,
              maxSelect: 1,
              displayFields: ['name'],
            },
          },
          {
            name: 'quantity',
            type: 'number',
            required: true,
          },
        ],
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
      });

      // Update with proper rules after creation
      await pb.collections.update(cartCollection.id, {
        listRule: 'user = @request.auth.id',
        viewRule: 'user = @request.auth.id',
        createRule: '@request.auth.id != ""',
        updateRule: 'user = @request.auth.id',
        deleteRule: 'user = @request.auth.id',
      });

      console.log('✅ Cart items collection created');
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.response?.data?.name) {
        console.log('⚠️  Cart items collection already exists');
      } else {
        console.error('Error creating cart_items:', e.response || e.message);
        throw e;
      }
    }

    // Create Orders Collection
    console.log('📦 Creating orders collection...');
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
              collectionId: '', // Will be auto-filled
              cascadeDelete: false,
              minSelect: null,
              maxSelect: 1,
              displayFields: ['email'],
            },
          },
          {
            name: 'items',
            type: 'json',
            required: true,
          },
          {
            name: 'total',
            type: 'number',
            required: true,
          },
          {
            name: 'status',
            type: 'select',
            required: true,
            options: {
              maxSelect: 1,
              values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
            },
          },
        ],
        listRule: null,
        viewRule: null,
        createRule: null,
        updateRule: null,
        deleteRule: null,
      });

      // Update with proper rules after creation
      await pb.collections.update(ordersCollection.id, {
        listRule: 'user = @request.auth.id || @request.auth.role = "admin"',
        viewRule: 'user = @request.auth.id || @request.auth.role = "admin"',
        createRule: '@request.auth.id != ""',
        updateRule: '@request.auth.role = "admin"',
        deleteRule: '@request.auth.role = "admin"',
      });

      console.log('✅ Orders collection created');
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.response?.data?.name) {
        console.log('⚠️  Orders collection already exists');
      } else {
        console.error('Error creating orders:', e.response || e.message);
        throw e;
      }
    }

    console.log('\n🎉 All collections created successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Run: npm run seed-data (to add demo data)');
    console.log('2. Visit http://127.0.0.1:8090/_/ to view collections');

  } catch (error) {
    console.error('❌ Error setting up collections:', error);
    process.exit(1);
  }
}

setupCollections();
