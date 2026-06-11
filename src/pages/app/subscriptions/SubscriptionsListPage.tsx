import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Loader2,
  Search,
  ShieldAlert,
  Store,
} from "lucide-react";
import { Dialog } from "@headlessui/react";

import {
  listSubscriptions,
  reactivateStore,
  renewSubscription,
  suspendSubscription,
  updateSubscriptionEndDate,
} from "@/services/subscriptions";
import { api } from "@/lib/axios";
import { toast } from "sonner";

type SubscriptionItem = {
  id: string;
  status: "ACTIVE" | "TRIALING" | "EXPIRED" | "CANCELED";
  isTrial: boolean;
  startDate: string;
  endDate: string;
  daysRemaining: number;

  usage?: {
    products: number;
    banners: number;
    reels: number;
    categories: number;
  };

  plan: {
    id: string;
    name: string;
    price: number;
    maxProducts: number | null;
    maxBanners: number | null;
    maxReels: number | null;
    maxCategories: number | null;
  };

  store: {
    id: string;
    name: string;
    cnpj: string | null;
    city: string | null;
  };
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Ativo",
  TRIALING: "Período grátis",
  EXPIRED: "Expirado",
  CANCELED: "Cancelado",
};

export function SubscriptionsListPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [planFilter, setPlanFilter] = useState<string>("ALL");

  const [selectedSubscription, setSelectedSubscription] = useState<
    string | null
  >(null);

  const [newEndDate, setNewEndDate] = useState("");

  /* ======================================================
     QUERY
  ====================================================== */

  const { data, isLoading } = useQuery<SubscriptionItem[]>({
    queryKey: ["subscriptions"],
    queryFn: listSubscriptions,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await api.get("/plans");

      return res.data?.plans ?? [];
    },
  });

  /* ======================================================
     MANTÉM APENAS A ASSINATURA MAIS RECENTE POR LOJA
  ====================================================== */

  const uniqueSubscriptions = useMemo(() => {
    if (!data) return [];

    const map = new Map<string, SubscriptionItem>();

    data.forEach((sub) => {
      const current = map.get(sub.store.id);

      if (!current) {
        map.set(sub.store.id, sub);
        return;
      }

      const currentDate = new Date(current.startDate).getTime();
      const nextDate = new Date(sub.startDate).getTime();

      if (nextDate > currentDate) {
        map.set(sub.store.id, sub);
      }
    });

    return Array.from(map.values());
  }, [data]);

  /* ======================================================
     MUTATIONS
  ====================================================== */

  const renewMutation = useMutation({
    mutationFn: renewSubscription,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subscriptions"],
      });

      toast.success("Assinatura renovada com sucesso!");
    },
  });

  const suspendMutation = useMutation({
    mutationFn: suspendSubscription,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subscriptions"],
      });

      toast.success("Assinatura suspensa.");
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: reactivateStore,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subscriptions"],
      });

      toast.success("Loja reativada.");
    },
  });

  const updateEndDateMutation = useMutation({
    mutationFn: ({
      subscriptionId,
      endDate,
    }: {
      subscriptionId: string;
      endDate: string;
    }) => updateSubscriptionEndDate(subscriptionId, endDate),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subscriptions"],
      });

      setSelectedSubscription(null);

      toast.success("Vencimento atualizado.");
    },
  });
  /* ======================================================
     HELPERS
  ====================================================== */

  function formatPrice(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString("pt-BR");
  }

  function getStatusBadge(status: string) {
    const base = "px-3 py-1 rounded-full text-xs font-semibold border";

    switch (status) {
      case "ACTIVE":
        return `${base} bg-green-100 text-green-700 border-green-200`;

      case "TRIALING":
        return `${base} bg-yellow-100 text-yellow-700 border-yellow-200`;

      case "EXPIRED":
        return `${base} bg-red-100 text-red-700 border-red-200`;

      case "CANCELED":
        return `${base} bg-gray-100 text-gray-700 border-gray-200`;

      default:
        return base;
    }
  }

  /*  
  function getUsageColor(percentage: number) {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-blue-500";
  }

  function renderUsage(used: number, limit: number | null) {
    if (limit === null) {
      return (
        <div className="text-xs font-medium text-green-600">Ilimitado</div>
      );
    }

    const percentage = (used / limit) * 100;

    return (
      <div className="min-w-[120px]">
        <div className="flex items-center justify-between text-xs mb-1">
          <span>
            {used} / {limit}
          </span>

          {percentage >= 80 && (
            <AlertTriangle className="h-3 w-3 text-yellow-600" />
          )}
        </div>

        <div className="h-2 rounded bg-gray-200 overflow-hidden">
          <div
            className={`h-2 ${getUsageColor(percentage)}`}
            style={{
              width: `${Math.min(percentage, 100)}%`,
            }}
          />
        </div>
      </div>
    );
  }
  */

  /* ======================================================
     FILTROS
  ====================================================== */

  const filteredData = uniqueSubscriptions.filter((sub) => {
    const term = search.toLowerCase();

    const matchSearch =
      sub.store.name.toLowerCase().includes(term) ||
      sub.store.city?.toLowerCase().includes(term) ||
      sub.store.cnpj?.includes(term);

    const matchStatus = statusFilter === "ALL" || sub.status === statusFilter;

    const matchPlan = planFilter === "ALL" || sub.plan.id === planFilter;

    return matchSearch && matchStatus && matchPlan;
  });

  /* ======================================================
     KPIS
  ====================================================== */

  const stats = {
    total: filteredData.length,
    active: filteredData.filter((s) => s.status === "ACTIVE").length,

    // trial: filteredData.filter((s) => s.status === "TRIALING").length,

    canceled: filteredData.filter((s) => s.status === "CANCELED").length,

    expired: filteredData.filter((s) => s.status === "EXPIRED").length,
  };

  /* ======================================================
     LOADING
  ====================================================== */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Assinaturas</h1>

          <p className="text-sm text-muted-foreground">
            Situação atual das lojas e planos ativos
          </p>
        </div>
      </div>

      {/* KPIs */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardKpi
          title="Lojas"
          value={stats.total}
          icon={<Store className="h-5 w-5" />}
        />

        <CardKpi
          title="Ativas"
          value={stats.active}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
        />

        <CardKpi
          title="Canceladas"
          value={stats.canceled}
          icon={<ShieldAlert className="h-5 w-5 text-red-600" />}
        />

        <CardKpi
          title="Expiradas"
          value={stats.expired}
          icon={<ShieldAlert className="h-5 w-5 text-red-600" />}
        />
      </div>

      {/* FILTROS */}

      <div className="flex flex-wrap gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

          <input
            placeholder="Buscar loja, cidade ou CNPJ..."
            className="border rounded-lg pl-10 pr-4 py-2 text-sm w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Todos status</option>

          <option value="ACTIVE">Ativo</option>

          <option value="TRIALING">Período grátis</option>

          <option value="EXPIRED">Expirado</option>

          <option value="CANCELED">Cancelado</option>
        </select>

        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
        >
          <option value="ALL">Todos planos</option>

          {plans.map((plan: any) => (
            <option key={plan.id} value={plan.id}>
              {plan.name}
            </option>
          ))}
        </select>
      </div>

      {/* TABELA */}

      <div className="overflow-auto rounded-2xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="px-4 py-4 text-left">Loja</th>

              <th className="px-4 py-4 text-left">Plano Atual</th>

              <th className="px-4 py-4 text-left">Status</th>

              <th className="px-4 py-4 text-left">Vencimento</th>

              <th className="px-4 py-4 text-left">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredData.map((sub) => {
              return (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  {/* LOJA */}

                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <strong>{sub.store.name}</strong>

                      <span className="text-xs text-gray-500">
                        {sub.store.city || "Sem cidade"}
                      </span>

                      {sub.store.cnpj && (
                        <span className="text-xs text-gray-400">
                          {sub.store.cnpj}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* PLANO */}

                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold">{sub.plan.name}</span>

                      <span className="text-xs text-gray-500">
                        {formatPrice(sub.plan.price)}
                      </span>
                    </div>
                  </td>

                  {/* STATUS */}

                  <td className="px-4 py-4">
                    <span className={getStatusBadge(sub.status)}>
                      {STATUS_LABELS[sub.status]}
                    </span>
                  </td>

                  {/* VENCIMENTO */}

                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span>{formatDate(sub.endDate)}</span>

                      <span
                        className={`text-xs ${
                          sub.daysRemaining <= 5
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {sub.daysRemaining} dias
                      </span>
                    </div>
                  </td>

                  {/* AÇÕES */}

                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-2 text-xs">
                      <button
                        onClick={() => {
                          if (
                            !confirm(
                              "Renovar esta assinatura por mais 30 dias?",
                            )
                          )
                            return;

                          renewMutation.mutate(sub.id);
                        }}
                        className="text-green-600 hover:underline text-left"
                      >
                        Renovar +30 dias
                      </button>

                      <button
                        onClick={() => {
                          setSelectedSubscription(sub.id);

                          setNewEndDate(sub.endDate.slice(0, 10));
                        }}
                        className="text-blue-600 hover:underline text-left"
                      >
                        Alterar vencimento
                      </button>

                      {(sub.status === "EXPIRED" ||
                        sub.status === "CANCELED") && (
                        <button
                          onClick={() => {
                            if (!confirm("Reativar esta loja?")) return;

                            reactivateMutation.mutate(sub.store.id);
                          }}
                          className="text-green-700 hover:underline text-left"
                        >
                          Reativar loja
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (!confirm("Suspender acesso desta loja?")) return;

                          suspendMutation.mutate(sub.id);
                        }}
                        className="text-red-600 hover:underline text-left"
                      >
                        Suspender acesso{" "}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL */}

      <Dialog
        open={Boolean(selectedSubscription)}
        onClose={() => {
          setSelectedSubscription(null);
          setNewEndDate("");
        }}
      >
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-[420px] space-y-4 shadow-xl">
            <h2 className="text-lg font-bold">Alterar vencimento</h2>

            <input
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              className="border w-full p-2 rounded-lg"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedSubscription(null)}
                className="px-4 py-2 rounded border"
              >
                Cancelar
              </button>

              <button
                onClick={() => {
                  if (!selectedSubscription) return;

                  updateEndDateMutation.mutate({
                    subscriptionId: selectedSubscription,
                    endDate: newEndDate,
                  });
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function CardKpi({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <h3 className="text-2xl font-bold">{value}</h3>
        </div>

        {icon}
      </div>
    </div>
  );
}
