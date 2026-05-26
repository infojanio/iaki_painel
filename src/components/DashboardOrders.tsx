import { LatestOrdersTable } from "@/pages/app/dashboard/charts/LatestOrdersTable";
import { PendingOrdersTable } from "@/pages/app/dashboard/charts/PendingOrdersTable";

export function DashboardOrders() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="bg-white border rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Últimos pedidos</h2>

        <LatestOrdersTable />
      </div>

      <div className="bg-white border rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Pedidos pendentes</h2>

        <PendingOrdersTable />
      </div>
    </div>
  );
}
