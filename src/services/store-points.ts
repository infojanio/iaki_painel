import { api } from "@/lib/axios";

export type StorePoints = {
  balance: number;
};

export type Reward = {
  id: string;
  title: string;
  pointsRequired: number;
  image?: string | null;
};

export async function getMyPoints(storeId: string): Promise<StorePoints> {
  const res = await api.get(`/stores/${storeId}/points/me`);
  const data = res.data?.data ?? res.data;

  return {
    balance: Number(data.balance ?? 0),
  };
}

export async function getRewards(storeId: string): Promise<Reward[]> {
  const res = await api.get(`/stores/${storeId}/rewards`);
  const data = res.data?.data ?? res.data;

  return Array.isArray(data) ? data : [];
}

export async function redeemReward(storeId: string, rewardId: string) {
  await api.post(`/stores/${storeId}/rewards/${rewardId}/redeem`);
}
