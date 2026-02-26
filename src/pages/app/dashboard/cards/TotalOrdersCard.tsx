// src/pages/app/dashboard/cards/TotalOrdersCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";

export function TotalOrdersCard() {
  const { data, isLoading } = useDashboardMetrics();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total de Pedidos</CardTitle>
      </CardHeader>
      <CardContent>
        <span className="text-2xl font-bold">
          {isLoading ? "..." : data?.totalOrders ?? 0}
        </span>
      </CardContent>
    </Card>
  );
}
