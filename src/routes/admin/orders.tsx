import { createFileRoute } from '@tanstack/react-router';
import { pb } from '@/lib/pocketbase';
import type { Order } from '@/lib/pocketbase';
import { useState } from 'react';

export const Route = createFileRoute('/admin/orders')({
  loader: async () => {
    try {
      const ordersResult = await pb.collection('orders').getList<Order>(1, 100, {
        expand: 'user',
        sort: '-created',
      });

      return { orders: ordersResult.items };
    } catch (error) {
      console.error('Error loading orders:', error);
      return { orders: [] };
    }
  },
  component: OrdersManagement,
});

function OrdersManagement() {
  const { orders } = Route.useLoaderData();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash':
        return 'پرداخت در محل';
      case 'card':
        return 'کارت به کارت';
      case 'online':
        return 'پرداخت آنلاین';
      default:
        return method;
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingStatus(true);
    try {
      await pb.collection('orders').update(orderId, { status: newStatus });
      window.location.reload();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('خطا در بروزرسانی وضعیت سفارش');
    } finally {
      setUpdatingStatus(false);
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

  const parseShippingInfo = (shippingData: any) => {
    try {
      // If it's already an object, return it
      if (typeof shippingData === 'object' && shippingData !== null && !Array.isArray(shippingData)) {
        return shippingData;
      }
      // If it's a string, try to parse it
      if (typeof shippingData === 'string') {
        return JSON.parse(shippingData);
      }
      // Otherwise return null
      return null;
    } catch (error) {
      console.error('Error parsing shipping info:', error, shippingData);
      return null;
    }
  };

  const statusOptions: Order['status'][] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="max-w-7xl">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">مدیریت سفارش‌ها</h1>
        <p className="text-sm md:text-base text-gray-600">{orders.length} سفارش</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
        <button className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg text-sm md:text-base font-medium">
          همه ({orders.length})
        </button>
        <button className="px-3 md:px-4 py-1.5 md:py-2 bg-white text-gray-700 rounded-lg text-sm md:text-base font-medium hover:bg-gray-50 transition">
          در انتظار ({orders.filter((o) => o.status === 'pending').length})
        </button>
        <button className="px-3 md:px-4 py-1.5 md:py-2 bg-white text-gray-700 rounded-lg text-sm md:text-base font-medium hover:bg-gray-50 transition">
          در حال پردازش ({orders.filter((o) => o.status === 'processing').length})
        </button>
        <button className="px-3 md:px-4 py-1.5 md:py-2 bg-white text-gray-700 rounded-lg text-sm md:text-base font-medium hover:bg-gray-50 transition">
          ارسال شده ({orders.filter((o) => o.status === 'shipped').length})
        </button>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">هنوز سفارشی ثبت نشده</h3>
            <p className="text-sm md:text-base text-gray-600">سفارش‌های ثبت شده در اینجا نمایش داده می‌شوند</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">شماره سفارش</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">مشتری</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">تاریخ</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">مبلغ</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">وضعیت</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => {
                    const orderDate = new Date(order.created);
                    const items = parseOrderItems(order.items);

                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">#{order.id.substring(0, 8)}</p>
                          <p className="text-xs text-gray-500">{items.length} محصول</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">
                            {order.expand?.user?.name || 'نامشخص'}
                          </p>
                          <p className="text-xs text-gray-500">{order.expand?.user?.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-700">
                            {orderDate.toLocaleDateString('fa-IR')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {orderDate.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">
                            {order.total.toLocaleString('fa-IR')} تومان
                          </p>
                          <p className="text-xs text-gray-500">
                            {getPaymentMethodText(order.paymentMethod)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
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
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {orders.map((order) => {
                const orderDate = new Date(order.created);
                const items = parseOrderItems(order.items);

                return (
                  <div key={order.id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm mb-1">
                          سفارش #{order.id.substring(0, 8)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.expand?.user?.name || 'نامشخص'}
                        </p>
                        <p className="text-xs text-gray-500">{items.length} محصول</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">تاریخ</p>
                        <p className="text-xs text-gray-700">
                          {orderDate.toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-500 mb-0.5">مبلغ</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {order.total.toLocaleString('fa-IR')} تومان
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="w-full py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-medium transition"
                    >
                      مشاهده جزئیات
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-0 md:p-4 overflow-y-auto">
          <div className="bg-white md:rounded-2xl shadow-2xl max-w-3xl w-full min-h-screen md:min-h-0 md:max-h-[90vh] flex flex-col">
            <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0 sticky top-0 md:static bg-white md:rounded-t-2xl z-10">
              <div className="flex-1 min-w-0 pr-4">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                  جزئیات سفارش #{selectedOrder.id.substring(0, 8)}
                </h2>
                <p className="text-xs md:text-sm text-gray-600 mt-1">
                  {new Date(selectedOrder.created).toLocaleDateString('fa-IR')} - {new Date(selectedOrder.created).toLocaleTimeString('fa-IR')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto flex-1">
              {/* Status Update */}
              <div className="bg-gray-50 rounded-xl p-3 md:p-4">
                <label className="block text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3">
                  وضعیت سفارش
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                      disabled={updatingStatus || selectedOrder.status === status}
                      className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition ${
                        selectedOrder.status === status
                          ? getStatusColor(status)
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {getStatusText(status)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">اطلاعات مشتری</h3>
                <div className="bg-gray-50 rounded-xl p-3 md:p-4 space-y-2">
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="text-gray-600">نام:</span>
                    <span className="font-medium text-gray-900">{selectedOrder.expand?.user?.name || 'نامشخص'}</span>
                  </div>
                  <div className="flex justify-between text-sm md:text-base">
                    <span className="text-gray-600">ایمیل:</span>
                    <span className="font-medium text-gray-900 truncate mr-2">{selectedOrder.expand?.user?.email}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              {selectedOrder.shippingInfo && (() => {
                const shipping = parseShippingInfo(selectedOrder.shippingInfo);
                return shipping ? (
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">اطلاعات ارسال</h3>
                    <div className="bg-gray-50 rounded-xl p-3 md:p-4 space-y-2 text-sm md:text-base">
                      <div className="flex justify-between">
                        <span className="text-gray-600">نام گیرنده:</span>
                        <span className="font-medium text-gray-900">{shipping.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">تلفن:</span>
                        <span className="font-medium text-gray-900" dir="ltr">{shipping.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">شهر:</span>
                        <span className="font-medium text-gray-900">{shipping.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">کد پستی:</span>
                        <span className="font-medium text-gray-900" dir="ltr">{shipping.postalCode}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <span className="text-gray-600 text-xs md:text-sm">آدرس:</span>
                        <p className="font-medium text-gray-900 mt-1 text-sm md:text-base">{shipping.address}</p>
                      </div>
                      {shipping.notes && (
                        <div className="pt-2 border-t border-gray-200">
                          <span className="text-gray-600 text-xs md:text-sm">یادداشت:</span>
                          <p className="text-gray-700 mt-1 text-sm md:text-base">{shipping.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Order Items */}
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">محصولات</h3>
                <div className="space-y-2 md:space-y-3">
                  {parseOrderItems(selectedOrder.items).map((item: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-3 md:p-4 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm md:text-base truncate">{item.productName}</p>
                        <p className="text-xs md:text-sm text-gray-600">
                          {item.quantity} × {item.price.toLocaleString('fa-IR')} تومان
                        </p>
                      </div>
                      <p className="font-bold text-rose-600 text-sm md:text-base flex-shrink-0">
                        {item.total.toLocaleString('fa-IR')} تومان
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 text-sm md:text-base">
                  <span className="text-gray-700">روش پرداخت:</span>
                  <span className="font-medium text-gray-900">{getPaymentMethodText(selectedOrder.paymentMethod)}</span>
                </div>
                <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-rose-200">
                  <span className="text-base md:text-lg font-semibold text-gray-900">مجموع:</span>
                  <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                    {selectedOrder.total.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
