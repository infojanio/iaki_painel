import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  Loader2,
  Search,
  Users,
  Phone,
  Link2,
  Store,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import { Dialog } from "@headlessui/react";

import { anonymizeUser, listUsers } from "@/services/users";

import { api } from "@/lib/axios";

type StoreItem = {
  id: string;
  name: string;
};

type DeleteUserData = {
  id: string;
  name: string;
  email: string;
};

export function CustomersListPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  /*
   * Modal de vínculo com loja
   */
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [selectedStoreId, setSelectedStoreId] = useState("");

  /*
   * Modal de exclusão
   */
  const [userToDelete, setUserToDelete] = useState<DeleteUserData | null>(null);

  /* ======================================================
     USERS
  ====================================================== */

  const { data, isLoading, isFetching } = useQuery({
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
     ATTACH STORE
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

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
      });

      setSelectedUserId(null);
      setSelectedStoreId("");

      alert("Usuário vinculado à loja com sucesso.");
    },

    onError: (error: any) => {
      console.error(
        "[CustomersListPage] Erro ao vincular loja:",
        error?.response?.data ?? error,
      );

      alert(error?.response?.data?.message ?? "Erro ao vincular loja.");
    },
  });

  /* ======================================================
     DELETE / ANONYMIZE USER
  ====================================================== */

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => anonymizeUser(userId),

    onSuccess: async (response) => {
      /*
       * Fecha primeiro o modal.
       */
      setUserToDelete(null);

      /*
       * Atualiza todas as queries
       * iniciadas por "customers".
       */
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
      });

      alert(response?.message ?? "Conta do cliente excluída com sucesso.");
    },

    onError: (error: any) => {
      console.error(
        "[CustomersListPage] Erro ao excluir cliente:",
        error?.response?.data ?? error,
      );

      alert(
        error?.response?.data?.message ??
          "Não foi possível excluir a conta do cliente.",
      );
    },
  });

  /* ======================================================
     HELPERS
  ====================================================== */

  function isDeletedUser(email: string) {
    return (
      email.startsWith("deleted+") && email.endsWith("@deleted.iaki.local")
    );
  }

  function openDeleteModal(user: DeleteUserData) {
    setUserToDelete(user);
  }

  function closeDeleteModal() {
    if (deleteUserMutation.isPending) {
      return;
    }

    setUserToDelete(null);
  }

  function handleDeleteUser() {
    if (!userToDelete) {
      return;
    }

    deleteUserMutation.mutate(userToDelete.id);
  }

  /* ======================================================
     DATA
  ====================================================== */

  const users = data?.users ?? [];

  const meta = data?.meta;

  const totalCustomers = meta?.totalCount ?? 0;

  const customersWithPhone = users.filter(
    (user) => !!user.phone && !isDeletedUser(user.email),
  ).length;

  const customersAdmins = users.filter(
    (user) => !!user.storeId && !isDeletedUser(user.email),
  ).length;

  /* ======================================================
     LOADING
  ====================================================== */

  if (isLoading) {
    return (
      <div
        className="
          flex
          items-center
          justify-center
          p-10
        "
      >
        <Loader2
          className="
            h-8
            w-8
            animate-spin
          "
        />
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

      <div
        className="
          grid
          grid-cols-1
          gap-4
          md:grid-cols-3
        "
      >
        <KpiCard
          title="Clientes"
          value={totalCustomers}
          icon={<Users className="h-5 w-5" />}
        />

        <KpiCard
          title="Com telefone"
          value={customersWithPhone}
          icon={
            <Phone
              className="
                h-5
                w-5
                text-green-600
              "
            />
          }
        />

        <KpiCard
          title="Administradores"
          value={customersAdmins}
          icon={
            <Store
              className="
                h-5
                w-5
                text-blue-600
              "
            />
          }
        />
      </div>

      {/* FILTRO */}

      <div className="flex flex-wrap gap-4">
        <div className="relative">
          <Search
            className="
              absolute
              left-3
              top-3
              h-4
              w-4
              text-gray-400
            "
          />

          <input
            placeholder="Buscar usuário..."
            className="
              w-80
              rounded-lg
              border
              py-2
              pl-10
              pr-4
              text-sm
            "
            value={query}
            onChange={(e) => {
              setPage(1);

              setQuery(e.target.value);
            }}
          />

          {isFetching && (
            <Loader2
              className="
                absolute
                right-3
                top-3
                h-4
                w-4
                animate-spin
                text-gray-400
              "
            />
          )}
        </div>
      </div>

      {/* TABELA */}

      <div
        className="
          overflow-auto
          rounded-2xl
          border
          bg-white
          shadow-sm
        "
      >
        <table className="min-w-full text-sm">
          <thead
            className="
              border-b
              bg-gray-50
              text-gray-600
            "
          >
            <tr>
              <th className="px-4 py-4 text-left">Usuário</th>

              <th className="px-4 py-4 text-left">Email</th>

              <th className="px-4 py-4 text-left">Telefone</th>

              <th className="px-4 py-4 text-left">Perfil</th>

              <th className="px-4 py-4 text-left">Cadastro</th>

              <th className="px-4 py-4 text-center">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {users.map((user) => {
              const deleted = isDeletedUser(user.email);

              return (
                <tr
                  key={user.id}
                  className={`
                    transition-colors

                    ${deleted ? "bg-gray-50 opacity-70" : "hover:bg-gray-50"}
                  `}
                >
                  {/* USER */}

                  <td className="px-4 py-4">
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                      "
                    >
                      {user.avatar && !deleted ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="
                            h-10
                            w-10
                            rounded-full
                            border
                            object-cover
                          "
                        />
                      ) : (
                        <div
                          className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-full
                            bg-gray-200
                            text-xs
                            font-bold
                          "
                        >
                          {deleted ? "X" : user.name.charAt(0)}
                        </div>
                      )}

                      <div className="flex flex-col">
                        <strong>{user.name}</strong>

                        {deleted ? (
                          <span
                            className="
                              text-xs
                              font-medium
                              text-gray-500
                            "
                          >
                            CONTA EXCLUÍDA
                          </span>
                        ) : user.storeId ? (
                          <span
                            className="
                              text-xs
                              text-blue-600
                            "
                          >
                            ADMIN
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  {/* EMAIL */}

                  <td className="px-4 py-4">
                    {deleted ? (
                      <span
                        className="
                          text-xs
                          text-gray-400
                        "
                      >
                        Dados removidos
                      </span>
                    ) : (
                      user.email
                    )}
                  </td>

                  {/* PHONE */}

                  <td className="px-4 py-4">
                    {deleted ? "-" : user.phone || "-"}
                  </td>

                  {/* ROLE */}

                  <td className="px-4 py-4">
                    {deleted ? (
                      <span
                        className="
                          rounded-full
                          bg-gray-200
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          text-gray-600
                        "
                      >
                        EXCLUÍDO
                      </span>
                    ) : user.storeId ? (
                      <span
                        className="
                          rounded-full
                          bg-blue-100
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          text-blue-700
                        "
                      >
                        ADMIN
                      </span>
                    ) : (
                      <span
                        className="
                          rounded-full
                          bg-gray-100
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          text-gray-700
                        "
                      >
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
                    <div
                      className="
                        flex
                        items-center
                        justify-center
                        gap-3
                      "
                    >
                      {deleted ? (
                        <span
                          className="
                            text-xs
                            text-gray-400
                          "
                        >
                          Sem ações
                        </span>
                      ) : (
                        <>
                          {/* VINCULAR LOJA */}

                          {!user.storeId && (
                            <button
                              type="button"
                              title="Vincular loja"
                              onClick={() => {
                                setSelectedUserId(user.id);
                              }}
                              className="
                                inline-flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                text-blue-600
                                transition-colors

                                hover:bg-blue-50
                                hover:text-blue-800
                              "
                            >
                              <Link2
                                className="
                                  h-4
                                  w-4
                                "
                              />
                            </button>
                          )}

                          {/* EXCLUIR CONTA */}

                          {!user.storeId && (
                            <button
                              type="button"
                              title="Excluir conta"
                              onClick={() =>
                                openDeleteModal({
                                  id: user.id,
                                  name: user.name,
                                  email: user.email,
                                })
                              }
                              className="
                                inline-flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                text-red-600
                                transition-colors

                                hover:bg-red-50
                                hover:text-red-800
                              "
                            >
                              <Trash2
                                className="
                                  h-4
                                  w-4
                                "
                              />
                            </button>
                          )}

                          {user.storeId && (
                            <span
                              className="
                                text-xs
                                text-gray-400
                              "
                            >
                              Administrador
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="
                    px-4
                    py-10
                    text-center
                    text-gray-500
                  "
                >
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINAÇÃO */}

      {meta && (
        <div
          className="
            flex
            items-center
            justify-between
          "
        >
          <p className="text-sm text-gray-500">
            Página {meta.page} de {meta.totalPages}
          </p>

          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="
                rounded-lg
                border
                px-4
                py-2
                text-sm

                disabled:opacity-50
              "
            >
              Anterior
            </button>

            <button
              disabled={page >= meta.totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="
                rounded-lg
                border
                px-4
                py-2
                text-sm

                disabled:opacity-50
              "
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* ==================================================
          MODAL VINCULAR LOJA
      ================================================== */}

      <Dialog
        open={!!selectedUserId}
        onClose={() => {
          if (attachStoreMutation.isPending) {
            return;
          }

          setSelectedUserId(null);
          setSelectedStoreId("");
        }}
      >
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            p-4
          "
        >
          <Dialog.Panel
            className="
              w-full
              max-w-[420px]
              space-y-4
              rounded-2xl
              bg-white
              p-6
              shadow-xl
            "
          >
            <Dialog.Title
              className="
                text-xl
                font-bold
              "
            >
              Vincular Loja
            </Dialog.Title>

            <p
              className="
                text-sm
                text-gray-500
              "
            >
              O usuário será promovido para ADMIN.
            </p>

            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="
                w-full
                rounded-lg
                border
                p-3
              "
            >
              <option value="">Selecione uma loja</option>

              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>

            <div
              className="
                flex
                justify-end
                gap-2
              "
            >
              <button
                disabled={attachStoreMutation.isPending}
                onClick={() => {
                  setSelectedUserId(null);
                  setSelectedStoreId("");
                }}
                className="
                  rounded-lg
                  border
                  px-4
                  py-2
                  disabled:opacity-50
                "
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
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-blue-600
                  px-4
                  py-2
                  text-white

                  hover:bg-blue-700

                  disabled:opacity-50
                "
              >
                {attachStoreMutation.isPending && (
                  <Loader2
                    className="
                      h-4
                      w-4
                      animate-spin
                    "
                  />
                )}

                {attachStoreMutation.isPending ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* ==================================================
          MODAL EXCLUIR CONTA
      ================================================== */}

      <Dialog open={!!userToDelete} onClose={closeDeleteModal}>
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            p-4
          "
        >
          <Dialog.Panel
            className="
              w-full
              max-w-[460px]
              rounded-2xl
              bg-white
              p-6
              shadow-xl
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-red-100
              "
            >
              <AlertTriangle
                className="
                  h-6
                  w-6
                  text-red-600
                "
              />
            </div>

            <Dialog.Title
              className="
                mt-4
                text-xl
                font-bold
                text-gray-900
              "
            >
              Excluir conta do cliente?
            </Dialog.Title>

            <Dialog.Description
              className="
                mt-2
                text-sm
                leading-6
                text-gray-600
              "
            >
              Esta ação removerá os dados pessoais do cliente e não poderá ser
              desfeita.
            </Dialog.Description>

            {userToDelete && (
              <div
                className="
                  mt-4
                  rounded-xl
                  border
                  bg-gray-50
                  p-4
                "
              >
                <p
                  className="
                    text-sm
                    font-semibold
                    text-gray-900
                  "
                >
                  {userToDelete.name}
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  {userToDelete.email}
                </p>
              </div>
            )}

            <div
              className="
                mt-4
                rounded-xl
                border
                border-red-200
                bg-red-50
                p-4
              "
            >
              <p
                className="
                  text-sm
                  leading-5
                  text-red-700
                "
              >
                Os dados pessoais serão anonimizados. Os registros históricos
                necessários para pedidos, pontos e auditoria permanecerão
                vinculados ao ID técnico do usuário.
              </p>
            </div>

            <div
              className="
                mt-6
                flex
                justify-end
                gap-3
              "
            >
              <button
                type="button"
                disabled={deleteUserMutation.isPending}
                onClick={closeDeleteModal}
                className="
                  rounded-lg
                  border
                  px-4
                  py-2
                  text-sm
                  font-medium

                  hover:bg-gray-50

                  disabled:opacity-50
                "
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={deleteUserMutation.isPending}
                onClick={handleDeleteUser}
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-red-600
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-white

                  hover:bg-red-700

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {deleteUserMutation.isPending ? (
                  <>
                    <Loader2
                      className="
                        h-4
                        w-4
                        animate-spin
                      "
                    />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2
                      className="
                        h-4
                        w-4
                      "
                    />
                    Excluir conta
                  </>
                )}
              </button>
            </div>
          </Dialog.Panel>
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
    <div
      className="
        rounded-2xl
        border
        bg-white
        p-5
        shadow-sm
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
        "
      >
        <div>
          <p
            className="
              text-sm
              text-gray-500
            "
          >
            {title}
          </p>

          <h3 className="text-2xl font-bold">{value}</h3>
        </div>

        {icon}
      </div>
    </div>
  );
}
