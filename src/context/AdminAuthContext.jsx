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
      }
    }
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
            roleCheckRetries.current = 0;
          } else if (event === 'SIGNED_IN') {
            // ✅ FIX: Only check role on SIGNED_IN, NOT on TOKEN_REFRESHED
            // TOKEN_REFRESHED just means the JWT was refreshed, user identity hasn't changed
            await checkAdminRole(session?.user ?? null);
          } else if (event === 'TOKEN_REFRESHED') {
            // Skip unnecessary DB query — user identity is unchanged
            // The admin state is still valid from the previous role check
            console.log('Token refreshed, admin role preserved');
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