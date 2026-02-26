import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/axios";

type Banner = {
  id: string;
  title: string;
  image_url: string;
  link?: string;
};

export function BannerList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: banners, isLoading } = useQuery<Banner[]>({
    queryKey: ["banners"],
    enabled: !!user,
    queryFn: async () => {
      const response = await api.get("/banners");
      return Array.isArray(response.data)
        ? response.data
        : response.data?.banners ?? []; // prettier-ignore
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/banners/${id}`); // backend retorna 204
    },
    onSuccess: async () => {
      // Recarrega a lista após deletar
      await queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });

  const handleDelete = async (id: string, title?: string) => {
    const ok = window.confirm(
      `Tem certeza que deseja excluir o banner${title ? ` "${title}"` : ""}?` // eslint-ignore
    );
    if (!ok) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      alert("Não foi possível excluir o banner. Tente novamente.");
    }
  };

  if (isLoading)
    return <p className="p-4 text-gray-600">Carregando banners...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        📦 Lista de Banners
      </h1>

      <div className="overflow-auto rounded-lg shadow">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50 text-gray-700 text-sm">
            <tr>
              <th className="p-4 text-left">Imagem</th>
              <th className="p-4 text-left">Nome</th>
              <th className="p-4 text-left">Link</th>
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
                    {banner.image_url ? (
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ) : (
                      <span className="text-xs text-gray-400">Sem imagem</span>
                    )}
                  </td>

                  <td className="p-4">{banner.title}</td>
                  <td className="p-4 truncate max-w-xs">{banner.link}</td>

                  <td className="p-4 flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/banners/editar/${banner.id}`)}
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
                      title="Excluir"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
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
    </div>
  );
}
