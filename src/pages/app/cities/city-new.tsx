import { useEffect, useState } from "react";
import { createCity } from "@/services/cities";
import { getStates, State } from "@/services/states";
import { useNavigate } from "react-router-dom";

export function CityNew() {
  const [name, setName] = useState("");
  const [stateId, setStateId] = useState("");
  const [states, setStates] = useState<State[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadStates() {
      const data = await getStates();
      setStates(data);
    }
    loadStates();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createCity({ name, stateId });
    navigate("/cities");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-bold">Nova Cidade</h1>

      <input
        placeholder="Nome da cidade"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full"
      />

      <select
        value={stateId}
        onChange={(e) => setStateId(e.target.value)}
        className="border p-2 w-full"
      >
        <option value="">Selecione o Estado</option>
        {states.map((state) => (
          <option key={state.id} value={state.id}>
            {state.name} - {state.uf}
          </option>
        ))}
      </select>

      <button className="bg-green-600 text-white px-4 py-2 rounded">
        Salvar
      </button>
    </form>
  );
}