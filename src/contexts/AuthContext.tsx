import { createContext, useContext, useEffect, useState } from "react";

import { api } from "@/lib/axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "USER";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  signOut: () => void;
  signIn: (data: { user: User; accessToken: string }) => void;
}

const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Erro ao recuperar usuário:", error);
        signOut();
      }
    }
  }, []);

  function signOut() {
    localStorage.clear();
    setUser(null);
    delete api.defaults.headers.common.Authorization;
    window.location.href = "/sign-in";
  }

  function signIn({ user, accessToken }: { user: User; accessToken: string }) {
    localStorage.setItem("token", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signOut,
        signIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Mantenha fora do componente, mas após a definição de AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
