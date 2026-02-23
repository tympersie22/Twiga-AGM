'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'manager' | 'super_admin';
  displayName: string;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'manager',
  displayName: 'Admin',
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'admin' | 'manager' | 'super_admin'>('manager');
  const [displayName, setDisplayName] = useState('Admin');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const toDisplayName = (email?: string | null) => {
    if (!email) return 'Admin';
    return email
      .split('@')[0]
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const loadProfile = useCallback(async (sessionUser: User) => {
    if (!supabase) {
      return { role: 'manager' as const, displayName: toDisplayName(sessionUser.email) };
    }

    try {
      const { data } = await supabase
        .from('admin_profiles')
        .select('full_name, role, email')
        .eq('user_id', sessionUser.id)
        .maybeSingle();

      const roleFromProfile = data?.role;
      const resolvedRole =
        roleFromProfile === 'admin' || roleFromProfile === 'super_admin' ? roleFromProfile : 'manager';

      const existingName = typeof data?.full_name === 'string' ? data.full_name.trim() : '';
      const metadata = (sessionUser.user_metadata || {}) as Record<string, unknown>;
      const metadataName = typeof metadata.full_name === 'string' ? metadata.full_name.trim() : '';
      const resolvedName = existingName || metadataName || toDisplayName(sessionUser.email);

      if (!data) {
        const now = Date.now();
        await supabase.from('admin_profiles').upsert(
          {
            user_id: sessionUser.id,
            company_id: 'twiga-agm',
            email: sessionUser.email || null,
            full_name: resolvedName,
            role: 'manager',
            updated_at: now,
          },
          { onConflict: 'user_id' },
        );
      } else if (!existingName || data.email !== sessionUser.email) {
        await supabase
          .from('admin_profiles')
          .update({
            full_name: resolvedName,
            email: sessionUser.email || null,
            updated_at: Date.now(),
          })
          .eq('user_id', sessionUser.id);
      }

      return { role: resolvedRole, displayName: resolvedName };
    } catch {
      return { role: 'manager' as const, displayName: toDisplayName(sessionUser.email) };
    }
  }, []);

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) {
      setUser(null);
      setRole('manager');
      setDisplayName('Admin');
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
        setDisplayName('Admin');
        setLoading(false);
        router.push('/login');
        return;
      }
      void loadProfile(data.session.user).then((profile) => {
        if (!mounted) return;
        setRole(profile.role);
        setDisplayName(profile.displayName);
        setLoading(false);
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setRole('manager');
        setDisplayName('Admin');
        setLoading(false);
        router.push('/login');
        return;
      }
      void loadProfile(session.user).then((profile) => {
        setRole(profile.role);
        setDisplayName(profile.displayName);
        setLoading(false);
      });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router, pathname, loadProfile]);

  const signOut = async () => {
    if (!supabase || !isSupabaseConfigured) {
      router.push('/login');
      return;
    }
    await supabase.auth.signOut();
    router.push('/login');
  };

  return <AuthContext.Provider value={{ user, role, displayName, loading, signOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
