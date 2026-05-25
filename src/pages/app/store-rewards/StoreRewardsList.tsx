import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Loader2, Pencil, Trash2, Gift } from "lucide-react";

import { Link } from "react-router-dom";

import {
  deleteStoreReward,
  getStoreRewards,
  StoreReward,
} from "@/services/store-rewards";

export function StoreRewardsList() {
  const queryClient = useQueryClient();

  const { data: rewards, isLoading } = useQuery<StoreReward[]>({
    queryKey: ["store-rewards"],

    queryFn: getStoreRewards,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStoreReward,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["store-rewards"],
      });
    },
  });

  function handleDelete(rewardId: string) {
    if (!confirm("Deseja excluir este brinde?")) return;

    deleteMutation.mutate(rewardId);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brindes & Recompensas</h1>

          <p className="text-sm text-muted-foreground">
            Gerencie os brindes disponíveis para os clientes.
          </p>
        </div>

        <Link
          to="/store-rewards/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Novo brinde
        </Link>
      </div>

      {/* EMPTY */}
      {!rewards?.length && (
        <div className="border rounded-xl p-10 text-center">
          <Gift className="mx-auto h-10 w-10 text-muted-foreground mb-3" />

          <h2 className="font-semibold text-lg">Nenhum brinde cadastrado</h2>

          <p className="text-sm text-muted-foreground">
            Crie recompensas para fidelizar clientes.
          </p>
        </div>
      )}

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {rewards?.map((reward) => (
          <div
            key={reward.id}
            className="border rounded-2xl overflow-hidden bg-white shadow-sm"
          >
            {/* IMAGE */}
            <div className="h-44 bg-muted">
              {reward.image ? (
                <img
                  src={reward.image}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Gift className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* CONTENT */}
            <div className="p-4 space-y-3">
              <div>
                <h2 className="font-semibold text-lg">{reward.title}</h2>

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {reward.description}
                </p>
              </div>

              <div className="space-y-1 text-sm">
                <p>
                  ⭐ <strong>{reward.pointsCost} pontos</strong>
                </p>

                <p>
                  📦 Estoque: <strong>{reward.stock}</strong>
                </p>

                {reward.maxPerUser && (
                  <p>
                    👤 Máx por usuário: <strong>{reward.maxPerUser}</strong>
                  </p>
                )}

                {reward.expiresAt && (
                  <p>
                    ⏳ Expira em:{" "}
                    <strong>
                      {new Date(reward.expiresAt).toLocaleDateString("pt-BR")}
                    </strong>
                  </p>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex items-center gap-2 pt-2">
                <Link
                  to={`/store-rewards/${reward.id}/edit`}
                  className="flex-1 border rounded-lg px-3 py-2 flex items-center justify-center gap-2 hover:bg-muted"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </Link>

                <button
                  onClick={() => handleDelete(reward.id)}
                  className="border rounded-lg px-3 py-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
