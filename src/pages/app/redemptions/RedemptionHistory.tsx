import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { CheckCircle2, Gift, Loader2, Search } from "lucide-react";

import { getConfirmedRedemptions } from "@/services/redemptions";

type Redemption = {
  id: string;

  createdAt: string;

  usedAt?: string | null;

  status: string;

  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };

  reward: {
    id: string;
    title: string;
    pointsCost: number;
    image?: string | null;
  };
};

export function RedemptionHistory() {
  const [search, setSearch] = useState("");

  const [startDate, setStartDate] = useState("");

  const [endDate, setEndDate] = useState("");

  const { data: redemptions, isLoading } = useQuery<Redemption[]>({
    queryKey: ["confirmed-redemptions"],

    queryFn: getConfirmedRedemptions,
  });

  /**
   * =========================
   * FILTERS
   * =========================
   */

  const filteredRedemptions = useMemo(() => {
    if (!redemptions) return [];

    return redemptions.filter((redemption) => {
      const clientName = redemption.user.name.toLowerCase();

      const matchesClient = clientName.includes(search.toLowerCase());

      const redemptionDate = new Date(
        redemption.usedAt ?? redemption.createdAt,
      );

      const matchesStart = startDate
        ? redemptionDate >= new Date(startDate)
        : true;

      const matchesEnd = endDate
        ? redemptionDate <= new Date(endDate + "T23:59:59")
        : true;

      return matchesClient && matchesStart && matchesEnd;
    });
  }, [redemptions, search, startDate, endDate]);

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold">Histórico de Resgates</h1>

        <p className="text-sm text-muted-foreground">
          Visualize os brindes já entregues aos clientes.
        </p>
      </div>

      {/* FILTERS */}

      <div className="bg-white border rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-base">Filtros</h2>

            <p className="text-sm text-muted-foreground">
              Busque resgates por cliente ou período.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* CLIENTE */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Cliente</label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

              <input
                type="text"
                placeholder="Nome do cliente"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded-xl pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* DATA INICIAL */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Data inicial</label>

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* DATA FINAL */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Data final</label>

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* EMPTY */}

      {!filteredRedemptions?.length && (
        <div className="border rounded-2xl p-10 text-center bg-white">
          <Gift className="mx-auto h-10 w-10 text-muted-foreground mb-3" />

          <h2 className="text-lg font-semibold">Nenhum resgate encontrado</h2>

          <p className="text-sm text-muted-foreground">
            Nenhum resultado para os filtros aplicados.
          </p>
        </div>
      )}

      {/* LIST */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredRedemptions?.map((redemption) => (
          <div
            key={redemption.id}
            className="border rounded-2xl overflow-hidden bg-white shadow-sm"
          >
            {/* IMAGE */}

            <div className="h-44 bg-muted">
              {redemption.reward?.image ? (
                <img
                  src={redemption.reward.image}
                  alt={redemption.reward.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Gift className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* CONTENT */}

            <div className="p-5 space-y-4">
              {/* STATUS */}

              <div className="flex items-center justify-between">
                <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Entregue
                </span>

                <span className="text-xs text-muted-foreground">
                  ⭐ {redemption.reward.pointsCost} pts
                </span>
              </div>

              {/* REWARD */}

              <div>
                <h2 className="font-semibold text-lg">
                  {redemption.reward.title}
                </h2>
              </div>

              {/* USER */}

              <div className="border rounded-xl p-3 bg-muted/20">
                <p className="text-xs text-muted-foreground mb-2">Cliente</p>

                <div className="flex items-center gap-3">
                  {redemption.user?.avatar ? (
                    <img
                      src={redemption.user.avatar}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted" />
                  )}

                  <div>
                    <p className="font-medium">{redemption.user.name}</p>

                    <p className="text-xs text-muted-foreground">
                      {redemption.user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* DATES */}

              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">
                  📅 Solicitação:{" "}
                  <strong>
                    {new Date(redemption.createdAt).toLocaleDateString("pt-BR")}
                  </strong>
                </p>

                {redemption.usedAt && (
                  <p className="text-green-700">
                    ✅ Entregue em{" "}
                    <strong>
                      {new Date(redemption.usedAt).toLocaleDateString("pt-BR")}
                    </strong>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
