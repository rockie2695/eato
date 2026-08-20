/**
 * Header Component.
 *
 * Main navigation header with user menu, cart link, and theme toggle.
 * Responsive - shows hamburger menu on mobile.
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  ShoppingCart,
  LogOut,
  UtensilsCrossed,
  Moon,
  Sun,
  LayoutDashboard,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore, useCartStore, useThemeStore } from '@/stores';
import { getInitials } from '@eato/shared/utils';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { href: '/menu', label: 'Menu', icon: UtensilsCrossed },
    ...(isAuthenticated
      ? [
          { href: '/orders', label: 'My Orders', icon: ClipboardList },
          { href: '/cart', label: 'Cart', icon: ShoppingCart, badge: itemCount },
        ]
      : []),
    ...(user?.role === 'admin'
      ? [{ href: '/admin', label: 'Admin', icon: LayoutDashboard }]
      : []),
    ...(user?.role === 'staff' || user?.role === 'admin'
      ? [{ href: '/staff', label: 'Staff Panel', icon: ClipboardList }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold gradient-text">Eato</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
                {'badge' in link && link.badge && link.badge > 0 && (
                  <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {getInitials(user?.name || '')}
                    </span>
                  </div>
                  <span className="hidden lg:inline text-sm">{user?.name}</span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate('/login')}>Sign In</Button>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background animate-fade-in">
          <nav className="container flex flex-col gap-1 p-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
