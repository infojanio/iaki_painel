import { api } from "@/lib/axios";
import axios from "axios";

export async function listSubscriptions() {
  const response = await api.get("/subscriptions");
  return response.data?.subscriptions ?? response.data ?? [];
}

export async function getMySubscription() {
  try {
    const res = await api.get("/stores/me/subscription");

    return {
      subscription: res.data?.subscription ?? null,
      usage: res.data?.usage ?? {
        products: 0,
        banners: 0,
        reels: 0,
      },
      isExpired: false,
    };
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.data?.code === "SUBSCRIPTION_EXPIRED"
    ) {
      return {
        subscription: null,
        usage: {
          products: 0,
          banners: 0,
          reels: 0,
        },
        isExpired: true,
      };
    }

    throw error;
  }
}

export async function changePlan(planId: string) {
  const res = await api.post("/stores/me/subscription/change-plan", {
    planId,
  });
  return res.data;
}

export async function cancelMySubscription() {
  const { data } = await api.patch("/stores/me/subscription/cancel");

  return data;
}

export async function renewSubscription(subscriptionId: string) {
  const { data } = await api.patch(`/subscriptions/${subscriptionId}/renew`);

  return data;
}

export async function updateSubscriptionEndDate(
  subscriptionId: string,
  endDate: string,
) {
  const { data } = await api.patch(
    `/subscriptions/${subscriptionId}/end-date`,
    {
      endDate,
    },
  );

  return data;
}

export async function suspendSubscription(subscriptionId: string) {
  const { data } = await api.patch(`/subscriptions/${subscriptionId}/cancel`);

  return data;
}

export async function reactivateStore(storeId: string) {
  const { data } = await api.patch(
    `/subscriptions/store/${storeId}/reactivate`,
  );

  return data;
}
