import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/axios";

import { OrderTable } from "./OrderTable";

export function PendingOrdersPage() {
  const { isAuthenticated } = useAuth();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["pending-orders"],
    queryFn: async () => {
      const response = await api.get("/orders", {
        params: { status: "PENDING" },
      });

      return response.data.orders;
    },
    enabled: isAuthenticated, // Só executa se o usuário estiver autenticado
    staleTime: 1000 * 60, // 1 minuto (ajuste opcional para performance)
  });

  return (
    <>
      <Helmet title="Pedidos Pendentes" />
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Pedidos Pendentes</h1>
        <OrderTable orders={orders} isLoading={isLoading} />
      </div>
    </>
  );
}
