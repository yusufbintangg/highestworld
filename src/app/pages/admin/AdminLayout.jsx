import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import { LayoutDashboard, Package, ShoppingBag, Layers, LogOut, Menu, X, AlertTriangle } from 'lucide-react';
import { useAdminAuth } from '../../../context/AdminAuthContext';
import { Button } from '../../components/ui/button';
import { useState } from 'react';

export const AdminLayout = () => {
  const { admin, loading, authError, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Kalau belum login DAN loading sudah selesai DAN tidak ada authError,
  // baru redirect ke login. authError berarti ada token tapi gagal
  // diverifikasi karena masalah jaringan/server -- BUKAN berarti user
  // benar-benar belum login. Jangan redirect dalam kondisi ini, biarkan
  // user lihat pesan error + tombol retry.
  React.useEffect(() => {
    if (!loading && !admin && !authError) {
      navigate('/admin/login');
    }
  }, [admin, loading, authError, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Ada error verifikasi sesi (timeout/network) DAN belum ada admin state.
  // Tampilkan pesan eksplisit + tombol refresh, JANGAN redirect ke login
  // diam-diam -- token di localStorage masih valid, masalahnya cuma di
  // komunikasi ke server.
  if (authError && !admin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full border border-destructive/30 bg-destructive/5 rounded-lg p-6 text-center space-y-4">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
          <p className="text-sm text-foreground font-medium">Gagal memverifikasi sesi admin</p>
          <p className="text-xs text-muted-foreground">{authError}</p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Coba Lagi (Refresh)
          </Button>
          <button
            onClick={() => navigate('/admin/login')}
            className="text-xs text-muted-foreground underline block w-full"
          >
            atau login ulang
          </button>
        </div>
      </div>
    );
  }

  if (!admin) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/produk', label: 'Produk', icon: Package },
    { to: '/admin/stock', label: 'Stock', icon: Layers },
    { to: '/admin/order', label: 'Order', icon: ShoppingBag },
  ];

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h1 className="font-bold tracking-widest text-sm">HIGHEST WORLD</h1>
        <p className="text-xs text-muted-foreground mt-1">Admin Panel </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-3 truncate">{admin.email}</p>
        <Button
          variant="ghost"
          className="w-full justify-start text-sm text-muted-foreground hover:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 border-r border-border fixed h-full bg-card">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-60 bg-card border-r border-border flex flex-col">
            <Sidebar />
          </div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-14 border-b border-border flex items-center px-4 gap-4 bg-card sticky top-0 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <span className="text-sm text-muted-foreground ml-auto">
            Selamat datang, <span className="text-foreground font-medium">{admin.email}</span>
          </span>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};