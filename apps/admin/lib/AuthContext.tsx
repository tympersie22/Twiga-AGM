'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      setUser({
        uid: 'demo-admin',
        email: 'demo@twiga.local',
        displayName: 'Demo Admin',
      } as User);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (!firebaseUser && pathname !== '/login') {
        router.push('/login');
      }
    });

    return unsubscribe;
  }, [router, pathname]);

  const signOut = async () => {
    if (!auth || !isFirebaseConfigured) {
      router.push('/login');
      return;
    }
    await firebaseSignOut(auth);
    router.push('/login');
  };

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
