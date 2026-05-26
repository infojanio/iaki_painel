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

export async function getDashboardSummary() {
  const response = await api.get("/dashboard/summary");

  return response.data?.summary as DashboardSummary;
}
