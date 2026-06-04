import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";

export function OrdersByMonthChart() {
  const { data, isLoading } = useDashboardMetrics();

  const chartData = data?.ordersByMonth ?? [];

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Pedidos por mês</CardTitle>

        <p className="text-sm text-muted-foreground">
          Quantidade de pedidos gerados durante o ano.
        </p>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <span>Carregando gráfico...</span>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" tickLine={false} axisLine={false} />

              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />

              <Tooltip formatter={(value) => [`${value} pedidos`, "Pedidos"]} />

              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                <LabelList dataKey="total" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
