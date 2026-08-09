import {
  LayoutDashboard,
  MapPinned,
  Building2,
  Store,
  Package,
  Layers3,
  Megaphone,
  Clapperboard,
  CreditCard,
  Users,
  Gift,
  BadgePercent,
  History,
  Settings,
  LogOut,
  ChevronRight,
  FolderDownIcon,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";

function SidebarLink({
  to,
  icon: Icon,
  label,
  end = false,
}: {
  to: string;
  icon: any;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-green-600 text-white shadow-lg"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`
      }
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>

      <ChevronRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
    </NavLink>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </h3>

      <div className="space-y-1">{children}</div>
    </div>
  );
}

export function Sidebar() {
  const { user, signOut } = useAuth();

  const role = user?.role;

  return (
    <aside className="w-72 h-screen bg-[#0F172A] border-r border-slate-800 flex flex-col sticky top-0">
      {/* HEADER */}

      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-green-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">I</span>
          </div>

          <div>
            <h1 className="text-lg font-bold text-white">IAki Painel</h1>

            <p className="text-xs text-gray-400">Marketplace & Fidelização</p>
          </div>
        </div>
      </div>

      {/* USER */}

      <div className="px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
            {user?.name?.charAt(0)}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.name}
            </p>

            <p className="text-xs text-gray-400 truncate">
              {role === "SUPER_ADMIN" ? "Super Administrador" : "Administrador"}
            </p>
          </div>
        </div>
      </div>

      {/* MENU */}

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {/* DASHBOARD */}

        <SidebarSection title="Painel">
          <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" />
        </SidebarSection>

        {/* SUPER ADMIN */}

        {role === "SUPER_ADMIN" && (
          <>
            <SidebarSection title="Estrutura">
              <SidebarLink to="/states" icon={MapPinned} label="Estados" />

              <SidebarLink to="/cities" icon={Building2} label="Cidades" />

              <SidebarLink
                to="/business-categories"
                icon={Store}
                label="Ramos de Negócio"
              />

              <SidebarLink to="/stores" icon={Store} label="Lojas" />

              <SidebarSection title="Vinculação">
                <SidebarLink
                  to="/business-categories-cities"
                  icon={Store}
                  label="Cidade/Negócio"
                />

                <SidebarLink
                  to="/store-business-categories"
                  icon={Store}
                  label="Negócio/Loja"
                />
              </SidebarSection>
            </SidebarSection>

            <SidebarSection title="Categorias">
              <SidebarLink to="/categories" icon={Layers3} label="Categorias" />

              <SidebarLink
                to="/subcategories"
                icon={Layers3}
                label="Subcategorias"
              />
            </SidebarSection>

            <SidebarSection title="Cobrança">
              <SidebarLink to="/plans" icon={CreditCard} label="Planos" />

              <SidebarLink
                to="/subscriptions"
                icon={BadgePercent}
                label="Assinaturas"
              />
            </SidebarSection>

            <SidebarSection title="Usuários">
              <SidebarLink to="/users" icon={Users} label="Clientes" />
            </SidebarSection>
          </>
        )}

        {/* ADMIN */}

        {role === "ADMIN" && (
          <>
            <SidebarSection title="Assinatura">
              <SidebarLink
                to="/plans/subscribe"
                icon={CreditCard}
                label="Meu Plano"
              />
            </SidebarSection>

            <SidebarSection title="Produtos">
              <SidebarLink to="/products" icon={Package} label="Produtos" />
            </SidebarSection>

            <SidebarSection title="Publicidade">
              <SidebarLink to="/banners" icon={Megaphone} label="Banners" />
              <SidebarLink to="/reels" icon={Clapperboard} label="Reels" />
            </SidebarSection>

            <SidebarSection title="Vinculação">
              <SidebarLink
                to="/categories-by-store"
                icon={Megaphone}
                label="Categoria"
              />
            </SidebarSection>

            <SidebarSection title="Aprovar">
              <SidebarLink
                to="/orders/validate"
                icon={Megaphone}
                label="Pedidos"
              />
            </SidebarSection>

            <SidebarSection title="Fidelização">
              <SidebarLink
                to="/store-rewards"
                icon={Gift}
                label="Recompensas"
              />

              <SidebarLink
                to="/redemptions"
                icon={BadgePercent}
                label="Pendentes"
                end
              />

              <SidebarLink
                to="/redemptions/history"
                icon={History}
                label="Histórico"
              />
            </SidebarSection>

            <SidebarSection title="Configurações">
              <SidebarLink
                to="/reports"
                icon={FolderDownIcon}
                label="Relatórios"
              />
            </SidebarSection>
          </>
        )}
      </div>

      {/* FOOTER */}

      <div className="p-4 border-t border-slate-800 bg-[#111827]">
        <Button
          onClick={signOut}
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-300 hover:bg-red-500 hover:text-white rounded-xl"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
