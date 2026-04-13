import { RouterProvider } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { CartProvider } from '../context/CartContext';
import { AdminAuthProvider } from '../context/AdminAuthContext';

// Handle Supabase auth redirect via hash
if (typeof window !== 'undefined') {
  const hash = window.location.hash;
  if (hash.includes('type=recovery')) {
    window.location.replace('/reset-password' + hash);
  }
}


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