/**
 * App Component.
 *
 * Root component that sets up routing, layout, and global providers.
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { useAuthStore, useCartStore, useThemeStore } from '@/stores';

// Pages
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import { MenuPage } from '@/pages/menu';
import { CartPage } from '@/pages/cart';
import { OrdersPage } from '@/pages/orders';
import { OrderDetailPage } from '@/pages/order-detail';
import { AdminPage } from '@/pages/admin';

function App() {
  const { initialize } = useAuthStore();
  const { loadCart } = useCartStore();
  const { loadTheme } = useThemeStore();

  // Initialize stores on app start
  useEffect(() => {
    initialize();
    loadCart();
    loadTheme();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 page-transition">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
