import { AlertTriangle } from "lucide-react";

export function DashboardAlerts() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="border rounded-2xl bg-yellow-50 border-yellow-200 p-5">
        <div className="flex gap-3">
          <AlertTriangle className="text-yellow-600" />

          <div>
            <h3 className="font-semibold text-yellow-800">
              Resgates pendentes
            </h3>

            <p className="text-sm text-yellow-700 mt-1">
              Existem clientes aguardando aprovação de brindes.
            </p>
          </div>
        </div>
      </div>

      <div className="border rounded-2xl bg-blue-50 border-blue-200 p-5">
        <div className="flex gap-3">
          <AlertTriangle className="text-blue-600" />

          <div>
            <h3 className="font-semibold text-blue-800">Fidelização ativa</h3>

            <p className="text-sm text-blue-700 mt-1">
              Seu sistema de recompensas está ativo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
