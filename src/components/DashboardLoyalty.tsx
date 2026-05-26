import { TopUsersTable } from "@/pages/app/dashboard/charts/TopUsersTable";

export function DashboardLoyalty() {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm">
      <h2 className="font-semibold mb-4">Clientes fidelizados</h2>

      <TopUsersTable />
    </div>
  );
}
