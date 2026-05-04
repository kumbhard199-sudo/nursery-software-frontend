import { createContext, useContext, useEffect, useMemo, useState, createElement } from 'react';
import { clearSession, getAdmin, getToken, setSession } from '../utils/authStorage';
import * as authApi from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken());
  const [admin, setAdmin] = useState(() => getAdmin());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        if (!getToken()) return;
        const me = await authApi.getMe();
        if (!mounted) return;
        setAdmin(me?.data?.admin || null);
        setSession({ token: getToken(), admin: me?.data?.admin || null });
      } catch {
        clearSession();
        if (!mounted) return;
        setToken(null);
        setAdmin(null);
      } finally {
        if (mounted) setIsBootstrapping(false);
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const onUnauthorized = () => {
      clearSession();
      setToken(null);
      setAdmin(null);
    };
    window.addEventListener('nms:unauthorized', onUnauthorized);
    return () => window.removeEventListener('nms:unauthorized', onUnauthorized);
  }, []);

  const value = useMemo(
    () => ({
      token,
      admin,
      isAuthenticated: Boolean(token),
      isBootstrapping,
      async login(payload) {
        const res = await authApi.login(payload);
        const nextToken = res?.data?.token;
        const nextAdmin = res?.data?.admin;
        setSession({ token: nextToken, admin: nextAdmin });
        setToken(nextToken);
        setAdmin(nextAdmin);
        return res;
      },
      async setup(payload) {
        return authApi.setupInitialAdmin(payload);
      },
      logout() {
        clearSession();
        setToken(null);
        setAdmin(null);
      },
      async refreshMe() {
        const me = await authApi.getMe();
        const nextAdmin = me?.data?.admin || null;
        setAdmin(nextAdmin);
        setSession({ token: getToken(), admin: nextAdmin });
        return me;
      },
    }),
    [token, admin, isBootstrapping]
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

