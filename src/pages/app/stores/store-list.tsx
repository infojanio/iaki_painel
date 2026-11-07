import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AlertCircle, Loader2, Pencil, Plus, Truck } from "lucide-react";

import { getStores, toggleStoreStatus } from "@/services/stores";

import type { Store } from "@/services/stores";

export function StoreList() {
  const queryClient = useQueryClient();

  const [actionError, setActionError] = useState<string | null>(null);

  const {
    data: stores,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["stores"],
    queryFn: getStores,
  });

  const {
    mutateAsync: toggleStatus,
    isPending,
    variables: updatingStoreId,
  } = useMutation({
    mutationFn: (storeId: string) => toggleStoreStatus(storeId),

    retry: false,

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["stores"],
      });
    },
  });

  async function handleToggle(store: Store) {
    if (isPending) return;

    const confirmed = window.confirm(
      `Deseja ${
        store.isActive ? "DESATIVAR" : "ATIVAR"
      } a loja "${store.name}"?`,
    );

    if (!confirmed) return;

    setActionError(null);

    try {
      await toggleStatus(store.id);
    } catch {
      setActionError(
        "Não foi possível alterar o status da loja. Tente novamente.",
      );
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Lojas
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Gerencie os estabelecimentos e suas configurações.
          </p>
        </div>

        <Link
          to="/stores/new"
          className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-800"
        >
          <Plus size={18} aria-hidden="true" />
          Nova loja
        </Link>
      </header>

      {actionError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={20} className="shrink-0" aria-hidden="true" />

          <p>{actionError}</p>
        </div>
      )}

      {isLoading && (
        <div
          role="status"
          className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500"
        >
          <Loader2
            size={24}
            className="animate-spin text-blue-600"
            aria-hidden="true"
          />
          Carregando lojas...
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5"
        >
          <p className="text-sm text-red-700">
            Não foi possível carregar as lojas.
          </p>

          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 text-sm font-semibold text-red-800 underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!isLoading && !isError && !!stores?.length && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="border-b border-slate-200 p-4 text-left font-semibold text-slate-600">
                  Loja
                </th>

                <th className="border-b border-slate-200 p-4 text-left font-semibold text-slate-600">
                  Status
                </th>

                <th className="border-b border-slate-200 p-4 text-left font-semibold text-slate-600">
                  Entrega
                </th>

                <th className="border-b border-slate-200 p-4 text-right font-semibold text-slate-600">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
              {stores.map((store) => {
                const updating = isPending && updatingStoreId === store.id;

                return (
                  <tr
                    key={store.id}
                    className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {store.avatar ? (
                          <img
                            src={store.avatar}
                            alt=""
                            className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 object-cover"
                          />
                        ) : (
                          <div
                            aria-hidden="true"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-500"
                          >
                            {store.name.trim().charAt(0).toUpperCase() || "L"}
                          </div>
                        )}

                        <span className="font-medium text-slate-900">
                          {store.name}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          store.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {store.isActive ? "Ativa" : "Inativa"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
                          store.deliveryEnabled
                            ? "bg-blue-100 text-blue-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {store.deliveryEnabled ? "Habilitada" : "Desabilitada"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Link
                          to={`/stores/edit/${store.id}`}
                          aria-label={`Editar ${store.name}`}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-blue-700 transition hover:bg-blue-50"
                        >
                          <Pencil size={16} aria-hidden="true" />
                          Editar
                        </Link>

                        <Link
                          to={`/stores/${store.id}/delivery`}
                          aria-label={`Configurar entrega e pagamento de ${store.name}`}
                          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-green-700 transition hover:bg-green-50"
                        >
                          <Truck size={17} aria-hidden="true" />
                          Entrega e pagamento
                        </Link>

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => void handleToggle(store)}
                          aria-label={`${
                            store.isActive ? "Desativar" : "Ativar"
                          } ${store.name}`}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {updating && (
                            <Loader2
                              size={16}
                              className="animate-spin"
                              aria-hidden="true"
                            />
                          )}

                          {updating
                            ? "Atualizando..."
                            : store.isActive
                              ? "Desativar"
                              : "Ativar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !isError && (!stores || stores.length === 0) && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="font-medium text-slate-800">Nenhuma loja cadastrada.</p>

          <p className="mt-2 text-sm text-slate-500">
            Clique em Nova loja para cadastrar o primeiro estabelecimento.
          </p>
        </div>
      )}
    </div>
  );
}
