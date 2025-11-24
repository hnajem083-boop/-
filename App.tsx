import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import { ProductGrid, CartDrawer } from './pages/StorePages';
import { AdminDashboard, AdminProducts, AdminOrders } from './pages/AdminPages';
import { ShoppingBagIcon, MenuIcon, PackageIcon, LayoutDashboardIcon, UsersIcon } from './components/Icons';

// --- Components ---

const Navbar: React.FC<{ onCartClick: () => void; onMenuClick: () => void }> = ({ onCartClick, onMenuClick }) => {
  const { cart, isAdminMode, toggleAdminMode } = useStore();
  const itemCount = cart.reduce((a, b) => a + b.quantity, 0);

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <MenuIcon />
          </button>
          <Link to="/" className="text-2xl font-black text-gray-900 tracking-tight">
            الأناقة<span className="text-indigo-600">.</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleAdminMode}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
              isAdminMode 
                ? 'bg-indigo-900 text-white shadow-lg ring-2 ring-indigo-300 ring-offset-2' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isAdminMode ? 'وضع المدير' : 'وضع المتجر'}
          </button>

          {!isAdminMode && (
             <button 
               onClick={onCartClick} 
               className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
             >
               <ShoppingBagIcon className="w-6 h-6" />
               {itemCount > 0 && (
                 <span className="absolute top-1 right-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                   {itemCount}
                 </span>
               )}
             </button>
          )}
        </div>
      </div>
    </nav>
  );
};

const AdminSidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const links = [
    { path: '/admin', label: 'لوحة القيادة', icon: <LayoutDashboardIcon /> },
    { path: '/admin/products', label: 'المنتجات', icon: <PackageIcon /> },
    { path: '/admin/orders', label: 'الطلبات', icon: <UsersIcon /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose}></div>}
      
      <aside className={`fixed top-16 right-0 bottom-0 w-64 bg-white border-l border-gray-100 transform transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 space-y-2">
          {links.map(link => (
            <Link 
              key={link.path} 
              to={link.path}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                location.pathname === link.path 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="w-5 h-5">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
           <div className="bg-indigo-900 rounded-xl p-4 text-white">
             <h4 className="font-bold text-sm mb-1">متجر الأناقة</h4>
             <p className="text-xs text-indigo-300">لوحة تحكم المدير</p>
           </div>
        </div>
      </aside>
    </>
  );
};

// --- Layouts ---

const StoreLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Not used in store mode really

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onCartClick={() => setIsCartOpen(true)} onMenuClick={() => setIsSidebarOpen(true)} />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
        {children}
      </main>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <footer className="bg-white border-t mt-auto py-8 text-center text-gray-500 text-sm">
        <p>© 2024 متجر الأناقة. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
};

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAdminMode } = useStore();

  if (!isAdminMode) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onCartClick={() => {}} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 w-full lg:mr-64 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

// --- Main App Wrapper ---

const AppContent: React.FC = () => {
  const { isAdminMode } = useStore();

  return (
    <HashRouter>
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={
           isAdminMode ? <Navigate to="/admin" replace /> : 
           <StoreLayout><ProductGrid /></StoreLayout>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
        <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
        <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
      </Routes>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;