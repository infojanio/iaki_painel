import { api } from "@/lib/axios";

export interface BusinessCategory {
  id: string;
  name: string;
  image: string;
  createdAt: string;
}

export async function getBusinessCategories() {
  const { data } = await api.get<BusinessCategory[]>("/business-categories");
  return data;
}

export async function createBusinessCategory(payload: {
  name: string;
  image: string;
}) {
  const { data } = await api.post("/business-categories", payload);
  return data;
}

export async function updateBusinessCategory(
  id: string,
  payload: { name: string; image: string },
) {
  const { data } = await api.patch(`/business-categories/${id}`, payload);
  return data;
}

export async function deleteBusinessCategory(id: string) {
  await api.delete(`/business-categories/${id}`);
}
