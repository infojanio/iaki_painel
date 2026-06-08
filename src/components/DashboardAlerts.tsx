import { AlertTriangle, Gift, ShoppingBag } from "lucide-react";
import { useSubscriptionStatus } from "@/hooks/use-subscription-status";
import { getDashboardSummary } from "@/services/dashboard";

import { useQuery } from "@tanstack/react-query";

export function DashboardAlerts() {
  const { data: subscriptionStatus } = useSubscriptionStatus();

  const isSubscriptionExpired = subscriptionStatus?.expired;

  const { data } = useQuery({
    queryKey: ["dashboard-summary"],

    queryFn: getDashboardSummary,
  });

  const pendingRedemptions = data?.pendingRedemptions ?? 0;

  const pendingOrders = data?.pendingOrders ?? 0;

  // 🔥 sem alertas
  if (pendingRedemptions === 0 && pendingOrders === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* ASSINATURA VENCIDA */}
      {isSubscriptionExpired && (
        <div className="border rounded-2xl bg-red-50 border-red-200 p-5">
          <div className="flex gap-3">
            <AlertTriangle className="text-red-600" />

            <div>
              <h3 className="font-semibold text-red-800">Assinatura vencida</h3>

              <p className="text-sm text-red-700 mt-1">
                Sua assinatura está vencida. Entre em contato com o
                administrador ou solicite a renovação em "Meu Plano".
              </p>
            </div>
          </div>
        </div>
      )}

      {/* RESGATES PENDENTES */}

      {pendingRedemptions > 0 && (
        <div className="border rounded-2xl bg-yellow-50 border-yellow-200 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center">
              <Gift className="text-yellow-600 h-6 w-6" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-yellow-900">
                  Resgates pendentes
                </h3>

                <span className="bg-yellow-200 text-yellow-900 text-sm font-bold px-3 py-1 rounded-full">
                  {pendingRedemptions}
                </span>
              </div>

              <p className="text-sm text-yellow-800 mt-2">
                Existem clientes aguardando aprovação de brindes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PEDIDOS PENDENTES */}

      {pendingOrders > 0 && (
        <div className="border rounded-2xl bg-blue-50 border-blue-200 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
              <ShoppingBag className="text-blue-600 h-6 w-6" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-blue-900">
                  Pedidos pendentes
                </h3>

                <span className="bg-blue-200 text-blue-900 text-sm font-bold px-3 py-1 rounded-full">
                  {pendingOrders}
                </span>
              </div>

              <p className="text-sm text-blue-800 mt-2">
                Existem pedidos aguardando validação da loja.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
