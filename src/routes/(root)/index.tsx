import { createFileRoute, Link } from '@tanstack/react-router';
import { pb } from '@/lib/pocketbase';
import type { Category, Product } from '@/lib/pocketbase';

export const Route = createFileRoute('/(root)/')({
  loader: async () => {
    // Fetch categories and featured products
    const [categories, products] = await Promise.all([
      pb.collection('categories').getFullList<Category>({
        sort: 'created',
      }),
      pb.collection('products').getList<Product>(1, 8, {
        filter: 'featured = true',
        expand: 'category',
        sort: '-created',
      }),
    ]);

    return { categories, products: products.items };
  },
  component: HomePage,
});

function HomePage() {
  const { categories, products } = Route.useLoaderData();

  return (
    <div className='min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white'>

      {/* Hero Section */}
      <section className='container mx-auto px-4 py-20 relative overflow-hidden'>
        {/* Floating Gradient Orbs */}
        <div className='absolute top-20 right-20 w-72 h-72 bg-gradient-to-r from-rose-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float'></div>
        <div className='absolute bottom-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float' style={{animationDelay: '1s'}}></div>

        <div className='text-center max-w-3xl mx-auto relative z-10'>
          <h1 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in-up'>
            خرید آنلاین
            <span className='bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent'> آسان و لذت‌بخش</span>
          </h1>
          <p className='text-xl text-gray-600 mb-8 animate-fade-in-up stagger-1'>
            بهترین محصولات با کیفیت عالی و قیمت مناسب
          </p>
          <div className='flex gap-4 justify-center animate-fade-in-up stagger-2'>
            <Link
              to='/products'
              className='group bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-3 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium'
            >
              <span className='flex items-center gap-2'>
                مشاهده محصولات
                <svg className='w-5 h-5 group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                </svg>
              </span>
            </Link>
            <Link
              to='/categories'
              className='bg-white text-rose-500 px-8 py-3 rounded-lg border-2 border-rose-500 hover:bg-rose-50 hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium'
            >
              دسته‌بندی‌ها
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className='container mx-auto px-4 py-16'>
        <h2 className='text-3xl font-bold text-gray-900 mb-8 text-center bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text'>
          دسته‌بندی‌های محبوب
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          {categories.slice(0, 3).map((category, index) => (
            <Link
              key={category.id}
              to='/categories'
              className={`group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up stagger-${index + 1}`}
            >
              <div className='absolute inset-0 bg-gradient-to-br from-rose-400 to-pink-400 opacity-0 group-hover:opacity-10 transition-opacity duration-500'></div>
              <div className='aspect-square bg-gradient-to-br from-rose-100 via-pink-100 to-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500'>
                <span className='text-7xl group-hover:scale-110 transition-transform duration-500'>{category.icon}</span>
              </div>
              <div className='p-6 relative'>
                <h3 className='text-xl font-semibold text-gray-900 group-hover:text-rose-600 transition-colors duration-300'>
                  {category.name}
                </h3>
                <p className='text-gray-600 mt-2 group-hover:text-gray-700 transition-colors'>{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className='container mx-auto px-4 py-16 relative'>
        <div className='flex justify-between items-center mb-8'>
          <h2 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>محصولات ویژه</h2>
          <Link
            to='/products'
            className='group text-rose-500 hover:text-rose-600 font-medium flex items-center gap-2 transition-all'
          >
            مشاهده همه
            <svg className='w-5 h-5 group-hover:translate-x-1 transition-transform' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
          </Link>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {products.map((product, index) => (
            <Link
              key={product.id}
              to='/products/$productId'
              params={{ productId: product.id }}
              className={`group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up stagger-${(index % 4) + 1} block`}
            >
              <div className='relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden'>
                {product.image ? (
                  <img
                    src={pb.files.getUrl(product, product.image)}
                    alt={product.name}
                    className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                  />
                ) : (
                  <div className='w-full h-full flex items-center justify-center'>
                    <span className='text-6xl group-hover:scale-110 transition-transform duration-500'>📦</span>
                  </div>
                )}
                <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
              </div>
              <div className='p-4 relative'>
                <h3 className='font-semibold text-gray-900 group-hover:text-rose-600 transition-colors duration-300'>
                  {product.name}
                </h3>
                <p className='text-sm text-gray-500 mt-1 line-clamp-2'>
                  {product.description}
                </p>
                <div className='flex items-center justify-between mt-4'>
                  <span className='text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent'>
                    {product.price.toLocaleString('fa-IR')} تومان
                  </span>
                  <span className='bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 p-2 rounded-xl group-hover:from-rose-200 group-hover:to-pink-200 group-hover:scale-110 transition-all duration-300 shadow-sm inline-block'>
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 4v16m8-8H4'
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-16 relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10'></div>
        <div className='container mx-auto px-4 py-12 relative z-10'>
          <div className='text-center'>
            <h3 className='text-3xl font-bold mb-2 bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent'>مادیو</h3>
            <p className='text-gray-300 mb-4'>خرید آسان، کیفیت عالی</p>
            <div className='flex justify-center gap-4 mt-6'>
              <a href='#' className='text-gray-400 hover:text-rose-400 transition-colors'>
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z'/>
                </svg>
              </a>
              <a href='#' className='text-gray-400 hover:text-rose-400 transition-colors'>
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 2C6.477 2 2 6.477 2 12c0 5.013 3.693 9.153 8.505 9.876V14.65H8.031V12h2.474V9.845c0-2.44 1.492-3.798 3.691-3.798.992 0 1.84.074 2.088.107v2.42h-1.433c-1.124 0-1.342.534-1.342 1.318V12h2.682l-.35 2.65h-2.332v7.205C18.307 21.153 22 17.013 22 12c0-5.523-4.477-10-10-10z'/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

