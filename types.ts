export enum OrderStatus {
  PENDING = 'قيد الانتظار',
  PROCESSING = 'جاري التجهيز',
  SHIPPED = 'تم الشحن',
  DELIVERED = 'تم التوصيل',
  CANCELLED = 'ملغي'
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  imageUrl: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  date: string;
}

export type StoreContextType = {
  products: Product[];
  orders: Order[];
  cart: CartItem[];
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  placeOrder: (customerDetails: { name: string; phone: string; address: string }) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  clearCart: () => void;
};