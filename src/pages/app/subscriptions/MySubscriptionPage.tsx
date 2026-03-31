import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMySubscription,
  changePlan,
  cancelMySubscription,
} from "@/services/subscriptions";
import { api } from "@/lib/axios";

type Plan = {
  id: string;
  name: string;
  price: number;
  maxProducts: number | null;
  maxBanners: number | null;
  maxReels: number | null;
};

type ExceededItem = {
  resource: string;
  current: number;
  limit: number;
};

const resourceLabels: Record<string, string> = {
  products: "Produtos",
  banners: "Banners",
  reels: "Reels",
  categories: "Categorias",
};

const resourceRoutes: Record<string, string> = {
  products: "/products",
  banners: "/banners",
  reels: "/reels",
  categories: "/categories",
};

export function MySubscriptionPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [exceeded, setExceeded] = useState<ExceededItem[]>([]);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: getMySubscription,
  });

  const { data: plans } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await api.get("/plans");
      return res.data?.plans ?? res.data;
    },
  });

  const changePlanMutation = useMutation({
    mutationFn: changePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
      setExceeded([]);
      setLoadingPlanId(null);
      alert("Plano alterado com sucesso!");
    },
    onError: (err: any) => {
      setLoadingPlanId(null);

      if (err?.response?.data?.code === "DOWNGRADE_NOT_ALLOWED") {
        setExceeded(err.response.data.exceeded || []);
        return;
      }

      alert("Erro ao alterar plano.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelMySubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  const subscription = data?.subscription;
  const usage = data?.usage;

  if (!subscription) {
    return <p className="p-6">Nenhuma assinatura encontrada.</p>;
  }

  function formatPrice(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  async function handleChangePlan(plan: Plan) {
    if (!confirm(`Deseja mudar para o plano ${plan.name}?`)) return;

    setLoadingPlanId(plan.id);
    setExceeded([]);

    try {
      await api.post("/subscriptions/validate-downgrade", {
        planId: plan.id,
      });

      await changePlanMutation.mutateAsync(plan.id);
    } catch (err: any) {
      setLoadingPlanId(null);

      const data = err?.response?.data;

      if (data?.code === "DOWNGRADE_NOT_ALLOWED") {
        setExceeded(data.exceeded || []);
        return;
      }

      alert(data?.message || "Erro ao validar plano.");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Minha Assinatura</h1>

      {/* CARD ATUAL */}
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold">{subscription.plan?.name}</h2>

        <p className="text-sm text-gray-600">
          Status: <strong>{subscription.status}</strong>
        </p>

        <p className="text-sm text-gray-600">
          Expira em:{" "}
          <strong>
            {new Date(subscription.endDate).toLocaleDateString("pt-BR")}
          </strong>
        </p>

        <div className="space-y-3">
          <UsageBar
            label="Produtos"
            used={usage?.products ?? 0}
            limit={subscription.plan?.maxProducts}
          />
          <UsageBar
            label="Banners"
            used={usage?.banners ?? 0}
            limit={subscription.plan?.maxBanners}
          />
          <UsageBar
            label="Reels"
            used={usage?.reels ?? 0}
            limit={subscription.plan?.maxReels}
          />
        </div>

        <button
          onClick={() => {
            if (!confirm("Deseja cancelar sua assinatura?")) return;
            cancelMutation.mutate();
          }}
          className="text-red-600 text-sm"
        >
          {cancelMutation.isPending ? "Cancelando..." : "Cancelar assinatura"}
        </button>
      </div>

      {/* 🚨 ALERTA INTELIGENTE */}
      {exceeded.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-5 rounded space-y-3">
          <p className="font-semibold text-red-700 text-lg">
            ⚠️ Ajuste necessário antes de mudar de plano
          </p>

          <p className="text-sm text-gray-700">
            Você precisa reduzir os itens abaixo:
          </p>

          <ul className="space-y-2 text-sm">
            {exceeded.map((item) => {
              const label = resourceLabels[item.resource] ?? item.resource;
              const diff = item.current - item.limit;

              return (
                <li
                  key={item.resource}
                  className="flex items-center justify-between bg-white p-3 rounded border"
                >
                  <div>
                    <p>
                      <strong>{label}</strong>
                    </p>
                    <p className="text-xs text-gray-600">
                      {item.current} / {item.limit} → Remover {diff}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      navigate(resourceRoutes[item.resource] || "/")
                    }
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Ajustar
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="text-xs text-gray-500 pt-2">
            Ou escolha um plano maior para continuar sem alterações.
          </div>
        </div>
      )}

      {/* PLANOS */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Trocar plano</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans?.map((plan: Plan) => {
            const isCurrent = plan.id === subscription.planId;
            const isLoading = loadingPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className={`border rounded-xl p-4 ${
                  isCurrent ? "border-green-500" : ""
                }`}
              >
                <h3 className="font-bold">{plan.name}</h3>

                <p className="text-sm text-gray-600">
                  {formatPrice(plan.price)}
                </p>

                <ul className="text-xs mt-2 space-y-1">
                  <li>Produtos: {plan.maxProducts ?? "Ilimitado"}</li>
                  <li>Banners: {plan.maxBanners ?? "Ilimitado"}</li>
                  <li>Reels: {plan.maxReels ?? "Ilimitado"}</li>
                </ul>

                <button
                  disabled={isCurrent || isLoading}
                  onClick={() => handleChangePlan(plan)}
                  className={`mt-4 w-full py-2 rounded text-white ${
                    isCurrent ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isCurrent
                    ? "Plano atual"
                    : isLoading
                      ? "Processando..."
                      : "Escolher plano"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function UsageBar({
  label,
  used,
  limit,
}: {
  label: string;
  used: number;
  limit: number | null;
}) {
  const percentage = limit === null ? 0 : Math.min((used / limit) * 100, 100);

  const color =
    percentage >= 100
      ? "bg-red-500"
      : percentage >= 80
        ? "bg-yellow-500"
        : "bg-blue-500";

  return (
    <div>
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>
          {used} / {limit ?? "∞"}
        </span>
      </div>

      <div className="h-2 bg-gray-200 rounded">
        <div
          className={`h-2 ${color} rounded`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
