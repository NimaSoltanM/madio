import { Link, useMatchRoute } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/cart';
import { useState } from 'react';

export function Navigation() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const matchRoute = useMatchRoute();

  // Automatically detect active route
  const isHome = matchRoute({ to: '/', fuzzy: false });
  const isCategories = matchRoute({ to: '/categories', fuzzy: false });
  const isProducts = matchRoute({ to: '/products', fuzzy: true });

  return (
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
  );
}
