import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authAPI } from '@/services/api';
import { setStoredAuth, getStoredAuth, clearStoredAuth } from '@/utils/authStorage';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { refetch: refetchUser } = useQuery({
    queryKey: ['auth.me'],
    queryFn: () => authAPI.getCurrentUser(),
    enabled: false,
    retry: false,
    onSuccess: (data) => {
      if (data.success && data.data) {
        setUser(data.data);
      }
    },
    onError: () => {
      setUser(null);
    },
  });

  const { refetch: checkAuth } = useQuery({
    queryKey: ['auth.check'],
    queryFn: () => authAPI.checkAuth(),
    retry: false,
    onSuccess: (data) => {
      if (data.success && data.data?.authenticated) {
        setUser(data.data.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    },
    onError: () => {
      setUser(null);
      setIsLoading(false);
    },
  });

  useEffect(() => {
    const storedAuth = getStoredAuth();
    if (storedAuth) {
      setUser(storedAuth.user);
      setIsLoading(false);
    } else {
      checkAuth();
    }
  }, []);

  const login = async (email, password, remember = false) => {
    const response = await authAPI.login({ email, password, remember });
    if (response.success && response.data) {
      setUser(response.data.user);
      setStoredAuth(response.data.user);
    }
  };

  const register = async (data) => {
    const response = await authAPI.register(data);
    if (!response.success) {
      throw new Error(response.message);
    }
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
    clearStoredAuth();
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refetchUser: () => refetchUser(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
