import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Memory-based storage to avoid localStorage lock conflicts with customer auth
class MemoryStorage {
  constructor() {
    this.data = {}
  }

  getItem(key) {
    return this.data[key] || null
  }

  setItem(key, value) {
    this.data[key] = value
  }

  removeItem(key) {
    delete this.data[key]
  }
}

const memoryStorage = new MemoryStorage()

// Admin client with memory storage (no localStorage locks)
// This prevents conflicts with customer auth client using localStorage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Admin session: sengaja JANGAN persist ke storage browser
    // supaya nggak kena corrupted localStorage/session lock yang bikin refresh stuck.
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
    storageKey: 'hw-admin-session',
  },
});


