import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { pb } from '@/lib/pocketbase';
import type { Product } from '@/lib/pocketbase';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/products/$productId')({
  loader: async ({ params }) => {
    const { productId } = params;

    // Fetch the product with its category expanded
    const product = await pb.collection('products').getOne<Product>(productId, {
      expand: 'category',
    });

    // Fetch related products from the same category
    const relatedProducts = await pb.collection('products').getList<Product>(1, 4, {
      filter: `category = "${product.category}" && id != "${productId}"`,
      expand: 'category',
      sort: '-created',
    });

    return { product, relatedProducts: relatedProducts.items };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { product, relatedProducts } = Route.useLoaderData();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const categoryName = product.expand?.category?.name || 'دسته‌بندی نامشخص';

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // Show sticky bar on scroll (mobile only)
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 768) {
        setShowStickyBar(window.scrollY > 400);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-white">
      {/* Navigation */}
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
                  className="text-gray-700 hover:text-rose-600 transition"
                >
                  خانه
                </Link>
                <Link
                  to="/categories"
                  className="text-gray-700 hover:text-rose-600 transition"
                >
                  دسته‌بندی‌ها
                </Link>
                <Link
                  to="/products"
                  className="text-gray-700 hover:text-rose-600 transition"
                >
                  محصولات
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-700 hover:text-rose-600 transition">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
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
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </Link>
              <Link
                to="/login"
                className="text-gray-700 hover:text-rose-600 transition"
              >
                ورود
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-gray-500 hover:text-rose-600 transition flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>خانه</span>
          </Link>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <Link to="/products" className="text-gray-500 hover:text-rose-600 transition">
            محصولات
          </Link>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-gray-900 font-medium truncate">{product.name}</span>
        </div>
      </div>

      {/* Product Detail */}
      <div className="container mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in-up">
          <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
            {/* Product Image */}
            <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden group">
              {product.image ? (
                <img
                  src={pb.files.getUrl(product, product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-9xl">📦</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Featured Badge */}
              {product.featured && (
                <div className="absolute top-4 left-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  ویژه
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Category */}
                <Link
                  to="/products"
                  search={{ category: product.category }}
                  className="inline-block text-sm text-rose-600 bg-rose-50 px-3 py-1 rounded-full hover:bg-rose-100 transition mb-4"
                >
                  {categoryName}
                </Link>

                {/* Product Name */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>

                {/* Description */}
                <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8">
                  {product.description}
                </p>

                {/* Stock Status */}
                <div className="flex items-center gap-2 mb-8 pb-8 border-b border-gray-100">
                  {product.stock > 0 ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 font-medium">
                        موجود در انبار ({product.stock} عدد)
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-red-700 font-medium">ناموجود</span>
                    </>
                  )}
                </div>

                {/* Price */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 mb-8">
                  <p className="text-gray-600 text-sm mb-2">قیمت</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                      {product.price.toLocaleString('fa-IR')}
                    </span>
                    <span className="text-gray-600 text-lg">تومان</span>
                  </div>
                </div>

                {/* Quantity Selector */}
                {product.stock > 0 && (
                  <div className="mb-6">
                    <p className="text-gray-700 text-sm font-medium mb-3">تعداد</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          disabled={quantity <= 1}
                          className="p-3 hover:bg-rose-100 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
                        >
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="px-6 py-2 text-lg font-semibold min-w-[60px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          disabled={quantity >= product.stock}
                          className="p-3 hover:bg-rose-100 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-100"
                        >
                          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">حداکثر {product.stock} عدد</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  disabled={product.stock === 0}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-xl font-bold text-base md:text-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
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
                  {product.stock === 0 ? 'ناموجود' : 'افزودن به سبد خرید'}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate({ to: '/products' })}
                    className="bg-white text-gray-700 py-3 rounded-xl font-medium text-sm md:text-base border-2 border-gray-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300"
                  >
                    محصولات دیگر
                  </button>
                  <Link
                    to="/products"
                    search={{ category: product.category }}
                    className="bg-white text-gray-700 py-3 rounded-xl font-medium text-sm md:text-base border-2 border-gray-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 flex items-center justify-center gap-1"
                  >
                    <span>{categoryName}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 md:mt-16 animate-fade-in-up stagger-1">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  محصولات مرتبط
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  محصولات مشابه از دسته‌بندی {categoryName}
                </p>
              </div>
              <Link
                to="/products"
                search={{ category: product.category }}
                className="hidden md:flex items-center gap-2 text-rose-600 hover:text-rose-700 font-medium transition group"
              >
                <span>مشاهده همه</span>
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <Link
                  key={relatedProduct.id}
                  to="/products/$productId"
                  params={{ productId: relatedProduct.id }}
                  className={`group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up stagger-${(index % 4) + 1}`}
                >
                  <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    {relatedProduct.image ? (
                      <img
                        src={pb.files.getUrl(relatedProduct, relatedProduct.image)}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl group-hover:scale-110 transition-transform duration-500">
                          📦
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors duration-300">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {relatedProduct.description}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                        {relatedProduct.price.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Add to Cart Bar - Mobile Only */}
      {showStickyBar && product.stock > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 animate-slide-in-right">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500">قیمت</p>
                <p className="text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  {product.price.toLocaleString('fa-IR')} تومان
                </p>
              </div>
              <button className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-4 rounded-xl font-bold text-sm hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                افزودن به سبد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-16 relative overflow-hidden">
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
