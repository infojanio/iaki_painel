import { useCallback, useEffect, useMemo, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { api } from "@/lib/axios";

type OrderStatus = "PENDING" | "VALIDATED" | "EXPIRED";

type Product = {
  id: string;
  name: string;
  price: number | string;
  image: string | null;

  /*
   * No modelo atual, este percentual é usado
   * para montar um valor comparativo.
   */
  cashbackPercentage: number | string | null;
};

type OrderItem = {
  quantity: number;
  product: Product | null;
};

type Order = {
  id: string;
  user_name: string;
  createdAt: string;

  /*
   * Valor real que o cliente paga.
   */
  totalAmount: number | string;

  /*
   * Mantido no tipo porque existe no banco,
   * mas não participa do cálculo atual.
   */
  discountApplied?: number | string | null;

  status: OrderStatus;
  items: OrderItem[];
  qrCodeUrl?: string | null;
};

type OrdersResponse = {
  orders?: Order[];
  data?: Order[];
};

const STATUS_OPTIONS: Array<{
  value: OrderStatus;
  label: string;
}> = [
  {
    value: "PENDING",
    label: "Pendente",
  },
  {
    value: "VALIDATED",
    label: "Validado",
  },
  {
    value: "EXPIRED",
    label: "Cancelado",
  },
];

const DEFAULT_PRODUCT_IMAGE =
  "https://via.placeholder.com/160x160.png?text=Produto";

function toSafeNumber(value?: number | string | null) {
  const numericValue = Number(value ?? 0);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

function formatCurrency(value?: number | string | null) {
  return toSafeNumber(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatOrderDate(value?: string | null) {
  if (!value) {
    return "Data não informada";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  return format(date, "dd/MM/yyyy 'às' HH:mm", {
    locale: ptBR,
  });
}

function getProductDiscountPercentage(product: Product | null) {
  const percentage = toSafeNumber(product?.cashbackPercentage);

  /*
   * Evita percentuais negativos
   * ou superiores a 100%.
   */
  return Math.min(Math.max(percentage, 0), 100);
}

function calculateItemSubtotal(item: OrderItem) {
  const price = Math.max(toSafeNumber(item.product?.price), 0);

  const quantity = Math.max(toSafeNumber(item.quantity), 0);

  return price * quantity;
}

/*
 * Benefício visual do produto.
 *
 * Exemplo:
 * preço pago: R$ 100
 * percentual: 10%
 * benefício exibido: R$ 10
 * valor comparativo: R$ 110
 */
function calculateItemVisualDiscount(item: OrderItem) {
  const subtotal = calculateItemSubtotal(item);

  const percentage = getProductDiscountPercentage(item.product);

  return subtotal * (percentage / 100);
}

/*
 * Soma dos benefícios visuais
 * de todos os produtos.
 */
function calculateOrderVisualDiscount(order: Order) {
  return order.items.reduce(
    (totalDiscount, item) => totalDiscount + calculateItemVisualDiscount(item),
    0,
  );
}

/*
 * totalAmount já representa o
 * valor real pago pelo cliente.
 */
function calculatePaidAmount(order: Order) {
  return Math.max(toSafeNumber(order.totalAmount), 0);
}

/*
 * Valor comparativo apresentado:
 *
 * valor pago + benefício visual.
 */
function calculateReferenceAmount(order: Order) {
  const paidAmount = calculatePaidAmount(order);

  const visualDiscount = calculateOrderVisualDiscount(order);

  return paidAmount + visualDiscount;
}

/*
 * Regra de pontuação:
 *
 * 1 ponto para cada R$ 10
 * efetivamente pagos.
 */
function calculateOrderPoints(order: Order) {
  const paidAmount = calculatePaidAmount(order);

  return Math.floor(paidAmount / 10);
}

function getStatusLabel(status: OrderStatus) {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
  );
}

function getStatusClasses(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";

    case "VALIDATED":
      return "bg-green-100 text-green-700";

    case "EXPIRED":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function OrderValidationPage() {
  const queryClient = useQueryClient();

  const [orders, setOrders] = useState<Order[]>([]);

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("PENDING");

  const [searchId, setSearchId] = useState("");

  const [page, setPage] = useState(1);

  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = useCallback(
    async (pageNumber = 1, reset = false) => {
      try {
        setIsLoading(true);

        const response = await api.get<OrdersResponse>("/orders", {
          params: {
            page: pageNumber,

            status: selectedStatus,
          },
        });

        const responseData = response.data;

        const fetchedOrders = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.orders)
            ? responseData.orders
            : Array.isArray(responseData?.data)
              ? responseData.data
              : [];

        if (reset) {
          setOrders(fetchedOrders);

          return;
        }

        setOrders((currentOrders) => {
          const newOrders = fetchedOrders.filter(
            (fetchedOrder) =>
              !currentOrders.some(
                (currentOrder) => currentOrder.id === fetchedOrder.id,
              ),
          );

          return [...currentOrders, ...newOrders];
        });
      } catch (error: any) {
        console.error("[OrderValidationPage] Erro ao carregar pedidos:", {
          status: error?.response?.status,

          data: error?.response?.data,

          message: error?.message,
        });

        if (reset) {
          setOrders([]);
        }

        window.alert(
          error?.response?.data?.message ??
            "Não foi possível carregar os pedidos.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [selectedStatus],
  );

  const validateOrder = useMutation({
    mutationFn: async (orderId: string) => {
      /*
       * O frontend envia apenas o ID.
       * O backend deve calcular e creditar
       * oficialmente os pontos.
       */
      const response = await api.patch(`/orders/${orderId}/validate`);

      return response.data;
    },

    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["orders"],
      });

      setPage(1);

      await fetchOrders(1, true);

      const pointsMessage =
        data?.pointsEarned !== undefined
          ? `\n\nPontos creditados: ${Number(data.pointsEarned)}`
          : "";

      window.alert(
        `${
          data?.message ?? "Pedido validado e pontos acumulados com sucesso!"
        }${pointsMessage}`,
      );
    },

    onError: (error: any) => {
      const message =
        error?.response?.data?.message ?? "Erro ao validar o pedido.";

      window.alert(message);
    },
  });

  const cancelOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.patch(`/orders/${orderId}/cancel`);

      return response.data;
    },

    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["orders"],
      });

      setPage(1);

      await fetchOrders(1, true);

      window.alert(data?.message ?? "Pedido cancelado com sucesso.");
    },

    onError: (error: any) => {
      const message =
        error?.response?.data?.message ?? "Erro ao cancelar o pedido.";

      window.alert(message);
    },
  });

  useEffect(() => {
    setPage(1);
    setOrders([]);

    fetchOrders(1, true);
  }, [selectedStatus, fetchOrders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchId.trim().toLowerCase();

    if (!normalizedSearch) {
      return orders;
    }

    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(normalizedSearch) ||
        order.user_name?.toLowerCase().includes(normalizedSearch),
    );
  }, [orders, searchId]);

  const anyMutating = validateOrder.isPending || cancelOrder.isPending;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      {/* HEADER */}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Validação de pontos
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Confira os produtos, o benefício exibido e os pontos antes de validar
          o pedido.
        </p>
      </div>

      {/* FILTROS */}

      <div className="mb-5 flex flex-wrap items-center gap-4 rounded-xl border bg-white p-4 shadow-sm">
        <select
          value={selectedStatus}
          onChange={(event) =>
            setSelectedStatus(event.target.value as OrderStatus)
          }
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          disabled={anyMutating || isLoading}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Buscar por ID ou cliente"
          value={searchId}
          onChange={(event) => setSearchId(event.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 sm:w-72"
          disabled={anyMutating}
        />
      </div>

      {/* LISTAGEM */}

      {isLoading && orders.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
          Carregando pedidos...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <p className="font-medium text-gray-700">Nenhum pedido encontrado.</p>

          <p className="mt-1 text-sm text-gray-500">
            Não existem pedidos para o filtro selecionado.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const paidAmount = calculatePaidAmount(order);

            const visualDiscount = calculateOrderVisualDiscount(order);

            const referenceAmount = calculateReferenceAmount(order);

            const orderPoints = calculateOrderPoints(order);

            const isValidating =
              validateOrder.isPending && validateOrder.variables === order.id;

            const isCanceling =
              cancelOrder.isPending && cancelOrder.variables === order.id;

            return (
              <div
                key={order.id}
                className="rounded-xl border bg-white p-4 shadow-sm sm:p-5"
              >
                {/* PEDIDO */}

                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Pedido: #{order.id.slice(0, 8)}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Cliente: {order.user_name || "Não informado"}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                      order.status,
                    )}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <p className="mb-4 text-sm text-gray-500">
                  {formatOrderDate(order.createdAt)}
                </p>

                {/* PRODUTOS */}

                <div className="mb-5 grid gap-3 sm:grid-cols-2">
                  {order.items.map((item, index) => {
                    const product = item.product;

                    const discountPercentage =
                      getProductDiscountPercentage(product);

                    const itemSubtotal = calculateItemSubtotal(item);

                    const itemVisualDiscount =
                      calculateItemVisualDiscount(item);

                    const itemReferenceAmount =
                      itemSubtotal + itemVisualDiscount;

                    return (
                      <div
                        key={product?.id ?? `${order.id}-${index}`}
                        className="flex items-start gap-3 rounded-xl border border-gray-100 p-3"
                      >
                        {/* IMAGEM */}

                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-gray-50 p-1">
                          <img
                            src={product?.image ?? DEFAULT_PRODUCT_IMAGE}
                            alt={product?.name ?? "Produto"}
                            className="h-full w-full object-contain"
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                            }}
                          />
                        </div>

                        {/* DADOS */}

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-gray-800">
                            {product?.name ?? "Produto removido"}
                          </p>

                          <p className="mt-1 text-sm text-gray-600">
                            {toSafeNumber(item.quantity)}x{" "}
                            {formatCurrency(product?.price)}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Valor pago: {formatCurrency(itemSubtotal)}
                          </p>

                          {discountPercentage > 0 ? (
                            <div className="mt-2">
                              <span className="inline-flex rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                                {discountPercentage}% de benefício
                              </span>

                              <p className="mt-1 text-xs text-gray-500">
                                Valor de referência:{" "}
                                <span className="line-through">
                                  {formatCurrency(itemReferenceAmount)}
                                </span>
                              </p>

                              <p className="mt-1 text-xs text-orange-600">
                                Benefício exibido:{" "}
                                {formatCurrency(itemVisualDiscount)}
                              </p>
                            </div>
                          ) : (
                            <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
                              Sem benefício
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* RESUMO FINANCEIRO */}

                <div className="grid gap-3 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="text-xs font-medium text-gray-500">
                      Valor de referência
                    </p>

                    <p className="mt-1 text-lg font-bold text-gray-800">
                      {formatCurrency(referenceAmount)}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Valor comparativo
                    </p>
                  </div>

                  <div className="rounded-xl bg-orange-50 p-3">
                    <p className="text-xs font-medium text-orange-700">
                      Benefício exibido
                    </p>

                    <p className="mt-1 text-lg font-bold text-orange-700">
                      -{formatCurrency(visualDiscount)}
                    </p>

                    <p className="mt-1 text-xs text-orange-600">
                      Calculado pelos percentuais
                    </p>
                  </div>

                  <div className="rounded-xl bg-blue-50 p-3">
                    <p className="text-xs font-medium text-blue-700">
                      Total pago
                    </p>

                    <p className="mt-1 text-lg font-bold text-blue-700">
                      {formatCurrency(paidAmount)}
                    </p>

                    <p className="mt-1 text-xs text-blue-600">
                      Valor real do pedido
                    </p>
                  </div>

                  <div className="rounded-xl bg-green-50 p-3">
                    <p className="text-xs font-medium text-green-700">
                      {order.status === "VALIDATED"
                        ? "Pontos acumulados"
                        : order.status === "PENDING"
                          ? "Pontos previstos"
                          : "Pontos não creditados"}
                    </p>

                    <p className="mt-1 text-lg font-bold text-green-700">
                      {order.status === "EXPIRED" ? 0 : orderPoints}{" "}
                      {orderPoints === 1 ? "ponto" : "pontos"}
                    </p>

                    <p className="mt-1 text-xs text-green-600">
                      1 ponto a cada R$ 10 pagos
                    </p>
                  </div>
                </div>

                {/* AÇÕES */}

                {order.status === "PENDING" && (
                  <div className="flex flex-col gap-2 pt-4 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Confirmar a validação do pedido ${order.id.slice(
                            0,
                            8,
                          )}?\n\n` +
                            `Valor de referência: ${formatCurrency(
                              referenceAmount,
                            )}\n` +
                            `Benefício exibido: ${formatCurrency(
                              visualDiscount,
                            )}\n` +
                            `Total pago: ${formatCurrency(paidAmount)}\n` +
                            `Pontos previstos: ${orderPoints}\n\n` +
                            `O servidor fará o crédito oficial dos pontos.`,
                        );

                        if (confirmed) {
                          validateOrder.mutate(order.id);
                        }
                      }}
                      className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={anyMutating || isLoading}
                    >
                      {isValidating
                        ? "Validando..."
                        : `Validar ${orderPoints} ${
                            orderPoints === 1 ? "ponto" : "pontos"
                          }`}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Confirmar o cancelamento do pedido ${order.id.slice(
                            0,
                            8,
                          )}?`,
                        );

                        if (confirmed) {
                          cancelOrder.mutate(order.id);
                        }
                      }}
                      className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={anyMutating || isLoading}
                    >
                      {isCanceling ? "Cancelando..." : "Cancelar pedido"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* PAGINAÇÃO */}

      {orders.length > 0 && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              const nextPage = page + 1;

              setPage(nextPage);

              fetchOrders(nextPage, false);
            }}
            className="rounded-lg px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading || anyMutating}
          >
            {isLoading ? "Carregando..." : "Carregar mais"}
          </button>
        </div>
      )}
    </div>
  );
}
