import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateCity } from "@/services/cities";
import { getStates, State } from "@/services/states";
import { api } from "@/lib/axios";

export function CityEdit() {
  const { cityId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [stateId, setStateId] = useState("");
  const [states, setStates] = useState<State[]>([]);

  useEffect(() => {
    async function load() {
      try {
        console.log("ID:", cityId);

        const statesData = await getStates();
        setStates(statesData);

        const { data } = await api.get(`/cities/${cityId}`);
        console.log("CITY DATA:", data);

        setName(data.name);
        setStateId(data.stateId);
      } catch (err: any) {
        console.log("ERRO:", err.response?.data);
      }
    }

    load();
  }, [cityId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cityId) return;

    await updateCity(cityId, { name, stateId });
    navigate("/cities");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-bold">Editar Cidade</h1>

      <input
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

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Atualizar
      </button>
    </form>
  );
}
