import { OrdersByMonthChart } from "@/pages/app/dashboard/charts/OrdersByMonthChart";
import { TopProductsTable } from "@/pages/app/dashboard/charts/TopProductsTable";

export function DashboardCharts() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 bg-white border rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Pedidos por mês</h2>

        <OrdersByMonthChart />
      </div>

      <div className="bg-white border rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold mb-4">Produtos em destaque</h2>

        <TopProductsTable />
      </div>
    </div>
  );
}
