import { api } from "@/lib/axios";

export interface State {
  id: string;
  name: string;
  uf: string;
  createdAt: string;
}

export async function getStates() {
  const { data } = await api.get<State[]>("/states");
  return data;
}

export async function createState(payload: { name: string; uf: string }) {
  const { data } = await api.post<State>("/states", payload);
  return data;
}

export async function updateState(
  stateId: string,
  payload: {
    name?: string;
    uf?: string;
  },
) {
  const { data } = await api.patch<State>(`/states/${stateId}`, payload);
  return data;
}

export async function deleteState(stateId: string) {
  await api.delete(`/states/${stateId}`);
}
