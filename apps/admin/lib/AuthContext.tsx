'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'manager' | 'super_admin';
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'manager',
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'manager' | 'super_admin'>('manager');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const loadProfileRole = async (userId: string) => {
    if (!supabase) return 'manager' as const;
    const { data } = await supabase
      .from('admin_profiles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    const rawRole = data?.role;
    return rawRole === 'admin' || rawRole === 'super_admin' ? rawRole : 'manager';
  };

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setUser(null);
      setRole('manager');
      setLoading(false);
      if (pathname !== '/login') router.push('/login');
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      if (!data.session?.user) {
        setRole('manager');
        setLoading(false);
        router.push('/login');
        return;
      }
      void loadProfileRole(data.session.user.id).then((resolvedRole) => {
        if (!mounted) return;
        setRole(resolvedRole);
        setLoading(false);
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setRole('manager');
        setLoading(false);
        router.push('/login');
        return;
      }
      void loadProfileRole(session.user.id).then((resolvedRole) => {
        setRole(resolvedRole);
        setLoading(false);
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  const signOut = async () => {
    if (!supabase || !isSupabaseConfigured) {
      router.push('/login');
      return;
    }
    await supabase.auth.signOut();
    router.push('/login');
  };

  return <AuthContext.Provider value={{ user, role, loading, signOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
