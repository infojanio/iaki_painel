import { Helmet } from "react-helmet-async";

import { ActiveProductsCard } from "./cards/ActiveProductsCard";
import { CashbackGeneratedCard } from "./cards/CashbackGeneratedCard";
import { CashbackUsedCard } from "./cards/CashbackUsedCard";
import { TotalUsersCard } from "./cards/TotalUsersCard";
import { CashbackByMonthChart } from "./charts/CashbackByMonthChart";
import { LatestOrdersTable } from "./charts/LatestOrdersTable";
import { PendingOrdersTable } from "./charts/PendingOrdersTable";
import { TopProductsTable } from "./charts/TopProductsTable";
import { TopUsersTable } from "./charts/TopUsersTable";
import { DayOrdersAmountCard } from "./filters/day-orders-amount-card";
import { WeekOrdersAmountCard } from "./filters/week-orders-amount-card";

export function Dashboard() {
  return (
    <>
      <Helmet title="Dashboard" />
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

        {/* Cards principais */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <TotalUsersCard />
          <WeekOrdersAmountCard />
          <DayOrdersAmountCard />

          <ActiveProductsCard />
          <CashbackGeneratedCard />
          <CashbackUsedCard />
        </div>

        {/* Gráficos e tabelas */}
        <div className="grid grid-cols-2 gap-4 xl:grid-cols-2">
          <CashbackByMonthChart />
          <LatestOrdersTable />
          <PendingOrdersTable />
          <TopUsersTable />
          <TopProductsTable />
        </div>
      </div>
    </>
  );
}
