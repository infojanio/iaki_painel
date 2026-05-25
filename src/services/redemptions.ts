import { api } from "@/lib/axios";

export interface Redemption {
  id: string;

  createdAt: string;

  status: string;

  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };

  reward: {
    id: string;
    title: string;
    pointsCost: number;
    image?: string | null;
  };
}

/* =========================
   LISTAR PENDENTES
========================= */

export async function getPendingRedemptions() {
  const response = await api.get("/stores/rewards/redemptions/pending");

  return response.data?.data ?? response.data ?? [];
}

/* =========================
   APROVAR
========================= */

export async function approveRedemption(redemptionId: string) {
  const response = await api.patch(
    `/stores/rewards/redemptions/${redemptionId}/approve`,
  );

  return response.data;
}

/* =========================
   LISTA BRINDES APROVADOS
========================= */
export async function getConfirmedRedemptions() {
  const response = await api.get("/stores/rewards/redemptions/history");

  return response.data?.data ?? response.data ?? [];
}
