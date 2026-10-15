import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";

export function TopUsersTable() {
  const { data, isLoading } = useDashboardMetrics();

  const users = data?.topUsers ?? [];

  return (
    <Card className="overflow-hidden rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          🏆 Top 5 clientes mais engajados
        </CardTitle>

        <p className="text-sm text-muted-foreground">
          Clientes com mais brindes resgatados, seus pedidos validados e saldo
          de pontos.
        </p>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="border-b">
                <th className="px-4 py-3 text-left">Cliente</th>

                <th className="px-4 py-3 text-left">E-mail</th>

                <th className="px-4 py-3 text-center">Pedidos</th>

                <th className="px-4 py-3 text-center">Resgates</th>

                <th className="px-4 py-3 text-right">Saldo de pontos</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-muted-foreground"
                  >
                    Carregando clientes...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-muted-foreground"
                  >
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr
                    key={user.id}
                    className="border-b transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                          #{index + 1}
                        </span>

                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-muted-foreground">
                      {user.email}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1 font-semibold text-blue-700">
                        {user.totalOrders ?? 0}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex rounded-lg bg-green-50 px-3 py-1 font-semibold text-green-700">
                        {user.totalRedemptions ?? 0}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-amber-600">
                        {user.totalPoints == null
                          ? "—"
                          : user.totalPoints.toLocaleString("pt-BR")}
                      </span>
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
