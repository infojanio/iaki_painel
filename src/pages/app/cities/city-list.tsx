import { useEffect, useState } from "react";
import { getCities, deleteCity, City } from "@/services/cities";
import { useNavigate } from "react-router-dom";

export function CityList() {
  const [cities, setCities] = useState<City[]>([]);
  const navigate = useNavigate();

  async function load() {
    const data = await getCities();
    setCities(data);
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja realmente excluir?")) return;
    await deleteCity(id);
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
          onClick={() => navigate("/cities/new")}
        >
          + Nova Cidade
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
          {cities.map((city) => (
            <tr key={city.id}>
              <td className="border p-2">{city.name}</td>
              <td className="border p-2 space-x-2">
                <button
                  className="text-blue-600"
                  onClick={() => navigate(`/cities/edit/${city.id}`)}
                >
                  Editar
                </button>
                <button
                  className="text-red-600"
                  onClick={() => handleDelete(city.id)}
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
