import { useState, useEffect } from 'react';
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
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore, useCartStore, useThemeStore } from '@/stores';
import { getInitials } from '@eato/shared/utils';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'shadow-elevated' : ''
      }`}
    >
      {/* Gradient bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-primary/50 via-primary/20 to-transparent" />

      {/* Main header bar */}
      <div className="flex justify-center glass-strong">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link
            to="/"
            className="group relative flex items-center gap-2.5"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-warm-400 shadow-md transition-all duration-300 group-hover:shadow-[0_0_20px_hsl(25_95%_53%/0.4)] group-hover:scale-105">
              <UtensilsCrossed className="h-5 w-5 text-white transition-transform duration-300 group-hover:rotate-12" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-warm-400 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60" />
            </div>
            <span className="text-xl font-bold gradient-text-animated">
              Eato
            </span>
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
                  className="group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  <Icon
                    className={`h-4 w-4 transition-colors duration-200 ${
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  />
                  <span
                    className={`transition-colors duration-200 ${
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground group-hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </span>
                  {'badge' in link && link.badge && link.badge > 0 && (
                    <span className="ml-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-primary to-warm-500 px-1 text-[10px] font-bold text-primary-foreground shadow-sm animate-scale-in">
                      {link.badge}
                    </span>
                  )}
                  {/* Active indicator */}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-primary to-warm-400 animate-slide-down" />
                  )}
                  {/* Hover background */}
                  <span
                    className={`absolute inset-0 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-primary/10'
                        : 'bg-muted/0 group-hover:bg-muted/60'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="relative h-9 w-9 rounded-full text-muted-foreground transition-all duration-300 hover:text-foreground hover:bg-primary/10"
              aria-label="Toggle theme"
            >
              <span
                className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out"
                style={{
                  transform: theme === 'dark' ? 'rotate(180deg) scale(0)' : 'rotate(0deg) scale(1)',
                  opacity: theme === 'dark' ? 0 : 1,
                }}
              >
                <Moon className="h-[18px] w-[18px]" />
              </span>
              <span
                className="absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out"
                style={{
                  transform: theme === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(-180deg) scale(0)',
                  opacity: theme === 'dark' ? 1 : 0,
                }}
              >
                <Sun className="h-[18px] w-[18px]" />
              </span>
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1">
                <Link to="/profile">
                  <div className="flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 transition-all duration-200 hover:bg-muted/60">
                    <Avatar
                      src={user?.avatar}
                      fallback={getInitials(user?.name || '')}
                      size="sm"
                      className="ring-2 ring-background shadow-sm transition-shadow duration-200 hover:ring-primary/30"
                    />
                    <span className="hidden lg:inline text-sm font-medium text-foreground">
                      {user?.name}
                    </span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-9 w-9 rounded-full text-muted-foreground transition-all duration-200 hover:text-destructive hover:bg-destructive/10"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                className="relative h-9 rounded-full px-5 text-sm font-semibold transition-all duration-300 hover:shadow-glow"
              >
                Sign In
              </Button>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-full md:hidden text-muted-foreground transition-all duration-200 hover:text-foreground hover:bg-primary/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className="absolute inset-0 flex items-center justify-center transition-all duration-300" style={{ transform: mobileMenuOpen ? 'rotate(90deg) scale(0)' : 'rotate(0deg) scale(1)', opacity: mobileMenuOpen ? 0 : 1 }}>
                <Menu className="h-5 w-5" />
              </span>
              <span className="absolute inset-0 flex items-center justify-center transition-all duration-300" style={{ transform: mobileMenuOpen ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0)', opacity: mobileMenuOpen ? 1 : 0 }}>
                <X className="h-5 w-5" />
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="glass-strong border-t border-border/30">
          <nav className="container stagger-children flex flex-col gap-1 p-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                  {'badge' in link && link.badge && link.badge > 0 && (
                    <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-primary to-warm-500 px-1.5 text-[10px] font-bold text-primary-foreground">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
