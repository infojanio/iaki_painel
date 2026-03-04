import { api } from "@/lib/axios";

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link?: string | null;
  isActive: boolean;
  position?: number | null;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateBannerPayload = {
  title: string;
  imageUrl: string;
  link?: string;
  isActive?: boolean;
  position?: number;
  storeId: string;
};

// ✅ permite atualizar storeId e isActive
export type UpdateBannerPayload = Partial<CreateBannerPayload>;

export async function getBanners() {
  const { data } = await api.get<Banner[]>("/banners");
  return data;
}

export async function getBannerById(bannerId: string) {
  const { data } = await api.get<Banner>(`/banners/${bannerId}`);
  return data;
}

export async function createBanner(payload: CreateBannerPayload) {
  const { data } = await api.post<Banner>("/banners", payload);
  return data;
}

export async function updateBanner(
  bannerId: string,
  payload: UpdateBannerPayload,
) {
  const { data } = await api.patch<Banner>(`/banners/${bannerId}`, payload);
  return data;
}

export async function deleteBanner(bannerId: string) {
  await api.delete(`/banners/${bannerId}`);
}
