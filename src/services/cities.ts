import { api } from "@/lib/axios";

export interface City {
  id: string;
  name: string;
  stateId: string;
  createdAt: string;
}

export async function getCities() {
  const { data } = await api.get<City[]>("/cities");
  return data;
}

export async function createCity(payload: { name: string; stateId: string }) {
  const { data } = await api.post<City>("/cities", payload);
  return data;
}

export async function updateCity(
  cityId: string,
  payload: {
    name?: string;
    stateId?: string;
  },
) {
  const { data } = await api.patch<City>(`/cities/${cityId}`, payload);
  return data;
}

export async function deleteCity(cityId: string) {
  await api.delete(`/cities/${cityId}`);
}
