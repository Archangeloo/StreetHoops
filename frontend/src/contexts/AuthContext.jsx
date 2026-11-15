import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../services/api.js';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serviceError, setServiceError] = useState('');

  const refresh = useCallback(async (signal) => {
    const result = await apiFetch('/auth/me', { signal });
    setUser(result.user);
    return result.user;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try { await refresh(controller.signal); }
      catch (error) {
        if (error?.name === 'AbortError') return;
        if (error.status !== 401) setServiceError(error.message);
        setUser(null);
      } finally { if (!controller.signal.aborted) setLoading(false); }
    })();
    return () => controller.abort();
  }, [refresh]);

  const login = useCallback(async ({ email, senha }) => {
    const data = await apiFetch('/auth/login', { method: 'POST', body: { email, senha } });
    setUser(data.user);
    setServiceError('');
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout, refresh, serviceError }), [user, loading, login, logout, refresh, serviceError]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth requer AuthProvider.');
  return context;
}
