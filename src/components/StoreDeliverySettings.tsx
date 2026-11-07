import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Truck } from "lucide-react";

import {
  DELIVERY_PAYMENT_METHODS,
  updateStoreDeliverySettings,
} from "@/services/stores";

import type {
  DeliveryPaymentMethod,
  StoreDeliverySettings as DeliverySettings,
} from "@/services/stores";

type Props = {
  storeId: string;
  initialSettings: DeliverySettings;
  disabled?: boolean;
};

function normalizeWhatsapp(value: string) {
  let number = value.replace(/\D/g, "");

  if (number.length === 10 || number.length === 11) {
    number = `55${number}`;
  }

  return number;
}

export function StoreDeliverySettings({
  storeId,
  initialSettings,
  disabled = false,
}: Props) {
  const queryClient = useQueryClient();

  const [enabled, setEnabled] = useState(initialSettings.deliveryEnabled);

  const [whatsapp, setWhatsapp] = useState(
    initialSettings.deliveryWhatsapp ?? "",
  );

  const [methods, setMethods] = useState<DeliveryPaymentMethod[]>([
    ...initialSettings.deliveryPaymentMethods,
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const busy = saving || disabled;

  function clearFeedback() {
    setError(null);
    setSuccess(false);
  }

  function toggleMethod(method: DeliveryPaymentMethod) {
    clearFeedback();

    setMethods((current) =>
      current.includes(method)
        ? current.filter((item) => item !== method)
        : [...current, method],
    );
  }

  async function handleSave() {
    if (busy) return;

    clearFeedback();

    const number = normalizeWhatsapp(whatsapp);

    if (number && !/^55\d{10,11}$/.test(number)) {
      setError("Informe um WhatsApp brasileiro válido com DDD.");
      return;
    }

    if (enabled && !number) {
      setError("Informe o WhatsApp para habilitar a entrega.");
      return;
    }

    if (enabled && methods.length === 0) {
      setError("Selecione ao menos uma forma de pagamento.");
      return;
    }

    setSaving(true);

    try {
      const saved = await updateStoreDeliverySettings(storeId, {
        deliveryEnabled: enabled,
        deliveryWhatsapp: number || null,
        deliveryPaymentMethods: methods,
      });

      setEnabled(saved.deliveryEnabled);
      setWhatsapp(saved.deliveryWhatsapp ?? "");
      setMethods([...saved.deliveryPaymentMethods]);
      setSuccess(true);

      // Atualiza as listagens que usam a chave já existente.
      void queryClient.invalidateQueries({
        queryKey: ["stores"],
      });
    } catch {
      setError(
        "Não foi possível salvar a entrega. Confira sua permissão e tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="rounded-lg bg-green-50 p-2 text-green-700">
          <Truck size={20} aria-hidden="true" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            Entrega pelo WhatsApp
          </h2>

          <p className="text-xs text-slate-500">
            Configure a solicitação de entrega no aplicativo.
          </p>
        </div>
      </div>

      <div className="space-y-5 p-5">
        <p className="rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-800">
          O cliente registra o pedido e abre uma solicitação pelo WhatsApp. A
          loja confirma disponibilidade, taxa, prazo e pagamento diretamente na
          conversa.
        </p>

        <fieldset disabled={busy} className="space-y-5">
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <span className="block text-sm font-semibold text-slate-800">
                Habilitar solicitação de entrega
              </span>

              <span className="mt-1 block text-xs text-slate-500">
                Exibe o botão para pedidos pendentes desta loja.
              </span>
            </div>

            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => {
                clearFeedback();
                setEnabled(event.target.checked);
              }}
              className="h-5 w-5 shrink-0 accent-green-600"
            />
          </label>

          <div>
            <label
              htmlFor={`delivery-whatsapp-${storeId}`}
              className="block text-sm font-medium text-slate-700"
            >
              WhatsApp da loja
            </label>

            <input
              id={`delivery-whatsapp-${storeId}`}
              type="tel"
              autoComplete="tel"
              value={whatsapp}
              maxLength={30}
              onChange={(event) => {
                clearFeedback();
                setWhatsapp(event.target.value);
              }}
              placeholder="(62) 99999-9999"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-slate-50"
            />

            <p className="mt-2 text-xs text-slate-500">
              Use um número confirmado para receber pedidos. Pode informar com
              DDD ou com +55 e DDD.
            </p>
          </div>

          <fieldset className="space-y-3">
            <legend className="mb-3 text-sm font-medium text-slate-700">
              Formas aceitas na entrega
            </legend>

            {DELIVERY_PAYMENT_METHODS.map((method) => (
              <label
                key={method}
                className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700"
              >
                <input
                  type="checkbox"
                  checked={methods.includes(method)}
                  onChange={() => toggleMethod(method)}
                  className="h-4 w-4 accent-green-600"
                />

                {method}
              </label>
            ))}

            <p className="text-xs leading-5 text-slate-500">
              A escolha do cliente informa uma preferência. Nenhum pagamento é
              processado pelo aplicativo.
            </p>
          </fieldset>
        </fieldset>

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {success && (
          <p
            role="status"
            className="rounded-xl bg-green-50 p-3 text-sm text-green-800"
          >
            Configuração de entrega salva com sucesso.
          </p>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleSave()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving && (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            )}

            {saving ? "Salvando entrega..." : "Salvar configuração de entrega"}
          </button>
        </div>
      </div>
    </section>
  );
}
