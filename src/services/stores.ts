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
  deliveryEnabled?: boolean;
  deliveryWhatsapp?: string | null;
  deliveryPaymentMethods?: DeliveryPaymentMethod[];
}

export type StoreCreatePayload = {
  name: string;
  slug?: string;
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

export const DELIVERY_PAYMENT_METHODS = [
  "Pix na entrega",
  "Dinheiro na entrega",
  "Cartão de débito na entrega",
  "Cartão de crédito na entrega",
] as const;

export type DeliveryPaymentMethod = (typeof DELIVERY_PAYMENT_METHODS)[number];

export interface StoreDeliverySettings {
  deliveryEnabled: boolean;
  deliveryWhatsapp: string | null;
  deliveryPaymentMethods: DeliveryPaymentMethod[];
}

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

export async function updateStoreDeliverySettings(
  storeId: string,
  payload: StoreDeliverySettings,
) {
  const { data } = await api.patch<{
    store: StoreDeliverySettings & { id: string };
  }>(`/stores/${storeId}/delivery-settings`, payload);

  return data.store;
}
