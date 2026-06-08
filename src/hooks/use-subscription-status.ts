// hooks/use-subscription-status.ts

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { api } from "@/lib/axios";

export function useSubscriptionStatus() {
  return useQuery({
    queryKey: ["subscription-status"],

    queryFn: async () => {
      try {
        await api.get("/stores/me/subscription");

        return {
          expired: false,
        };
      } catch (error) {
        if (
          axios.isAxiosError(error) &&
          error.response?.data?.code === "SUBSCRIPTION_EXPIRED"
        ) {
          return {
            expired: true,
          };
        }

        throw error;
      }
    },
  });
}
