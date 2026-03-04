import { NavLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";

export function Sidebar() {
  const { user, signOut } = useAuth();

  const role = user?.role;

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-4">
      <h2 className="text-xl font-bold mb-6">IAki Painel</h2>

      {/* DASHBOARD */}
      <div className="mb-6">
        <NavLink to="/dashboard" className="hover:underline">
          🏠 Dashboard
        </NavLink>
      </div>

      {/* ================= SUPER ADMIN ================= */}
      {role === "SUPER_ADMIN" && (
        <>
          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-2">🌎 Estrutura</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <NavLink to="/states">Estados</NavLink>
              </li>
              <li>
                <NavLink to="/cities">Cidades</NavLink>
              </li>
              <li>
                <NavLink to="/business-categories">Ramo de Negócio</NavLink>
              </li>
              <li>
                <NavLink to="/business-categories-cities">
                  Vincular ↔ Cidade/Negócio
                </NavLink>
              </li>
              <li>
                <NavLink to="/stores">Lojas</NavLink>
              </li>
              <li>
                <NavLink to="/store-business-categories">
                  Loja ↔ Categoria
                </NavLink>
              </li>
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-2">📢 Mídia</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <NavLink to="/banners">Banners</NavLink>
              </li>
              <li>
                <NavLink to="/reels">Reels</NavLink>
              </li>
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-2">👥 Usuários</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <NavLink to="/users/admins">Administradores</NavLink>
              </li>
              <li>
                <NavLink to="/users">Clientes</NavLink>
              </li>
            </ul>
          </div>
        </>
      )}

      {/* ================= ADMIN LOJA ================= */}
      {role === "ADMIN" && (
        <>
          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-2">🛒 Produtos</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <NavLink to="/products">Listar</NavLink>
              </li>
              <li>
                <NavLink to="/products/create">Criar</NavLink>
              </li>
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-2">📦 Pedidos</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <NavLink to="/orders">Listar</NavLink>
              </li>
              <li>
                <NavLink to="/orders/validate">Validar</NavLink>
              </li>
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-2">💰 Pontos & Cashback</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <NavLink to="/rewards">Recompensas</NavLink>
              </li>
              <li>
                <NavLink to="/redemptions">Resgates</NavLink>
              </li>
            </ul>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold text-sm mb-2">📂 Categorias</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <NavLink to="/categories">Categorias</NavLink>
              </li>
              <li>
                <NavLink to="/subcategories">Subcategorias</NavLink>
              </li>
            </ul>
          </div>

          <div className="mb-4">
            <NavLink to="/stock">📊 Estoque</NavLink>
          </div>
        </>
      )}

      {/* SAIR */}
      <div className="mt-8">
        <Button variant="ghost" size="sm" onClick={signOut}>
          ⛔ Sair
        </Button>
      </div>
    </aside>
  );
}
