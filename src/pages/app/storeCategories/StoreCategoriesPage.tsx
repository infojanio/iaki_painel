import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/axios";
import {
  getMyStoreCategories,
  updateMyStoreCategories,
} from "@/services/store-categories";

type Category = {
  id: string;
  name: string;
  image?: string | null;
};

export function StoreCategoriesPage() {
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<string[]>([]);

  /**
   * 🔹 TODAS CATEGORIAS (GLOBAL)
   */
  const { data: allCategories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get("/categories");
      const data = res.data?.data ?? res.data;
      return Array.isArray(data) ? data : [];
    },
  });

  /**
   * 🔹 CATEGORIAS DA LOJA
   */
  const { data: storeCategories = [] } = useQuery({
    queryKey: ["store-categories"],
    queryFn: getMyStoreCategories,
  });

  /**
   * 🔥 sincroniza seleção
   */
  useEffect(() => {
    if (storeCategories.length > 0) {
      setSelected(storeCategories.map((c) => c.id));
    }
  }, [storeCategories]);

  /**
   * 🔹 mutation salvar
   */
  const { mutateAsync: saveCategories, isPending } = useMutation({
    mutationFn: updateMyStoreCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store-categories"] });
      alert("✅ Categorias atualizadas!");
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "Erro ao salvar");
    },
  });

  function toggleCategory(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  async function handleSave() {
    await saveCategories(selected);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Categorias da sua loja</h1>

      <div className="space-y-3">
        {allCategories.map((category) => {
          const isActive = selected.includes(category.id);

          return (
            <div
              key={category.id}
              className={`flex items-center justify-between p-4 rounded border transition ${
                isActive ? "border-green-500 bg-green-50" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4">
                {category.image && (
                  <img
                    src={category.image}
                    className="w-12 h-12 rounded object-cover border"
                  />
                )}

                <span className="font-medium">{category.name}</span>
              </div>

              <button
                onClick={() => toggleCategory(category.id)}
                className={`px-4 py-1 rounded text-sm ${
                  isActive ? "bg-green-600 text-white" : "bg-gray-200"
                }`}
              >
                {isActive ? "Ativo" : "Adicionar"}
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={isPending}
        className="mt-6 w-full bg-green-600 text-white py-3 rounded hover:bg-green-700"
      >
        {isPending ? "Salvando..." : "Salvar alterações"}
      </button>
    </div>
  );
}
