import { StrictMode } from 'react';
import { RouterProvider } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { AdminAuthProvider } from '../context/AdminAuthContext';
import { router } from './routes';

export default function App() {
  return (
    <StrictMode>
      <AuthProvider>
        <AdminAuthProvider>
          <CartProvider>
            <RouterProvider router={router} />
            <Toaster position="top-right" />
          </CartProvider>
        </AdminAuthProvider>
      </AuthProvider>
    </StrictMode>
  );
}

