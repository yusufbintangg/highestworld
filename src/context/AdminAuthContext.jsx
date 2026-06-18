import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseAdmin';

const AdminAuthContext = createContext(null);

const STORAGE_KEY = 'hw-admin-session';

function ts() {
  const d = new Date();
  return d.toISOString().split('T')[1].replace('Z', '');
}

function dumpStorage(label) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // console.log(`%c[ADMIN-AUTH ${ts()}] STORAGE(${label}): EMPTY/MISSING`, 'color: orange');
      return;
    }
    const parsed = JSON.parse(raw);
    const expiresAt = parsed?.expires_at;
    const expiresIn = expiresAt ? Math.round(expiresAt * 1000 - Date.now()) / 1000 : null;
    // console.log(
    //   `%c[ADMIN-AUTH ${ts()}] STORAGE(${label}): user=${parsed?.user?.email ?? '?'} expires_in=${expiresIn}s`,
    //   'color: cyan'
    // );
  } catch (e) {
    // console.log(`%c[ADMIN-AUTH ${ts()}] STORAGE(${label}): CORRUPT -> ${e.message}`, 'color: red; font-weight: bold');
  }
}

function log(...args) { /* console.log(`%c[ADMIN-AUTH ${ts()}]`, 'color: lime', ...args); */ }
function warn(...args) { /* console.warn(`%c[ADMIN-AUTH ${ts()}]`, 'color: orange', ...args); */ }
function err(...args) { /* console.error(`%c[ADMIN-AUTH ${ts()}]`, 'color: red; font-weight: bold', ...args); */ }



// ============================================================
// PROMISE TIMEOUT WRAPPER
// Dipertahankan dari versi lama, dipakai HANYA untuk checkAdminRole
// (query ke tabel admin_users), bukan untuk getSession.
// getSession TIDAK PERLU timeout manual lagi karena kita tidak
// lagi memanggilnya secara manual — lihat catatan di bawah.
// ============================================================
function withTimeout(promiseLike, ms, label) {
  const t0 = performance.now();
  let settled = false;

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      if (!settled) {
        err(`⏱️ TIMEOUT after ${ms}ms on: ${label}. The underlying promise NEVER resolved or rejected.`);
      }
      reject(new Error(`TIMEOUT: ${label} exceeded ${ms}ms`));
    }, ms);
  });

  const wrapped = Promise.resolve(promiseLike).then(
    (result) => {
      settled = true;
      log(`✅ "${label}" resolved in ${(performance.now() - t0).toFixed(0)}ms`);
      return result;
    },
    (error) => {
      settled = true;
      err(`❌ "${label}" rejected in ${(performance.now() - t0).toFixed(0)}ms:`, error);
      throw error;
    }
  );

  return Promise.race([wrapped, timeoutPromise]);
}

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  // authError: dipakai untuk menampilkan pesan error yang JELAS di UI
  // (mis. AdminLayout bisa render banner "Gagal verifikasi sesi, coba refresh")
  // alih-alih silent fail / diam-diam redirect ke login.
  const [authError, setAuthError] = useState(null);

  // adminRef: mirror dari state `admin` dalam bentuk ref, supaya closure
  // di onAuthStateChange selalu bisa baca nilai admin TERKINI tanpa
  // stale closure -- nilai state tidak bisa dibaca fresh dari dalam
  // useEffect closure yang didaftarkan sekali saat mount.
  const adminRef = useRef(null);

  const initialized = useRef(false);
  const roleCheckRetries = useRef(0);
  const maxRetries = 3;
  // Guard supaya checkAdminRole tidak dipanggil 2x bersamaan untuk user yang sama.
  const checkInFlightFor = useRef(null);

  const checkAdminRole = async (user, isRetry = false) => {
    if (!user) {
      warn('checkAdminRole: no user -> setAdmin(null)');
      setAdmin(null);
      setAuthError(null);
      roleCheckRetries.current = 0;
      return;
    }

   // if (checkInFlightFor.current === user.id && !isRetry) {
   //   warn(`checkAdminRole: query untuk ${user.email} sudah sedang berjalan, skip duplicate call`);
   //   return;
   // }
    checkInFlightFor.current = user.id;

    log('checkAdminRole() CALLED for', user.email, 'isRetry=', isRetry);

    try {
      const queryBuilder = supabase
        .from('admin_users')
        .select('id, email, full_name, role, is_active')
        .eq('id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      const { data: adminUser, error } = await withTimeout(
        queryBuilder,
        8000,
        `admin_users SELECT for ${user.email}`
      );

      if (error) {
        err('Role check query error (Supabase returned an error object):', error);
        throw error;
      }

      if (!adminUser) {
        warn(`User ${user.email} TIDAK ditemukan sebagai admin aktif di tabel admin_users -> setAdmin(null)`);
        setAdmin(null);
        setAuthError(null);
        roleCheckRetries.current = 0;
        return;
      }

      log('Role check OK -> setAdmin', adminUser.email, adminUser.role);
      setAdmin({ ...user, ...adminUser });
      setAuthError(null);
      roleCheckRetries.current = 0;
    } catch (caught) {
      const message = caught?.message || String(caught);
      err('checkAdminRole EXCEPTION:', message);

      if (!isRetry && roleCheckRetries.current < maxRetries) {
        roleCheckRetries.current++;
        const delay = Math.min(1000 * Math.pow(2, roleCheckRetries.current - 1), 8000);
        warn(`Retrying in ${delay}ms (attempt ${roleCheckRetries.current}/${maxRetries})`);
        checkInFlightFor.current = null;
        setTimeout(() => checkAdminRole(user, true), delay);
        return; // jangan jatuh ke finally di bawah, retry masih berlangsung
      } else {
        // Retry habis. INI BUKAN "anggap saja gagal" -> kita SET authError
        // yang jelas, supaya UI bisa menampilkan pesan eksplisit alih-alih
        // diam-diam logout / redirect tanpa penjelasan.
        err(`Retries exhausted untuk ${user.email}. Set authError, JANGAN logout otomatis.`);
        setAuthError(
          `Gagal memverifikasi sesi admin (${message}). Token Anda masih ada, tapi server tidak merespons. Coba refresh halaman.`
        );
        roleCheckRetries.current = 0;
        setLoading(false);
      }
    } finally {
      checkInFlightFor.current = null;
    }
  };

  // Sync adminRef setiap kali admin state berubah, supaya closure
  // di onAuthStateChange selalu baca nilai terkini (bukan nilai stale
  // dari saat listener pertama kali didaftarkan).
  useEffect(() => {
    adminRef.current = admin;
  }, [admin]);

  useEffect(() => {
    log('=== MOUNTED ===');
    dumpStorage('on-mount');

    // ============================================================
    // SINGLE SOURCE OF TRUTH: hanya onAuthStateChange.
    //
    // Supabase SDK otomatis menembak event 'INITIAL_SESSION' sesaat
    // setelah listener didaftarkan, berisi hasil restore dari
    // localStorage (kalau ada). Ini menggantikan getSession() manual
    // yang dulu jalan PARALEL dengan listener ini dan menyebabkan race
    // condition: dua jalur sama-sama berusaha set `admin`/`loading`
    // dengan urutan resolve yang tidak deterministik antara local dan
    // production (beda latency network).
    //
    // Dengan hanya 1 jalur, urutan event SELALU:
    //   INITIAL_SESSION -> (SIGNED_IN | SIGNED_OUT | TOKEN_REFRESHED | ...)
    // dan tidak ada lagi dua proses yang berebut men-set state yang sama.
    // ============================================================
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        log(`onAuthStateChange: event=${event} hasSession=${!!session} initialized=${initialized.current}`);
        dumpStorage(`event-${event}`);

        try {
          if (event === 'INITIAL_SESSION') {
            initialized.current = true;
            if (session?.user) {
              await checkAdminRole(session.user);
            } else {
              log('INITIAL_SESSION tanpa session -> tidak ada token tersimpan, user belum login');
              setAdmin(null);
            }
            setLoading(false);
            return;
          }

          if (event === 'SIGNED_OUT') {
            setAdmin(null);
            setAuthError(null);
            roleCheckRetries.current = 0;
            setLoading(false);
            return;
          }

          if (event === 'TOKEN_REFRESHED') {
            // Token refresh TIDAK mengubah role admin -- user yang sama,
            // cuma token barunya yang berbeda. Tidak perlu re-query admin_users.
            log(`TOKEN_REFRESHED: token diperbarui untuk ${session?.user?.email ?? '?'}, admin state dipertahankan, SKIP checkAdminRole`);
            setLoading(false);
            return;
          }

          if (event === 'SIGNED_IN') {
            if (!session?.user) {
              warn('SIGNED_IN tapi session/user kosong — tidak seharusnya terjadi');
              setLoading(false);
              return;
            }

            // SIGNED_IN sebelum INITIAL_SESSION (initialized masih false):
            // Ini terjadi di production karena _recoverAndRefresh overlap
            // dengan inisialisasi client. Kita SKIP -- biar INITIAL_SESSION
            // yang jadi satu-satunya trigger checkAdminRole di fase init.
            // INITIAL_SESSION pasti akan menyusul dan handle dengan benar.
            if (!initialized.current) {
              log(`SIGNED_IN sebelum INITIAL_SESSION untuk ${session.user.email}, SKIP -- tunggu INITIAL_SESSION`);
              return;
            }

            // Kalau admin state sudah ada dan user-nya sama persis,
            // ini kemungkinan besar SIGNED_IN dari token refresh cycle
            // (Supabase SDK kadang nembak SIGNED_IN alih-alih TOKEN_REFRESHED).
            // Tidak perlu re-query admin_users -- admin state masih valid.
            const currentAdmin = adminRef.current;
            if (currentAdmin && currentAdmin.id === session.user.id) {
              log(`SIGNED_IN: user ${session.user.email} sama dengan admin state saat ini, SKIP checkAdminRole (token refresh cycle)`);
              setLoading(false);
              return;
            }

            // User berbeda atau belum ada admin state -- perlu verifikasi role.
            log(`SIGNED_IN: user ${session.user.email} perlu verifikasi role`);
            await checkAdminRole(session.user);
            setLoading(false);
            return;
          }

          // Event lain (USER_UPDATED, PASSWORD_RECOVERY, dll) - tidak
          // perlu aksi khusus untuk admin dashboard, tapi tetap dicatat.
          log(`Event ${event} tidak ditangani secara khusus, diabaikan`);
        } catch (caught) {
          // INI KUNCI: kalau ada error tak terduga di handler ini,
          // JANGAN biarkan silent. Tampilkan di authError, dan jangan
          // logout paksa hanya karena handler error.
          err('Unhandled error di onAuthStateChange handler:', caught?.message || caught);
          setAuthError(`Error tak terduga saat memproses status sesi: ${caught?.message || caught}`);
          setLoading(false);
        }
      }
    );

    return () => {
      log('=== UNMOUNT ===');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    log('signIn() CALLED for', email);
    setAuthError(null);

    let signInResult;
    try {
      signInResult = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        8000,
        'signInWithPassword'
      );
    } catch (caught) {
      err('signIn: signInWithPassword call THREW (network/timeout):', caught?.message || caught);
      throw new Error(`Tidak bisa menghubungi server otentikasi: ${caught?.message || caught}`);
    }

    const { data, error } = signInResult;
    if (error) {
      err('signIn FAILED (Supabase returned error):', error);
      throw error;
    }
    if (!data?.user) {
      err('signIn: tidak ada error tapi data.user kosong — kondisi tidak terduga dari Supabase');
      throw new Error('Login gagal: respons server tidak berisi data user.');
    }

    let roleCheckResult;
    try {
      roleCheckResult = await withTimeout(
        supabase
          .from('admin_users')
          .select('id, email, full_name, role, is_active')
          .eq('id', data.user.id)
          .eq('is_active', true)
          .maybeSingle(),
        8000,
        'admin_users lookup (signIn)'
      );
    } catch (caught) {
      err('signIn: role lookup THREW:', caught?.message || caught);
      // Sign out supaya tidak ada sesi "menggantung" tanpa kepastian role
      await supabase.auth.signOut();
      throw new Error(`Gagal memverifikasi role admin: ${caught?.message || caught}`);
    }

    const { data: adminUser, error: roleError } = roleCheckResult;
    if (roleError) {
      err('signIn: role lookup returned error:', roleError);
      await supabase.auth.signOut();
      throw new Error(`Gagal memverifikasi role admin: ${roleError.message}`);
    }

    if (!adminUser) {
      warn(`signIn: ${email} berhasil auth tapi BUKAN admin aktif -> signOut + reject`);
      await supabase.auth.signOut();
      throw new Error('Akses ditolak. Bukan admin.');
    }

    log('signIn SUCCESS for', email, 'role=', adminUser.role);
    return data;
  };

  const signOut = async () => {
    log('signOut() CALLED');
    try {
      await supabase.auth.signOut();
    } catch (caught) {
      // Tetap clear state lokal walau signOut ke server gagal (mis. offline),
      // supaya user tidak "terjebak" di state admin walau sudah klik logout.
      err('signOut: supabase.auth.signOut() THREW (state lokal tetap dibersihkan):', caught?.message || caught);
    }
    setAdmin(null);
    setAuthError(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, authError, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return context;
};