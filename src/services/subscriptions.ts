import { api } from "@/lib/axios";

export async function listSubscriptions() {
  const response = await api.get("/subscriptions");
  return response.data?.subscriptions ?? response.data ?? [];
}

export async function getMySubscription() {
  const res = await api.get("/stores/me/subscription");

  const data = res.data;

  return {
    subscription: data?.subscription ?? null,
    usage: data?.usage ?? {
      products: 0,
      banners: 0,
      reels: 0,
    },
  };
}

export async function changePlan(planId: string) {
  const res = await api.post("/stores/me/subscription/change-plan", {
    planId,
  });
  return res.data;
}

export async function cancelMySubscription() {
  const res = await api.post("/stores/me/subscription/cancel");
  return res.data;
}
