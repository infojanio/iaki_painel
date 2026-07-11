import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Loader2,
  PlusCircle,
  Search,
  ShieldAlert,
  Store,
} from "lucide-react";
import { Dialog } from "@headlessui/react";

import {
  createSubscription,
  listSubscriptions,
  reactivateStore,
  renewSubscription,
  suspendSubscription,
  updateSubscriptionEndDate,
} from "@/services/subscriptions";
import { api } from "@/lib/axios";
import { toast } from "sonner";

type SubscriptionStatus = "ACTIVE" | "TRIALING" | "EXPIRED" | "CANCELED";

type CreateSubscriptionStatus = "ACTIVE" | "TRIALING";

type SubscriptionItem = {
  id: string;
  status: SubscriptionStatus;
  isTrial: boolean;
  startDate: string;
  endDate: string;
  createdAt?: string;
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

type PlanItem = {
  id: string;
  name: string;
  price: number;
};

type StoreOption = {
  id: string;
  name: string;
  cnpj?: string | null;
  city?: string | { name?: string | null } | null;
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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [createForm, setCreateForm] = useState<{
    storeId: string;
    planId: string;
    status: CreateSubscriptionStatus;
    startDate: string;
    endDate: string;
  }>({
    storeId: "",
    planId: "",
    status: "ACTIVE",
    startDate: "",
    endDate: "",
  });

  /* ======================================================
     QUERY
  ====================================================== */

  const { data, isLoading } = useQuery<SubscriptionItem[]>({
    queryKey: ["subscriptions"],
    queryFn: listSubscriptions,
  });

  const { data: plans = [] } = useQuery<PlanItem[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const res = await api.get("/plans");

      return res.data?.plans ?? res.data ?? [];
    },
  });

  const { data: stores = [] } = useQuery<StoreOption[]>({
    queryKey: ["stores"],
    queryFn: async () => {
      const res = await api.get("/stores");

      return res.data?.stores ?? res.data ?? [];
    },
  });

  /* ======================================================
     MANTÉM APENAS A ASSINATURA MAIS RECENTE POR LOJA
  ====================================================== */

  const STATUS_PRIORITY: Record<SubscriptionStatus, number> = {
    ACTIVE: 4,
    TRIALING: 3,
    EXPIRED: 2,
    CANCELED: 1,
  };

  function getSubscriptionDate(sub: SubscriptionItem) {
    return new Date(sub.createdAt ?? sub.startDate).getTime();
  }

  const uniqueSubscriptions = useMemo(() => {
    if (!data) return [];

    const map = new Map<string, SubscriptionItem>();

    data.forEach((sub) => {
      const current = map.get(sub.store.id);

      if (!current) {
        map.set(sub.store.id, sub);
        return;
      }

      const currentPriority = STATUS_PRIORITY[current.status] ?? 0;
      const nextPriority = STATUS_PRIORITY[sub.status] ?? 0;

      /**
       * 1. ACTIVE/TRIALING sempre ganha de CANCELED/EXPIRED
       */
      if (nextPriority > currentPriority) {
        map.set(sub.store.id, sub);
        return;
      }

      /**
       * 2. Se tiverem o mesmo status/prioridade, pega a mais nova
       */
      if (nextPriority === currentPriority) {
        const currentDate = getSubscriptionDate(current);
        const nextDate = getSubscriptionDate(sub);

        if (nextDate > currentDate) {
          map.set(sub.store.id, sub);
        }
      }
    });

    return Array.from(map.values());
  }, [data]);

  /* ======================================================
     MUTATIONS
  ====================================================== */

  const createSubscriptionMutation = useMutation({
    mutationFn: createSubscription,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["subscriptions"],
      });

      setIsCreateModalOpen(false);

      setCreateForm({
        storeId: "",
        planId: "",
        status: "ACTIVE",
        startDate: "",
        endDate: "",
      });

      toast.success("Assinatura criada com sucesso!");
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message ?? "Erro ao criar assinatura.");
    },
  });

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

  function getStoreCityName(store: StoreOption) {
    if (!store.city) return null;

    if (typeof store.city === "string") {
      return store.city;
    }

    return store.city.name ?? null;
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

  function handleOpenCreateModal() {
    setCreateForm({
      storeId: "",
      planId: "",
      status: "ACTIVE",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: "",
    });

    setIsCreateModalOpen(true);
  }

  function handleCreateSubscription(event: React.FormEvent) {
    event.preventDefault();

    if (!createForm.storeId) {
      toast.error("Selecione uma loja.");
      return;
    }

    if (!createForm.planId) {
      toast.error("Selecione um plano.");
      return;
    }

    createSubscriptionMutation.mutate({
      storeId: createForm.storeId,
      planId: createForm.planId,
      status: createForm.status,
      startDate: createForm.startDate || undefined,
      endDate: createForm.endDate || undefined,
    });
  }

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

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Assinaturas</h1>

          <p className="text-sm text-muted-foreground">
            Situação atual das lojas e planos ativos
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <PlusCircle className="h-4 w-4" />
          Nova assinatura
        </button>
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

          {plans.map((plan) => (
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
                          ) {
                            return;
                          }

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
                        Suspender acesso
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredData.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-sm text-gray-500"
                >
                  Nenhuma assinatura encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL - NOVA ASSINATURA */}

      <Dialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <Dialog.Panel className="bg-white p-6 rounded-2xl w-[520px] max-w-[92vw] space-y-5 shadow-xl">
            <div>
              <Dialog.Title className="text-lg font-bold">
                Nova assinatura
              </Dialog.Title>

              <p className="mt-1 text-sm text-gray-500">
                Vincule uma loja a um plano. Ao confirmar, o backend deve
                cancelar assinaturas abertas anteriores da loja e criar a nova.
              </p>
            </div>

            <form onSubmit={handleCreateSubscription} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Loja</label>

                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={createForm.storeId}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      storeId: e.target.value,
                    }))
                  }
                >
                  <option value="">Selecione uma loja</option>

                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                      {getStoreCityName(store)
                        ? ` - ${getStoreCityName(store)}`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Plano</label>

                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={createForm.planId}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      planId: e.target.value,
                    }))
                  }
                >
                  <option value="">Selecione um plano</option>

                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {formatPrice(plan.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>

                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                  value={createForm.status}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      status: e.target.value as CreateSubscriptionStatus,
                    }))
                  }
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="TRIALING">Período grátis</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de início</label>

                  <input
                    type="date"
                    value={createForm.startDate}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Data de vencimento
                  </label>

                  <input
                    type="date"
                    value={createForm.endDate}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />

                  <p className="text-xs text-gray-400">
                    Opcional. Se ficar vazio, o backend calcula pela duração do
                    plano.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
                Atenção: esta ação pode substituir a assinatura ativa atual da
                loja, conforme a regra implementada no backend.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border text-sm"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={createSubscriptionMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {createSubscriptionMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Salvar assinatura
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* MODAL - ALTERAR VENCIMENTO */}

      <Dialog
        open={Boolean(selectedSubscription)}
        onClose={() => {
          setSelectedSubscription(null);
          setNewEndDate("");
        }}
      >
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <Dialog.Panel className="bg-white p-6 rounded-2xl w-[420px] space-y-4 shadow-xl">
            <Dialog.Title className="text-lg font-bold">
              Alterar vencimento
            </Dialog.Title>

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
          </Dialog.Panel>
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
