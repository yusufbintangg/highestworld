import { createBrowserRouter } from 'react-router';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CollectionDetailPage } from './pages/CollectionDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PaymentConfirmationPage } from './pages/PaymentConfirmationPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Layout } from './Layout';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';

import { AdminOrders } from './pages/admin/AdminOrders';

import { AdminStock } from './pages/admin/AdminStock';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import { AccountDashboardPage } from './pages/AccountDashboardPage';

import { AccountOrdersPage } from './pages/AccountOrdersPage';

import { AccountAddressesPage } from './pages/AccountAddressesPage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import { AccountSecurityPage } from './pages/AccountSecurityPage';
import LoyaltyDashboardPage from './pages/LoyaltyDashboardPage';
import LoyaltyHistoryPage from './pages/LoyaltyHistoryPage';
import LoyaltyRewardsPage from './pages/LoyaltyRewardsPage';
import LoyaltyReferralPage from './pages/LoyaltyReferralPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

const AdminWrapper = () => (
  <AdminAuthProvider>
    <AdminLayout />
  </AdminAuthProvider>
);

const AdminLoginWrapper = () => (
  <AdminAuthProvider>
    <AdminLogin />
  </AdminAuthProvider>
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
      { path: 'account', element: <ProtectedRoute><AccountDashboardPage /></ProtectedRoute> },

      { path: 'account/orders', element: <ProtectedRoute><AccountOrdersPage /></ProtectedRoute> },

      { path: 'account/addresses', element: <ProtectedRoute><AccountAddressesPage /></ProtectedRoute> },
      { path: 'account/settings', element: <ProtectedRoute><AccountSettingsPage /></ProtectedRoute> },
      { path: 'account/security', element: <ProtectedRoute><AccountSecurityPage /></ProtectedRoute> },

      { path: 'loyalty', element: <ProtectedRoute><LoyaltyDashboardPage /></ProtectedRoute> },
      { path: 'loyalty/history', element: <ProtectedRoute><LoyaltyHistoryPage /></ProtectedRoute> },
      { path: 'loyalty/rewards', element: <ProtectedRoute><LoyaltyRewardsPage /></ProtectedRoute> },
      { path: 'loyalty/referral', element: <ProtectedRoute><LoyaltyReferralPage /></ProtectedRoute> },

      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // Di routes:
{
  path: '/admin',
  element: <AdminWrapper />,
  children: [
    { index: true, element: <AdminDashboard /> },
    { path: 'produk', element: <AdminProducts /> },

    { path: 'order', element: <AdminOrders /> },

    { path: 'stock', element: <AdminStock /> },
  ],
},
{ path: '/admin/login', element: <AdminLoginWrapper /> },
]);