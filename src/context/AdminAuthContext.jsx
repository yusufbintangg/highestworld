import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false); // ← guard biar getSession ga bentrok sama onAuthStateChange

  const checkAdminRole = async (user) => {
    if (!user) {
      setAdmin(null);
      return;
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id, email, full_name, role, is_active')
      .eq('id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    setAdmin(adminUser ? { ...user, ...adminUser } : null);
  };

  useEffect(() => {
    // ✅ Fix: pakai onAuthStateChange INITIAL_SESSION event aja
    // jangan gabungin getSession() + onAuthStateChange bersamaan
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!initialized.current) {
          // First fire = initial session load
          initialized.current = true;
          await checkAdminRole(session?.user ?? null);
          setLoading(false);
          return;
        }

        // Subsequent events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, dll)
        if (event === 'SIGNED_OUT') {
          setAdmin(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await checkAdminRole(session?.user ?? null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('id, email, full_name, role, is_active')
      .eq('id', data.user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!adminUser) {
      await supabase.auth.signOut();
      throw new Error('Akses ditolak. Bukan admin.');
    }

    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};