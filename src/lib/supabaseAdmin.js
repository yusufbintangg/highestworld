import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Admin client pakai storageKey terpisah ('hw-admin-session') dari client customer
// (yang pakai default 'sb-<project-ref>-auth-token'). Ini supaya dua client tidak
// rebutan key localStorage yang sama (storage lock collision).
//
// persistSession: true -> sengaja, supaya admin TETAP login walau tab di-refresh
// atau browser ditutup-buka lagi (sesuai requirement).
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: 'hw-admin-session',
  },
});