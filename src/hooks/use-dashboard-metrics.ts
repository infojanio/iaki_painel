import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";

export interface DashboardMetrics {
  totalOrders: number;
  totalUsers: number;
  totalStores: number;
  activeProducts: number;
  totalCashbackGenerated: number;
  totalCashbackUsed: number;
  cashbackByMonth: { month: string; total: number }[];
  latestValidatedOrders: {
    id: string;
    total: number;
    cashback: number;
    userName: string;
    storeName: string;
    status: string;
    validatedAt: string;
  }[];
  latestPendingOrders: {
    id: string;
    total: number;
    cashback: number;
    userName: string;
    storeName: string;
    status: string;
    validatedAt: string;
  }[];
  topUsers: { id: string; email: string; name: string; total: number }[];
  topProducts: { id: string; name: string; totalSold: number }[];
}

export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const response = await api.get("/dashboard/metrics");
      return response.data;
    },
  });
}
