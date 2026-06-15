import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Separate storage key so admin sessions don't clash with customer sessions
// Enable persistent sessions and automatic token refresh so the admin client
// will try to refresh expired access tokens using the refresh token.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'hw-admin-session',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
})
