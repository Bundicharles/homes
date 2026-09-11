import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/services/api';
import { setStoredAuth, getStoredAuth, clearStoredAuth } from '@/utils/authStorage';

const AuthContext = createContext(null);

const readStoredUser = () => {
  const stored = getStoredAuth();
  if (!stored) return null;
  return stored.user || stored;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(() => readStoredUser());

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['auth.check'],
    queryFn: () => authAPI.checkAuth(),
    retry: false,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (!data?.success) return;
    if (data.data?.authenticated && data.data.user) {
      setUser(data.data.user);
      setStoredAuth(data.data.user);
      return;
    }
    if (data.data && data.data.authenticated === false) {
      setUser(null);
      clearStoredAuth();
    }
  }, [data]);

  const login = async (email, password, remember = false) => {
    const response = await authAPI.login({ email, password, remember });
    if (response.success && response.data) {
      const nextUser = response.data.user;
      setUser(nextUser);
      setStoredAuth(nextUser);
      queryClient.setQueryData(['auth.check'], {
        success: true,
        data: { authenticated: true, user: nextUser },
      });
    }
    return response;
  };

  const register = async (payload) => {
    const response = await authAPI.register(payload);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // still clear local session
    }
    setUser(null);
    clearStoredAuth();
    queryClient.setQueryData(['auth.check'], {
      success: true,
      data: { authenticated: false, user: null },
    });
    queryClient.removeQueries({ queryKey: ['auth.me'] });
  };

  const refetchUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        setStoredAuth(response.data);
      }
      return response;
    } catch (error) {
      await refetch();
      throw error;
    }
  };

  const value = {
    user,
    isLoading: isLoading && !user && !isError,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
