import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coins,
  Gift,
  Hash,
  Loader2,
  Mail,
  Phone,
  Search,
  User,
} from "lucide-react";

import {
  approveRedemption,
  getPendingRedemptions,
  Redemption,
} from "@/services/redemptions";

function getShortCode(redemptionId: string) {
  return redemptionId.replace(/-/g, "").slice(0, 8).toUpperCase();
}

function normalizeText(value?: string | null) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Não informado";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data inválida";
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function maskCpf(cpf?: string | null) {
  if (!cpf) {
    return "Não informado";
  }

  const numbers = cpf.replace(/\D/g, "");

  if (numbers.length !== 11) {
    return cpf;
  }

  return `***.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-**`;
}

export function RedemptionsList() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");

  const [approvingId, setApprovingId] = useState<string | null>(null);

  const {
    data: redemptions = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery<Redemption[]>({
    queryKey: ["redemptions", "pending"],

    queryFn: getPendingRedemptions,

    /*
     * Mantém o painel atualizado enquanto
     * clientes fazem novas solicitações.
     */
    refetchInterval: 8000,
  });

  const approveMutation = useMutation({
    mutationFn: approveRedemption,

    onMutate: (redemptionId) => {
      setApprovingId(redemptionId);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["redemptions"],
      });
    },

    onError: (error: any) => {
      window.alert(
        error?.response?.data?.message ??
          error?.message ??
          "Não foi possível confirmar o resgate.",
      );
    },

    onSettled: () => {
      setApprovingId(null);
    },
  });

  const filteredRedemptions = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    if (!normalizedSearch) {
      return redemptions;
    }

    return redemptions.filter((redemption) => {
      const code = normalizeText(getShortCode(redemption.id));

      const fullId = normalizeText(redemption.id);

      const rewardTitle = normalizeText(redemption.reward?.title);

      const userName = normalizeText(redemption.user?.name);

      const userEmail = normalizeText(redemption.user?.email);

      const userCpf = normalizeText(redemption.user?.cpf);

      const userPhone = normalizeText(redemption.user?.phone);

      return (
        code.includes(normalizedSearch) ||
        fullId.includes(normalizedSearch) ||
        rewardTitle.includes(normalizedSearch) ||
        userName.includes(normalizedSearch) ||
        userEmail.includes(normalizedSearch) ||
        userCpf.includes(normalizedSearch) ||
        userPhone.includes(normalizedSearch)
      );
    });
  }, [redemptions, search]);

  function handleApprove(redemption: Redemption) {
    const code = getShortCode(redemption.id);

    const confirmed = window.confirm(
      [
        "Confirmar entrega do brinde?",
        "",
        `Código: ${code}`,
        `Cliente: ${redemption.user?.name ?? "Não informado"}`,
        `Brinde: ${redemption.reward?.title ?? "Não informado"}`,
        `Pontos: ${Number(redemption.points ?? 0)}`,
      ].join("\n"),
    );

    if (!confirmed) {
      return;
    }

    approveMutation.mutate(redemption.id);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />

          <span className="text-sm">Carregando resgates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-2 text-purple-700">
              <Gift className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Resgates pendentes
              </h1>

              <p className="text-sm text-muted-foreground">
                Confira os dados apresentados pelo cliente antes de confirmar a
                entrega.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border bg-white px-4 py-2">
            <p className="text-xs text-muted-foreground">Pendentes</p>

            <p className="text-xl font-bold">{redemptions.length}</p>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex h-10 items-center gap-2 rounded-xl border bg-white px-4 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Loader2
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Atualizar
          </button>
        </div>
      </div>

      {/* BUSCA */}

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por código, cliente, CPF ou brinde"
          className="h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
        />
      </div>

      {/* ERRO */}

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="font-medium text-red-700">
            Não foi possível carregar os resgates.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 text-sm font-semibold text-red-700 underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* EMPTY */}

      {!isError && filteredRedemptions.length === 0 && (
        <div className="rounded-2xl border bg-white p-10 text-center">
          <Gift className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

          <h2 className="text-lg font-semibold">
            {search ? "Nenhum resgate encontrado" : "Nenhum resgate pendente"}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? "Confira o código ou tente outro termo de busca."
              : "Quando clientes solicitarem brindes, eles aparecerão aqui."}
          </p>
        </div>
      )}

      {/* LIST */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {filteredRedemptions.map((redemption) => {
          const shortCode = getShortCode(redemption.id);

          const isApproving = approvingId === redemption.id;

          return (
            <article
              key={redemption.id}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm"
            >
              <div className="grid md:grid-cols-[280px_1fr]">
                {/* IMAGEM */}

                {/* IMAGEM DO BRINDE */}

                <div className="flex h-56 items-center justify-center bg-slate-50 p-4 md:h-auto md:min-h-[320px]">
                  {redemption.reward?.image ? (
                    <img
                      src={redemption.reward.image}
                      alt={redemption.reward.title ?? "Imagem do brinde"}
                      className="h-full max-h-72 w-full object-contain"
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";

                        const fallback = event.currentTarget
                          .nextElementSibling as HTMLElement | null;

                        if (fallback) {
                          fallback.style.display = "flex";
                        }
                      }}
                    />
                  ) : null}

                  <div
                    className={`h-full min-h-48 w-full items-center justify-center ${
                      redemption.reward?.image ? "hidden" : "flex"
                    }`}
                  >
                    <div className="text-center">
                      <Gift className="mx-auto h-12 w-12 text-muted-foreground" />

                      <p className="mt-2 text-sm text-muted-foreground">
                        Imagem não disponível
                      </p>
                    </div>
                  </div>
                </div>

                {/* CONTEÚDO */}

                <div className="space-y-5 p-5">
                  {/* STATUS E CÓDIGO */}

                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        <Clock3 className="h-3.5 w-3.5" />
                        Aguardando confirmação
                      </span>

                      <h2 className="mt-3 text-xl font-bold">
                        {redemption.reward?.title ?? "Brinde"}
                      </h2>

                      {redemption.reward?.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {redemption.reward.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CÓDIGO IGUAL AO MOBILE */}

                  <div className="rounded-2xl bg-purple-600 p-4 text-center text-white">
                    <p className="text-xs font-semibold uppercase tracking-wide text-purple-100">
                      Código apresentado pelo cliente
                    </p>

                    <p className="mt-2 text-3xl font-bold tracking-[0.25em]">
                      {shortCode}
                    </p>
                  </div>

                  {/* CLIENTE */}

                  <div className="rounded-xl border bg-muted/30 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Cliente
                    </p>

                    <div className="flex items-center gap-3">
                      {redemption.user?.avatar ? (
                        <img
                          src={redemption.user.avatar}
                          alt={redemption.user.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                          <User className="h-6 w-6" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="font-semibold">
                          {redemption.user?.name ?? "Cliente não informado"}
                        </p>

                        {redemption.user?.email && (
                          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />

                            {redemption.user.email}
                          </p>
                        )}

                        {redemption.user?.phone && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />

                            {redemption.user.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DADOS DA CONFERÊNCIA */}

                  <div className="divide-y rounded-xl border">
                    <DetailRow
                      icon={<User className="h-4 w-4" />}
                      label="CPF"
                      value={maskCpf(redemption.user?.cpf)}
                    />

                    <DetailRow
                      icon={<Coins className="h-4 w-4" />}
                      label="Pontos utilizados"
                      value={`${Number(redemption.points ?? 0)} pontos`}
                    />

                    <DetailRow
                      icon={<CalendarDays className="h-4 w-4" />}
                      label="Solicitado em"
                      value={formatDateTime(redemption.createdAt)}
                    />

                    <DetailRow
                      icon={<Hash className="h-4 w-4" />}
                      label="ID do resgate"
                      value={redemption.id}
                      small
                    />
                  </div>

                  {/* AÇÃO */}

                  <button
                    type="button"
                    disabled={isApproving}
                    onClick={() => handleApprove(redemption)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isApproving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5" />
                        Confirmar entrega
                      </>
                    )}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

type DetailRowProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  small?: boolean;
};

function DetailRow({ icon, label, value, small = false }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 p-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}

        <span>{label}</span>
      </div>

      <span
        className={`max-w-[60%] break-all text-right font-medium ${
          small ? "text-xs" : "text-sm"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
