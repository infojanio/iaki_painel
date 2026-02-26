// src/components/Sidebar.tsx
import { NavLink } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";

import { Button } from "./ui/button";

export function Sidebar() {
  const { signOut } = useAuth();

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-4">
      <h2 className="text-xl font-bold mb-6">Menu</h2>
      <div className="mb-6">
        <li>
          <NavLink to="/" className="hover:underline">
            🔙 Início
          </NavLink>
        </li>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-sm mb-2">🛒 Produtos</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <NavLink to="/produtos/novo" className="hover:underline">
              ➕ Novo
            </NavLink>
          </li>
          <li>
            <NavLink to="/produtos" className="hover:underline">
              🔎 Editar / Excluir
            </NavLink>
          </li>
          {/* 
          <li>
            <NavLink to="/produtos/todos" className="hover:underline">
              🧾 Lista Completa
            </NavLink>
          </li>
          */}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2 mt-8">🗂 Categorias</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <NavLink to="/categorias/novo" className="hover:underline">
              ➕ Adicionar
            </NavLink>
          </li>
          <li>
            <NavLink to="/categorias/todos" className="hover:underline">
              📝 Editar
            </NavLink>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2 mt-8">📤 SubCategorias</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <NavLink to="/subcategorias/novo" className="hover:underline">
              ➕ Adicionar
            </NavLink>
          </li>
          <li>
            <NavLink to="/subcategorias/todos" className="hover:underline">
              📝 Editar
            </NavLink>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2 mt-8">📦 Pedidos</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <NavLink to="/pedidos/validar" className="hover:underline">
              ✅ Aprovar
            </NavLink>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2 mt-8">📢 Banners</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <NavLink to="/banners/novo" className="hover:underline">
              ➕ Adicionar
            </NavLink>
          </li>
          <li>
            <NavLink to="/banners/todos" className="hover:underline">
              📝 Editar / Excluir
            </NavLink>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2 mt-8">🎬 Reels</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <NavLink to="/reels/novo" className="hover:underline">
              ➕ Adicionar
            </NavLink>
          </li>
          <li>
            <NavLink to="/reels/todos" className="hover:underline">
              📝 Editar / Excluir
            </NavLink>
          </li>
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-2 mt-8"> </h3>
        <ul className="space-y-1 text-sm">
          <li>
            <Button variant="ghost" size="sm" onClick={signOut}>
              ⛔ Sair
            </Button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
