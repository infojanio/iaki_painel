import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { api } from "@/lib/axios";

type BusinessCategory = {
  id: string;
  name: string;
  image?: string | null;
  createdAt?: string;
};

async function fetchBusinessCategories() {
  const { data } = await api.get<BusinessCategory[]>("/business-categories");
  return data;
}

export function BusinessCategoryList() {
  const queryClient = useQueryClient();

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["business-categories"],
    queryFn: fetchBusinessCategories,
  });

  const { mutateAsync: removeCategory, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/business-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-categories"] });
    },
  });

  async function handleDelete(id: string) {
    const ok = confirm("Deseja excluir esta categoria de negócio?");
    if (!ok) return;

    await removeCategory(id);
    alert("✅ Categoria excluída!");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias de Negócio</h1>

        <Link
          to="/business-categories/new"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ➕ Nova Categoria
        </Link>
      </div>

      {isLoading && <p>Carregando...</p>}
      {error && (
        <p className="text-red-600">
          Erro ao carregar categorias. Verifique o backend/JWT.
        </p>
      )}

      {!isLoading && categories?.length === 0 && (
        <p className="text-gray-600">Nenhuma categoria cadastrada.</p>
      )}

      {!!categories?.length && (
        <div className="overflow-auto border rounded">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3 border-b">Imagem</th>
                <th className="text-left p-3 border-b">Nome</th>
                <th className="text-right p-3 border-b">Ações</th>
              </tr>
            </thead>

            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-10 h-10 rounded object-cover border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded border bg-gray-200" />
                    )}
                  </td>

                  <td className="p-3 border-b">{cat.name}</td>

                  <td className="p-3 border-b">
                    <div className="flex justify-end gap-3">
                      <Link
                        to={`/business-categories/edit/${cat.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Editar
                      </Link>

                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDelete(cat.id)}
                        className="text-red-600 hover:underline disabled:opacity-60"
                      >
                        Excluir
                      </button>
                    </div>
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
