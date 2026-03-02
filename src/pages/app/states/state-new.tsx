import { useState } from "react";
import { createState } from "@/services/states";
import { useNavigate } from "react-router-dom";

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

export function StateNew() {
  const [name, setName] = useState("");
  const [uf, setUf] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await createState({ name, uf });

    navigate("/states");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-bold">Novo Estado</h1>

      <input
        placeholder="Nome do estado"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full"
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

      <button className="bg-green-600 text-white px-4 py-2 rounded">
        Salvar
      </button>
    </form>
  );
}
