import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/axios";

export interface DashboardSummary {
  todayOrders: number;

  weekOrders: number;

  pendingOrders: number;

  activeProducts: number;

  activeRewards: number;

  pendingRedemptions: number;

  confirmedRedemptions: number;

  totalUsers: number;
}

export function useDashboardSummary() {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard-summary"],

    queryFn: async () => {
      const response = await api.get("/dashboard/summary");

      return response.data.summary;
    },
  });
}
