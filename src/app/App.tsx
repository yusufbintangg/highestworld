import { RouterProvider } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { CartProvider } from '../context/CartContext';
import { AdminAuthProvider } from '../context/AdminAuthContext';
import { AuthProvider } from '../context/AuthContext';
import { router } from './routes';

export default function App() {
  return (
    <AdminAuthProvider>
      <AuthProvider>
        <CartProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </CartProvider>
      </AuthProvider>
    </AdminAuthProvider>
  );
}