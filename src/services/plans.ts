import { api } from "@/lib/axios";

export interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  maxProducts: number;
  maxBanners: number;
  maxReels: number;
  maxCategories?: number | null;
  isActive: boolean;
  createdAt: string;
}

export async function fetchPlans(): Promise<Plan[]> {
  const response = await api.get("/plans");
  return response.data.plans;
}

export async function createPlan(payload: {
  name: string;
  price: number;
  durationDays: number;
  maxProducts: number;
  maxBanners: number;
  maxReels: number;
  maxCategories?: number | null;
  isActive: boolean;
  createdAt: string;
}) {
  const { data } = await api.post<Plan>("/plans", payload);
  return data;
}
