import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout/root-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { lazy, Suspense } from 'react';
import { PageSpinner } from '@/components/ui/spinner';

// Lazy-load pages for code splitting
const HomePage = lazy(() => import('@/pages/home'));
const LoginPage = lazy(() => import('@/pages/auth/login'));
const RegisterPage = lazy(() => import('@/pages/auth/register'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/forgot-password'));
const RestaurantsPage = lazy(() => import('@/pages/restaurants/restaurants-list'));
const RestaurantDetailPage = lazy(() => import('@/pages/restaurants/restaurant-detail'));
const CartPage = lazy(() => import('@/pages/cart/cart'));
const CheckoutPage = lazy(() => import('@/pages/checkout/checkout'));
const OrdersPage = lazy(() => import('@/pages/orders/orders-list'));
const OrderDetailPage = lazy(() => import('@/pages/orders/order-detail'));
const ProfilePage = lazy(() => import('@/pages/profile/profile'));
const NotFoundPage = lazy(() => import('@/pages/not-found'));

function Lazy({ children }) {
  return <Suspense fallback={<PageSpinner />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Lazy><HomePage /></Lazy>,
      },

      // ─── Auth ────────────────────────────────────────────────────────
      {
        path: 'login',
        element: <Lazy><LoginPage /></Lazy>,
      },
      {
        path: 'register',
        element: <Lazy><RegisterPage /></Lazy>,
      },
      {
        path: 'forgot-password',
        element: <Lazy><ForgotPasswordPage /></Lazy>,
      },

      // ─── Restaurants ─────────────────────────────────────────────────
      {
        path: 'restaurants',
        element: <Lazy><RestaurantsPage /></Lazy>,
      },
      {
        path: 'restaurants/:slug',
        element: <Lazy><RestaurantDetailPage /></Lazy>,
      },

      // ─── Cart & Checkout (Protected) ─────────────────────────────────
      {
        path: 'cart',
        element: <Lazy><CartPage /></Lazy>,
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute roles={['customer']}>
            <Lazy><CheckoutPage /></Lazy>
          </ProtectedRoute>
        ),
      },

      // ─── Orders (Protected) ──────────────────────────────────────────
      {
        path: 'orders',
        element: (
          <ProtectedRoute roles={['customer']}>
            <Lazy><OrdersPage /></Lazy>
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <ProtectedRoute>
            <Lazy><OrderDetailPage /></Lazy>
          </ProtectedRoute>
        ),
      },

      // ─── Profile (Protected) ────────────────────────────────────────
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <Lazy><ProfilePage /></Lazy>
          </ProtectedRoute>
        ),
      },

      // ─── 404 ─────────────────────────────────────────────────────────
      {
        path: '*',
        element: <Lazy><NotFoundPage /></Lazy>,
      },
    ],
  },
]);
