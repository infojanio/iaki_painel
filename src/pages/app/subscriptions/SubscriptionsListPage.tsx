import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";

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

  const { data, isLoading } = useQuery<SubscriptionItem[]>({
    queryKey: ["subscriptions"],
    queryFn: listSubscriptions,
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/subscriptions/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });

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

  const filteredData = data?.filter((sub) => {
    const matchSearch = sub.store.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus = statusFilter === "ALL" || sub.status === statusFilter;

    const matchPlan = planFilter === "ALL" || sub.plan.name === planFilter;

    return matchSearch && matchStatus && matchPlan;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">Assinaturas</h1>
        <p className="text-sm text-muted-foreground">
          Gestão completa das assinaturas do sistema
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
          <option value="BASICO">BASICO</option>
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
              <th className="px-4 py-3 text-left">Trial</th>
              <th className="px-4 py-3 text-left">Início</th>
              <th className="px-4 py-3 text-left">Fim</th>
              <th className="px-4 py-3 text-left">Dias</th>
              <th className="px-4 py-3 text-left">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filteredData?.map((sub) => {
              const isLoading =
                cancelMutation.isPending && cancelMutation.variables === sub.id;

              return (
                <tr key={sub.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{sub.store.name}</div>
                    <div className="text-xs text-gray-500">
                      {sub.store.city ?? "—"}
                    </div>
                  </td>

                  <td className="px-4 py-3 font-semibold">{sub.plan.name}</td>

                  <td className="px-4 py-3">{formatPrice(sub.plan.price)}</td>

                  <td className="px-4 py-3">
                    <span className={getStatusBadge(sub.status)}>
                      {sub.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">{sub.isTrial ? "Sim" : "Não"}</td>

                  <td className="px-4 py-3">{formatDate(sub.startDate)}</td>

                  <td className="px-4 py-3">{formatDate(sub.endDate)}</td>

                  <td className="px-4 py-3">{sub.daysRemaining}</td>

                  <td className="px-4 py-3">
                    <button
                      disabled={isLoading}
                      onClick={() => {
                        const confirm = window.confirm("Cancelar assinatura?");
                        if (!confirm) return;
                        cancelMutation.mutate(sub.id);
                      }}
                      className={`text-sm ${
                        isLoading
                          ? "text-gray-400"
                          : "text-red-600 hover:text-red-800"
                      }`}
                    >
                      {isLoading ? "Cancelando..." : "Cancelar"}
                    </button>
                  </td>
                </tr>
              );
            })}

            {!filteredData?.length && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-500">
                  Nenhuma assinatura encontrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
