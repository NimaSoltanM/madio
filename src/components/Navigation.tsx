import { Link, useMatchRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useState, useEffect } from 'react';
import { pb } from '@/lib/pocketbase';
import type { Product } from '@/lib/pocketbase';

export function Navigation() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();

  // Automatically detect active route
  const isHome = matchRoute({ to: '/', fuzzy: false });
  const isCategories = matchRoute({ to: '/categories', fuzzy: false });
  const isProducts = matchRoute({ to: '/products', fuzzy: true });

  // Search products with debounce
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await pb.collection('products').getList<Product>(1, 10, {
          filter: `name ~ "${searchQuery}" || description ~ "${searchQuery}"`,
          expand: 'category',
          sort: '-created',
        });
        setSearchResults(results.items);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchClick = (productId: string) => {
    setShowSearch(false);
    setSearchQuery('');
    navigate({ to: '/products/$productId', params: { productId } });
  };

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-2xl font-bold text-rose-600">
                مادیو
              </Link>
              <div className="hidden md:flex gap-6">
                <Link
                  to="/"
                  className={
                    isHome
                      ? 'text-rose-600 font-medium'
                      : 'text-gray-700 hover:text-rose-600 transition'
                  }
                >
                  خانه
                </Link>
                <Link
                  to="/categories"
                  className={
                    isCategories
                      ? 'text-rose-600 font-medium'
                      : 'text-gray-700 hover:text-rose-600 transition'
                  }
                >
                  دسته‌بندی‌ها
                </Link>
                <Link
                  to="/products"
                  className={
                    isProducts
                      ? 'text-rose-600 font-medium'
                      : 'text-gray-700 hover:text-rose-600 transition'
                  }
                >
                  محصولات
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search Button */}
              <button
                onClick={() => setShowSearch(true)}
                className="text-gray-700 hover:text-rose-600 transition"
                title="جستجو"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-rose-600 transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:text-rose-600 transition group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:block text-gray-700 text-sm group-hover:text-rose-600 transition">
                    {user.name}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 group-hover:text-rose-600 transition ${showUserMenu ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    ></div>
                    <div className="absolute left-0 mt-2 w-44 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-20">
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition flex items-center gap-2"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        داشبورد
                      </Link>
                      {(user.role === 'admin' || user.isSuperuser) && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition flex items-center gap-2"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          پنل مدیریت
                        </Link>
                      )}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          logout();
                          // Hard reload to clear all state
                          window.location.href = '/';
                        }}
                        className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        خروج
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-gray-700 hover:text-rose-600 transition"
              >
                ورود
              </Link>
            )}
          </div>
        </div>
      </div>
      </nav>

      {/* Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowSearch(false);
              setSearchQuery('');
            }}
          ></div>

          {/* Search Content */}
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجوی محصولات..."
                  autoFocus
                  className="flex-1 text-lg outline-none text-gray-900 placeholder-gray-400"
                />
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-12 text-center">
                  <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-600 mt-4">در حال جستجو...</p>
                </div>
              ) : searchQuery.trim().length < 2 ? (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-500">حداقل 2 حرف برای جستجو وارد کنید</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">محصولی یافت نشد</h3>
                  <p className="text-gray-500">متاسفانه نتیجه‌ای برای جستجوی شما پیدا نشد</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {searchResults.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSearchClick(product.id)}
                      className="w-full p-4 hover:bg-rose-50 transition flex items-center gap-4 text-right"
                    >
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={pb.files.getUrl(product, product.images[0], { thumb: '100x100' })}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                        <p className="text-rose-600 font-semibold mt-1">
                          {product.price.toLocaleString('fa-IR')} تومان
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
