/**
 * App Component.
 *
 * Root component that sets up routing, layout, and global providers.
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { NewsTicker } from '@/components/notification/news-ticker';
import { NotificationPopup } from '@/components/notification/notification-popup';
import { useAuthStore, useCartStore, useThemeStore, useNotificationStore, notificationApi } from '@/stores';

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
  const { loadTheme, setSystemDark } = useThemeStore();
  const {
    tickers,
    popups,
    dismissedPopups,
    loadActive,
    dismissPopup,
  } = useNotificationStore();

  // Initialize stores on app start
  useEffect(() => {
    initialize();
    loadCart();
    loadTheme();
    loadActive(notificationApi.getActive);

    // Listen for system color scheme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemDark(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);

    // Set initial system preference
    setSystemDark(mediaQuery.matches);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        {/* News Ticker - shows below header */}
        <NewsTicker tickers={tickers} />

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

        {/* Notification Popup */}
        <NotificationPopup
          popups={popups}
          dismissedIds={dismissedPopups}
          onDismiss={dismissPopup}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
