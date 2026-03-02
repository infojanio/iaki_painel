import { useEffect, useState } from "react";
import {
  getBusinessCategories,
  deleteBusinessCategory,
  BusinessCategory,
} from "@/services/business-categories";
import { Link } from "react-router-dom";

export function BusinessCategoryList() {
  const [categories, setCategories] = useState<BusinessCategory[]>([]);

  async function load() {
    const data = await getBusinessCategories();
    setCategories(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Deseja excluir esta categoria?")) return;
    await deleteBusinessCategory(id);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Categorias de Negócio</h1>
        <Link
          to="/business-categories/new"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Nova Categoria
        </Link>
      </div>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Nome</th>
            <th className="p-2 border">Ações</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td className="p-2 border">{cat.name}</td>
              <td className="p-2 border space-x-2">
                <Link
                  to={`/business-categories/edit/${cat.id}`}
                  className="text-blue-600"
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-red-600"
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
