import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseAdmin';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false); // ← guard biar getSession ga bentrok sama onAuthStateChange
  const roleCheckRetries = useRef(0);
  const maxRetries = 3;

  const checkAdminRole = async (user, isRetry = false) => {
    if (!user) {
      setAdmin(null);
      roleCheckRetries.current = 0;
      return;
    }

    try {
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('id, email, full_name, role, is_active')
        .eq('id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Role check query error:', error);
        throw error;
      }

      if (!adminUser) {
        console.warn('User is not an active admin');
        setAdmin(null);
        roleCheckRetries.current = 0;
        return;
      }

      setAdmin({ ...user, ...adminUser });
      roleCheckRetries.current = 0;
    } catch (err) {
      // ✅ CRITICAL FIX: Don't silently logout on query failure
      // Instead, preserve current admin state if available
      console.error('checkAdminRole error:', err);
      
      // Only retry on initial checks or network-related errors
      if (!isRetry && roleCheckRetries.current < maxRetries) {
        roleCheckRetries.current++;
        const delay = Math.min(1000 * Math.pow(2, roleCheckRetries.current - 1), 8000);
        console.log(`Retrying role check in ${delay}ms (attempt ${roleCheckRetries.current}/${maxRetries})`);
        setTimeout(() => checkAdminRole(user, true), delay);
      } else {
        // After retries exhausted, keep the user logged in but alert them
        console.error('Role check failed after retries. User may have lost admin status.');
        // DO NOT call setAdmin(null) — let them stay logged in, but show warning
        roleCheckRetries.current = 0;
      }
    }
  };

  useEffect(() => {
    // ✅ IMMEDIATE: Check localStorage first for instant restore on refresh
    const initFromStorage = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          console.log('Session restored from storage, checking admin role...');
          await checkAdminRole(data.session.user);
          initialized.current = true;
          setLoading(false);
        } else {
          console.log('No session in storage, waiting for auth event...');
          // Session not in storage, wait for onAuthStateChange to handle it
        }
      } catch (err) {
        console.error('Failed to restore from storage:', err);
        // Fallback: wait for onAuthStateChange
      }
    };

    // Start restore immediately
    initFromStorage();

    // ✅ Use onAuthStateChange INITIAL_SESSION event as backup
    let fallbackTimeout;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, !!session, 'initialized:', initialized.current);

        // If already initialized (from initFromStorage), skip re-init
        if (initialized.current) {
          // Just handle state updates from subsequent events
          try {
            if (event === 'SIGNED_OUT') {
              setAdmin(null);
              roleCheckRetries.current = 0;
              setLoading(false);
            } else if (event === 'SIGNED_IN') {
              if (session?.user) await checkAdminRole(session.user);
              setLoading(false);
            } else if (event === 'TOKEN_REFRESHED') {
              if (session?.user) {
                // Jangan tergantung admin sudah tersedia; validasi ulang dari sessionUser
                await checkAdminRole(session.user);
              }
              console.log('Token refreshed, admin state re-checked');
              setLoading(false);
            }
          } catch (err) {
            console.error('checkAdminRole error (event):', err);
            setLoading(false);
          }
          return;
        }

        // First time initialization (initFromStorage didn't find session)
        if (!initialized.current) {
          initialized.current = true;
          if (fallbackTimeout) clearTimeout(fallbackTimeout);
          // Jangan langsung check role kalau session belum siap (race di refresh)
          if (!session?.user) return;
          try {
            await checkAdminRole(session.user);
          } catch (err) {
            console.error('checkAdminRole error (initial):', err);
          } finally {
            setLoading(false);
          }
          return;
        }
      }
    );

    // Safety fallback: jika auth events telat/ga sesuai, kita coba getSession sekali.
    // Tujuan: jangan biarin UI stuck loading selamanya (terutama di production).
    fallbackTimeout = setTimeout(async () => {
      if (!initialized.current) {
        try {
          const { data } = await supabase.auth.getSession();
          const sessUser = data?.session?.user ?? null;
          await checkAdminRole(sessUser);
        } catch (err) {
          console.error('Fallback getSession/checkAdminRole error:', err);
        } finally {
          initialized.current = true;
          setLoading(false);
        }
      }
    }, 3000);

    // HARD TIMEOUT: pastikan loading berhenti walaupun Supabase listener/lock mentok.
    // Ini ngurangin kasus “refresh di server stuck Loading...”.
    const hardTimeout = setTimeout(() => {
      console.warn('AdminAuth hard timeout: forcing loading=false');
      setLoading(false);
    }, 6000);

    return () => {
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      clearTimeout(hardTimeout);
      subscription.unsubscribe();
    };

  }, []);

  // ✅ NEW: Session validation listener
  // Detects if admin session becomes invalid (e.g., localStorage corruption, RLS denial)
  // and provides graceful recovery
  useEffect(() => {
    if (!admin || loading) return;

    const validateSessionInterval = setInterval(async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const currentSession = data?.session;

        if (!currentSession) {
          // Session is gone from Supabase, but admin state still exists
          console.warn('Session became invalid. Logging out.');
          setAdmin(null);
          roleCheckRetries.current = 0;
          return;
        }

        // Session exists, verify user ID matches (sanity check)
        if (currentSession.user.id !== admin.id) {
          console.warn('Session user ID mismatch. Forcing re-check.');
          setAdmin(null);
          roleCheckRetries.current = 0;
        }

        // Log token expiry
        const expiresAt = currentSession.expires_at;
        const expiresIn = expiresAt ? (expiresAt * 1000 - Date.now()) / 1000 : null;
        console.log(`Token expires in ${expiresIn?.toFixed(0)}s`);
      } catch (err) {
        console.error('Session validation error:', err);
        // Don't logout on validation errors — just log and continue
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(validateSessionInterval);
  }, [admin, loading]);

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



518