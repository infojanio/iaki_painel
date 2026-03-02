import { useEffect, useState } from "react";
import { getStates, deleteState, State } from "@/services/states";
import { useNavigate } from "react-router-dom";

export function StateList() {
  const [states, setState] = useState<State[]>([]);
  const navigate = useNavigate();

  async function load() {
    const data = await getStates();
    setState(data);
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir?")) return;
    await deleteState(id);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Cidades</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => navigate("/states/new")}
        >
          + Novo Estado
        </button>
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Nome</th>
            <th className="border p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {states.map((state) => (
            <tr key={state.id}>
              <td className="border p-2">{state.name}</td>
              <td className="border p-2 space-x-2">
                <button
                  className="text-blue-600"
                  onClick={() => navigate(`/states/edit/${state.id}`)}
                >
                  Editar
                </button>
                <button
                  className="text-red-600"
                  onClick={() => handleDelete(state.id)}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
