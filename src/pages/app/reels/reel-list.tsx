import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/axios";

type Reel = {
  id: string;
  title: string;
  imageUrl: string;
  link?: string;
};

export function ReelList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 🔥 LISTAR REELS (PADRÃO SaaS)
  const { data: reels, isLoading } = useQuery<Reel[]>({
    queryKey: ["reels"],
    enabled: !!user,
    queryFn: async () => {
      const response = await api.get("/reels/me");

      return response.data?.data ?? response.data?.reels ?? response.data ?? [];
    },
  });

  // 🔥 DELETE
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/reels/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["reels"],
      });
    },
  });

  const handleDelete = async (id: string, title?: string) => {
    const ok = window.confirm(
      `Tem certeza que deseja excluir o reel${title ? ` "${title}"` : ""}?`,
    );
    if (!ok) return;

    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      alert("Não foi possível excluir o reel. Tente novamente.");
    }
  };

  if (isLoading) {
    return <p className="p-4 text-gray-600">Carregando reels...</p>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Reels do Instagram</h1>

        <Link
          to="/reels/new"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ➕ Novo Reel
        </Link>
      </div>

      {reels?.length === 0 ? (
        <p className="text-gray-500">Nenhum reel cadastrado.</p>
      ) : (
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
              {reels?.map((reel) => {
                const isDeleting =
                  deleteMutation.isPending &&
                  deleteMutation.variables === reel.id;

                return (
                  <tr key={reel.id}>
                    <td className="p-4">
                      {reel.imageUrl ? (
                        <img
                          src={reel.imageUrl}
                          alt={reel.title}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">
                          Sem imagem
                        </span>
                      )}
                    </td>

                    <td className="p-4">{reel.title}</td>

                    <td className="p-4 truncate max-w-xs">
                      {reel.link ? (
                        <a
                          href={reel.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Ver link
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="p-4 flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/reels/edit/${reel.id}`)}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Pencil className="w-4 h-4" /> Editar
                      </button>

                      <button
                        onClick={() => handleDelete(reel.id, reel.title)}
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
