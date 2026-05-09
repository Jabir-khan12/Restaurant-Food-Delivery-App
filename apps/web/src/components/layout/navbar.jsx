import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { api } from '@/lib/api-client';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount());
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-primary">FlavourFleet</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/restaurants" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Restaurants
          </Link>
          {isAuthenticated && user?.role === 'customer' && (
            <Link to="/orders" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              My Orders
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          {isAuthenticated ? (
            <>
              {user?.role === 'customer' && (
                <Button variant="ghost" size="icon" onClick={() => navigate('/cart')} className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                {user?.name?.split(' ')[0]}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t p-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link to="/restaurants" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
              Restaurants
            </Link>
            {isAuthenticated && user?.role === 'customer' && (
              <>
                <Link to="/orders" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  My Orders
                </Link>
                <Link to="/cart" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Cart {itemCount > 0 && `(${itemCount})`}
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Profile
                </Link>
                <button className="text-left text-sm font-medium text-destructive" onClick={handleLogout}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="text-sm font-medium" onClick={() => setMobileOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
