import { api } from "@/lib/axios";

export interface Reel {
  id: string;
  title: string;
  image_url: string;
  link?: string | null;
  created_at: string;
  updated_at: string;
}

export type CreateReelPayload = {
  title: string;
  image_url: string;
  link?: string;
};

export type UpdateReelPayload = Partial<CreateReelPayload>;

export async function getReels() {
  const { data } = await api.get<Reel[]>("/reels");
  return data;
}

export async function getReelsByStore() {
  const { data } = await api.get<Reel[]>("/reels/me");
  return data;
}

export async function getReelById(reelId: string) {
  const { data } = await api.get<Reel>(`/reels/${reelId}`);
  return data;
}

export async function createReel(payload: CreateReelPayload) {
  const { data } = await api.post<Reel>("/reels", payload);
  return data;
}

export async function updateReel(reelId: string, payload: UpdateReelPayload) {
  const { data } = await api.patch<Reel>(`/reels/${reelId}`, payload);
  return data;
}

export async function deleteReel(reelId: string) {
  await api.delete(`/reels/${reelId}`);
}
