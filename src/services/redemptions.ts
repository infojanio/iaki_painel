import { api } from "@/lib/axios";

export type RedemptionStatus = "PENDING" | "CONFIRMED" | "CANCELED";

export interface RedemptionUser {
  id: string;
  name: string;
  email: string;
  cpf: string | null;
  phone: string | null;
  avatar: string | null;
}

export interface RedemptionReward {
  id: string;
  title: string;
  description: string | null;
  pointsCost: number;
  image: string | null;
}

export interface RedemptionStore {
  id: string;
  name: string;
  avatar: string | null;
}

export interface Redemption {
  id: string;

  rewardId: string;
  userId: string;
  storeId: string;

  /*
   * Pontos registrados no momento do resgate.
   * Use este valor na conferência, em vez de
   * reward.pointsCost, que pode ser alterado depois.
   */
  points: number;

  status: RedemptionStatus;

  createdAt: string;
  usedAt: string | null;

  user: RedemptionUser;
  reward: RedemptionReward;
  store?: RedemptionStore | null;
}

type RedemptionApiResponse = {
  data?: unknown;
  redemption?: unknown;
  redemptions?: unknown;
};

function normalizeStatus(status: unknown): RedemptionStatus {
  const normalized = String(status ?? "PENDING")
    .trim()
    .toUpperCase();

  if (normalized === "CONFIRMED") {
    return "CONFIRMED";
  }

  if (normalized === "CANCELED") {
    return "CANCELED";
  }

  return "PENDING";
}

function normalizeRedemption(item: any): Redemption {
  return {
    id: String(item?.id ?? ""),

    rewardId: String(item?.rewardId ?? item?.reward?.id ?? ""),

    userId: String(item?.userId ?? item?.user?.id ?? ""),

    storeId: String(item?.storeId ?? item?.store?.id ?? ""),

    points: Number(item?.points ?? item?.reward?.pointsCost ?? 0),

    status: normalizeStatus(item?.status),

    createdAt: String(item?.createdAt ?? ""),

    usedAt: item?.usedAt != null ? String(item.usedAt) : null,

    user: {
      id: String(item?.user?.id ?? item?.userId ?? ""),

      name: String(item?.user?.name ?? "Cliente"),

      email: String(item?.user?.email ?? ""),

      cpf: item?.user?.cpf != null ? String(item.user.cpf) : null,

      phone: item?.user?.phone != null ? String(item.user.phone) : null,

      avatar: item?.user?.avatar != null ? String(item.user.avatar) : null,
    },

    reward: {
      id: String(item?.reward?.id ?? item?.rewardId ?? ""),

      title: String(item?.reward?.title ?? "Brinde"),

      description:
        item?.reward?.description != null
          ? String(item.reward.description)
          : null,

      pointsCost: Number(item?.reward?.pointsCost ?? item?.points ?? 0),

      image: item?.reward?.image != null ? String(item.reward.image) : null,
    },

    store: item?.store
      ? {
          id: String(item.store.id ?? item.storeId ?? ""),

          name: String(item.store.name ?? "Loja"),

          avatar: item.store.avatar != null ? String(item.store.avatar) : null,
        }
      : null,
  };
}

function extractList(
  responseData: RedemptionApiResponse | unknown,
): Redemption[] {
  const payload =
    (responseData as any)?.redemptions ??
    (responseData as any)?.data ??
    responseData ??
    [];

  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map(normalizeRedemption)
    .filter((redemption) => Boolean(redemption.id));
}

function extractSingle(
  responseData: RedemptionApiResponse | unknown,
): Redemption | null {
  const payload =
    (responseData as any)?.redemption ??
    (responseData as any)?.data ??
    responseData;

  if (!payload || Array.isArray(payload)) {
    return null;
  }

  const redemption = normalizeRedemption(payload);

  return redemption.id ? redemption : null;
}

/* =========================
   LISTAR PENDENTES
========================= */

export async function getPendingRedemptions(): Promise<Redemption[]> {
  const response = await api.get("/stores/rewards/redemptions/pending");

  return extractList(response.data);
}

/* =========================
   APROVAR ENTREGA
========================= */

export async function approveRedemption(
  redemptionId: string,
): Promise<Redemption | null> {
  const response = await api.patch(
    `/stores/rewards/redemptions/${redemptionId}/approve`,
  );

  return extractSingle(response.data);
}

/* =========================
   LISTAR CONFIRMADOS
========================= */

export async function getConfirmedRedemptions(): Promise<Redemption[]> {
  const response = await api.get("/stores/rewards/redemptions/history");

  return extractList(response.data);
}
