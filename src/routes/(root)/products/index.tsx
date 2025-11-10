import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { pb } from '@/lib/pocketbase';
import type { Category, Product } from '@/lib/pocketbase';
import { useState } from 'react';

type ProductsSearch = {
  category?: string;
  search?: string;
  sort?: string;
};

export const Route = createFileRoute('/(root)/products/')({
  validateSearch: (search: Record<string, unknown>): ProductsSearch => {
    return {
      category: (search?.category as string) || undefined,
      search: (search?.search as string) || undefined,
      sort: (search?.sort as string) || '-created',
    };
  },
  // Declare search params as dependencies so the loader reloads when they change
  loaderDeps: ({ search: { category, search, sort } }) => ({
    category,
    search,
    sort,
  }),
  loader: async ({ deps }) => {
    const { category, search: searchQuery, sort = '-created' } = deps;

    // Build filter
    let filter = '';
    if (category) {
      filter = `category = "${category}"`;
    }
    if (searchQuery) {
      const searchFilter = `name ~ "${searchQuery}" || description ~ "${searchQuery}"`;
      filter = filter ? `${filter} && (${searchFilter})` : searchFilter;
    }

    const [categories, productsResult] = await Promise.all([
      pb.collection('categories').getFullList<Category>({
        sort: 'name',
      }),
      pb.collection('products').getList<Product>(1, 50, {
        filter: filter || undefined,
        expand: 'category',
        sort: sort,
      }),
    ]);

    return {
      categories,
      products: productsResult.items,
      totalProducts: productsResult.totalItems,
    };
  },
  component: ProductsPage,
});

function ProductsPage() {
  const { categories, products, totalProducts } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: '/products' });
  const [searchInput, setSearchInput] = useState(search.search || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleCategoryFilter = (categoryId: string | undefined) => {
    navigate({
      search: (prev) => ({
        ...prev,
        category: categoryId,
      }),
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      search: (prev) => ({
        ...prev,
        search: searchInput || undefined,
      }),
    });
  };

  const handleSort = (sortValue: string) => {
    navigate({
      search: (prev) => ({
        ...prev,
        sort: sortValue,
      }),
    });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white'>

      {/* Header */}
      <section className='container mx-auto px-4 py-8 md:py-12 relative overflow-hidden'>
        <div className='absolute top-10 left-20 w-64 h-64 bg-gradient-to-r from-rose-300 to-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float'></div>

        <div className='relative z-10'>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4 animate-fade-in-up'>
            <span className='bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
              همه محصولات
            </span>
          </h1>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
            <p className='text-gray-600 text-base md:text-lg animate-fade-in-up stagger-1'>
              {totalProducts} محصول یافت شد
            </p>

            {/* Active Filters - Mobile Quick View */}
            {(search.category || search.search) && (
              <div className='flex flex-wrap gap-2 lg:hidden'>
                {search.category && (
                  <span className='inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm'>
                    {categories.find((c) => c.id === search.category)?.name}
                    <button
                      onClick={() => handleCategoryFilter(undefined)}
                      className='hover:bg-rose-200 rounded-full p-0.5'>
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
                    </button>
                  </span>
                )}
                {search.search && (
                  <span className='inline-flex items-center gap-1 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm'>
                    جستجو: {search.search}
                    <button
                      onClick={() => {
                        navigate({
                          search: (prev) => ({ ...prev, search: undefined }),
                        });
                        setSearchInput('');
                      }}
                      className='hover:bg-rose-200 rounded-full p-0.5'>
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className='container mx-auto px-4 pb-16'>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Sidebar Filters - Desktop */}
          <aside className='hidden lg:block lg:w-64 flex-shrink-0'>
            <div className='bg-white rounded-2xl shadow-md p-6 sticky top-24 animate-fade-in-up stagger-2'>
              {/* Search */}
              <div className='mb-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  جستجو
                </h3>
                <form onSubmit={handleSearch}>
                  <div className='relative'>
                    <input
                      type='text'
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder='جستجوی محصول...'
                      className='w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition'
                    />
                    <button
                      type='submit'
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition'>
                      <svg
                        className='w-5 h-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                        />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>

              {/* Categories Filter */}
              <div className='mb-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  دسته‌بندی
                </h3>
                <div className='space-y-2'>
                  <button
                    onClick={() => handleCategoryFilter(undefined)}
                    className={`w-full text-right px-4 py-2 rounded-lg transition-all ${
                      !search.category
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-rose-50'
                    }`}>
                    همه محصولات
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryFilter(category.id)}
                      className={`w-full text-right px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                        search.category === category.id
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                          : 'text-gray-700 hover:bg-rose-50'
                      }`}>
                      <span className='text-xl'>{category.icon}</span>
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                  مرتب‌سازی
                </h3>
                <select
                  value={search.sort || '-created'}
                  onChange={(e) => handleSort(e.target.value)}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition'>
                  <option value='-created'>جدیدترین</option>
                  <option value='created'>قدیمی‌ترین</option>
                  <option value='price'>ارزان‌ترین</option>
                  <option value='-price'>گران‌ترین</option>
                  <option value='name'>نام (الف-ی)</option>
                  <option value='-name'>نام (ی-الف)</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className='lg:hidden fixed bottom-6 left-6 z-40 bg-gradient-to-r from-rose-500 to-pink-500 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110'>
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
              />
            </svg>
            {(search.category || search.search) && (
              <span className='absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold'>
                !
              </span>
            )}
          </button>

          {/* Mobile Filter Drawer */}
          {isFilterOpen && (
            <div className='lg:hidden fixed inset-0 z-50 animate-fade-in-up'>
              {/* Backdrop */}
              <div
                onClick={() => setIsFilterOpen(false)}
                className='absolute inset-0 bg-black/50 backdrop-blur-sm'></div>

              {/* Drawer */}
              <div className='absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto animate-slide-in-right'>
                <div className='flex justify-between items-center mb-6'>
                  <h2 className='text-2xl font-bold text-gray-900'>فیلترها</h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className='text-gray-500 hover:text-gray-700 p-2'>
                    <svg
                      className='w-6 h-6'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                  </button>
                </div>

                {/* Search */}
                <div className='mb-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                    جستجو
                  </h3>
                  <form
                    onSubmit={(e) => {
                      handleSearch(e);
                      setIsFilterOpen(false);
                    }}>
                    <div className='relative'>
                      <input
                        type='text'
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder='جستجوی محصول...'
                        className='w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition'
                      />
                      <button
                        type='submit'
                        className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition'>
                        <svg
                          className='w-5 h-5'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                          />
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Categories */}
                <div className='mb-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                    دسته‌بندی
                  </h3>
                  <div className='space-y-2'>
                    <button
                      onClick={() => {
                        handleCategoryFilter(undefined);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-right px-4 py-3 rounded-xl transition-all ${
                        !search.category
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                          : 'text-gray-700 hover:bg-rose-50'
                      }`}>
                      همه محصولات
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          handleCategoryFilter(category.id);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-right px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${
                          search.category === category.id
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                            : 'text-gray-700 hover:bg-rose-50'
                        }`}>
                        <span className='text-xl'>{category.icon}</span>
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                    مرتب‌سازی
                  </h3>
                  <select
                    value={search.sort || '-created'}
                    onChange={(e) => {
                      handleSort(e.target.value);
                      setIsFilterOpen(false);
                    }}
                    className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition'>
                    <option value='-created'>جدیدترین</option>
                    <option value='created'>قدیمی‌ترین</option>
                    <option value='price'>ارزان‌ترین</option>
                    <option value='-price'>گران‌ترین</option>
                    <option value='name'>نام (الف-ی)</option>
                    <option value='-name'>نام (ی-الف)</option>
                  </select>
                </div>

                {/* Clear All Button */}
                {(search.category ||
                  search.search ||
                  search.sort !== '-created') && (
                  <button
                    onClick={() => {
                      navigate({ search: {} });
                      setSearchInput('');
                      setIsFilterOpen(false);
                    }}
                    className='w-full mt-6 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium'>
                    پاک کردن فیلترها
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Products Grid */}
          <main className='flex-1'>
            {products.length === 0 ? (
              <div className='text-center py-20 animate-fade-in-up bg-white rounded-2xl shadow-sm'>
                <div className='text-6xl mb-4'>🔍</div>
                <h3 className='text-2xl font-semibold text-gray-900 mb-2'>
                  محصولی یافت نشد
                </h3>
                <p className='text-gray-600 mb-6'>
                  لطفاً فیلترهای دیگری را امتحان کنید
                </p>
                {(search.category || search.search) && (
                  <button
                    onClick={() => {
                      navigate({ search: {} });
                      setSearchInput('');
                    }}
                    className='bg-gradient-to-r from-rose-500 to-pink-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition'>
                    پاک کردن فیلترها
                  </button>
                )}
              </div>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {products.map((product, index) => (
                  <Link
                    key={product.id}
                    to='/products/$productId'
                    params={{ productId: product.id }}
                    className={`group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up stagger-${(index % 4) + 1} block`}>
                    <div className='relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden'>
                      {product.image ? (
                        <img
                          src={pb.files.getUrl(product, product.image)}
                          alt={product.name}
                          className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          <span className='text-6xl group-hover:scale-110 transition-transform duration-500'>
                            📦
                          </span>
                        </div>
                      )}
                      <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>

                      {/* Stock Badge */}
                      {product.stock < 5 && product.stock > 0 && (
                        <div className='absolute top-3 left-3 bg-orange-500 text-white text-xs px-3 py-1 rounded-full shadow-lg'>
                          تنها {product.stock} عدد
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className='absolute top-3 left-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow-lg'>
                          ناموجود
                        </div>
                      )}
                    </div>

                    <div className='p-4'>
                      <h3 className='font-semibold text-gray-900 group-hover:text-rose-600 transition-colors duration-300 line-clamp-1'>
                        {product.name}
                      </h3>
                      <p className='text-sm text-gray-500 mt-1 line-clamp-2'>
                        {product.description}
                      </p>

                      <div className='flex items-center justify-between mt-4'>
                        <div>
                          <span className='text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent'>
                            {product.price.toLocaleString('fa-IR')}
                          </span>
                          <span className='text-sm text-gray-500 mr-1'>
                            تومان
                          </span>
                        </div>
                        <span
                          className={`p-2 rounded-xl transition-all duration-300 shadow-sm inline-block ${
                            product.stock === 0
                              ? 'bg-gray-100 text-gray-400'
                              : 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600 group-hover:from-rose-200 group-hover:to-pink-200 group-hover:scale-110'
                          }`}>
                          <svg
                            className='w-5 h-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'>
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
                            />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
