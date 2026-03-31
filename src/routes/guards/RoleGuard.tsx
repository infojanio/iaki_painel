import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoading } = useAuth(); // 🔥 precisa disso

  // 🟡 enquanto carrega → não faz nada
  if (isLoading) {
    return null; // ou spinner
  }

  // 🔴 não autenticado
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // 🔴 sem permissão
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
