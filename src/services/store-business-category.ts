import { api } from "@/lib/axios";

export type StoreBusinessCategoryLink = {
  id: string;
  storeId: string;
  categoryId: string;
  createdAt?: string;
};

export type LinkStoreToBusinessCategoryPayload = {
  storeId: string;
  categoryId: string;
};

/**
 * 🔎 HOME: lista lojas por categoria de negócio
 * GET /stores-business-categories/category/:categoryId
 */
export async function getStoresByBusinessCategory(categoryId: string) {
  const { data } = await api.get(
    `/stores-business-categories/category/${categoryId}`,
  );
  return data;
}

/**
 * 📋 SUPER_ADMIN: lista todos os vínculos (store ↔ category)
 * GET /store-business-categories
 */
export async function listStoreBusinessCategories() {
  const { data } = await api.get<StoreBusinessCategoryLink[]>(
    "/store-business-categories",
  );
  return data;
}

/**
 * 📌 SUPER_ADMIN: lista vínculos por categoryId
 * GET /store-business-categories/:categoryId
 */
export async function listStoreBusinessCategoriesByCategoryId(
  categoryId: string,
) {
  const { data } = await api.get<StoreBusinessCategoryLink[]>(
    `/store-business-categories/${categoryId}`,
  );
  return data;
}

/**
 * 🔗 SUPER_ADMIN: vincular store ↔ category
 * POST /store-business-categories/link-category
 */
export async function linkStoreToBusinessCategory(
  payload: LinkStoreToBusinessCategoryPayload,
) {
  await api.post("/store-business-categories/link-category", payload);
}

/**
 * ➕ SUPER_ADMIN: criar vínculo (se você usar esse endpoint também)
 * POST /store-business-categories
 */
export async function createStoreBusinessCategory(
  payload: LinkStoreToBusinessCategoryPayload,
) {
  const { data } = await api.post<StoreBusinessCategoryLink>(
    "/store-business-categories",
    payload,
  );
  return data;
}

/**
 * ❌ SUPER_ADMIN: remover vínculo pelo ID do vínculo
 * DELETE /store-business-categories/:id
 */
export async function deleteStoreBusinessCategory(linkId: string) {
  await api.delete(`/store-business-categories/${linkId}`);
}
