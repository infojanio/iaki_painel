import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export interface DashboardMetrics {
  todayOrders: number;
  weekOrders: number;
  pendingOrders: number;

  activeProducts: number;
  activeRewards: number;

  pendingRedemptions: number;
  confirmedRedemptions: number;

  totalUsers: number;

  ordersByMonth: {
    month: string;
    total: number;
  }[];

  topProducts: {
    id: string;
    name: string;
    totalSold: number;
  }[];

  topUsers: {
    id: string;
    name: string;
    email: string;
    totalPoints: number;
    totalRedemptions: number;
  }[];

  latestValidatedOrders: {
    id: string;
    totalAmount: number;
    userName: string;
    createdAt: string;
  }[];

  latestPendingOrders: {
    id: string;
    totalAmount: number;
    userName: string;
    createdAt: string;
  }[];
}

export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ["dashboard-summary"],

    queryFn: async () => {
      const response = await api.get("/dashboard/summary");

      return response.data?.summary ?? response.data;
    },

    staleTime: 1000 * 60 * 5, // 5 min
  });
}
