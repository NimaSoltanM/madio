import { createFileRoute, Link } from '@tanstack/react-router';
import { pb } from '@/lib/pocketbase';
import type { Product, Category, Order, User } from '@/lib/pocketbase';

export const Route = createFileRoute('/admin/')({
  loader: async () => {
    try {
      const [productsResult, categoriesResult, ordersResult, usersResult] = await Promise.all([
        pb.collection('products').getList<Product>(1, 1),
        pb.collection('categories').getList<Category>(1, 1),
        pb.collection('orders').getList<Order>(1, 50, {
          sort: '-created',
        }),
        pb.collection('users').getList<User>(1, 1),
      ]);

      // Calculate revenue
      const totalRevenue = ordersResult.items
        .filter((order) => order.status !== 'cancelled')
        .reduce((sum, order) => sum + order.total, 0);

      // Get recent orders
      const recentOrders = ordersResult.items.slice(0, 5);

      // Calculate pending orders
      const pendingOrders = ordersResult.items.filter((order) => order.status === 'pending').length;

      return {
        stats: {
          totalProducts: productsResult.totalItems,
          totalCategories: categoriesResult.totalItems,
          totalOrders: ordersResult.totalItems,
          totalUsers: usersResult.totalItems,
          totalRevenue,
          pendingOrders,
        },
        recentOrders,
      };
    } catch (error) {
      console.error('Error loading admin stats:', error);
      return {
        stats: {
          totalProducts: 0,
          totalCategories: 0,
          totalOrders: 0,
          totalUsers: 0,
          totalRevenue: 0,
          pendingOrders: 0,
        },
        recentOrders: [],
      };
    }
  },
  component: AdminOverview,
});

function AdminOverview() {
  const { stats, recentOrders } = Route.useLoaderData();

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
        return 'در انتظار';
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

  const statCards = [
    {
      title: 'کل محصولات',
      value: stats.totalProducts,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      gradient: 'from-blue-500 to-blue-600',
      link: '/admin/products',
    },
    {
      title: 'دسته‌بندی‌ها',
      value: stats.totalCategories,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-purple-600',
      link: '/admin/categories',
    },
    {
      title: 'کل سفارش‌ها',
      value: stats.totalOrders,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      gradient: 'from-rose-500 to-pink-500',
      link: '/admin/orders',
      badge: stats.pendingOrders > 0 ? `${stats.pendingOrders} در انتظار` : undefined,
    },
    {
      title: 'کاربران',
      value: stats.totalUsers,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: 'from-green-500 to-green-600',
      link: '/admin/users',
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">داشبورد مدیریت</h1>
        <p className="text-gray-600">خلاصه وضعیت فروشگاه</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} text-white group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                {stat.badge && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                    {stat.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString('fa-IR')}</p>
            </div>
            <div className={`h-1 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-right`}></div>
          </Link>
        ))}
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl shadow-xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 mb-2">کل درآمد</p>
            <p className="text-4xl font-bold">{stats.totalRevenue.toLocaleString('fa-IR')} تومان</p>
            <p className="text-white/80 text-sm mt-2">از {stats.totalOrders} سفارش</p>
          </div>
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-md">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">آخرین سفارش‌ها</h2>
            <Link
              to="/admin/orders"
              className="text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center gap-1"
            >
              مشاهده همه
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-gray-600">هنوز سفارشی ثبت نشده</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentOrders.map((order) => {
                const orderDate = new Date(order.created);
                return (
                  <div key={order.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-rose-100 to-pink-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">#{order.id.substring(0, 8)}</p>
                          <p className="text-xs text-gray-500">
                            {orderDate.toLocaleDateString('fa-IR')}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pr-13">
                      <p className="text-sm font-bold text-rose-600">
                        {order.total.toLocaleString('fa-IR')} تومان
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">عملیات سریع</h2>
          <div className="space-y-3">
            <Link
              to="/admin/products"
              search={{ action: 'new' }}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">محصول جدید</p>
                <p className="text-sm text-gray-600">افزودن محصول به فروشگاه</p>
              </div>
            </Link>

            <Link
              to="/admin/categories"
              search={{ action: 'new' }}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">دسته‌بندی جدید</p>
                <p className="text-sm text-gray-600">ایجاد دسته‌بندی جدید</p>
              </div>
            </Link>

            <Link
              to="/admin/orders"
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-rose-50 to-pink-100 hover:from-rose-100 hover:to-pink-200 rounded-xl transition-all group"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900">مدیریت سفارش‌ها</p>
                <p className="text-sm text-gray-600">بررسی و بروزرسانی سفارش‌ها</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
