import { createFileRoute, Link } from '@tanstack/react-router';
import { pb } from '@/lib/pocketbase';
import type { Category, Product } from '@/lib/pocketbase';

interface CategoryWithCount extends Category {
  productCount: number;
}

export const Route = createFileRoute('/(root)/categories')({
  loader: async () => {
    // Fetch all categories
    const categories = await pb.collection('categories').getFullList<Category>({
      sort: 'name',
    });

    // Fetch product counts for each category
    const categoriesWithCount: CategoryWithCount[] = await Promise.all(
      categories.map(async (category) => {
        const products = await pb.collection('products').getList<Product>(1, 1, {
          filter: `category = "${category.id}"`,
        });
        return {
          ...category,
          productCount: products.totalItems,
        };
      })
    );

    return { categories: categoriesWithCount };
  },
  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white">

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 relative overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-rose-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: "2s" }}></div>

        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              دسته‌بندی‌های محصولات
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 animate-fade-in-up stagger-1 leading-relaxed">
            محصولات مورد علاقه خود را از میان دسته‌بندی‌های مختلف کشف کنید
          </p>
          <div className="flex items-center justify-center gap-2 text-gray-500 animate-fade-in-up stagger-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>{categories.length} دسته‌بندی</span>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to="/products"
              search={{ category: category.id, sort: '-created' }}
              className={`group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-fade-in-up stagger-${(index % 4) + 1}`}
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-pink-500/0 group-hover:from-rose-500/5 group-hover:to-pink-500/5 transition-all duration-500"></div>

              {/* Content */}
              <div className="relative p-8 md:p-10">
                {/* Icon with animated background */}
                <div className="mb-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm group-hover:shadow-lg">
                    <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-500">
                      {category.icon}
                    </span>
                  </div>
                </div>

                {/* Category name */}
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-3 group-hover:text-rose-600 transition-colors duration-300">
                  {category.name}
                </h3>

                {/* Description */}
                {category.description && (
                  <p className="text-sm md:text-base text-gray-500 text-center mb-4 line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                )}

                {/* Product count badge */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 group-hover:bg-rose-50 rounded-full transition-colors duration-300">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-rose-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span className="font-medium group-hover:text-rose-600 transition-colors">
                      {category.productCount} محصول
                    </span>
                  </div>
                </div>

                {/* Hover arrow indicator */}
                <div className="mt-6 flex justify-center">
                  <div className="flex items-center gap-2 text-rose-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span className="text-sm font-medium">مشاهده محصولات</span>
                    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Corner decoration */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-rose-500/10 to-transparent rounded-br-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-pink-500/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {categories.length === 0 && (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              هنوز دسته‌بندی‌ای وجود ندارد
            </h3>
            <p className="text-gray-600">
              به زودی دسته‌بندی‌های جدید اضافه می‌شوند
            </p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-20">
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              محصول مورد نظر خود را پیدا نکردید؟
            </h2>
            <p className="text-base md:text-lg mb-8 text-white/90 max-w-2xl mx-auto">
              همه محصولات ما را مشاهده کنید و از میان صدها محصول با کیفیت انتخاب کنید
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white text-rose-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <span>مشاهده همه محصولات</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-pink-500/10"></div>
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">
              مادیو
            </h3>
            <p className="text-gray-300 mb-4">خرید آسان، کیفیت عالی</p>
            <div className="flex justify-center gap-4 mt-6">
              <a
                href="#"
                className="text-gray-400 hover:text-rose-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-rose-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 5.013 3.693 9.153 8.505 9.876V14.65H8.031V12h2.474V9.845c0-2.44 1.492-3.798 3.691-3.798.992 0 1.84.074 2.088.107v2.42h-1.433c-1.124 0-1.342.534-1.342 1.318V12h2.682l-.35 2.65h-2.332v7.205C18.307 21.153 22 17.013 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
