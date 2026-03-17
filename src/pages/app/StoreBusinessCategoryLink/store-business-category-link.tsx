import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import { getBusinessCategories } from "@/services/business-categories"; // se você já tiver
import {
  deleteStoreBusinessCategory,
  linkStoreToBusinessCategory,
  listStoreBusinessCategories,
  StoreBusinessCategoryLink,
} from "@/services/store-business-category";

type Store = {
  id: string;
  name: string;
};

type BusinessCategory = {
  id: string;
  name: string;
  image?: string | null;
};

export function StoreBusinessCategoryLinkPage() {
  const queryClient = useQueryClient();
  const [storeId, setStoreId] = useState("");

  // ✅ Lojas
  const { data: stores, isLoading: isLoadingStores } = useQuery<Store[]>({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data } = await api.get("/stores");
      return Array.isArray(data) ? data : (data?.stores ?? []);
    },
  });

  // ✅ Categorias de negócio
  const { data: categories, isLoading: isLoadingCategories } = useQuery<
    BusinessCategory[]
  >({
    queryKey: ["business-categories"],
    queryFn: async () => {
      // Se você já tem service, pode usar ele:
      // return await getBusinessCategories();

      const { data } = await api.get("/business-categories");
      return Array.isArray(data) ? data : (data?.businessCategories ?? []);
    },
  });

  // ✅ Vínculos (store ↔ category)
  const { data: links, isLoading: isLoadingLinks } = useQuery<
    StoreBusinessCategoryLink[]
  >({
    queryKey: ["store-business-categories"],
    queryFn: listStoreBusinessCategories,
  });

  // ✅ Vínculos da loja selecionada
  const storeLinks = useMemo(() => {
    if (!storeId) return [];
    return (links ?? []).filter((l) => l.storeId === storeId);
  }, [links, storeId]);

  // ✅ Map para lookup rápido: categoryId -> linkId
  const linkIdByCategoryId = useMemo(() => {
    const map = new Map<string, string>();
    storeLinks.forEach((l) => map.set(l.categoryId, l.id));
    return map;
  }, [storeLinks]);

  // ✅ Vincular
  const linkMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      if (!storeId) throw new Error("Selecione uma loja.");
      await linkStoreToBusinessCategory({ storeId, categoryId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["store-business-categories"],
      });
    },
    onError: (err: any) => {
      alert(
        err?.response?.data?.message ?? err?.message ?? "Erro ao vincular.",
      );
    },
  });

  // ✅ Remover vínculo
  const unlinkMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      if (!storeId) throw new Error("Selecione uma loja.");

      const linkId = linkIdByCategoryId.get(categoryId);
      if (!linkId) throw new Error("Vínculo não encontrado.");

      await deleteStoreBusinessCategory(linkId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["store-business-categories"],
      });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? err?.message ?? "Erro ao remover.");
    },
  });

  const isBusy =
    isLoadingStores ||
    isLoadingCategories ||
    isLoadingLinks ||
    linkMutation.isPending ||
    unlinkMutation.isPending;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vincular Loja → Tipo de Negócio</h1>
        <p className="text-sm text-gray-600">
          Selecione uma loja e vincule as categorias de negócio que ela atende.
        </p>
      </div>

      {/* SELECT LOJA */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold">Loja</label>
        <select
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          className="w-full border p-2 rounded"
          disabled={isLoadingStores}
        >
          <option value="">
            {isLoadingStores ? "Carregando lojas..." : "Selecione a loja"}
          </option>
          {stores?.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      {/* LISTA CATEGORIAS */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Tipos de negócio</h2>

        {!storeId ? (
          <div className="text-sm text-gray-500">
            Selecione uma loja para ver e gerenciar os vínculos.
          </div>
        ) : isLoadingCategories || isLoadingLinks ? (
          <div className="text-sm text-gray-500">Carregando dados...</div>
        ) : (
          <div className="space-y-2">
            {categories?.map((cat) => {
              const isLinked = linkIdByCategoryId.has(cat.id);
              const isLinking =
                linkMutation.isPending && linkMutation.variables === cat.id;
              const isUnlinking =
                unlinkMutation.isPending && unlinkMutation.variables === cat.id;

              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between border rounded p-3"
                >
                  <div className="flex items-center gap-3">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-10 h-10 object-cover rounded border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded border bg-gray-50" />
                    )}

                    <div>
                      <div className="font-medium">{cat.name}</div>
                      <div className="text-xs text-gray-500">
                        {isLinked ? "Vinculado" : "Não vinculado"}
                      </div>
                    </div>
                  </div>

                  {isLinked ? (
                    <button
                      type="button"
                      onClick={() => unlinkMutation.mutate(cat.id)}
                      disabled={isBusy || isUnlinking}
                      className="px-3 py-1.5 rounded text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {isUnlinking ? "Removendo..." : "Remover"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => linkMutation.mutate(cat.id)}
                      disabled={isBusy || isLinking}
                      className="px-3 py-1.5 rounded text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                    >
                      {isLinking ? "Vinculando..." : "Vincular"}
                    </button>
                  )}
                </div>
              );
            })}

            {categories?.length === 0 && (
              <div className="text-sm text-gray-500">
                Nenhuma categoria cadastrada.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
