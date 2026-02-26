import "./global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";

import { ThemeProvider } from "./components/theme/theme-provider";
import { AuthProvider } from "./contexts/AuthContext";
import { queryClient } from "./lib/react-query";
import { router } from "./routes";

export function App() {
  return (
    <HelmetProvider>
      <ThemeProvider defaultTheme="light" storageKey="pizzashop-theme">
        <Helmet titleTemplate="%s | Lojas Rahdar" />

        <Toaster richColors />

        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
