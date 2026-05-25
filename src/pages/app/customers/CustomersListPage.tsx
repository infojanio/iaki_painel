import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Loader2, Search, Users, Phone, Link2, Store } from "lucide-react";

import { Dialog } from "@headlessui/react";

import { listUsers } from "@/services/users";
import { api } from "@/lib/axios";

type StoreItem = {
  id: string;
  name: string;
};

export function CustomersListPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [selectedStoreId, setSelectedStoreId] = useState("");

  /* ======================================================
     USERS
  ====================================================== */

  const { data, isLoading } = useQuery({
    queryKey: ["customers", page, query],

    queryFn: () =>
      listUsers({
        page,
        query,
      }),
  });

  /* ======================================================
     STORES
  ====================================================== */

  const { data: stores = [] } = useQuery<StoreItem[]>({
    queryKey: ["stores"],

    queryFn: async () => {
      const response = await api.get("/stores");

      return Array.isArray(response.data)
        ? response.data
        : (response.data?.stores ?? []);
    },
  });

  /* ======================================================
     MUTATION
  ====================================================== */

  const attachStoreMutation = useMutation({
    mutationFn: async ({
      userId,
      storeId,
    }: {
      userId: string;
      storeId: string;
    }) => {
      await api.patch(`/users/${userId}/attach-store`, {
        storeId,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });

      setSelectedUserId(null);
      setSelectedStoreId("");

      alert("Usuário vinculado à loja com sucesso.");
    },

    onError: () => {
      alert("Erro ao vincular loja.");
    },
  });

  /* ======================================================
     DATA
  ====================================================== */

  const users = data?.users ?? [];
  const meta = data?.meta;

  const totalCustomers = meta?.totalCount ?? 0;

  const customersWithPhone = users.filter((user) => !!user.phone).length;

  const customersAdmins = users.filter((user) => !!user.storeId).length;

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

      <div>
        <h1 className="text-2xl font-bold">Clientes do Sistema</h1>

        <p className="text-sm text-muted-foreground">
          Gerencie usuários e administradores
        </p>
      </div>

      {/* KPIS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Clientes"
          value={totalCustomers}
          icon={<Users className="h-5 w-5" />}
        />

        <KpiCard
          title="Com telefone"
          value={customersWithPhone}
          icon={<Phone className="h-5 w-5 text-green-600" />}
        />

        <KpiCard
          title="Administradores"
          value={customersAdmins}
          icon={<Store className="h-5 w-5 text-blue-600" />}
        />
      </div>

      {/* FILTRO */}

      <div className="flex flex-wrap gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

          <input
            placeholder="Buscar usuário..."
            className="border rounded-lg pl-10 pr-4 py-2 text-sm w-80"
            value={query}
            onChange={(e) => {
              setPage(1);
              setQuery(e.target.value);
            }}
          />
        </div>
      </div>

      {/* TABELA */}

      <div className="overflow-auto rounded-2xl border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b">
            <tr>
              <th className="px-4 py-4 text-left">Usuário</th>

              <th className="px-4 py-4 text-left">Email</th>

              <th className="px-4 py-4 text-left">Telefone</th>

              <th className="px-4 py-4 text-left">Perfil</th>

              <th className="px-4 py-4 text-left">Cadastro</th>

              <th className="px-4 py-4 text-left">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {users.map((user) => {
              return (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* USER */}

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-10 w-10 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                          {user.name.charAt(0)}
                        </div>
                      )}

                      <div className="flex flex-col">
                        <strong>{user.name}</strong>

                        {user.storeId && (
                          <span className="text-xs text-blue-600">ADMIN</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* EMAIL */}

                  <td className="px-4 py-4">{user.email}</td>

                  {/* PHONE */}

                  <td className="px-4 py-4">{user.phone || "-"}</td>

                  {/* ROLE */}

                  <td className="px-4 py-4">
                    {user.storeId ? (
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                        ADMIN
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                        CLIENTE
                      </span>
                    )}
                  </td>

                  {/* CREATED */}

                  <td className="px-4 py-4">
                    {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                  </td>

                  {/* ACTIONS */}

                  <td className="px-4 py-4">
                    {!user.storeId ? (
                      <button
                        onClick={() => {
                          setSelectedUserId(user.id);
                        }}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      >
                        <Link2 className="h-4 w-4" />
                        Vincular Loja
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">
                        Já vinculado
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINAÇÃO */}

      {meta && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Página {meta.page} de {meta.totalPages}
          </p>

          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="border rounded-lg px-4 py-2 text-sm disabled:opacity-50"
            >
              Anterior
            </button>

            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="border rounded-lg px-4 py-2 text-sm disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* MODAL */}

      <Dialog
        open={!!selectedUserId}
        onClose={() => {
          setSelectedUserId(null);
        }}
      >
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[420px] rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xl font-bold">Vincular Loja</h2>

            <p className="text-sm text-gray-500">
              O usuário será promovido para ADMIN.
            </p>

            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="w-full border rounded-lg p-3"
            >
              <option value="">Selecione uma loja</option>

              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedUserId(null)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancelar
              </button>

              <button
                disabled={!selectedStoreId || attachStoreMutation.isPending}
                onClick={() => {
                  attachStoreMutation.mutate({
                    userId: selectedUserId!,
                    storeId: selectedStoreId,
                  });
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {attachStoreMutation.isPending ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

/* ======================================================
   KPI
====================================================== */

function KpiCard({
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
