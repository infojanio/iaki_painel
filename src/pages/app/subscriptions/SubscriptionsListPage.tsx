import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Dialog } from "@headlessui/react";

import { listSubscriptions } from "@/services/subscriptions";
import { api } from "@/lib/axios";

type SubscriptionItem = {
  id: string;
  status: "ACTIVE" | "TRIALING" | "EXPIRED" | "CANCELED";
  isTrial: boolean;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  plan: {
    id: string;
    name: string;
    price: number;
  };
  store: {
    id: string;
    name: string;
    cnpj: string | null;
    city: string | null;
  };
};

export function SubscriptionsListPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [planFilter, setPlanFilter] = useState("ALL");

  const [selectedSub, setSelectedSub] = useState<SubscriptionItem | null>(null);
  const [newEndDate, setNewEndDate] = useState("");

  const { data, isLoading } = useQuery<SubscriptionItem[]>({
    queryKey: ["subscriptions"],
    queryFn: listSubscriptions,
  });

  /* =========================
     MUTATIONS
  ========================= */

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/subscriptions/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });

  const renewMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/subscriptions/${id}/renew`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/subscriptions/${id}/reactivate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });

  const updateDateMutation = useMutation({
    mutationFn: async ({ id, endDate }: { id: string; endDate: string }) => {
      await api.patch(`/subscriptions/${id}/end-date`, {
        endDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      setSelectedSub(null);
    },
  });

  /* =========================
     HELPERS
  ========================= */

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
    const base = "px-2 py-1 rounded-full text-xs font-semibold";

    switch (status) {
      case "ACTIVE":
        return `${base} bg-green-100 text-green-700`;
      case "TRIALING":
        return `${base} bg-yellow-100 text-yellow-700`;
      case "EXPIRED":
        return `${base} bg-red-100 text-red-700`;
      case "CANCELED":
        return `${base} bg-gray-200 text-gray-600`;
      default:
        return base;
    }
  }

  /* =========================
     FILTROS
  ========================= */

  const filteredData = data?.filter((sub) => {
    const matchSearch = sub.store.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus = statusFilter === "ALL" || sub.status === statusFilter;

    const matchPlan = planFilter === "ALL" || sub.plan.name === planFilter;

    return matchSearch && matchStatus && matchPlan;
  });

  /* =========================
     LOADING
  ========================= */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  /* =========================
     UI
  ========================= */

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Assinaturas</h1>
        <p className="text-sm text-muted-foreground">
          Gestão completa das assinaturas
        </p>
      </div>

      {/* FILTROS */}
      <div className="flex flex-wrap gap-4">
        <input
          placeholder="Buscar loja..."
          className="border rounded px-3 py-2 text-sm w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">Todos status</option>
          <option value="ACTIVE">Ativo</option>
          <option value="TRIALING">Trial</option>
          <option value="EXPIRED">Expirado</option>
          <option value="CANCELED">Cancelado</option>
        </select>

        <select
          className="border rounded px-3 py-2 text-sm"
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
        >
          <option value="ALL">Todos planos</option>
          <option value="FREE">FREE</option>
          <option value="BASICO">BÁSICO</option>
          <option value="PRO">INTERMEDIÁRIO</option>
          <option value="PREMIUM">PREMIUM</option>
        </select>
      </div>

      {/* TABELA */}
      <div className="overflow-auto rounded-xl border bg-white shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Loja</th>
              <th className="px-4 py-3 text-left">Plano</th>
              <th className="px-4 py-3 text-left">Valor</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Fim</th>
              <th className="px-4 py-3 text-left">Dias</th>
              <th className="px-4 py-3 text-left">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredData?.map((sub) => {
              return (
                <tr key={sub.id}>
                  <td className="px-4 py-3">{sub.store.name}</td>

                  <td className="px-4 py-3 font-semibold">{sub.plan.name}</td>

                  <td className="px-4 py-3">{formatPrice(sub.plan.price)}</td>

                  <td className="px-4 py-3">
                    <span className={getStatusBadge(sub.status)}>
                      {sub.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">{formatDate(sub.endDate)}</td>

                  <td className="px-4 py-3">{sub.daysRemaining}</td>

                  <td className="px-4 py-3 flex flex-col gap-1 text-xs">
                    <button
                      onClick={() => renewMutation.mutate(sub.id)}
                      className="text-green-600"
                    >
                      +30 dias
                    </button>

                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setNewEndDate(sub.endDate.slice(0, 10));
                      }}
                      className="text-blue-600"
                    >
                      Editar
                    </button>

                    {sub.status === "EXPIRED" && (
                      <button
                        onClick={() => reactivateMutation.mutate(sub.id)}
                        className="text-green-700"
                      >
                        Reativar
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (!confirm("Cancelar assinatura?")) return;
                        cancelMutation.mutate(sub.id);
                      }}
                      className="text-red-600"
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      <Dialog open={!!selectedSub} onClose={() => setSelectedSub(null)}>
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">
            <h2 className="text-lg font-bold">Editar data final</h2>

            <input
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              className="border w-full p-2 rounded"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setSelectedSub(null)}>Cancelar</button>

              <button
                onClick={() =>
                  updateDateMutation.mutate({
                    id: selectedSub!.id,
                    endDate: newEndDate,
                  })
                }
                className="bg-blue-600 text-white px-4 py-2 rounded"
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
