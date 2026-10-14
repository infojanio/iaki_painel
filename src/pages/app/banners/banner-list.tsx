import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/axios";

type Banner = {
  id: string;
  title: string;
  imageUrl: string;
  link?: string | null;
  isActive: boolean;
  position?: number | null;
  storeId: string;
  store?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
};

// Normaliza os diferentes formatos possíveis da API.
function normalizeBanners(payload: unknown): Banner[] {
  if (Array.isArray(payload)) {
    return payload as Banner[];
  }

  if (payload && typeof payload === "object") {
    const response = payload as Record<string, unknown>;

    if (Array.isArray(response.banners)) {
      return response.banners as Banner[];
    }

    if (Array.isArray(response.data)) {
      return response.data as Banner[];
    }

    if (response.data && typeof response.data === "object") {
      const nested = response.data as Record<string, unknown>;

      if (Array.isArray(nested.banners)) {
        return nested.banners as Banner[];
      }
    }
  }

  throw new Error("Formato inesperado na resposta da API de banners.");
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      return "Sua sessão expirou. Entre novamente no sistema.";
    }

    if (status === 403) {
      return "Você não possui permissão para consultar os banners desta loja.";
    }

    if (status === 404) {
      return "A rota de listagem de banners não foi encontrada no backend.";
    }

    if (status === 500) {
      return message ?? "Erro interno no servidor ao consultar banners.";
    }

    return message ?? "Não foi possível consultar os banners.";
  }

  return error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
}

export function BannerList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const storeId = user?.storeId;

  // LISTAGEM
  // O backend identifica a loja autenticada pelo JWT.
  // Não enviamos storeId manualmente na requisição.
  const {
    data: banners = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery<Banner[]>({
    queryKey: ["banners", user?.id, storeId],
    enabled: Boolean(user),
    queryFn: async () => {
      const response = await api.get("/banners/me");

      console.log("[IAKI] Resposta banners:", response.data);

      const result = normalizeBanners(response.data);

      console.log("[IAKI] Banners encontrados:", result.length);

      return result;
    },
    staleTime: 30_000,
    retry: (failureCount, error) => {
      if (
        axios.isAxiosError(error) &&
        [401, 403, 404].includes(error.response?.status ?? 0)
      ) {
        return false;
      }

      return failureCount < 1;
    },
  });

  // EXCLUSÃO
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/banners/${id}`);
      return response.data;
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["banners"],
      });
    },
  });

  async function handleDelete(id: string, title?: string) {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o banner${title ? ` "${title}"` : ""}?`,
    );

    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      window.alert(getErrorMessage(error));
    }
  }

  // CARREGAMENTO
  if (isLoading) {
    return (
      <div className="flex min-h-[350px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />

        <p className="text-sm text-gray-500">Carregando banners da loja...</p>
      </div>
    );
  }

  // ERRO
  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 shrink-0 text-red-600" />

            <div className="flex-1">
              <h2 className="font-semibold text-red-700">
                Erro ao carregar banners
              </h2>

              <p className="mt-2 text-sm text-red-600">
                {getErrorMessage(error)}
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="mt-4 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>

          <p className="mt-1 text-sm text-gray-500">
            Gerencie os banners promocionais da sua loja.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            title="Atualizar listagem"
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Atualizar
          </button>

          <Link
            to="/banners/new"
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Novo Banner
          </Link>
        </div>
      </div>

      {/* RESUMO */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total de banners</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {banners.length}
          </p>
        </div>

        <div className="rounded-xl border border-green-100 bg-green-50 p-4">
          <p className="text-sm text-green-700">Banners ativos</p>
          <p className="mt-1 text-2xl font-bold text-green-700">
            {banners.filter((banner) => banner.isActive).length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm text-gray-600">Banners inativos</p>
          <p className="mt-1 text-2xl font-bold text-gray-700">
            {banners.filter((banner) => !banner.isActive).length}
          </p>
        </div>
      </div>

      {/* LISTAGEM */}
      {banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>

          <h2 className="text-lg font-semibold text-gray-800">
            Nenhum banner cadastrado
          </h2>

          <p className="mt-2 max-w-sm text-sm text-gray-500">
            Cadastre seu primeiro banner para divulgar promoções e novidades da
            loja.
          </p>

          <Link
            to="/banners/new"
            className="mt-5 flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Cadastrar banner
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr className="border-b border-gray-200">
                  <th className="px-5 py-4 text-left font-semibold">Imagem</th>

                  <th className="px-5 py-4 text-left font-semibold">Nome</th>

                  <th className="px-5 py-4 text-left font-semibold">Status</th>

                  <th className="px-5 py-4 text-left font-semibold">Posição</th>

                  <th className="px-5 py-4 text-right font-semibold">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {banners.map((banner) => {
                  const isDeleting =
                    deleteMutation.isPending &&
                    deleteMutation.variables === banner.id;

                  return (
                    <tr key={banner.id} className="transition hover:bg-gray-50">
                      {/* IMAGEM */}
                      <td className="px-5 py-4">
                        {banner.imageUrl ? (
                          <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            loading="lazy"
                            className="h-14 w-24 rounded-lg border border-gray-200 object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-24 items-center justify-center rounded-lg bg-gray-100">
                            <ImageIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </td>

                      {/* NOME */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">
                          {banner.title}
                        </div>

                        {banner.store?.name && (
                          <div className="mt-1 text-xs text-gray-500">
                            {banner.store.name}
                          </div>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">
                        {banner.isActive ? (
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
                            Inativo
                          </span>
                        )}
                      </td>

                      {/* POSIÇÃO */}
                      <td className="px-5 py-4 text-gray-600">
                        {banner.position ?? "—"}
                      </td>

                      {/* AÇÕES */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/banners/edit/${banner.id}`)
                            }
                            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(banner.id, banner.title)
                            }
                            disabled={isDeleting}
                            className={`flex items-center gap-1 text-sm font-medium ${
                              isDeleting
                                ? "cursor-not-allowed text-gray-400"
                                : "text-red-600 hover:text-red-800"
                            }`}
                          >
                            {isDeleting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Excluindo...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4" />
                                Excluir
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
