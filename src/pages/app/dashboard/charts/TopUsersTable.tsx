// src/pages/app/dashboard/tables/TopUsersTable.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";

export function TopUsersTable() {
  const { data, isLoading } = useDashboardMetrics();

  const users = data?.topUsers ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>🏆 Top 5 clientes mais engajados</CardTitle>

        <p className="text-sm text-muted-foreground">
          Clientes com maior quantidade de brindes resgatados.
        </p>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-muted">
                <th className="px-4 py-3 text-left">Cliente</th>

                <th className="px-4 py-3 text-left">E-mail</th>

                <th className="px-4 py-3 text-center">Resgates</th>

                <th className="px-4 py-3 text-right">Pontos</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-4 text-center text-muted-foreground"
                  >
                    Carregando...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-4 text-center text-muted-foreground"
                  >
                    Nenhum dado encontrado.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b border-muted hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>

                        {user.name}
                      </div>
                    </td>

                    <td className="px-4 py-3">{user.email}</td>

                    <td className="px-4 py-3 text-center">
                      {user.totalRedemptions ?? 0}
                    </td>

                    <td className="px-4 py-3 text-right font-semibold">
                      {(user.totalPoints ?? 0).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
