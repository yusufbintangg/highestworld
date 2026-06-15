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
    // ✅ Use onAuthStateChange INITIAL_SESSION event as primary source
    // Add a safety fallback: if INITIAL_SESSION doesn't arrive within 3s,
    // fetch the current session and proceed to check role.
    let fallbackTimeout;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, !!session);

        // If the initial session hasn't been handled yet, treat this as INITIAL_SESSION
        if (!initialized.current) {
          initialized.current = true;
          if (fallbackTimeout) clearTimeout(fallbackTimeout);
          try {
            await checkAdminRole(session?.user ?? null);
          } catch (err) {
            console.error('checkAdminRole error (initial):', err);
          } finally {
            setLoading(false);
          }
          return;
        }

        // Subsequent events (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.)
        try {
          if (event === 'SIGNED_OUT') {
            setAdmin(null);
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            await checkAdminRole(session?.user ?? null);
          }
        } catch (err) {
          console.error('checkAdminRole error (event):', err);
        } finally {
          setLoading(false);
        }
      }
    );

    // Safety fallback: if INITIAL_SESSION doesn't fire within 3s, try to get session
    fallbackTimeout = setTimeout(async () => {
      if (!initialized.current) {
        initialized.current = true;
        try {
          const { data } = await supabase.auth.getSession();
          const sessUser = data?.session?.user ?? null;
          await checkAdminRole(sessUser);
        } catch (err) {
          console.error('Fallback getSession/checkAdminRole error:', err);
        } finally {
          setLoading(false);
        }
      }
    }, 3000);

    return () => {
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
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