import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useState } from "react";

import { api } from "@/lib/axios";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  cashback_percentage: number;
};

type OrderItem = {
  quantity: number;
  product: Product | null;
};

type Order = {
  id: string;
  user_name: string;
  createdAt: string;
  totalAmount: number;
  discountApplied?: number;
  status: "PENDING" | "VALIDATED" | "EXPIRED";
  items: OrderItem[];
  cashbackAmount?: number;
  qrCodeUrl?: string | null;
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendente" },
  { value: "VALIDATED", label: "Aprovado" },
  { value: "EXPIRED", label: "Cancelado" },
];

export function OrderValidationPage() {
  const queryClient = useQueryClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("PENDING");
  const [searchId, setSearchId] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const validateOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.patch(`/orders/${orderId}/validate`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      fetchOrders(1, true);
      alert(data?.message || "Pedido validado com sucesso!");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Erro ao validar o pedido.";
      alert(message);
    },
  });

  // ✅ Cancelar: altera status para EXPIRED
  const cancelOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.patch(`/orders/${orderId}/cancel`);

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      fetchOrders(1, true);
      alert(data?.message || "Pedido cancelado com sucesso.");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || "Erro ao cancelar o pedido.";
      alert(message);
    },
  });

  async function fetchOrders(pageNumber = 1, reset = false) {
    try {
      setIsLoading(true);
      const response = await api.get("/orders", {
        params: { page: pageNumber, status: selectedStatus },
      });

      const newOrders: Order[] = response.data.orders || [];
      if (reset) {
        setOrders(newOrders);
      } else {
        setOrders((prev) => [...prev, ...newOrders]);
      }
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders(1, true);
  }, [selectedStatus]);

  useEffect(() => {
    let result = [...orders];
    if (searchId.trim() !== "") {
      result = result.filter((order) =>
        order.id.toLowerCase().includes(searchId.toLowerCase())
      );
    }
    setFilteredOrders(result);
  }, [searchId, orders]);

  const calculateCashback = (order: Order) => {
    if (order.discountApplied && order.discountApplied > 0) return 0;
    if (order.cashbackAmount !== undefined) return order.cashbackAmount;
    return order.items.reduce((total, item) => {
      const price = item.product?.price || 0;
      const percentage = item.product?.cashback_percentage || 0;
      return total + (price * item.quantity * percentage) / 100;
    }, 0);
  };

  const anyMutating =
    validateOrder.isPending || cancelOrder.isPending || isLoading;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Validação de Pedidos
      </h1>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border px-3 py-2 rounded text-sm"
          disabled={anyMutating}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Buscar por ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="border px-3 py-2 rounded text-sm w-full sm:w-64"
          disabled={anyMutating}
        />
      </div>

      {/* Lista */}
      {filteredOrders.length === 0 ? (
        <p className="text-gray-500">Nenhum pedido encontrado.</p>
      ) : (
        filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white shadow-sm rounded-lg p-4 mb-4 border"
          >
            <div className="flex justify-between mb-2">
              <div>
                <p className="font-medium">Pedido: #{order.id.slice(0, 8)}</p>
                <p className="text-sm text-gray-500">
                  Cliente: {order.user_name}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${
                  order.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : order.status === "VALIDATED"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {STATUS_OPTIONS.find((s) => s.value === order.status)?.label}
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-3">
              {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", {
                locale: ptBR,
              })}
            </p>

            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              {order.items.map((item, idx) => (
                <div
                  key={item.product?.id ?? `${order.id}-${idx}`}
                  className="flex items-start gap-3"
                >
                  <img
                    src={
                      item.product?.image || "https://via.placeholder.com/80"
                    }
                    alt={item.product?.name ?? "Produto"}
                    className="w-16 h-16 object-cover rounded border"
                  />
                  <div>
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity}x R${" "}
                      {(item.product?.price ?? 0).toFixed(2)}
                    </p>
                    {(!order.discountApplied ||
                      order.discountApplied === 0) && (
                      <p className="text-green-600 text-sm">
                        {item.product?.cashback_percentage}% cashback
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-sm border-t pt-2">
              <p className="font-semibold">
                Total: R$ {order.totalAmount.toFixed(2)}
              </p>
              {order.discountApplied && order.discountApplied > 0 ? (
                <p className="text-orange-600 font-medium">
                  Desconto aplicado: R$ {order.discountApplied.toFixed(2)}
                </p>
              ) : (
                <p className="text-green-600 font-medium">
                  Cashback: R$ {calculateCashback(order).toFixed(2)}
                </p>
              )}
            </div>

            {order.status === "PENDING" && (
              <div className="pt-3 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    const ok = window.confirm(
                      `Confirmar validação do pedido ${order.id.slice(0, 8)}?`
                    );
                    if (ok) validateOrder.mutate(order.id);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-60"
                  disabled={anyMutating}
                >
                  {validateOrder.isPending
                    ? "Validando..."
                    : "Validar Cashback"}
                </button>

                <button
                  onClick={() => {
                    const ok = window.confirm(
                      `Confirmar cancelamento (EXPIRED) do pedido ${order.id.slice(
                        0,
                        8
                      )}?`
                    );
                    if (ok) cancelOrder.mutate(order.id);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded disabled:opacity-60"
                  disabled={anyMutating}
                >
                  {cancelOrder.isPending ? "Cancelando..." : "Cancelar Pedido"}
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {/* Paginação simples */}
      <div className="text-center mt-6">
        <button
          onClick={() => {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchOrders(nextPage);
          }}
          className="text-sm text-blue-600 hover:underline disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? "Carregando..." : "Carregar mais"}
        </button>
      </div>
    </div>
  );
}
