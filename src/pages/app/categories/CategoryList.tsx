import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/axios";

type Category = {
  id: string;
  name: string;
  image: string;
};

export function CategoryList() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    enabled: !!user,
    queryFn: async () => {
      const response = await api.get("/categories");

      return Array.isArray(response.data)
        ? response.data
        : response.data.categories;
    },
  });

  /* ================= LOADING ================= */
  if (isLoading) {
    return <div className="p-6 text-gray-600">Carregando categorias...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">📦 Categorias</h1>

        <button
          onClick={() => navigate("/categories/new")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Adicionar Categoria
        </button>
      </div>

      {/* EMPTY STATE */}
      {categories?.length === 0 && (
        <div className="bg-white border rounded-lg p-10 text-center text-gray-500">
          <p className="mb-4">Nenhuma categoria cadastrada</p>

          <button
            onClick={() => navigate("/categories/new")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Criar primeira categoria
          </button>
        </div>
      )}

      {/* TABLE */}
      {categories && categories.length > 0 && (
        <div className="overflow-auto rounded-lg shadow border">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50 text-gray-700 text-sm">
              <tr>
                <th className="p-4 text-left">Imagem</th>
                <th className="p-4 text-left">Nome</th>
                <th className="p-4 text-left">Ações</th>
              </tr>
            </thead>

            <tbody className="text-gray-700 text-sm divide-y">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-14 h-14 object-cover rounded border"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">Sem imagem</span>
                    )}
                  </td>

                  <td className="p-4 font-medium">{category.name}</td>

                  <td className="p-4">
                    <button
                      onClick={() =>
                        navigate(`/categories/edit/${category.id}`)
                      }
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
