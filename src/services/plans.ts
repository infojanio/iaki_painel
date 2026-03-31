import { api } from "@/lib/axios";

export interface CreatePlanDTO {
  id?: string;
  name: string;
  price: number;
  durationDays: number;

  maxProducts: number | null;
  maxBanners: number | null;
  maxReels: number | null;
  maxCategories: number | null;
  isActive: boolean;
  createdAt?: string;
}

export async function fetchPlans(): Promise<CreatePlanDTO[]> {
  const response = await api.get("/plans");
  return response.data.plans;
}

export async function createPlan(data: CreatePlanDTO) {
  const response = await api.post("/plans", data);
  return response.data;
}

export async function updatePlan(id: string, data: Partial<CreatePlanDTO>) {
  const response = await api.put(`/plans/${id}`, data);
  return response.data;
}

export async function getPlanById(id: string) {
  const response = await api.get(`/plans/${id}`);
  return response.data;
}

export async function fetchPlansPublic() {
  const res = await api.get("/plans");
  return res.data?.plans ?? res.data;
}
