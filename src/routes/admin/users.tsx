import { createFileRoute } from '@tanstack/react-router';
import { pb } from '@/lib/pocketbase';
import type { User } from '@/lib/pocketbase';
import { useState } from 'react';

export const Route = createFileRoute('/admin/users')({
  loader: async () => {
    try {
      const usersResult = await pb.collection('users').getList<User>(1, 100, {
        sort: '-created',
      });

      return { users: usersResult.items };
    } catch (error) {
      console.error('Error loading users:', error);
      return { users: [] };
    }
  },
  component: UsersManagement,
});

function UsersManagement() {
  const { users } = Route.useLoaderData();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return 'bg-purple-100 text-purple-800';
    }
    return 'bg-blue-100 text-blue-800';
  };

  const getRoleText = (role: string) => {
    if (role === 'admin') {
      return 'مدیر';
    }
    return 'کاربر';
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">مدیریت کاربران</h1>
        <p className="text-gray-600">{users.length} کاربر</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">کل کاربران</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">مدیران</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">کاربران عادی</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role !== 'admin').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">کاربر</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">ایمیل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">نقش</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">تاریخ عضویت</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => {
                const joinDate = new Date(user.created);

                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">ID: {user.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                        {getRoleText(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">
                        {joinDate.toLocaleDateString('fa-IR')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {joinDate.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        جزئیات
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">هنوز کاربری ثبت‌نام نکرده</h3>
              <p className="text-gray-600">کاربران ثبت‌نام شده در اینجا نمایش داده می‌شوند</p>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">جزئیات کاربر</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Avatar */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
                  {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">شناسه کاربر:</span>
                  <span className="font-medium text-gray-900 font-mono text-sm">{selectedUser.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">نقش:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadge(selectedUser.role)}`}>
                    {getRoleText(selectedUser.role)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">تاریخ عضویت:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedUser.created).toLocaleDateString('fa-IR')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">آخرین بروزرسانی:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedUser.updated).toLocaleDateString('fa-IR')}
                  </span>
                </div>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-900">
                  برای مشاهده سفارش‌های این کاربر، به بخش مدیریت سفارش‌ها بروید و بر اساس ایمیل جستجو کنید.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
