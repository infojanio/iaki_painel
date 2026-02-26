import { ListOrderedIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";

export function ActiveProductsCard() {
  const { data, isLoading } = useDashboardMetrics();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Produtos Ativos</CardTitle>
        <ListOrderedIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <span className="text-2xl font-bold">
          {isLoading ? "..." : data?.activeProducts ?? 0}
        </span>
      </CardContent>
    </Card>
  );
}
