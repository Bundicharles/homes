import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { settingsAPI } from '@/services/api';

const SettingsContext = createContext(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['settings.public'],
    queryFn: () => settingsAPI.getPublic(),
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });

  const settings = data?.success ? data.data : {};

  const value = {
    settings,
    isLoading,
    refetch: () => refetch(),
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};
