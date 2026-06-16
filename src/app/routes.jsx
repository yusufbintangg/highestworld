import { createBrowserRouter, Outlet } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// Import all page components
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/products/ProductsPage';
import { ProductDetailPage } from './pages/products/ProductDetailPage';
import { CollectionsPage } from './pages/collections/CollectionsPage';
import { CollectionDetailPage } from './pages/collections/CollectionDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PaymentConfirmationPage } from './pages/PaymentConfirmationPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Layout } from './Layout';
// Import admin pages and context
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminStock } from './pages/admin/AdminStock';
// Import account pages and context
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
// Account pages
import { AccountDashboardPage } from './pages/account/AccountDashboardPage';
import { AccountOrdersPage } from './pages/account/AccountOrdersPage';
import { AccountAddressesPage } from './pages/account/AccountAddressesPage';
import { AccountSettingsPage } from './pages/account/AccountSettingsPage';
import { AccountSecurityPage } from './pages/account/AccountSecurityPage';
// Loyalty pages
import LoyaltyDashboardPage from './pages/account/loyalty/LoyaltyDashboardPage';
import LoyaltyHistoryPage from './pages/account/loyalty/LoyaltyHistoryPage';
import LoyaltyRewardsPage from './pages/account/loyalty/LoyaltyRewardsPage';
import LoyaltyReferralPage from './pages/account/loyalty/LoyaltyReferralPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

const adminQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // data fresh for 5 minutes
      gcTime: 1000 * 60 * 10,         // keep in cache for 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,    // don't refetch when tab regains focus
    },
  },
});

const AdminRoot = () => (
  <QueryClientProvider client={adminQueryClient}>
    <AdminAuthProvider>
      <Outlet />
    </AdminAuthProvider>
  </QueryClientProvider>
);
export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },


  {
    path: '/',
    element: <Layout />,
    children: [
      // Public routes:
      // pages for home, products, collections, about, contact, etc.
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
      { path: 'collections', element: <CollectionsPage /> },
      { path: 'collections/:slug', element: <CollectionDetailPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'payment-confirmation', element: <PaymentConfirmationPage /> },
      { path: 'orders/:orderNumber', element: <OrderDetailPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      // Account routes:
      { path: 'account', element: <ProtectedRoute><AccountDashboardPage /></ProtectedRoute> },
      { path: 'account/orders', element: <ProtectedRoute><AccountOrdersPage /></ProtectedRoute> },
      { path: 'account/addresses', element: <ProtectedRoute><AccountAddressesPage /></ProtectedRoute> },
      { path: 'account/settings', element: <ProtectedRoute><AccountSettingsPage /></ProtectedRoute> },
      { path: 'account/security', element: <ProtectedRoute><AccountSecurityPage /></ProtectedRoute> },
      // Loyalty program routes:
      { path: 'loyalty', element: <ProtectedRoute><LoyaltyDashboardPage /></ProtectedRoute> },
      { path: 'loyalty/history', element: <ProtectedRoute><LoyaltyHistoryPage /></ProtectedRoute> },
      { path: 'loyalty/rewards', element: <ProtectedRoute><LoyaltyRewardsPage /></ProtectedRoute> },
      { path: 'loyalty/referral', element: <ProtectedRoute><LoyaltyReferralPage /></ProtectedRoute> },
      // Catch-all route for 404 Not Found
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // Di routes:
{
  path: '/admin',
  element: <AdminRoot />,
  children: [
    { path: 'login', element: <AdminLogin /> },
    {
      element: <AdminLayout />,
      children: [
        { index: true, element: <AdminDashboard /> },
        { path: 'produk', element: <AdminProducts /> },
        { path: 'order', element: <AdminOrders /> },
        { path: 'stock', element: <AdminStock /> },
      ],
    },
  ],
},
]);