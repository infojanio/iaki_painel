// src/api/sign-in.ts
import { api } from "@/lib/axios";

interface SignInRequest {
  email: string;
  password: string;
}

export default async function signIn({ email, password }: SignInRequest) {
  const response = await api.post("/sessions", { email, password });

  const { accessToken, refreshToken, user } = response.data;

  // Salva os dados no localStorage
  localStorage.setItem("token", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("user", JSON.stringify(user));

  // 🔐 Define o token globalmente no axios
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  return { user, token: accessToken, refreshToken };
}
