import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './globals.css'
import { QueryClient, QueryClientProvider } from "react-query";
import { createClient } from '@supabase/supabase-js';
import "./i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);