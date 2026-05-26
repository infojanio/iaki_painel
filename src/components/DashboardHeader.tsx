import { useAuth } from "@/contexts/AuthContext";

export function DashboardHeader() {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Olá, {user?.name} 👋
        </h1>

        <p className="text-muted-foreground mt-1">
          Acompanhe os resultados da sua loja em tempo real.
        </p>
      </div>
    </div>
  );
}
