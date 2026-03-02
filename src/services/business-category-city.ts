import { api } from "@/lib/axios";

export async function linkBusinessCategoryToCity(payload: {
  businessCategoryId: string;
  cityId: string;
}) {
  const { data } = await api.post("/business-categories/link-city", payload);
  return data;
}

export async function getBusinessCategoriesByCity(cityId: string) {
  const { data } = await api.get(`/business-categories/city/${cityId}`);
  return data;
}

export async function unlinkBusinessCategoryFromCity(id: string) {
  await api.delete(`/business-category-city/${id}`);
}
