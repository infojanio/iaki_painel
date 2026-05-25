import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { CheckCircle2, Loader2, Gift } from "lucide-react";

import {
  approveRedemption,
  getPendingRedemptions,
  Redemption,
} from "@/services/redemptions";

export function RedemptionsList() {
  const queryClient = useQueryClient();

  const { data: redemptions, isLoading } = useQuery<Redemption[]>({
    queryKey: ["redemptions"],

    queryFn: getPendingRedemptions,
  });

  const approveMutation = useMutation({
    mutationFn: approveRedemption,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["redemptions"],
      });
    },
  });

  function handleApprove(redemptionId: string) {
    if (!confirm("Confirmar entrega do brinde?")) return;

    approveMutation.mutate(redemptionId);
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

      <div>
        <h1 className="text-2xl font-bold">Resgates Pendentes</h1>

        <p className="text-sm text-muted-foreground">
          Aprove e controle os brindes resgatados pelos clientes.
        </p>
      </div>

      {/* EMPTY */}

      {!redemptions?.length && (
        <div className="border rounded-2xl p-10 text-center">
          <Gift className="mx-auto h-10 w-10 text-muted-foreground mb-3" />

          <h2 className="text-lg font-semibold">Nenhum resgate pendente</h2>

          <p className="text-sm text-muted-foreground">
            Quando clientes solicitarem brindes, eles aparecerão aqui.
          </p>
        </div>
      )}

      {/* LIST */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {redemptions?.map((redemption) => (
          <div
            key={redemption.id}
            className="border rounded-2xl bg-white overflow-hidden shadow-sm"
          >
            {/* IMAGE */}

            <div className="h-44 bg-muted">
              {redemption.reward?.image ? (
                <img
                  src={redemption.reward.image}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Gift className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* CONTENT */}

            <div className="p-5 space-y-4">
              {/* reward */}

              <div>
                <h2 className="font-semibold text-lg">
                  {redemption.reward.title}
                </h2>

                <p className="text-sm text-muted-foreground">
                  ⭐ {redemption.reward.pointsCost} pontos
                </p>
              </div>

              {/* user */}

              <div className="border rounded-xl p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground">Cliente</p>

                <div className="flex items-center gap-3 mt-2">
                  {redemption.user?.avatar ? (
                    <img
                      src={redemption.user.avatar}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted" />
                  )}

                  <div>
                    <p className="font-medium">{redemption.user.name}</p>

                    <p className="text-xs text-muted-foreground">
                      {redemption.user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* data */}

              <div className="text-sm text-muted-foreground">
                Solicitação em{" "}
                <strong>
                  {new Date(redemption.createdAt).toLocaleDateString("pt-BR")}
                </strong>
              </div>

              {/* ACTION */}

              <button
                onClick={() => handleApprove(redemption.id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5" />
                Aprovar entrega
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
