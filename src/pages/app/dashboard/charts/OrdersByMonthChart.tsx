import { useMemo } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Activity, BarChart3, CalendarDays, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";

type ChartItem = {
  month: string;
  total: number;
};

const COLORS = [
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#06B6D4",
  "#F59E0B",
  "#10B981",
  "#6366F1",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#84CC16",
  "#0EA5E9",
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("pt-BR").format(value);

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value?: number | string;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const total = Number(payload[0]?.value ?? 0);

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-xl">
      <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>

      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

        <span className="text-lg font-bold text-gray-900">
          {formatNumber(total)}
        </span>

        <span className="text-xs text-gray-500">pedidos</span>
      </div>
    </div>
  );
}

export function OrdersByMonthChart() {
  const { data, isLoading } = useDashboardMetrics();

  const chartData = useMemo<ChartItem[]>(() => {
    return (data?.ordersByMonth ?? []).map((item) => ({
      month: String(item.month),
      total: Number(item.total ?? 0),
    }));
  }, [data?.ordersByMonth]);

  const metrics = useMemo(() => {
    const totalOrders = chartData.reduce((sum, item) => sum + item.total, 0);

    const average = chartData.length > 0 ? totalOrders / chartData.length : 0;

    const bestMonth = chartData.reduce<ChartItem | null>(
      (best, item) => (!best || item.total > best.total ? item : best),
      null,
    );

    const maxValue = Math.max(...chartData.map((item) => item.total), 0);

    return {
      totalOrders,
      average,
      bestMonth,
      maxValue,
    };
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className="col-span-2 rounded-2xl border border-gray-100 shadow-sm">
        <CardContent className="flex h-[420px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-green-100 border-t-green-600" />

            <p className="text-sm text-gray-500">
              Carregando dados dos pedidos...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* CABEÇALHO */}
      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-white to-green-50/60 pb-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100">
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>

            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                Pedidos por mês
              </CardTitle>

              <p className="mt-1 text-sm text-gray-500">
                Acompanhe o desempenho mensal da loja
              </p>
            </div>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-1.5">
            <Activity className="h-3.5 w-3.5 text-green-600" />

            <span className="text-xs font-semibold text-green-700">
              Visão mensal
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-7 p-5 sm:p-6">
        {/* INDICADORES */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* TOTAL */}
          <div className="rounded-xl border border-green-100 bg-green-50/70 p-4">
            <div className="mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-600" />

              <span className="text-xs font-medium text-gray-600">
                Total de pedidos
              </span>
            </div>

            <p className="text-2xl font-bold tracking-tight text-gray-900">
              {formatNumber(metrics.totalOrders)}
            </p>

            <p className="mt-1 text-xs text-gray-500">No período apresentado</p>
          </div>

          {/* MÉDIA */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />

              <span className="text-xs font-medium text-gray-600">
                Média mensal
              </span>
            </div>

            <p className="text-2xl font-bold tracking-tight text-gray-900">
              {metrics.average.toLocaleString("pt-BR", {
                maximumFractionDigits: 1,
              })}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Pedidos por mês exibido
            </p>
          </div>

          {/* MELHOR MÊS */}
          <div className="rounded-xl border border-purple-100 bg-purple-50/70 p-4">
            <div className="mb-2 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-purple-600" />

              <span className="text-xs font-medium text-gray-600">
                Melhor mês
              </span>
            </div>

            <p className="truncate text-2xl font-bold tracking-tight text-gray-900">
              {metrics.bestMonth?.month ?? "—"}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {formatNumber(metrics.bestMonth?.total ?? 0)} pedidos
            </p>
          </div>
        </div>

        {/* GRÁFICO */}
        {chartData.length === 0 ? (
          <div className="flex h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50">
            <BarChart3 className="mb-3 h-10 w-10 text-gray-300" />

            <p className="font-medium text-gray-600">
              Nenhum pedido encontrado
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Os dados aparecerão quando houver pedidos.
            </p>
          </div>
        ) : (
          <div className="w-full">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  Evolução dos pedidos
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Quantidade registrada em cada mês
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                Pedidos realizados
              </div>
            </div>

            <div className="h-[330px] w-full sm:h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 25,
                    right: 12,
                    left: -15,
                    bottom: 5,
                  }}
                  barCategoryGap="25%"
                >
                  <CartesianGrid
                    strokeDasharray="4 5"
                    stroke="#E5E7EB"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#6B7280",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                    tickMargin={12}
                    interval={0}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#9CA3AF",
                      fontSize: 11,
                    }}
                    tickFormatter={(value) => formatNumber(Number(value))}
                  />

                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{
                      fill: "#F3F4F6",
                      radius: 8,
                    }}
                  />

                  <Bar
                    dataKey="total"
                    name="Pedidos"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={52}
                    minPointSize={0}
                    isAnimationActive
                    animationDuration={900}
                    animationEasing="ease-out"
                  >
                    {chartData.map((item, index) => {
                      const isBestMonth =
                        metrics.maxValue > 0 && item.total === metrics.maxValue;

                      return (
                        <Cell
                          key={`${item.month}-${index}`}
                          fill={
                            isBestMonth
                              ? "#16A34A"
                              : COLORS[index % COLORS.length]
                          }
                          fillOpacity={isBestMonth ? 1 : 0.85}
                        />
                      );
                    })}

                    <LabelList
                      dataKey="total"
                      position="top"
                      formatter={(value: unknown) => {
                        const total = Number(value ?? 0);

                        return total > 0 ? formatNumber(total) : "";
                      }}
                      style={{
                        fill: "#374151",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* RODAPÉ */}
        <div className="flex flex-col gap-2 border-t border-gray-100 pt-4 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>Dados atualizados conforme os registros do sistema.</span>

          <span className="font-medium text-gray-600">
            IAKI • Relatório de pedidos
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
