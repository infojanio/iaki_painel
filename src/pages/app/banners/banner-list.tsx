import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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
  store?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
};

export function BannerList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 🔥 LISTAR BANNERS (SEM storeId no frontend)
  const { data: banners, isLoading } = useQuery<Banner[]>({
    queryKey: ["banners"],
    enabled: !!user,
    queryFn: async () => {
      const response = await api.get("/banners/me");

      return response.data?.data ?? [];
    },
  });

  // 🔥 DELETE
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/banners/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["banners"],
      });
    },
  });

  const handleDelete = async (id: string, title?: string) => {
    const ok = window.confirm(
      `Tem certeza que deseja excluir o banner${title ? ` "${title}"` : ""}?`,
    );
    if (!ok) return;

    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      alert("Não foi possível excluir o banner. Tente novamente.");
    }
  };

  if (isLoading) {
    return <p className="p-4 text-gray-600">Carregando banners...</p>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Banners</h1>

        <Link
          to="/banners/new"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ➕ Novo Banner
        </Link>
      </div>

      {banners?.length === 0 ? (
        <p className="text-gray-500">Nenhum banner cadastrado.</p>
      ) : (
        <div className="overflow-auto rounded-lg shadow">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50 text-gray-700 text-sm">
              <tr>
                <th className="p-4 text-left">Imagem</th>
                <th className="p-4 text-left">Nome</th>
                <th className="p-4 text-left">Ativo</th>
                <th className="p-4 text-left">Ações</th>
              </tr>
            </thead>

            <tbody className="text-gray-700 text-sm divide-y divide-gray-200">
              {banners?.map((banner) => {
                const isDeleting =
                  deleteMutation.isPending &&
                  deleteMutation.variables === banner.id;

                return (
                  <tr key={banner.id}>
                    <td className="p-4">
                      {banner.imageUrl ? (
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-20 h-12 object-cover rounded border"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">
                          Sem imagem
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-medium">{banner.title}</td>

                    <td className="p-4">
                      {banner.isActive ? (
                        <span className="text-green-600 font-semibold">
                          Ativo
                        </span>
                      ) : (
                        <span className="text-red-500 font-semibold">
                          Inativo
                        </span>
                      )}
                    </td>

                    <td className="p-4 flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/banners/edit/${banner.id}`)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Pencil className="w-4 h-4" /> Editar
                      </button>

                      <button
                        onClick={() => handleDelete(banner.id, banner.title)}
                        disabled={isDeleting}
                        className={`flex items-center gap-1 text-sm ${
                          isDeleting
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-600 hover:text-red-800"
                        }`}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Excluindo…
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" /> Excluir
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
