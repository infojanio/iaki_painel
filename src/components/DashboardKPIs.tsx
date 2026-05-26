import { useQuery } from "@tanstack/react-query";

import {
  ShoppingBag,
  Users,
  Package,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import { getDashboardSummary } from "@/services/dashboard";

function Card({ title, value, icon: Icon }: any) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>

          <h2 className="text-3xl font-bold mt-2">{value}</h2>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
          <Icon className="text-green-600" />
        </div>
      </div>
    </div>
  );
}

export function DashboardKPIs() {
  const { data } = useQuery({
    queryKey: ["dashboard-summary"],

    queryFn: getDashboardSummary,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Card
        title="Pedidos Hoje"
        value={data?.todayOrders ?? 0}
        icon={ShoppingBag}
      />

      <Card
        title="Pedidos Semana"
        value={data?.weekOrders ?? 0}
        icon={ShoppingBag}
      />

      <Card
        title="Pedidos Pendentes"
        value={data?.pendingOrders ?? 0}
        icon={Clock3}
      />

      <Card
        title="Produtos Ativos"
        value={data?.activeProducts ?? 0}
        icon={Package}
      />

      <Card
        title="Brindes Entregues"
        value={data?.confirmedRedemptions ?? 0}
        icon={CheckCircle2}
      />

      <Card title="Clientes" value={data?.totalUsers ?? 0} icon={Users} />
    </div>
  );
}
