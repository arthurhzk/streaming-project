import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, clearAccessToken, getRefreshToken } from '@web/lib/api';
import { AuthContext, type AuthContextValue } from '@web/contexts/auth.context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = userId !== null;

  const setAuthenticated = useCallback((id: string) => {
    setUserId(id);
  }, []);

  const logout = useCallback(async () => {
    const token = getRefreshToken();
    try {
      await api.post('/auth/logout', { refreshToken: token ?? '' });
    } finally {
      clearAccessToken();
      setUserId(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    api
      .get<{ userId: string }>('/users/me')
      .then((res) => {
        if (!cancelled && res.data?.userId) {
          setUserId(res.data.userId);
        }
        return res.data;
      })
      .catch(() => {
        if (!cancelled) {
          setUserId(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      userId,
      setAuthenticated,
      logout,
    }),
    [isAuthenticated, userId, setAuthenticated, logout],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
