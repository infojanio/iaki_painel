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

export function CashbackByMonthChart() {
  const { data, isLoading } = useDashboardMetrics();

  const chartData =
    data?.cashbackByMonth.map((month) => ({
      name: month.month,
      value: month.total,
    })) ?? [];

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Cashback gerado por mês
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Visualização dos valores totais gerados em cashback a cada mês.
        </p>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <span className="text-muted-foreground">Carregando gráfico...</span>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              {/* Linhas de grade suaves */}
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />{" "}
              {/* gray-200 */}
              <XAxis
                dataKey="name"
                stroke="#6b7280" // gray-500
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `R$ ${v}`}
              />
              <Tooltip
                cursor={{ fill: "#f1f5f9" }} // bg-slate-100
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "#f8fafc",
                  color: "#0f172a",
                }}
                formatter={(v: number) => `R$ ${v.toFixed(2)}`}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 2, 0, 0]}>
                {/* Mostrar valores nas barras */}
                <LabelList
                  dataKey="value"
                  position="top"
                  formatter={(v: number) => `R$ ${v}`}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
