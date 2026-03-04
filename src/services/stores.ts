import { api } from "@/lib/axios";

export interface Store {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  latitude: number;
  longitude: number;
  phone: string;
  cnpj: string;
  avatar?: string | null;
  street: string;
  postalCode: string;
  cityId: string;
  createdAt?: string;
}

export type StoreCreatePayload = {
  name: string;
  slug: string;
  isActive: boolean;
  latitude: number;
  longitude: number;
  phone: string;
  cnpj: string;
  avatar?: string;
  street: string;
  postalCode: string;
  cityId: string;
};

export type StoreUpdatePayload = Partial<StoreCreatePayload>;

export async function getStores() {
  const { data } = await api.get<Store[]>("/stores");
  return data;
}

export async function getStoreById(storeId: string) {
  const { data } = await api.get<Store>(`/stores/${storeId}`);
  return data;
}

export async function createStore(payload: StoreCreatePayload) {
  const { data } = await api.post<Store>("/stores", payload);
  return data;
}

export async function updateStore(
  storeId: string,
  payload: StoreUpdatePayload,
) {
  const { data } = await api.patch<Store>(`/stores/${storeId}`, payload);
  return data;
}

// Se você não tiver updateStore no backend ainda, a gente cria depois.
// Por enquanto dá pra usar toggle-status.
export async function toggleStoreStatus(storeId: string) {
  const { data } = await api.patch(`/stores/${storeId}/toggle-status`);
  return data;
}
