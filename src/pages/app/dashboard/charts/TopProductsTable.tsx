// src/pages/app/dashboard/tables/TopProductsTable.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";

export function TopProductsTable() {
  const { data, isLoading } = useDashboardMetrics();
  const products = data?.topProducts ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 produtos mais vendidos</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-muted">
                <th className="px-4 py-2 text-left">Produto</th>
                <th className="px-4 py-2 text-left">Vendido por:</th>
                <th className="px-4 py-2 text-right">Vendas</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="p-4 text-center text-muted-foreground"
                  >
                    Carregando...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="p-4 text-center text-muted-foreground"
                  >
                    Nenhum dado encontrado.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-muted">
                    <td className="px-4 py-2 font-medium">{product.name}</td>
                    <td className="px-4 py-2">{"Loja Rhadar"}</td>
                    <td className="px-4 py-2 text-right">
                      {product.totalSold}
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
