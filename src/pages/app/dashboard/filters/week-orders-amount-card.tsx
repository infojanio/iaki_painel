import { CalendarCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeekOrdersAmount } from "@/hooks/use-week-orders-amount";

import { MetricCardSkeleton } from "./metric-card-skeleton";

export function WeekOrdersAmountCard() {
  const { data: weekOrdersAmount, isLoading } = useWeekOrdersAmount();

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold ">
          Pedidos (semana)
        </CardTitle>
        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-1">
        {isLoading || !weekOrdersAmount ? (
          <MetricCardSkeleton />
        ) : (
          <>
            <span className="text-2xl font-bold tracking-tight">
              {weekOrdersAmount.amount.toLocaleString("pt-BR")}
            </span>
            <p className="text-xs text-muted-foreground">
              {weekOrdersAmount.diffFromLastWeek >= 0 ? (
                <>
                  <span className="text-emerald-500 dark:text-emerald-400">
                    +{weekOrdersAmount.diffFromLastWeek}%
                  </span>{" "}
                  em relação à semana passada
                </>
              ) : (
                <>
                  <span className="text-rose-500 dark:text-rose-400">
                    {weekOrdersAmount.diffFromLastWeek}%
                  </span>{" "}
                  em relação à semana passada
                </>
              )}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
