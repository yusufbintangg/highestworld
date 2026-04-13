import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { User, Package, MapPin, Lock, ArrowRight, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export const AccountDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalOrders: 0, activeOrders: 0, savedAddresses: 0, points: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [ordersRes, activeRes, addressRes, profileRes] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['waiting_payment', 'payment_confirmed', 'processing', 'shipped']),
        supabase.from('user_addresses').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('user_profiles').select('points_balance').eq('id', user.id).single(),
      ]);
      setStats({
        totalOrders: ordersRes.count || 0,
        activeOrders: activeRes.count || 0,
        points: profileRes.data?.points_balance || 0,
      });
    };
    fetchStats();
  }, [user?.id]);

  const menuItems = [
    { icon: Package, title: 'Order History', description: 'Lihat semua pesanan kamu', link: '/account/orders', count: stats.totalOrders },
    { icon: Award, title: 'Loyalty Program', description: 'Lihat poin dan reward kamu', link: '/loyalty', count: stats.points, highlight: true },
    { icon: MapPin, title: 'Alamat Pengiriman', description: 'Kelola alamat pengiriman', link: '/account/addresses', count: stats.savedAddresses },
    { icon: User, title: 'Profile Settings', description: 'Edit informasi profil', link: '/account/settings' },
    { icon: Lock, title: 'Keamanan', description: 'Ganti password & keamanan', link: '/account/security' },
  ];

  return (
    <div className="min-h-screen mt-2 pb-2">
      <div className="max-w-5xl mx-auto px-4">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="pt-16 pb-12 border-b border-[var(--border)]">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4">My Account</p>
          <h1 className="text-5xl md:text-7xl font-light text-[var(--text-primary)] mb-6">{user?.name || 'Account'}</h1>
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
            <p className="text-lg text-[var(--text-secondary)]">{user?.email}</p>
            {user?.phone && (
              <>
                <span className="hidden md:block w-1 h-1 bg-[var(--border)] rounded-full" />
                <p className="text-sm text-[var(--text-muted)]">{user.phone}</p>
              </>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="grid grid-cols-3 gap-8 py-12 border-b border-[var(--border)]">
          <div>
            <p className="text-sm uppercase h-8 text-[var(--text-muted)] mb-2">Total Orders</p>
            <p className="text-4xl font-light text-[var(--text-primary)] tabular-nums">{stats.totalOrders}</p>
          </div>
          <div>
            <p className="text-sm uppercase h-8 tracking-[0.15em] text-[var(--text-muted)] mb-2">Active</p>
            <p className="text-4xl font-light text-[var(--accent-gold)] tabular-nums">{stats.activeOrders}</p>
          </div>
          <div>
            <p className="text-sm uppercase h-8 tracking-[0.15em] text-[var(--text-muted)] mb-2">Poin</p>
            <p className="text-4xl font-light text-[var(--accent-gold)] tabular-nums">{stats.points}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="py-12">
          <div className="space-y-6">
            {menuItems.map((item, index) => (
              <motion.div key={item.link} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 + (index * 0.05) }}>
                <Link to={item.link} className="group block border border-[var(--border)] hover:border-[var(--border-accent)] transition-all">
                  <div className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className={`p-4 border border-[var(--border)] ${item.highlight ? 'bg-[var(--accent-gold)]/5' : ''}`}>
                        <item.icon className={`w-6 h-6 ${item.highlight ? 'text-[var(--accent-gold)]' : 'text-[var(--text-secondary)]'}`} />
                      </div>
                      <div>
                        <h3 className={`text-lg mb-1 group-hover:text-[var(--accent-gold)] transition-colors ${item.highlight ? 'text-[var(--accent-gold)]' : 'text-[var(--text-primary)]'}`}>
                          {item.title}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {item.count !== undefined && (
                        <span className={`text-2xl font-light tabular-nums ${item.highlight ? 'text-[var(--accent-gold)]' : 'text-[var(--text-muted)]'}`}>
                          {item.count}
                        </span>
                      )}
                      <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent-gold)] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  );
};