import { RouterProvider } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import { CartProvider } from '../context/CartContext';
import { AdminAuthProvider } from '../context/AdminAuthContext';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AdminAuthProvider>
        <CartProvider>
          <RouterProvider router={router} />
          <Toaster position="top-right" />
        </CartProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}