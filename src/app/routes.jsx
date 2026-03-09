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
import { CheckoutSuccessPage } from './pages/CheckoutSuccessPage';
import { CheckoutPendingPage } from './pages/CheckoutPendingPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Layout } from './Layout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminStock } from './pages/admin/AdminStock';


export const router = createBrowserRouter([
  // Customer routes
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'produk', element: <ProductsPage /> },
      { path: 'produk/:slug', element: <ProductDetailPage /> },
      { path: 'koleksi', element: <CollectionsPage /> },
      { path: 'koleksi/:slug', element: <CollectionDetailPage /> },
      { path: 'tentang', element: <AboutPage /> },
      { path: 'kontak', element: <ContactPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: '/pesanan/:orderNumber', element: <OrderDetailPage /> },
      { path: 'checkout/success', element: <CheckoutSuccessPage /> },
      { path: 'checkout/pending', element: <CheckoutPendingPage /> },
      { path: 'konfirmasi-pembayaran', element: <PaymentConfirmationPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // Admin routes (terpisah dari Layout customer)
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'produk', element: <AdminProducts /> },
      { path: 'order', element: <AdminOrders /> },
      { path: 'stock', element: <AdminStock /> },
    ],
  },
{
    path: '/admin/login',
    element: <AdminLogin />,
  },
]);
