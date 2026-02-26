import { UserIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardMetrics } from "@/hooks/use-dashboard-metrics";

export function TotalUsersCard() {
  const { data, isLoading } = useDashboardMetrics();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">
          Total de Usuários
        </CardTitle>
        <UserIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <span className="text-2xl font-bold">
          {isLoading ? "..." : data?.totalUsers ?? 0}
        </span>
      </CardContent>
    </Card>
  );
}
