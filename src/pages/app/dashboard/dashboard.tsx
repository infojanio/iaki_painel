import { DashboardAlerts } from "@/components/DashboardAlerts";
import { DashboardCharts } from "@/components/DashboardCharts";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardKPIs } from "@/components/DashboardKPIs";
import { DashboardLoyalty } from "@/components/DashboardLoyalty";
import { DashboardOrders } from "@/components/DashboardOrders";
import { Helmet } from "react-helmet-async";

export function Dashboard() {
  return (
    <>
      <Helmet title="Dashboard" />

      <div className="space-y-6">
        <DashboardHeader />

        <DashboardAlerts />

        <DashboardKPIs />

        <DashboardCharts />

        <DashboardOrders />

        <DashboardLoyalty />
      </div>
    </>
  );
}
