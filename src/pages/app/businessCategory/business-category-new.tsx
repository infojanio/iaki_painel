import { useState } from "react";
import { createBusinessCategory } from "@/services/business-categories";
import { useNavigate } from "react-router-dom";

export function BusinessCategoryNew() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createBusinessCategory({ name });
    navigate("/business-categories");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-bold">Nova Categoria de Negócio</h1>

      <input
        placeholder="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full"
      />

      <button className="bg-green-600 text-white px-4 py-2 rounded">
        Salvar
      </button>
    </form>
  );
}
