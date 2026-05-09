import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, Users, ShoppingBag, Bike, BarChart3, FileText, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon, href: '/' },
  { label: 'Restaurants', icon, href: '/restaurants' },
  { label: 'Orders', icon, href: '/orders' },
  { label: 'Users', icon, href: '/users' },
  { label: 'Riders', icon, href: '/riders' },
  { label: 'Analytics', icon, href: '/analytics' },
  { label: 'Audit Logs', icon, href: '/audit' },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('ff-admin-token');
    navigate('/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={cn(
        'flex flex-col border-r bg-card',
        mobile ? 'fixed inset-y-0 left-0 z-50 w-64' : 'hidden w-64 lg:flex',
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <LayoutDashboard className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">Admin Panel</span>
        {mobile && (
          <button className="ml-auto" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ label, icon, href }) => {
          const active = location.pathname === href || (href !== '/' && location.pathname.startsWith(href));
          return (
            <Link
              key={href}
              to={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <Sidebar mobile />
        </>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">
            {navItems.find((n) => location.pathname === n.href || (n.href !== '/' && location.pathname.startsWith(n.href)))?.label || 'Admin'}
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
