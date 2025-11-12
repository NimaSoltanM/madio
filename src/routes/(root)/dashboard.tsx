import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth';
import { pb } from '@/lib/pocketbase';
import type { Order } from '@/lib/pocketbase';
import { useState } from 'react';

export const Route = createFileRoute('/(root)/dashboard')({
  beforeLoad: ({ context }) => {
    // Check if user is authenticated
    if (!pb.authStore.isValid) {
      throw redirect({
        to: '/login',
        search: {
          redirect: '/dashboard',
        },
      });
    }
  },
  loader: async () => {
    try {
      // Fetch user's orders
      const orders = await pb.collection('orders').getList<Order>(1, 50, {
        filter: `user = "${pb.authStore.record?.id}"`,
        sort: '-created',
      });

      return { orders: orders.items };
    } catch (error) {
      console.error('Error loading orders:', error);
      return { orders: [] };
    }
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { user, logout } = useAuth();
  const { orders } = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'در انتظار تایید';
      case 'processing':
        return 'در حال پردازش';
      case 'shipped':
        return 'ارسال شده';
      case 'delivered':
        return 'تحویل داده شده';
      case 'cancelled':
        return 'لغو شده';
      default:
        return status;
    }
  };

  const parseOrderItems = (itemsData: any) => {
    try {
      // If it's already an array, return it
      if (Array.isArray(itemsData)) {
        return itemsData;
      }
      // If it's a string, try to parse it
      if (typeof itemsData === 'string') {
        return JSON.parse(itemsData);
      }
      // Otherwise return empty array
      return [];
    } catch (error) {
      console.error('Error parsing order items:', error, itemsData);
      return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            داشبورد کاربری
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            خوش آمدید، {user?.name || 'کاربر عزیز'}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 md:gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 lg:sticky lg:top-24">
              {/* User Info */}
              <div className="text-center mb-4 md:mb-6 pb-4 md:pb-6 border-b border-gray-200">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h3 className="font-bold text-gray-900 text-base md:text-lg">
                  {user?.name || 'کاربر'}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 mt-1 truncate px-2">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2 mb-4 md:mb-6">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-right px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all flex items-center gap-2 md:gap-3 text-sm md:text-base ${
                    activeTab === 'orders'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-rose-50'
                  }`}
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  سفارش‌های من
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-right px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all flex items-center gap-2 md:gap-3 text-sm md:text-base ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-rose-50'
                  }`}
                >
                  <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  پروفایل من
                </button>
              </nav>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full text-right px-3 md:px-4 py-2.5 md:py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all flex items-center gap-2 md:gap-3 text-sm md:text-base"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                خروج
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {activeTab === 'orders' && (
              <div>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="bg-white rounded-xl p-3 md:p-4 shadow-md">
                    <p className="text-xs md:text-sm text-gray-600 mb-1">کل سفارش‌ها</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{orders.length}</p>
                  </div>
                  <div className="bg-white rounded-xl p-3 md:p-4 shadow-md">
                    <p className="text-xs md:text-sm text-gray-600 mb-1">در انتظار</p>
                    <p className="text-xl md:text-2xl font-bold text-yellow-600">
                      {orders.filter((o) => o.status === 'pending').length}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-3 md:p-4 shadow-md">
                    <p className="text-xs md:text-sm text-gray-600 mb-1">ارسال شده</p>
                    <p className="text-xl md:text-2xl font-bold text-purple-600">
                      {orders.filter((o) => o.status === 'shipped').length}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-3 md:p-4 shadow-md">
                    <p className="text-xs md:text-sm text-gray-600 mb-1">تحویل داده شده</p>
                    <p className="text-xl md:text-2xl font-bold text-green-600">
                      {orders.filter((o) => o.status === 'delivered').length}
                    </p>
                  </div>
                </div>

                {/* Orders List */}
                <div className="bg-white rounded-2xl shadow-md">
                  <div className="p-4 md:p-6 border-b border-gray-200">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900">تاریخچه سفارش‌ها</h2>
                  </div>

                  {orders.length === 0 ? (
                    <div className="p-8 md:p-12 text-center">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                        هنوز سفارشی ثبت نکرده‌اید
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                        برای شروع خرید به فروشگاه بروید
                      </p>
                      <Link
                        to="/products"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl text-sm md:text-base font-medium hover:shadow-lg transition"
                      >
                        مشاهده محصولات
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {orders.map((order) => {
                        const items = parseOrderItems(order.items);
                        const orderDate = new Date(order.created);

                        return (
                          <div key={order.id} className="p-4 md:p-6 hover:bg-gray-50 transition">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-3 md:mb-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                                  <h3 className="font-bold text-gray-900 text-sm md:text-base">
                                    سفارش #{order.id.substring(0, 8)}
                                  </h3>
                                  <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                    {getStatusText(order.status)}
                                  </span>
                                </div>
                                <p className="text-xs md:text-sm text-gray-500">
                                  {orderDate.toLocaleDateString('fa-IR')} - {orderDate.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs md:text-sm text-gray-600 mb-1">مبلغ کل</p>
                                <p className="text-lg md:text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                  {order.total.toLocaleString('fa-IR')} تومان
                                </p>
                              </div>
                            </div>

                            {/* Order Items Preview */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3 md:mb-4">
                              <p className="text-xs md:text-sm text-gray-600 flex-shrink-0">محصولات:</p>
                              <div className="flex-1 flex flex-wrap gap-1.5 md:gap-2">
                                {items.slice(0, 3).map((item: any, idx: number) => (
                                  <span key={idx} className="text-xs md:text-sm text-gray-700 bg-gray-100 px-2 md:px-3 py-1 rounded-lg whitespace-nowrap">
                                    {item.productName} × {item.quantity}
                                  </span>
                                ))}
                                {items.length > 3 && (
                                  <span className="text-xs md:text-sm text-gray-500 bg-gray-100 px-2 md:px-3 py-1 rounded-lg whitespace-nowrap">
                                    +{items.length - 3} مورد دیگر
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Order Progress */}
                            <div className="relative pt-3 md:pt-4 overflow-x-auto">
                              <div className="flex justify-between mb-2 min-w-[280px] md:min-w-0">
                                {['pending', 'processing', 'shipped', 'delivered'].map((status, idx) => {
                                  const isActive = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= idx;
                                  const isCancelled = order.status === 'cancelled';

                                  return (
                                    <div key={status} className="flex flex-col items-center flex-1">
                                      <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center mb-1 flex-shrink-0 ${
                                        isCancelled ? 'bg-red-500 text-white' : isActive ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' : 'bg-gray-200 text-gray-400'
                                      }`}>
                                        {isActive && !isCancelled && (
                                          <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                      </div>
                                      <p className={`text-[10px] md:text-xs text-center ${isActive && !isCancelled ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                                        {getStatusText(status as Order['status'])}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 -z-10">
                                <div
                                  className="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500"
                                  style={{
                                    width: `${
                                      order.status === 'cancelled' ? 0 :
                                      order.status === 'pending' ? '0%' :
                                      order.status === 'processing' ? '33%' :
                                      order.status === 'shipped' ? '66%' :
                                      order.status === 'delivered' ? '100%' : '0%'
                                    }`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-md p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">اطلاعات پروفایل</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                      نام
                    </label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      disabled
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                      ایمیل
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600 text-sm md:text-base"
                    />
                  </div>

                  <div className="pt-2 md:pt-4">
                    <p className="text-xs md:text-sm text-gray-500">
                      برای ویرایش اطلاعات پروفایل، لطفاً با پشتیبانی تماس بگیرید.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
