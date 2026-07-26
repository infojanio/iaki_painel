import { useAuth } from "@/contexts/AuthContext";

export function DashboardHeader() {
  const { user } = useAuth();

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-3">
          {user?.store?.avatar ? (
            <img
              src={user.store.avatar}
              alt={user.store.name}
              className="h-16 w-16 rounded-full object-cover border shadow-sm"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-semibold">
              🏪
            </div>
          )}

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {user?.store?.name ?? "Nenhuma loja vinculada"}
            </h1>

            <p className="text-muted-foreground mt-1">
              Acompanhe os resultados da sua loja em tempo real.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
