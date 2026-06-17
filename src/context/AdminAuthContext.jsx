import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseAdmin';

const AdminAuthContext = createContext(null);

// ============================================================
// DEBUG LOGGER
// Semua log dikasih timestamp + tag [ADMIN-AUTH] biar gampang
// di-filter di console (ketik "ADMIN-AUTH" di filter box Console).
// Juga nge-dump localStorage tiap kali dipanggil.
// ============================================================
const STORAGE_KEY = 'hw-admin-session';

function ts() {
  const d = new Date();
  return d.toISOString().split('T')[1].replace('Z', '');
}

function dumpStorage(label) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      console.log(`%c[ADMIN-AUTH ${ts()}] STORAGE(${label}): EMPTY/MISSING`, 'color: orange');
      return;
    }
    const parsed = JSON.parse(raw);
    const expiresAt = parsed?.expires_at;
    const expiresIn = expiresAt ? Math.round(expiresAt * 1000 - Date.now()) / 1000 : null;
    console.log(
      `%c[ADMIN-AUTH ${ts()}] STORAGE(${label}): user=${parsed?.user?.email ?? '?'} expires_in=${expiresIn}s access_token_len=${parsed?.access_token?.length ?? 0} refresh_token_len=${parsed?.refresh_token?.length ?? 0}`,
      'color: cyan'
    );
  } catch (err) {
    console.log(`%c[ADMIN-AUTH ${ts()}] STORAGE(${label}): CORRUPT/UNPARSEABLE -> ${err.message}`, 'color: red; font-weight: bold');
    console.log('Raw value:', localStorage.getItem(STORAGE_KEY));
  }
}

function log(...args) {
  console.log(`%c[ADMIN-AUTH ${ts()}]`, 'color: lime', ...args);
}

function warn(...args) {
  console.warn(`%c[ADMIN-AUTH ${ts()}]`, 'color: orange', ...args);
}

function err(...args) {
  console.error(`%c[ADMIN-AUTH ${ts()}]`, 'color: red; font-weight: bold', ...args);
}

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);
  const roleCheckRetries = useRef(0);
  const sessionMissCount = useRef(0);
  const maxRetries = 3;

  const checkAdminRole = async (user, isRetry = false) => {
    log('checkAdminRole() CALLED for', user?.email, 'isRetry=', isRetry);
    if (!user) {
      warn('checkAdminRole: no user passed -> setAdmin(null)');
      setAdmin(null);
      roleCheckRetries.current = 0;
      return;
    }

    try {
      const t0 = performance.now();
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('id, email, full_name, role, is_active')
        .eq('id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      log(`admin_users query took ${(performance.now() - t0).toFixed(0)}ms`, { adminUser, error });

      if (error) {
        err('Role check query error:', error);
        throw error;
      }

      if (!adminUser) {
        warn('User is not an active admin (query returned null) -> setAdmin(null)');
        setAdmin(null);
        roleCheckRetries.current = 0;
        return;
      }

      log('Role check OK -> setAdmin(...)', adminUser);
      setAdmin({ ...user, ...adminUser });
      roleCheckRetries.current = 0;
    } catch (caught) {
      err('checkAdminRole EXCEPTION:', caught);

      if (!isRetry && roleCheckRetries.current < maxRetries) {
        roleCheckRetries.current++;
        const delay = Math.min(1000 * Math.pow(2, roleCheckRetries.current - 1), 8000);
        warn(`Retrying role check in ${delay}ms (attempt ${roleCheckRetries.current}/${maxRetries})`);
        setTimeout(() => checkAdminRole(user, true), delay);
      } else {
        err('Role check failed after retries. Keeping current admin state (NOT logging out).');
        roleCheckRetries.current = 0;
      }
    }
  };

  useEffect(() => {
    log('=== AdminAuthProvider MOUNTED ===');
    dumpStorage('on-mount');

    const initFromStorage = async () => {
      log('initFromStorage() START -> calling getSession()');
      try {
        const t0 = performance.now();
        const { data, error } = await supabase.auth.getSession();
        log(`getSession() resolved in ${(performance.now() - t0).toFixed(0)}ms`, { hasSession: !!data?.session, error });
        dumpStorage('after-getSession-in-initFromStorage');

        if (error) {
          err('getSession() returned an ERROR object:', error);
        }

        if (data?.session?.user) {
          log('Session FOUND in storage for', data.session.user.email, '-> checkAdminRole');
          await checkAdminRole(data.session.user);
          initialized.current = true;
          setLoading(false);
          log('initFromStorage DONE, loading=false, initialized=true');
        } else {
          warn('No session found in storage via getSession(). Waiting for onAuthStateChange...');
        }
      } catch (caught) {
        err('initFromStorage THREW:', caught);
      }
    };

    initFromStorage();

    let fallbackTimeout;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        log(`onAuthStateChange FIRED: event=${event} hasSession=${!!session} initialized=${initialized.current}`);
        dumpStorage(`onAuthStateChange-${event}`);

        if (initialized.current) {
          try {
            if (event === 'SIGNED_OUT') {
              warn('SIGNED_OUT event -> setAdmin(null)');
              setAdmin(null);
              roleCheckRetries.current = 0;
              setLoading(false);
            } else if (event === 'SIGNED_IN') {
              log('SIGNED_IN event, session.user=', session?.user?.email);
              if (session?.user) await checkAdminRole(session.user);
              setLoading(false);
            } else if (event === 'TOKEN_REFRESHED') {
              log('TOKEN_REFRESHED event, session.user=', session?.user?.email);
              if (session?.user) {
                await checkAdminRole(session.user);
              } else {
                warn('TOKEN_REFRESHED but session.user is missing!');
              }
              setLoading(false);
            } else {
              log(`Unhandled event type (no-op): ${event}`);
            }
          } catch (caught) {
            err('Error handling auth event (post-init):', caught);
            setLoading(false);
          }
          return;
        }

        if (!initialized.current) {
          initialized.current = true;
          if (fallbackTimeout) clearTimeout(fallbackTimeout);
          log('First-time init via onAuthStateChange. event=', event);
          if (!session?.user) {
            warn('No session.user on first init event -> staying logged out, loading=false');
            setLoading(false);
            return;
          }
          try {
            await checkAdminRole(session.user);
          } catch (caught) {
            err('checkAdminRole error (initial):', caught);
          } finally {
            setLoading(false);
            log('First-time init DONE, loading=false');
          }
          return;
        }
      }
    );

    fallbackTimeout = setTimeout(async () => {
      if (!initialized.current) {
        warn('FALLBACK TIMEOUT (3s) fired — neither initFromStorage nor onAuthStateChange finished. Forcing getSession() check.');
        dumpStorage('fallback-timeout-before-getSession');
        try {
          const { data, error } = await supabase.auth.getSession();
          log('Fallback getSession() result:', { hasSession: !!data?.session, error });
          const sessUser = data?.session?.user ?? null;
          await checkAdminRole(sessUser);
        } catch (caught) {
          err('Fallback getSession/checkAdminRole error:', caught);
        } finally {
          initialized.current = true;
          setLoading(false);
          log('Fallback path DONE, loading=false, initialized=true');
        }
      }
    }, 3000);

    const hardTimeout = setTimeout(() => {
      warn('HARD TIMEOUT (6s) fired — forcing loading=false regardless of state.');
      dumpStorage('hard-timeout');
      setLoading(false);
    }, 6000);

    return () => {
      log('=== AdminAuthProvider UNMOUNTING / cleanup ===');
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      clearTimeout(hardTimeout);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!admin || loading) return;

    log('Starting 30s session validation interval for admin:', admin.email);

    const validateSessionInterval = setInterval(async () => {
      log('--- validateSessionInterval TICK ---');
      try {
        const { data, error } = await supabase.auth.getSession();
        const currentSession = data?.session;
        dumpStorage('validate-interval-tick');

        if (error) err('validateSessionInterval getSession() error object:', error);

        if (!currentSession) {
          sessionMissCount.current++;
          warn(`Session MISSING in validate tick. sessionMissCount=${sessionMissCount.current}`);
          if (sessionMissCount.current >= 2) {
            err('Session confirmed invalid (2 consecutive misses). Logging out.');
            setAdmin(null);
            sessionMissCount.current = 0;
          }
          return;
        }

        sessionMissCount.current = 0;

        if (currentSession.user.id !== admin.id) {
          warn(`Session user ID MISMATCH: session=${currentSession.user.id} admin=${admin.id}. Logging out.`);
          setAdmin(null);
          return;
        }

        const expiresAt = currentSession.expires_at;
        const expiresIn = expiresAt ? (expiresAt * 1000 - Date.now()) / 1000 : null;
        log(`Session OK. Token expires in ${expiresIn?.toFixed(0)}s`);
      } catch (caught) {
        err('validateSessionInterval THREW:', caught);
      }
    }, 30000);

    return () => {
      log('Clearing 30s validation interval');
      clearInterval(validateSessionInterval);
    };
  }, [admin, loading]);

  const signIn = async (email, password) => {
    log('signIn() CALLED for', email);
    dumpStorage('before-signIn');
    const t0 = performance.now();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    log(`signInWithPassword resolved in ${(performance.now() - t0).toFixed(0)}ms`, { hasData: !!data, error });
    dumpStorage('after-signInWithPassword');

    if (error) {
      err('signIn FAILED at signInWithPassword:', error);
      throw error;
    }

    log('signInWithPassword OK, now checking admin_users table for', data.user.id);
    const t1 = performance.now();
    const { data: adminUser, error: roleError } = await supabase
      .from('admin_users')
      .select('id, email, full_name, role, is_active')
      .eq('id', data.user.id)
      .eq('is_active', true)
      .maybeSingle();
    log(`admin_users lookup in signIn took ${(performance.now() - t1).toFixed(0)}ms`, { adminUser, roleError });

    if (!adminUser) {
      err('signIn: user is NOT an active admin. Signing out and throwing.');
      await supabase.auth.signOut();
      dumpStorage('after-signOut-in-failed-signIn');
      throw new Error('Akses ditolak. Bukan admin.');
    }

    log('signIn() SUCCESS, returning data. Note: setAdmin() will happen via onAuthStateChange SIGNED_IN event, not here.');
    return data;
  };

  const signOut = async () => {
    log('signOut() CALLED');
    await supabase.auth.signOut();
    dumpStorage('after-signOut');
    setAdmin(null);
  };

  // Log every render with current state snapshot
  log(`RENDER: loading=${loading} admin=${admin?.email ?? 'null'}`);

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