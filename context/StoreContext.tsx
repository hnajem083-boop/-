import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, Order, CartItem, OrderStatus, StoreContextType } from '../types';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'جاكيت جلدي كلاسيك',
    price: 350,
    category: 'سترات',
    description: 'جاكيت جلدي فاخر مصنوع يدوياً من أجود أنواع الجلود الطبيعية. تصميم عصري يناسب جميع الأوقات.',
    imageUrl: 'https://picsum.photos/400/500?random=1',
    stock: 10
  },
  {
    id: '2',
    name: 'قميص أبيض رسمي',
    price: 120,
    category: 'قمصان',
    description: 'قميص قطني ناعم الملمس، مثالي للعمل والمناسبات الرسمية.',
    imageUrl: 'https://picsum.photos/400/500?random=2',
    stock: 25
  },
  {
    id: '3',
    name: 'بنطلون جينز أزرق',
    price: 180,
    category: 'بناطيل',
    description: 'بنطلون جينز بتصميم سليم فيت، مريح وعملي للاستخدام اليومي.',
    imageUrl: 'https://picsum.photos/400/500?random=3',
    stock: 15
  },
  {
    id: '4',
    name: 'فستان صيفي مزهر',
    price: 290,
    category: 'فساتين',
    description: 'فستان صيفي خفيف بنقوش زهور زاهية، مثالي للأجواء المشمسة والنزهات.',
    imageUrl: 'https://picsum.photos/400/500?random=4',
    stock: 8
  }
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage or defaults
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAdminMode, setIsAdminMode] = useState(false);

  // Persist to LocalStorage
  useEffect(() => localStorage.setItem('products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('orders', JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem('cart', JSON.stringify(cart)), [cart]);

  const toggleAdminMode = () => setIsAdminMode(prev => !prev);

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const placeOrder = (customerDetails: { name: string; phone: string; address: string }) => {
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      customerAddress: customerDetails.address,
      items: [...cart],
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: OrderStatus.PENDING,
      date: new Date().toISOString()
    };
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status } : order));
  };

  return (
    <StoreContext.Provider value={{
      products,
      orders,
      cart,
      isAdminMode,
      toggleAdminMode,
      addProduct,
      updateProduct,
      deleteProduct,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      placeOrder,
      updateOrderStatus,
      clearCart
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};