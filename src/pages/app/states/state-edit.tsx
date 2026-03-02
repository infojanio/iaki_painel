import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateState } from "@/services/states";
import { api } from "@/lib/axios";

const UFS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export function StateEdit() {
  const { stateId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [uf, setUf] = useState("");

  useEffect(() => {
    async function load() {
      if (!stateId) return;

      try {
        const { data } = await api.get(`/states/${stateId}`);

        setName(data.name);
        setUf(data.uf);
      } catch (err: any) {
        console.log("ERRO:", err.response?.data);
      }
    }

    load();
  }, [stateId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stateId) return;

    await updateState(stateId, { name, uf });
    navigate("/states");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-bold">Editar Estado</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full"
        placeholder="Nome do estado"
      />

      <select
        value={uf}
        onChange={(e) => setUf(e.target.value)}
        className="border p-2 w-full"
      >
        <option value="">Selecione a UF</option>
        {UFS.map((sigla) => (
          <option key={sigla} value={sigla}>
            {sigla}
          </option>
        ))}
      </select>

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Atualizar
      </button>
    </form>
  );
}
