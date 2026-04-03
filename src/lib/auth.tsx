import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CfUser {
  email: string;
  name: string;
}

interface AuthContextValue {
  user: CfUser | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true, signOut: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CfUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to decode user from the CF_Authorization cookie (set by Cloudflare Access)
    try {
      const cookie = document.cookie.split(';').find(c => c.trim().startsWith('CF_Authorization='));
      if (cookie) {
        const token = cookie.split('=')[1];
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          email: payload.email || '',
          name: payload.email?.split('@')[0] || 'Unknown',
        });
      }
    } catch {
      // Cookie decode failed; fall back to /api/me
    }
    
    // Verify with server (also works if cookie parsing failed)
    fetch('/api/me')
      .then(r => r.ok ? r.json() : null)
      .then((data: CfUser | null) => {
        if (data) setUser(data);
        else setUser(null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signOut = () => {
    // When Cloudflare Access is configured, redirect to logout endpoint:
    // window.location.href = '/cdn-cgi/access/logout';
    // For now (demo mode), just reload
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
