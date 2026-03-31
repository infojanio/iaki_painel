import { useQuery } from "@tanstack/react-query";
import { fetchPlansPublic } from "@/services/plans";
import { getMySubscription } from "@/services/subscriptions";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PlansPage() {
  const navigate = useNavigate();

  const { data: plans } = useQuery({
    queryKey: ["plans-public"],
    queryFn: fetchPlansPublic,
  });

  const { data: subscription } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: getMySubscription,
  });

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function isCurrent(planId: string) {
    return subscription?.subscription?.plan?.id === planId;
  }

  return (
    <div className="flex flex-col gap-10 items-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Escolha seu plano</h1>
        <p className="text-muted-foreground">
          Comece grátis e escale conforme cresce
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-6xl">
        {plans?.map((plan: any) => {
          const highlight = plan.name === "PRO" || plan.name === "PREMIUM";

          return (
            <Card
              key={plan.id}
              className={`p-6 flex flex-col gap-4 border ${
                highlight ? "border-primary shadow-lg scale-105" : ""
              }`}
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{plan.name}</h2>

                {highlight && (
                  <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                    Mais popular
                  </span>
                )}
              </div>

              {/* PREÇO */}
              <div>
                <span className="text-3xl font-bold">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-sm text-muted-foreground">
                  /{plan.durationDays} dias
                </span>
              </div>

              {/* FEATURES */}
              <div className="flex flex-col gap-2 text-sm">
                <Feature text={`Produtos: ${plan.maxProducts ?? "∞"}`} />
                <Feature text={`Banners: ${plan.maxBanners ?? "∞"}`} />
                <Feature text={`Reels: ${plan.maxReels ?? "∞"}`} />
                <Feature text={`Categorias: ${plan.maxCategories ?? "∞"}`} />
              </div>

              {/* CTA */}
              <Button
                className="mt-auto"
                variant={isCurrent(plan.id) ? "secondary" : "default"}
                disabled={isCurrent(plan.id)}
                onClick={() => navigate(`/checkout?planId=${plan.id}`)}
              >
                {isCurrent(plan.id) ? "Plano atual" : "Assinar"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Check size={16} />
      <span>{text}</span>
    </div>
  );
}
