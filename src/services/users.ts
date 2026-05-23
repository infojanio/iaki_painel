import { api } from "@/lib/axios";

export type UserItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  state: string | null;
  street: string | null;
  postalCode: string | null;
  cityId: string | null;
  storeId: string | null;
  createdAt: string;
};

type ListUsersParams = {
  page?: number;
  query?: string;
};

type ListUsersResponse = {
  users: UserItem[];
  meta: {
    page: number;
    perPage: number;
    totalCount: number;
    totalPages: number;
  };
};

export async function listUsers({
  page = 1,
  query = "",
}: ListUsersParams): Promise<ListUsersResponse> {
  const response = await api.get("/users", {
    params: {
      page,
      query,
    },
  });

  return response.data;
}
