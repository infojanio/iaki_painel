import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateBusinessCategory } from "@/services/business-categories";
import { api } from "@/lib/axios";

export function BusinessCategoryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");

  useEffect(() => {
    async function load() {
      if (!id) return;

      const { data } = await api.get(`/business-categories/${id}`);
      setName(data.name);
    }

    load();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;

    await updateBusinessCategory(id, { name });
    navigate("/business-categories");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-xl font-bold">Editar Categoria de Negócio</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 w-full"
      />

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Atualizar
      </button>
    </form>
  );
}
