import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";

import { getStoreById } from "@/services/stores";
import { StoreDeliverySettings } from "@/components/StoreDeliverySettings";

export function StoreDeliveryPage() {
  const { id } = useParams<{ id: string }>();

  const {
    data: store,
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["stores", id, "delivery"],
    queryFn: () => {
      if (!id) {
        throw new Error("ID da loja não informado.");
      }

      return getStoreById(id);
    },
    enabled: Boolean(id),
  });

  if (!id) {
    return (
      <p role="alert" className="text-red-600">
        ID da loja inválido.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link
          to="/stores"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Voltar para lojas
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Entrega e pagamento
        </h1>

        {store && <p className="mt-2 text-sm text-slate-600">{store.name}</p>}
      </header>

      {isPending && (
        <div
          role="status"
          className="flex items-center gap-3 py-12 text-sm text-slate-500"
        >
          <Loader2 size={22} className="animate-spin" aria-hidden="true" />
          Carregando configuração...
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm text-red-700">
            Não foi possível carregar a configuração da loja.
          </p>

          <button
            type="button"
            onClick={() => void refetch()}
            className="mt-3 text-sm font-semibold text-red-800 underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!isPending && !isError && store && (
        <>
          {!store.isActive && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Esta loja está inativa. Salvar a configuração de entrega não ativa
              o estabelecimento.
            </p>
          )}

          <StoreDeliverySettings
            key={store.id}
            storeId={store.id}
            initialSettings={{
              deliveryEnabled: store.deliveryEnabled ?? false,
              deliveryWhatsapp: store.deliveryWhatsapp ?? null,
              deliveryPaymentMethods: store.deliveryPaymentMethods ?? [],
            }}
          />
        </>
      )}
    </div>
  );
}
