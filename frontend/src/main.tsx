import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import "./i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClient } from '@supabase/supabase-js';
import { AuthProvider } from "./utils/Auth.tsx";
import { edenTreaty } from '@elysiajs/eden'
import type { Api } from "server/src/index.ts";
import { Toaster } from "./components/Toaster.tsx";

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

// export const clientApi = edenTreaty<Api>("http://localhost:3000");
export const clientApi = edenTreaty<Api>("http://192.168.86.226:5050");
export const getHeaders = async () => {
  const { data } =  await supabase.auth.getSession();

  if (data?.session?.access_token) return {
    "Authorization": `Bearer ${data.session.access_token}`
  };

  return undefined;
}

export const supabase = createClient(import.meta.env.VITE_SUPABASE_URL!, import.meta.env.VITE_SUPABASE_KEY!);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);