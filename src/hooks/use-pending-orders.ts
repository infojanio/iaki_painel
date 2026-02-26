// src/hooks/use-pending-orders.ts

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";

export interface PendingOrderItem {
  id: string;
  userId: string;
  user_name: string;
  storeId: string;
  totalAmount: number;
  discountApplied: number;
  status: "PENDING" | "VALIDATED" | "EXPIRED";
  qrCodeUrl: string;
  validatedAt: string | null;
  createdAt: string;
  items: {
    product: {
      id: string;
      name: string;
      image: string;
      price: number;
      cashback_percentage: number;
    } | null;
    quantity: number;
  }[];
}

interface FetchPendingOrdersResponse {
  orders: PendingOrderItem[];
}

export function usePendingOrders() {
  return useQuery<FetchPendingOrdersResponse>({
    queryKey: ["orders", "pending"],
    queryFn: async () => {
      const response = await api.get("/orders/");
      return response.data;
    },
    refetchOnWindowFocus: true,
  });
}
