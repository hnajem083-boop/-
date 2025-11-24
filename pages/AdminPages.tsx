import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { generateProductDescription } from '../services/geminiService';
import { Product, OrderStatus } from '../types';
import { SparklesIcon, TrashIcon, PlusIcon, PackageIcon, UsersIcon, LayoutDashboardIcon } from '../components/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- Dashboard Home ---
export const AdminDashboard: React.FC = () => {
  const { products, orders } = useStore();

  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;

  // Data for chart
  const salesData = products.map(p => {
    const salesCount = orders.reduce((acc, order) => {
        const item = order.items.find(i => i.id === p.id);
        return acc + (item ? item.quantity : 0);
    }, 0);
    return { name: p.name, sales: salesCount };
  }).sort((a,b) => b.sales - a.sales).slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">لوحة القيادة</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
             <LayoutDashboardIcon />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">إجمالي المبيعات</p>
            <p className="text-2xl font-bold text-gray-900">{totalSales} ر.س</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-xl">
             <PackageIcon />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">إجمالي الطلبات</p>
            <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
             <UsersIcon />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">المنتجات النشطة</p>
            <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
        <h3 className="text-lg font-bold text-gray-800 mb-6">المنتجات الأكثر مبيعاً</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
            <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                cursor={{fill: '#f3f4f6'}}
            />
            <Bar dataKey="sales" radius={[0, 4, 4, 0]} barSize={32}>
                {salesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- Products Management ---
export const AdminProducts: React.FC = () => {
  const { products, addProduct, deleteProduct } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    category: '',
    description: '',
    imageUrl: `https://picsum.photos/400/500?random=${Date.now()}`,
    stock: 0
  });

  const handleGenerateDescription = async () => {
    if (!newProduct.name || !newProduct.category) {
      alert("يرجى إدخال اسم المنتج والفئة أولاً");
      return;
    }
    setIsLoadingAI(true);
    const desc = await generateProductDescription(newProduct.name, newProduct.category, 'جودة عالية، عصري');
    setNewProduct(prev => ({ ...prev, description: desc }));
    setIsLoadingAI(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({ ...newProduct, id: Math.random().toString(36).substr(2, 9) });
    setIsModalOpen(false);
    // Reset form
    setNewProduct({
        name: '', price: 0, category: '', description: '', 
        imageUrl: `https://picsum.photos/400/500?random=${Date.now()}`, stock: 0 
    });
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">المنتجات</h2>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
                <PlusIcon className="w-4 h-4" /> إضافة منتج
            </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-right">
                <thead className="bg-gray-50 text-gray-600 font-medium border-b">
                    <tr>
                        <th className="p-4">المنتج</th>
                        <th className="p-4">السعر</th>
                        <th className="p-4">المخزون</th>
                        <th className="p-4">الفئة</th>
                        <th className="p-4">إجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {products.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 flex items-center gap-3">
                                <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-md object-cover bg-gray-100" />
                                <span className="font-medium text-gray-900">{p.name}</span>
                            </td>
                            <td className="p-4 text-gray-600">{p.price} ر.س</td>
                            <td className="p-4 text-gray-600">{p.stock}</td>
                            <td className="p-4">
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs">{p.category}</span>
                            </td>
                            <td className="p-4">
                                <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Add Product Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                <div className="bg-white rounded-2xl w-full max-w-lg p-6 relative z-10 shadow-2xl animate-fade-in-up">
                    <h3 className="text-xl font-bold mb-4">إضافة منتج جديد</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">اسم المنتج</label>
                                <input required type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">الفئة</label>
                                <input required type="text" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">السعر</label>
                                <input required type="number" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">الكمية</label>
                                <input required type="number" className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium">الوصف</label>
                                <button 
                                    type="button" 
                                    onClick={handleGenerateDescription}
                                    disabled={isLoadingAI}
                                    className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold disabled:opacity-50"
                                >
                                    <SparklesIcon className="w-3 h-3" />
                                    {isLoadingAI ? 'جاري التوليد...' : 'توليد بالذكاء الاصطناعي'}
                                </button>
                            </div>
                            <textarea required rows={3} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">إلغاء</button>
                            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">حفظ</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

// --- Order Management ---
export const AdminOrders: React.FC = () => {
    const { orders, updateOrderStatus } = useStore();

    const getStatusColor = (status: OrderStatus) => {
        switch(status) {
            case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-700';
            case OrderStatus.SHIPPED: return 'bg-blue-100 text-blue-700';
            case OrderStatus.DELIVERED: return 'bg-green-100 text-green-700';
            case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">إدارة الطلبات</h2>
            <div className="space-y-4">
                {orders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                        <p className="text-gray-500">لا توجد طلبات حتى الآن.</p>
                    </div>
                ) : (
                    orders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-gray-50">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">طلب #{order.id}</h3>
                                    <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString('ar-SA')} - {new Date(order.date).toLocaleTimeString('ar-SA')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                    <select 
                                        value={order.status}
                                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                                        className="text-sm border rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                                    >
                                        {Object.values(OrderStatus).map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-2">بيانات العميل</h4>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p><span className="font-medium text-gray-900">الاسم:</span> {order.customerName}</p>
                                        <p><span className="font-medium text-gray-900">الهاتف:</span> {order.customerPhone}</p>
                                        <p><span className="font-medium text-gray-900">العنوان:</span> {order.customerAddress}</p>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-2">المنتجات</h4>
                                    <div className="space-y-2">
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{item.name} <span className="text-xs bg-gray-100 px-1 rounded">x{item.quantity}</span></span>
                                                <span className="font-medium">{item.price * item.quantity} ر.س</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between pt-2 border-t mt-2 font-bold text-indigo-700">
                                            <span>الإجمالي</span>
                                            <span>{order.total} ر.س</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};