import { ArrowBigUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";

export function CashbackGeneratedCard() {
  const { data, isLoading } = useDashboardMetrics();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Cashback Gerado</CardTitle>
        <ArrowBigUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <span className="text-2xl font-bold text-green-600">
          {isLoading
            ? "..."
            : `R$ +${data?.totalCashbackGenerated?.toFixed(2) ?? "0.00"}`}
        </span>
      </CardContent>
    </Card>
  );
}
