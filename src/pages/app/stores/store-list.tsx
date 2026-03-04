import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { getStores, toggleStoreStatus, Store } from "@/services/stores";

export function StoreList() {
  const queryClient = useQueryClient();

  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: getStores,
  });

  const { mutateAsync: toggleStatus, isPending } = useMutation({
    mutationFn: async (storeId: string) => toggleStoreStatus(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });

  async function handleToggle(store: Store) {
    const ok = confirm(
      `Deseja ${store.isActive ? "DESATIVAR" : "ATIVAR"} a loja "${store.name}"?`,
    );
    if (!ok) return;

    await toggleStatus(store.id);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lojas</h1>

        <Link
          to="/stores/new"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ➕ Nova Loja
        </Link>
      </div>

      {isLoading && <p>Carregando...</p>}

      {!!stores?.length && (
        <div className="overflow-auto border rounded">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border-b text-left">Avatar</th>
                <th className="p-3 border-b text-left">Nome</th>
                <th className="p-3 border-b text-left">Status</th>
                <th className="p-3 border-b text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">
                    {s.avatar ? (
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-10 h-10 rounded object-cover border"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-200 border" />
                    )}
                  </td>
                  <td className="p-3 border-b">{s.name}</td>
                  <td className="p-3 border-b">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        s.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {s.isActive ? "ATIVA" : "INATIVA"}
                    </span>
                  </td>
                  <td className="p-3 border-b">
                    <div className="flex justify-end gap-3">
                      <Link
                        to={`/stores/edit/${s.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Editar
                      </Link>
                      <button
                        disabled={isPending}
                        onClick={() => handleToggle(s)}
                        className="text-gray-700 hover:underline disabled:opacity-60"
                      >
                        {s.isActive ? "Desativar" : "Ativar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && (!stores || stores.length === 0) && (
        <p className="text-gray-600">Nenhuma loja cadastrada.</p>
      )}
    </div>
  );
}
