import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBagIcon, XIcon, PlusIcon, SparklesIcon } from '../components/Icons';

// --- Product Grid Page ---
export const ProductGrid: React.FC = () => {
  const { products, addToCart } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

  const categories = ['الكل', ...Array.from(new Set(products.map(p => p.category)))];
  const filteredProducts = selectedCategory === 'الكل' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      {/* Hero Section */}
      <div className="mb-10 text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">تصفح أحدث التشكيلات</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          مجموعتنا المختارة من الملابس العصرية تجمع بين الأناقة والراحة لتناسب جميع مناسباتك.
        </p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === cat 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              {product.stock <= 5 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  كمية محدودة
                </span>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <p className="text-lg font-bold text-indigo-600">{product.price} ر.س</p>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">{product.description}</p>
              <button 
                onClick={() => addToCart(product)}
                className="w-full bg-gray-900 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBagIcon className="w-4 h-4" />
                أضف للسلة
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          لا توجد منتجات في هذا القسم حالياً.
        </div>
      )}
    </div>
  );
};

// --- Cart Modal / Drawer ---
export const CartDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateCartQuantity, placeOrder } = useStore();
  const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!isOpen) return null;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    placeOrder(formData);
    setFormData({ name: '', phone: '', address: '' });
    setStep('cart');
    onClose();
    alert("تم استلام طلبك بنجاح!");
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slideInRight">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            {step === 'cart' ? 'سلة المشتريات' : 'إتمام الطلب'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {step === 'cart' ? (
            cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                <ShoppingBagIcon className="w-16 h-16 opacity-20" />
                <p>السلة فارغة</p>
                <button onClick={onClose} className="text-indigo-600 font-medium hover:underline">تسوق الآن</button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 p-3 bg-white border rounded-xl hover:border-indigo-100 transition-colors">
                    <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-gray-100" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-bold text-gray-800">{item.name}</h4>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-indigo-600 font-medium text-sm">{item.price} ر.س</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button 
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                          onClick={() => updateCartQuantity(item.id, -1)}
                        >-</button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                          onClick={() => updateCartQuantity(item.id, 1)}
                        >+</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
               <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                 <h3 className="font-bold text-blue-800 mb-2">ملخص الطلب</h3>
                 <div className="flex justify-between text-sm text-blue-900">
                   <span>عدد المنتجات:</span>
                   <span>{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                 </div>
                 <div className="flex justify-between text-lg font-bold text-blue-900 mt-2 pt-2 border-t border-blue-200">
                   <span>الإجمالي:</span>
                   <span>{total} ر.س</span>
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                 <input 
                  required 
                  type="text" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                 <input 
                  required 
                  type="tel" 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">العنوان بالتفصيل</label>
                 <textarea 
                  required 
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                 />
               </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-gray-50">
          {step === 'cart' ? (
             <div className="space-y-3">
               <div className="flex justify-between text-xl font-bold text-gray-900">
                 <span>الإجمالي</span>
                 <span>{total} ر.س</span>
               </div>
               <button 
                 disabled={cart.length === 0}
                 onClick={() => setStep('checkout')}
                 className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-indigo-200"
               >
                 متابعة للدفع
               </button>
             </div>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={() => setStep('cart')}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
              >
                رجوع
              </button>
              <button 
                type="submit"
                form="checkout-form"
                className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-green-200"
              >
                تأكيد الطلب
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};