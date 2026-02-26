import { useQuery } from "@tanstack/react-query";
import { CheckIcon, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/axios";
import { formatCurrency } from "@/utils/format-currency";
import { formatDate } from "@/utils/format-date";

interface Order {
  id: string;
  user_name: string;
  storeId: string;
  totalAmount: number;
  status: "PENDING" | "VALIDATED" | "EXPIRED";
  createdAt: string;
}

export function LatestOrdersTable() {
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["orders", "validated"],
    queryFn: async () => {
      const response = await api.get("/orders", {
        params: { status: "VALIDATED" },
      });
      return response.data.orders;
    },
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Clock className="w-6 h-6 text-muted-foreground" />
          Últimos Pedidos Aprovados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando pedidos...</p>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {(orders ?? []).slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between border-b border-muted py-2"
              >
                <div>
                  <p className="text-sm font-medium">{order.user_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)} -{" "}
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("")}
                >
                  <CheckIcon className="w-4 h-4 mr-2" color="green" />
                  Aprovado
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum pedido pendente encontrado.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
