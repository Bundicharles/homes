import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { PWAProvider } from '@/context/PWAContext';
import App from '@/App';
import '@/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <AuthProvider>
          <NotificationProvider>
            <PWAProvider>
              <BrowserRouter
                basename={
                  typeof window !== 'undefined' && window.location.pathname.startsWith('/homes/dist')
                    ? '/homes/dist'
                    : typeof window !== 'undefined' && window.location.pathname.startsWith('/homes')
                    ? '/homes'
                    : '/'
                }
              >
                <App />
              </BrowserRouter>
            </PWAProvider>
          </NotificationProvider>
        </AuthProvider>
      </SettingsProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
