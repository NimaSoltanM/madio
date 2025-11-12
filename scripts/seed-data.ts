import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

async function seedData() {
  try {
    console.log('🌱 Starting database seeding...\n');
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
    console.log('✅ Admin authenticated\n');

    // Seed Categories
    console.log('📁 Seeding categories...');
    const categories = [
      {
        name: 'آرایش صورت',
        description: 'محصولات آرایشی برای زیبایی صورت شما',
        icon: '💄',
      },
      {
        name: 'مراقبت از پوست',
        description: 'محصولات مراقبت و زیبایی پوست',
        icon: '✨',
      },
      {
        name: 'عطر و ادکلن',
        description: 'بهترین عطرها و ادکلن‌های برند',
        icon: '🌹',
      },
      {
        name: 'مراقبت از مو',
        description: 'محصولات تقویت و زیبایی مو',
        icon: '💅',
      },
      {
        name: 'لوازم جانبی',
        description: 'لوازم جانبی آرایشی و بهداشتی',
        icon: '🎀',
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
      // آرایش صورت
      {
        name: 'رژلب مات درخشان',
        description: 'رژلب مات با ماندگاری بالا و رنگ‌های متنوع. مناسب برای استفاده روزانه و مهمانی‌ها.',
        price: 350000,
        stock: 50,
        featured: true,
        category: createdCategories[0].id,
      },
      {
        name: 'پالت سایه چشم حرفه‌ای',
        description: 'پالت 12 رنگ سایه چشم با رنگ‌های متنوع مات و شیمر. کیفیت عالی و پیگمنتاسیون بالا.',
        price: 580000,
        stock: 30,
        featured: true,
        category: createdCategories[0].id,
      },
      {
        name: 'ریمل حجم‌دهنده',
        description: 'ریمل حجم‌دهنده با فرمول ضد آب. مژه‌های بلند و پرپشت با یک بار استفاده.',
        price: 420000,
        stock: 45,
        featured: false,
        category: createdCategories[0].id,
      },
      {
        name: 'کانسیلر پوشش کامل',
        description: 'کانسیلر با پوشش‌دهندگی بالا برای پنهان کردن لک‌ها و هاله‌های تیره. بافت سبک و طبیعی.',
        price: 390000,
        stock: 35,
        featured: false,
        category: createdCategories[0].id,
      },
      {
        name: 'پودر فیکس کننده',
        description: 'پودر فیکس کننده آرایش با فینیش مات. مناسب برای تمام انواع پوست.',
        price: 340000,
        stock: 40,
        featured: false,
        category: createdCategories[0].id,
      },

      // مراقبت از پوست
      {
        name: 'سرم ویتامین C روشن‌کننده',
        description: 'سرم قوی ویتامین C برای روشن کردن و یکدست کردن رنگ پوست. ضد لک و ضد پیری.',
        price: 720000,
        stock: 25,
        featured: true,
        category: createdCategories[1].id,
      },
      {
        name: 'کرم آبرسان هیالورونیک',
        description: 'کرم آبرسان عمیق با اسید هیالورونیک. رطوبت 24 ساعته برای پوست شما.',
        price: 680000,
        stock: 28,
        featured: true,
        category: createdCategories[1].id,
      },
      {
        name: 'ماسک شب تغذیه‌کننده',
        description: 'ماسک شب غنی با مواد مغذی طبیعی. پوست نرم و شاداب در صبح.',
        price: 590000,
        stock: 20,
        featured: false,
        category: createdCategories[1].id,
      },
      {
        name: 'پاک‌کننده ملایم صورت',
        description: 'ژل پاک‌کننده ملایم مناسب برای تمام انواع پوست. بدون سولفات و پاربن.',
        price: 380000,
        stock: 55,
        featured: false,
        category: createdCategories[1].id,
      },
      {
        name: 'کرم ضد آفتاب SPF50',
        description: 'کرم ضد آفتاب با محافظت بالا. بدون رنگ و مناسب برای استفاده زیر آرایش.',
        price: 520000,
        stock: 32,
        featured: false,
        category: createdCategories[1].id,
      },

      // عطر و ادکلن
      {
        name: 'عطر زنانه رز گلد',
        description: 'عطر لوکس با رایحه گل رز و نت‌های شیرین. ماندگاری بالا و مناسب برای مهمانی‌ها.',
        price: 1250000,
        stock: 15,
        featured: true,
        category: createdCategories[2].id,
      },
      {
        name: 'ادکلن تابستانی سیتروس',
        description: 'ادکلن تازه و شاداب با رایحه مرکبات. مناسب برای استفاده روزانه.',
        price: 890000,
        stock: 22,
        featured: false,
        category: createdCategories[2].id,
      },
      {
        name: 'عطر شرقی وانیلی',
        description: 'عطر گرم و شیرین با نت‌های وانیل و چوب صندل. عطر شب و مناسبت‌های خاص.',
        price: 1480000,
        stock: 12,
        featured: true,
        category: createdCategories[2].id,
      },

      // مراقبت از مو
      {
        name: 'شامپو تقویت کننده مو',
        description: 'شامپو تقویت‌کننده با روغن آرگان و کراتین. برای موهای ضعیف و آسیب‌دیده.',
        price: 420000,
        stock: 38,
        featured: false,
        category: createdCategories[3].id,
      },
      {
        name: 'نرم‌کننده حجم‌دهنده',
        description: 'نرم‌کننده مو با فرمول بدون سیلیکون. حجم و درخشش طبیعی برای موها.',
        price: 380000,
        stock: 35,
        featured: false,
        category: createdCategories[3].id,
      },
      {
        name: 'ماسک مو احیاکننده',
        description: 'ماسک موی عمیق با پروتئین ابریشم. ترمیم موهای خشک و وز شده.',
        price: 550000,
        stock: 24,
        featured: true,
        category: createdCategories[3].id,
      },
      {
        name: 'سرم ضد ریزش مو',
        description: 'سرم قوی برای جلوگیری از ریزش مو و تحریک رشد. حاوی ویتامین‌های مو.',
        price: 780000,
        stock: 18,
        featured: false,
        category: createdCategories[3].id,
      },

      // لوازم جانبی
      {
        name: 'ست قلم‌موی آرایشی حرفه‌ای',
        description: 'ست 12 عددی قلم‌موی آرایشی با کیفیت عالی. مناسب برای آرایش حرفه‌ای.',
        price: 680000,
        stock: 28,
        featured: true,
        category: createdCategories[4].id,
      },
      {
        name: 'اسفنج آرایشی بیوتی بلندر',
        description: 'اسفنج آرایشی با بافت نرم و غیر حساسیت‌زا. برای اپلای فاندیشن و کانسیلر.',
        price: 180000,
        stock: 60,
        featured: false,
        category: createdCategories[4].id,
      },
      {
        name: 'پنس ابرو دقیق',
        description: 'پنس ابرو استیل با دقت بالا. مناسب برای اصلاح ابرو در خانه.',
        price: 220000,
        stock: 45,
        featured: false,
        category: createdCategories[4].id,
      },
      {
        name: 'کیف لوازم آرایش چرمی',
        description: 'کیف لوازم آرایش با طراحی شیک و کیفیت عالی. جادار و قابل حمل.',
        price: 450000,
        stock: 20,
        featured: false,
        category: createdCategories[4].id,
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
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${products.length} products`);
    console.log(`   - ${products.filter(p => p.featured).length} featured products`);
    console.log('\n🌐 Visit http://127.0.0.1:8090/_/ to view the data');
    console.log('💻 Or visit http://localhost:3000 to see the application\n');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
