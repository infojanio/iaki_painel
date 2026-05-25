import { api } from "@/lib/axios";

export interface StoreReward {
  id: string;

  title: string;

  description?: string | null;

  pointsCost: number;

  stock: number;

  image?: string | null;

  expiresAt?: string | null;

  maxPerUser?: number | null;

  isActive: boolean;

  createdAt: string;
}

export interface CreateStoreRewardPayload {
  title: string;

  description?: string;

  pointsCost: number;

  stock: number;

  image?: string;

  expiresAt?: string;

  maxPerUser?: number;

  isActive?: boolean;
}

/* =========================
   LISTAR
========================= */

export async function getStoreRewards() {
  const response = await api.get("/stores/rewards/me");

  return response.data?.data ?? response.data ?? [];
}

/* =========================
   DETALHE
========================= */

export async function getStoreReward(rewardId: string) {
  const response = await api.get(`/stores/rewards/${rewardId}`);

  return response.data?.data ?? response.data;
}

/* =========================
   CREATE
========================= */

export async function createStoreReward(payload: CreateStoreRewardPayload) {
  const response = await api.post("/stores/rewards", payload);

  return response.data?.data ?? response.data;
}

/* =========================
   UPDATE
========================= */

export async function updateStoreReward(
  rewardId: string,
  payload: Partial<CreateStoreRewardPayload>,
) {
  const response = await api.patch(`/stores/rewards/${rewardId}`, payload);

  return response.data?.data ?? response.data;
}

/* =========================
   DELETE
========================= */

export async function deleteStoreReward(rewardId: string) {
  await api.delete(`/stores/rewards/${rewardId}`);
}
