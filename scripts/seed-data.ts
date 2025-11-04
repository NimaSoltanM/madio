import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function seedData() {
  try {
    console.log('🔐 Authenticating as admin...');

    const adminEmail = process.env.PB_ADMIN_EMAIL || 'admin@madio.com';
    const adminPassword = process.env.PB_ADMIN_PASSWORD || 'admin123456';

    await pb.admins.authWithPassword(adminEmail, adminPassword);
    console.log('✅ Admin authenticated');

    // Seed Categories
    console.log('\n📁 Seeding categories...');
    const categories = [
      {
        name: 'لوازم آرایشی',
        description: 'محصولات آرایشی و بهداشتی',
        icon: '💄',
      },
      {
        name: 'پوشاک',
        description: 'لباس و پوشاک زنانه',
        icon: '👗',
      },
      {
        name: 'لوازم جانبی',
        description: 'کیف، کفش و اکسسوری',
        icon: '👜',
      },
      {
        name: 'عطر و ادکلن',
        description: 'عطرهای اورجینال',
        icon: '🌸',
      },
      {
        name: 'جواهرات',
        description: 'زیورآلات و طلا',
        icon: '✨',
      },
    ];

    const createdCategories: any[] = [];
    for (const category of categories) {
      try {
        const created = await pb.collection('categories').create(category);
        createdCategories.push(created);
        console.log(`✅ Created category: ${category.name}`);
      } catch (e: any) {
        console.log(`⚠️  Category ${category.name} might already exist`);
        // Try to get existing category
        const existing = await pb.collection('categories').getFirstListItem(`name="${category.name}"`);
        createdCategories.push(existing);
      }
    }

    // Seed Products
    console.log('\n🛍️  Seeding products...');
    const products = [
      // لوازم آرایشی
      {
        name: 'رژلب مات مک',
        description: 'رژلب مات با دوام بالا و رنگ‌های متنوع',
        price: 250000,
        stock: 50,
        featured: true,
        category: createdCategories[0].id,
        icon: '💋',
      },
      {
        name: 'پالت سایه چشم',
        description: 'پالت ۱۲ رنگ سایه چشم حرفه‌ای',
        price: 380000,
        stock: 30,
        featured: true,
        category: createdCategories[0].id,
        icon: '🎨',
      },
      {
        name: 'کرم پودر',
        description: 'کرم پودر با پوشش عالی و طبیعی',
        price: 420000,
        stock: 40,
        featured: false,
        category: createdCategories[0].id,
        icon: '🧴',
      },
      {
        name: 'ریمل حجم‌دهنده',
        description: 'ریمل ضد آب با قلم مو حرفه‌ای',
        price: 180000,
        stock: 60,
        featured: false,
        category: createdCategories[0].id,
        icon: '👁️',
      },

      // پوشاک
      {
        name: 'مانتو مجلسی',
        description: 'مانتو کار شده مناسب مجالس',
        price: 890000,
        stock: 15,
        featured: true,
        category: createdCategories[1].id,
        icon: '👘',
      },
      {
        name: 'شلوار جین',
        description: 'شلوار جین راسته با کیفیت بالا',
        price: 650000,
        stock: 25,
        featured: false,
        category: createdCategories[1].id,
        icon: '👖',
      },
      {
        name: 'تونیک نخی',
        description: 'تونیک نخی راحت و خنک',
        price: 420000,
        stock: 35,
        featured: false,
        category: createdCategories[1].id,
        icon: '👚',
      },

      // لوازم جانبی
      {
        name: 'کیف دستی چرم',
        description: 'کیف دستی چرم طبیعی دست‌دوز',
        price: 680000,
        stock: 20,
        featured: true,
        category: createdCategories[2].id,
        icon: '👝',
      },
      {
        name: 'کفش پاشنه بلند',
        description: 'کفش مجلسی با پاشنه ۷ سانت',
        price: 550000,
        stock: 18,
        featured: false,
        category: createdCategories[2].id,
        icon: '👠',
      },
      {
        name: 'شال نخی',
        description: 'شال نخی با طرح‌های متنوع',
        price: 150000,
        stock: 50,
        featured: false,
        category: createdCategories[2].id,
        icon: '🧣',
      },

      // عطر و ادکلن
      {
        name: 'عطر زنانه شانل',
        description: 'عطر اورجینال شانل نامبر ۵',
        price: 2500000,
        stock: 10,
        featured: true,
        category: createdCategories[3].id,
        icon: '🌸',
      },
      {
        name: 'ادکلن دیور',
        description: 'ادکلن جدید دیور',
        price: 1800000,
        stock: 12,
        featured: false,
        category: createdCategories[3].id,
        icon: '💐',
      },

      // جواهرات
      {
        name: 'گردنبند طلا',
        description: 'گردنبند طلای ۱۸ عیار',
        price: 1200000,
        stock: 8,
        featured: true,
        category: createdCategories[4].id,
        icon: '✨',
      },
      {
        name: 'دستبند نقره',
        description: 'دستبند نقره با نگین',
        price: 450000,
        stock: 15,
        featured: false,
        category: createdCategories[4].id,
        icon: '💍',
      },
      {
        name: 'گوشواره طلا',
        description: 'گوشواره میخی طلا',
        price: 980000,
        stock: 12,
        featured: false,
        category: createdCategories[4].id,
        icon: '💎',
      },
    ];

    for (const product of products) {
      try {
        await pb.collection('products').create(product);
        console.log(`✅ Created product: ${product.name}`);
      } catch (e: any) {
        console.log(`⚠️  Product ${product.name} might already exist`);
      }
    }

    console.log('\n🎉 Demo data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${categories.length} categories created`);
    console.log(`- ${products.length} products created`);
    console.log('\n🌐 Visit http://127.0.0.1:8090/_/ to view the data');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
