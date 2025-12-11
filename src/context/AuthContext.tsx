import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { login as loginRequest, LoginPayload } from '../services/auth';
import { clearSession, loadSession, saveSession } from '../storage/sessionStorage';
import { setAuthTokens } from '../services/http';
import { clearDayCycle } from '../services/dayCycle';

type Session = LoginPayload;

type AuthState = {
  session: Session | null;
  loading: boolean;
  error: string | null;
  remember: boolean;
};

type AuthContextValue = AuthState & {
  login: (username: string, password: string, remember: boolean) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadSession()
      .then(data => {
        if (mounted) {
          setSession(data.session);
          setRemember(data.remember);
          if (data.session) {
            setAuthTokens(
              {
                token: data.session.token,
                refreshToken: data.session.refreshToken,
                accessTokenExpiresAt: data.session.accessTokenExpiresAt,
                refreshTokenExpiresAt: data.session.refreshTokenExpiresAt,
              },
              async updated => {
                if (!updated) return;
                setSession(prev => {
                  const merged = prev
                    ? { ...prev, ...updated }
                    : data.session
                      ? { ...data.session, ...updated }
                      : null;
                  if (merged) {
                    saveSession(merged, data.remember);
                  }
                  return merged;
                });
              },
            );
          }
        }
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (username: string, password: string, rememberMe: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginRequest(username.trim(), password);
      const sessionData: Session = {
        ...result,
        accessTokenExpiresAt: result.accessTokenExpiry
          ? Date.now() + Number(result.accessTokenExpiry)
          : undefined,
        refreshTokenExpiresAt: result.refreshTokenExpiry
          ? Date.now() + Number(result.refreshTokenExpiry)
          : undefined,
      };
      if (__DEV__) {
        // Surface the logged-in user payload while developing
        // eslint-disable-next-line no-console
        console.log('Login success', sessionData);
      }
      setSession(sessionData);
      setRemember(rememberMe);
      setAuthTokens(
        {
          token: sessionData.token,
          refreshToken: sessionData.refreshToken,
          accessTokenExpiresAt: sessionData.accessTokenExpiresAt,
          refreshTokenExpiresAt: sessionData.refreshTokenExpiresAt,
        },
        async updated => {
          if (!updated) {
            return;
          }
          setSession(prev => (prev ? { ...prev, ...updated } : prev));
          const latest = { ...sessionData, ...updated };
          await saveSession(latest, rememberMe);
        },
      );
      await saveSession(sessionData, rememberMe);
    } catch (err: any) {
      const message =
        err?.message === 'Session expired'
          ? 'Unauthorized. Check your credentials.'
          : err?.message || 'Unable to log in right now.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const userId = session?.userId;
      setSession(null);
      setRemember(false);
      setAuthTokens(null);
      await clearSession();
      if (userId != null) {
        await clearDayCycle(userId);
      }
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      error,
      remember,
      login,
      logout,
    }),
    [session, loading, error, remember],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
