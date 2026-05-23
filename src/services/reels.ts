import { api } from "@/lib/axios";

export interface Reel {
  id: string;
  title: string;

  imageUrl: string;

  link?: string | null;

  createdAt: string;
  updatedAt: string;
}

export type CreateReelPayload = {
  title: string;

  imageUrl: string;

  link?: string;
};

export type UpdateReelPayload = Partial<CreateReelPayload>;

/* =========================
   NORMALIZER
========================= */

function normalizeReel(raw: any): Reel {
  return {
    id: raw.id,

    title: raw.title,

    imageUrl: raw.imageUrl ?? raw.image_url ?? "",

    link: raw.link ?? null,

    createdAt: raw.createdAt ?? raw.created_at,

    updatedAt: raw.updatedAt ?? raw.updated_at,
  };
}

/* =========================
   LISTAR REELS ADMIN
========================= */

export async function getReelsByStore() {
  const response = await api.get("/reels/me");

  const reels =
    response.data?.data ?? response.data?.reels ?? response.data ?? [];

  return Array.isArray(reels) ? reels.map(normalizeReel) : [];
}

/* =========================
   LISTAR REELS PUBLICOS
========================= */

export async function getReels() {
  const response = await api.get("/reels");

  const reels =
    response.data?.data ?? response.data?.reels ?? response.data ?? [];

  return Array.isArray(reels) ? reels.map(normalizeReel) : [];
}

/* =========================
   DETALHE
========================= */

export async function getReelById(reelId: string) {
  const response = await api.get(`/reels/${reelId}`);

  const reel = response.data?.data ?? response.data;

  return normalizeReel(reel);
}

/* =========================
   CREATE
========================= */

export async function createReel(payload: CreateReelPayload) {
  const response = await api.post("/reels", payload);

  return response.data?.data ?? response.data;
}

/* =========================
   UPDATE
========================= */

export async function updateReel(reelId: string, payload: UpdateReelPayload) {
  const response = await api.patch(`/reels/${reelId}`, payload);

  return response.data?.data ?? response.data;
}

/* =========================
   DELETE
========================= */

export async function deleteReel(reelId: string) {
  await api.delete(`/reels/${reelId}`);
}
