// src/pages/_layouts/app.tsx
import { Outlet } from "react-router-dom";

import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function AppLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between bg-gray-700 px-6 py-4 text-white">
          <h1 className="text-lg font-bold">Painel Administrativo</h1>

          <div className="flex items-center gap-4">
            <span className="text-sm">
              Olá, <strong>{user?.name}</strong>
            </span>
            <Button variant="default" size="sm" onClick={signOut}>
              Sair
            </Button>
          </div>
        </header>

        <main className="flex-1 bg-gray-100 text-black p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
