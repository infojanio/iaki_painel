import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/axios";

type Subcategory = {
  id: string;
  name: string;
  image: string;
  Category: {
    id: string;
    name: string;
  };
};

export function SubcategoryList() {
  const navigate = useNavigate();

  const { user } = useAuth();

  const { data: subcategories, isLoading } = useQuery<Subcategory[]>({
    queryKey: ["subcategories"],
    enabled: !!user,
    queryFn: async () => {
      const response = await api.get("/subcategories");
      console.log("subcategorias:", response.data);
      return Array.isArray(response.data)
        ? response.data
        : response.data.subcategories;
    },
  });

  if (isLoading)
    return <p className="p-4 text-gray-600">Carregando produtos...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        📦 Lista de Subcategorias
      </h1>

      <div className="overflow-auto rounded-lg shadow">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50 text-gray-700 text-sm">
            <tr>
              <th className="p-4 text-left">Imagem</th>
              <th className="p-4 text-left">Nome</th>
              <th className="p-4 text-left">Categoria</th>
              <th className="p-4 text-left">Ações</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm divide-y divide-gray-200">
            {subcategories?.map((subcategory) => (
              <tr key={subcategory.id}>
                <td className="p-4">
                  {subcategory.image ? (
                    <img
                      src={subcategory.image}
                      alt={subcategory.name}
                      className="w-16 h-16 object-cover rounded border"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">Sem imagem</span>
                  )}
                </td>

                <td className="p-4">{subcategory.name}</td>

                <td className="p-4">{subcategory.Category?.name}</td>

                <td className="p-4 space-x-2 flex items-center">
                  <button
                    onClick={() =>
                      navigate(`/subcategorias/editar/${subcategory.id}`)
                    }
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Pencil className="w-4 h-4" /> Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
