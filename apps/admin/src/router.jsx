import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/admin-layout';
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() => import('@/pages/dashboard'));
const LoginPage = lazy(() => import('@/pages/login'));
const OrdersPage = lazy(() => import('@/pages/orders'));
const RestaurantsPage = lazy(() => import('@/pages/restaurants'));
const UsersPage = lazy(() => import('@/pages/users'));
const RidersPage = lazy(() => import('@/pages/riders'));
const AnalyticsPage = lazy(() => import('@/pages/analytics'));
const AuditPage = lazy(() => import('@/pages/audit'));

function Lazy({ children }) {
  return (
    <Suspense
      fallback={<div className="flex h-40 items-center justify-center text-muted-foreground">Loading...</div>}
    >
      {children}
    </Suspense>
  );
}

function RequireAdmin({ children }) {
  const token = sessionStorage.getItem('ff-admin-token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Lazy><LoginPage /></Lazy>,
  },
  {
    path: '/',
    element: (
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    ),
    children: [
      { index: true, element: <Lazy><DashboardPage /></Lazy> },
      { path: 'restaurants', element: <Lazy><RestaurantsPage /></Lazy> },
      { path: 'orders', element: <Lazy><OrdersPage /></Lazy> },
      { path: 'users', element: <Lazy><UsersPage /></Lazy> },
      { path: 'riders', element: <Lazy><RidersPage /></Lazy> },
      { path: 'analytics', element: <Lazy><AnalyticsPage /></Lazy> },
      { path: 'audit', element: <Lazy><AuditPage /></Lazy> },
    ],
  },
]);
