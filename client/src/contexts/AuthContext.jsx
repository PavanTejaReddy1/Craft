import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/index.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    // Hard safety: never spin forever — resolve after 8 s regardless
    const safetyTimer = setTimeout(() => setLoading(false), 8000);

    try {
      const { data } = await authApi.getMe();
      setUser(data.user);
      setProfile(data.profile);
    } catch {
      // 401 / network error / server down → unauthenticated, not broken
      setUser(null);
      setProfile(null);
      localStorage.removeItem('accessToken');
    } finally {
      clearTimeout(safetyTimer);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
    setUser(data.user);
    setProfile(data.profile ?? null);
    return data.user;
  };

  const register = async (userData) => {
    const { data } = await authApi.register(userData);
    if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await authApi.logout().catch(() => {});
    localStorage.removeItem('accessToken');
    setUser(null);
    setProfile(null);
    window.location.href = '/';
  };

  const updateUser    = (updates) => setUser((p)    => ({ ...p, ...updates }));
  const updateProfile = (updates) => setProfile((p) => ({ ...p, ...updates }));

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      login, register, logout,
      updateUser, updateProfile, fetchMe,
      isAuthenticated: !!user,
      isClient:    user?.role === 'client',
      isDeveloper: user?.role === 'developer',
      isAdmin:     user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
