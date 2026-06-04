import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import {
  cancelMySubscription,
  getMySubscription,
} from "@/services/subscriptions";
import { api } from "@/lib/axios";

type Plan = {
  id: string;
  name: string;
  price: number;
  maxProducts: number | null;
  maxBanners: number | null;
  maxReels: number | null;
  maxCategories?: number | null;
};

const WHATSAPP_NUMBER = "5562999756514";

export function MySubscriptionPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: getMySubscription,
  });

  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await api.get("/plans");
      return res.data?.plans ?? res.data ?? [];
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelMySubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-subscription"] });
      alert("Assinatura cancelada com sucesso.");
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "Erro ao cancelar assinatura.");
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

  const hasSubscription = !!subscription;
  const isExpired = subscription?.status === "EXPIRED";

  function formatPrice(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function openWhatsApp(message: string) {
    const text = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  }

  function handleRenewPlan() {
    openWhatsApp(`
Olá!

Gostaria de renovar minha assinatura.

Plano atual: ${subscription?.plan?.name ?? "Nenhum"}
Store ID: ${subscription?.storeId ?? ""}
    `);
  }

  function handleRequestPlan(planName?: string) {
    openWhatsApp(`
Olá!

Gostaria de contratar ou migrar para um plano.

Plano desejado: ${planName ?? ""}
Plano atual: ${subscription?.plan?.name ?? "Nenhum"}
Store ID: ${subscription?.storeId ?? ""}
    `);
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Minha Assinatura</h1>
        <p className="text-sm text-gray-500 mt-1">
          Consulte seu plano, limites e solicite renovação ou upgrade pelo
          atendimento.
        </p>
      </div>

      {!hasSubscription && (
        <div className="bg-yellow-50 border border-yellow-300 p-6 rounded-xl">
          <p className="text-lg font-semibold text-yellow-700">
            🚀 Comece agora
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Você ainda não possui um plano ativo. Escolha um plano e fale com o
            atendimento.
          </p>

          <button
            onClick={() => handleRequestPlan()}
            className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg"
          >
            Falar com atendimento
          </button>
        </div>
      )}

      {hasSubscription && isExpired && (
        <div className="bg-red-50 border border-red-300 text-red-700 p-5 rounded-xl">
          <p className="text-lg font-semibold">🚫 Assinatura expirada</p>
          <p className="text-sm mt-1">
            Sua loja pode estar indisponível. Solicite a renovação pelo
            atendimento.
          </p>

          <button
            onClick={handleRenewPlan}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Renovar pelo WhatsApp
          </button>
        </div>
      )}

      {hasSubscription && (
        <div
          className={`bg-white rounded-2xl shadow-sm border p-6 space-y-5 ${
            isExpired ? "border-red-300" : "border-gray-200"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Plano atual</p>
              <h2 className="text-2xl font-bold">{subscription.plan?.name}</h2>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                isExpired
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {subscription.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-700">Vencimento</p>
              <p className="text-2xl font-bold text-blue-900">
                {new Date(subscription.endDate).toLocaleDateString("pt-BR")}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-700">Plano contratado</p>
              <p className="text-2xl font-bold text-green-900">
                {subscription.plan?.name}
              </p>
            </div>
          </div>

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

            <UsageBar
              label="Categorias"
              used={usage?.categories ?? 0}
              limit={subscription.plan?.maxCategories ?? null}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="font-medium text-blue-700">ℹ️ Renovação e upgrade</p>
            <p className="text-sm text-blue-600 mt-1">
              A renovação ou alteração do plano ocorre somente após confirmação
              do pagamento pelo administrador do sistema.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRenewPlan}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Renovar assinatura
            </button>

            <button
              onClick={() => handleRequestPlan()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Solicitar upgrade
            </button>

            {!isExpired && (
              <button
                onClick={() => {
                  if (!confirm("Deseja realmente cancelar sua assinatura?"))
                    return;
                  cancelMutation.mutate();
                }}
                className="border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg"
              >
                {cancelMutation.isPending
                  ? "Cancelando..."
                  : "Cancelar assinatura"}
              </button>
            )}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">Planos disponíveis</h2>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <p className="font-medium text-blue-700">ℹ️ Contratação de planos</p>
          <p className="text-sm text-blue-600 mt-1">
            Ao solicitar um plano, você será direcionado para o WhatsApp do
            atendimento. A ativação será feita após confirmação do pagamento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = plan.id === subscription?.planId;

            return (
              <div
                key={plan.id}
                className={`border rounded-2xl p-5 bg-white shadow-sm ${
                  plan.name === "PRO"
                    ? "border-blue-600 shadow-md"
                    : "border-gray-200"
                }`}
              >
                <h3 className="text-xl font-bold">{plan.name}</h3>

                <p className="text-gray-600 mt-1">{formatPrice(plan.price)}</p>

                <ul className="text-sm mt-4 space-y-2">
                  <li>Produtos: {plan.maxProducts ?? "∞"}</li>
                  <li>Banners: {plan.maxBanners ?? "∞"}</li>
                  <li>Reels: {plan.maxReels ?? "∞"}</li>
                  <li>Categorias: {plan.maxCategories ?? "∞"}</li>
                </ul>

                <button
                  disabled={isCurrent}
                  onClick={() => handleRequestPlan(plan.name)}
                  className={`mt-5 w-full py-2 rounded-lg text-white ${
                    isCurrent ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {isCurrent ? "Plano atual" : "Solicitar contratação"}
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
    limit === null
      ? "bg-green-500"
      : percentage >= 100
        ? "bg-red-500"
        : percentage >= 80
          ? "bg-yellow-500"
          : "bg-blue-500";

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span>
          {used} / {limit ?? "∞"}
        </span>
      </div>

      <div className="h-2 bg-gray-200 rounded overflow-hidden">
        <div
          className={`h-2 ${color} rounded`}
          style={{
            width: limit === null ? "100%" : `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}
