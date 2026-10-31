import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { isAxiosError } from "axios";
import {
  AlertCircle,
  ImageOff,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Shapes,
  Trash2,
} from "lucide-react";

import { api } from "@/lib/axios";

type BusinessCategory = {
  id: string;
  name: string;
  image?: string | null;
  createdAt?: string;
};

const QUERY_KEY = ["business-categories"] as const;
const REQUEST_TIMEOUT = 15000;

async function fetchBusinessCategories(
  signal?: AbortSignal,
): Promise<BusinessCategory[]> {
  const { data } = await api.get<BusinessCategory[]>("/business-categories", {
    signal,
    timeout: REQUEST_TIMEOUT,
  });

  if (!Array.isArray(data)) {
    throw new Error("A API retornou um formato inesperado.");
  }

  return data;
}

function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return (
        "O servidor demorou para responder. " +
        "Tente novamente em alguns instantes."
      );
    }

    switch (error.response?.status) {
      case 401:
        return "Sua sessão expirou. Entre novamente para continuar.";
      case 403:
        return "Você não tem permissão para realizar esta operação.";
      case 409:
        return "A categoria possui vínculos ou um conflito que impede a operação.";
      default:
        if (!error.response) {
          return "Não foi possível conectar ao servidor. Verifique sua conexão.";
        }

        return "Não foi possível concluir a operação. Tente novamente.";
    }
  }

  return "Não foi possível concluir a operação. Tente novamente.";
}

function CategoryImage({
  image,
  name,
}: {
  image?: string | null;
  name: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!image || failed) {
    return (
      <div
        role="img"
        aria-label={`Imagem indisponível de ${name}`}
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400"
      >
        <ImageOff size={20} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={name}
      width={48}
      height={48}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="h-12 w-12 rounded-xl border border-slate-200 bg-slate-50 object-cover"
    />
  );
}

export function BusinessCategoryList() {
  const queryClient = useQueryClient();

  const deleteLock = useRef(false);

  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    data: categories,
    isLoading,
    isFetching,
    isPaused,
    error,
    refetch,
  } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: ({ signal }) => fetchBusinessCategories(signal),
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const {
    mutateAsync: removeCategory,
    isPending: isDeleting,
    variables: deletingId,
  } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/business-categories/${id}`, {
        timeout: REQUEST_TIMEOUT,
      });
    },

    retry: false,

    onSuccess: (_, id) => {
      // Atualiza a interface sem aguardar outra consulta.
      queryClient.setQueryData<BusinessCategory[]>(QUERY_KEY, (current) =>
        current?.filter((category) => category.id !== id),
      );

      // Confere os dados com o servidor em segundo plano.
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEY,
      });
    },
  });

  async function handleDelete(category: BusinessCategory) {
    if (deleteLock.current) return;

    const confirmed = window.confirm(
      `Deseja excluir a categoria "${category.name}"?`,
    );

    if (!confirmed) return;

    deleteLock.current = true;
    setDeleteError(null);
    setSuccessMessage(null);

    try {
      // Evita que uma consulta anterior restaure dados antigos
      // no cache depois da exclusão.
      await queryClient.cancelQueries({
        queryKey: QUERY_KEY,
      });

      await removeCategory(category.id);

      setSuccessMessage(`Categoria "${category.name}" excluída com sucesso.`);
    } catch (error) {
      const timedOut =
        isAxiosError(error) &&
        (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT");

      setDeleteError(
        timedOut
          ? "A exclusão ficou sem confirmação do servidor. Atualize a lista antes de tentar novamente."
          : getErrorMessage(error),
      );
    } finally {
      deleteLock.current = false;
    }
  }

  const hasData = categories !== undefined;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Categorias de negócio
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Gerencie os segmentos das lojas parceiras.
          </p>
        </div>

        <Link
          to="/business-categories/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <Plus size={18} aria-hidden="true" />
          Nova categoria
        </Link>
      </header>

      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {successMessage}
        </div>
      )}

      {deleteError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={20} className="shrink-0" aria-hidden="true" />
          <p>{deleteError}</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3 text-sm text-red-700">
            <AlertCircle size={20} className="shrink-0" aria-hidden="true" />

            <div>
              <p className="font-semibold">
                {hasData
                  ? "Não foi possível atualizar a lista."
                  : "Não foi possível carregar as categorias."}
              </p>

              <p className="mt-1">{getErrorMessage(error)}</p>

              {hasData && (
                <p className="mt-1">
                  Os dados carregados anteriormente continuam visíveis.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching || isDeleting}
            className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {isPaused && (
        <p
          role="status"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          Sem conexão. O carregamento continuará quando a rede voltar.
        </p>
      )}

      <section
        aria-label="Lista de categorias"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-800">
              Categorias cadastradas
            </h2>

            {hasData && (
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {categories.length}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching || isDeleting || isPaused}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isFetching ? "animate-spin" : ""}
              aria-hidden="true"
            />
            {isFetching ? "Atualizando..." : "Atualizar"}
          </button>
        </div>

        {isLoading && !hasData ? (
          <div
            role="status"
            className="flex items-center justify-center gap-3 px-5 py-16 text-sm text-slate-500"
          >
            <Loader2
              size={22}
              className="animate-spin text-blue-600"
              aria-hidden="true"
            />
            Carregando categorias...
          </div>
        ) : !hasData ? (
          <div className="px-5 py-16 text-center">
            <Shapes
              size={32}
              className="mx-auto mb-3 text-slate-300"
              aria-hidden="true"
            />
            <p className="text-sm text-slate-500">
              {isPaused
                ? "Aguardando conexão com a internet."
                : "A lista de categorias está indisponível."}
            </p>
          </div>
        ) : categories.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <Shapes
              size={36}
              className="mx-auto mb-3 text-slate-300"
              aria-hidden="true"
            />

            <p className="font-medium text-slate-800">
              Nenhuma categoria cadastrada
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Cadastre o primeiro segmento das lojas parceiras.
            </p>

            <Link
              to="/business-categories/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              <Plus size={16} aria-hidden="true" />
              Criar categoria
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">
                  Categorias de negócio e ações de edição e exclusão
                </caption>

                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Categoria
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-3 text-right font-semibold"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {categories.map((category) => {
                    const deleting = isDeleting && deletingId === category.id;

                    return (
                      <tr
                        key={category.id}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="shrink-0">
                              <CategoryImage
                                key={category.image ?? "no-image"}
                                image={category.image}
                                name={category.name}
                              />
                            </div>

                            <span className="font-medium text-slate-800">
                              {category.name}
                            </span>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {deleting ? (
                              <span className="inline-flex h-10 items-center rounded-lg border border-slate-200 px-3 text-slate-400">
                                <Pencil size={16} aria-hidden="true" />
                                <span className="sr-only">
                                  Edição indisponível durante a exclusão
                                </span>
                              </span>
                            ) : (
                              <Link
                                to={`/business-categories/edit/${category.id}`}
                                aria-label={`Editar ${category.name}`}
                                title={`Editar ${category.name}`}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-blue-700 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                              >
                                <Pencil size={16} aria-hidden="true" />
                                <span className="hidden sm:inline">Editar</span>
                              </Link>
                            )}

                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => void handleDelete(category)}
                              aria-label={
                                deleting
                                  ? `Excluindo ${category.name}`
                                  : `Excluir ${category.name}`
                              }
                              title={`Excluir ${category.name}`}
                              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 text-red-600 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deleting ? (
                                <Loader2
                                  size={16}
                                  className="animate-spin"
                                  aria-hidden="true"
                                />
                              ) : (
                                <Trash2 size={16} aria-hidden="true" />
                              )}

                              <span className="hidden sm:inline">
                                {deleting ? "Excluindo..." : "Excluir"}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
              {categories.length}{" "}
              {categories.length === 1
                ? "categoria cadastrada"
                : "categorias cadastradas"}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
