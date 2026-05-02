import { api } from "@/lib/axios";

export type StoreCategory = {
  id: string;
  name: string;
  image?: string | null;
};

export async function getMyStoreCategories(): Promise<StoreCategory[]> {
  const response = await api.get("/stores/me/categories");

  const data = response.data?.data ?? response.data;

  return Array.isArray(data) ? data : [];
}

export async function updateMyStoreCategories(categoryIds: string[]) {
  await api.put("/stores/me/categories", {
    categoryIds,
  });
}
