import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar_url: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface UserProfileData {
  full_name?: string;
  phone?: string | null;
  avatar_url?: string | null;
}

const buildProfile = (supabaseUser: User, profileData?: UserProfileData): UserProfile => ({
  id: supabaseUser.id,
  email: supabaseUser.email ?? '',
  name:
    profileData?.full_name ||
    supabaseUser.user_metadata?.full_name ||
    supabaseUser.email?.split('@')[0] ||
    'User',
  phone: profileData?.phone || supabaseUser.user_metadata?.phone || null,
  avatar_url:
    profileData?.avatar_url ||
    supabaseUser.user_metadata?.avatar_url ||
    null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  const fetchProfile = async (supabaseUser: User) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('full_name, phone, avatar_url')
      .eq('id', supabaseUser.id)
      .single();

    if (error?.code === 'PGRST116') {
      // Profile belum ada, buat baru
      await supabase.from('user_profiles').insert({
        id: supabaseUser.id,
        full_name: supabaseUser.user_metadata?.full_name || null,
        phone: supabaseUser.user_metadata?.phone || null,
      });
    }

    setUser(buildProfile(supabaseUser, data));
  } catch {
    setUser(buildProfile(supabaseUser, null));
  }
};

  useEffect(() => {
    // Use only onAuthStateChange to avoid race between getSession() and listener

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // First event is INITIAL_SESSION (session may be null or valid)
        if (!initialized.current) {
          initialized.current = true;
          setSession(session);
          setIsLoading(false);
          if (session?.user) await fetchProfile(session.user);
          return;
        }

        // Subsequent events: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
        setSession(session);
        if (session?.user) {
          await fetchProfile(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!session,
        user,
        session,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};