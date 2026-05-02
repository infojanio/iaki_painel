import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { getMyPoints, getRewards, redeemReward } from "@/services/store-points";

export function StorePointsPage() {
  const { storeId } = useParams<{ storeId: string }>();

  /**
   * 🔹 saldo
   */
  const { data: points } = useQuery({
    queryKey: ["points", storeId],
    queryFn: () => getMyPoints(storeId!),
    enabled: !!storeId,
  });

  /**
   * 🔹 recompensas
   */
  const { data: rewards = [] } = useQuery({
    queryKey: ["rewards", storeId],
    queryFn: () => getRewards(storeId!),
    enabled: !!storeId,
  });

  /**
   * 🔥 resgatar
   */
  const { mutateAsync: redeem, isPending } = useMutation({
    mutationFn: ({ rewardId }: { rewardId: string }) =>
      redeemReward(storeId!, rewardId),

    onSuccess: () => {
      alert("🎉 Resgate solicitado!");
    },

    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "Erro ao resgatar");
    },
  });

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Seus pontos</h1>

      {/* SALDO */}
      <div className="bg-green-600 text-white p-6 rounded-xl text-center">
        <p className="text-sm">Saldo disponível</p>
        <p className="text-4xl font-bold">{points?.balance ?? 0} pts</p>
      </div>

      {/* RECOMPENSAS */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Resgatar recompensas</h2>

        {rewards.map((reward) => {
          const canRedeem = (points?.balance ?? 0) >= reward.pointsRequired;

          return (
            <div
              key={reward.id}
              className="flex items-center justify-between border p-4 rounded"
            >
              <div className="flex items-center gap-4">
                {reward.image && (
                  <img src={reward.image} className="w-12 h-12 rounded" />
                )}

                <div>
                  <p className="font-medium">{reward.title}</p>
                  <p className="text-sm text-gray-500">
                    {reward.pointsRequired} pontos
                  </p>
                </div>
              </div>

              <button
                disabled={!canRedeem || isPending}
                onClick={() => redeem({ rewardId: reward.id })}
                className={`px-4 py-2 rounded text-sm ${
                  canRedeem
                    ? "bg-green-600 text-white"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                Resgatar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
