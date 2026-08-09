import { useState } from "react";

import { FileDown, Loader2, ShieldCheck } from "lucide-react";

import { downloadStoreAuditReport } from "@/services/reports";

export function AuditReport() {
  const [from, setFrom] = useState("");

  const [to, setTo] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    try {
      setLoading(true);

      await downloadStoreAuditReport({
        from: from || undefined,

        to: to || undefined,
      });
    } catch (error: any) {
      alert(
        error?.response?.data?.message ?? "Não foi possível gerar o relatório.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-purple-100 p-3">
          <ShieldCheck className="h-6 w-6 text-purple-700" />
        </div>

        <div>
          <h2 className="text-lg font-bold">Relatório de auditoria</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Gere uma fotografia dos pedidos, pontos, brindes, resgates e
            estoques da sua loja.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Data inicial</label>

          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="h-11 w-full rounded-xl border px-3"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Data final</label>

          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="h-11 w-full rounded-xl border px-3"
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Deixe as datas vazias para gerar o relatório de todo o histórico.
      </p>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Gerando relatório...
          </>
        ) : (
          <>
            <FileDown className="h-5 w-5" />
            Gerar relatório PDF
          </>
        )}
      </button>
    </div>
  );
}
