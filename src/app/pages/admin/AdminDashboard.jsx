import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Package, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '../../../lib/supabaseAdmin';
import { formatPrice } from '../../../lib/utils';

export const AdminDashboard = () => {
  // Fetch all dashboard stats with React Query
  const { data: dashboardData = {}, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      // Total produk
      const { count: totalProducts, error: errP } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      if (errP) throw errP;

      // Total order
      const { count: totalOrders, error: errO } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      if (errO) throw errO;

      // Order pending
      const { count: pendingOrders, error: errPO } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'waiting_payment');
      if (errPO) throw errPO;

      // Revenue dari order yang sudah confirmed
      const { data: revenueData, error: errRev } = await supabase
        .from('orders')
        .select('total')
        .in('status', ['payment_confirmed', 'processing', 'shipped', 'completed']);
      if (errRev) throw errRev;

      const totalRevenue = revenueData?.reduce((sum, o) => sum + o.total, 0) || 0;

      // 5 order terbaru
      const { data: orders, error: errOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (errOrders) throw errOrders;

      // Varian dengan stok < 5
      const { data: variants, error: errVar } = await supabase
        .from('product_variants')
        .select('*, products(name)')
        .lt('stock', 5)
        .order('stock', { ascending: true })
        .limit(5);
      if (errVar) throw errVar;

      return {
        stats: { totalProducts, totalOrders, pendingOrders, totalRevenue },
        recentOrders: orders || [],
        lowStock: variants || [],
      };
    },
  });

  const {
    stats = { totalProducts: 0, totalOrders: 0, pendingOrders: 0, totalRevenue: 0 },
    recentOrders = [],
    lowStock = [],
  } = dashboardData;

  const statCards = [
    { label: 'Total Produk', value: stats.totalProducts, icon: Package, color: 'text-blue-500' },
    { label: 'Total Order', value: stats.totalOrders, icon: ShoppingBag, color: 'text-green-500' },
    { label: 'Menunggu Bayar', value: stats.pendingOrders, icon: Clock, color: 'text-orange-500' },
    { label: 'Total Revenue', value: formatPrice(stats.totalRevenue), icon: TrendingUp, color: 'text-purple-500' },
  ];

  const statusLabel = {
    waiting_payment: { label: 'Menunggu Bayar', color: 'bg-yellow-500/10 text-yellow-500' },
    payment_confirmed: { label: 'Dikonfirmasi', color: 'bg-blue-500/10 text-blue-500' },
    processing: { label: 'Diproses', color: 'bg-purple-500/10 text-purple-500' },
    shipped: { label: 'Dikirim', color: 'bg-cyan-500/10 text-cyan-500' },
    completed: { label: 'Selesai', color: 'bg-green-500/10 text-green-500' },
    cancelled: { label: 'Dibatalkan', color: 'bg-red-500/10 text-red-500' },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl tracking-[0.1em] mb-2">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground">
          Selamat datang kembali! Berikut ringkasan bisnis Anda hari ini.
        </p>
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Order Terbaru</h2>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">Belum ada order</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-muted-foreground text-xs">{order.order_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-medium">{formatPrice(order.total)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusLabel[order.status]?.color}`}>
                      {statusLabel[order.status]?.label || order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h2 className="font-semibold mb-4">Stok Hampir Habis</h2>
          {lowStock.length === 0 ? (
            <p className="text-muted-foreground text-sm">Semua stok aman ✅</p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((variant) => (
                <div key={variant.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium line-clamp-1">{variant.products?.name}</p>
                    <p className="text-muted-foreground text-xs">{variant.color} — {variant.size}</p>
                  </div>
                  <span className={`font-mono font-bold ${variant.stock === 0 ? 'text-destructive' : 'text-orange-500'}`}>
                    {variant.stock} pcs
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};