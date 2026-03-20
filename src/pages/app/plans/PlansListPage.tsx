import { useQuery } from "@tanstack/react-query";
import { fetchPlans } from "@/services/plans";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Loader2 } from "lucide-react";

export function PlansListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: fetchPlans,
  });

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Planos</h1>

      <div className="grid grid-cols-3 gap-4">
        {data?.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle className="flex justify-between">
                {plan.name}

                {!plan.isActive && (
                  <span className="text-xs text-red-500">Inativo</span>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col gap-2">
              <span className="text-xl font-bold">
                {formatCurrency(plan.price)}
              </span>

              <span>{plan.durationDays} dias</span>

              <div className="text-sm mt-2 flex flex-col gap-1">
                <span>Produtos: {plan.maxProducts}</span>
                <span>Banners: {plan.maxBanners}</span>
                <span>Reels: {plan.maxReels}</span>

                {plan.maxCategories && (
                  <span>Categorias: {plan.maxCategories}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
