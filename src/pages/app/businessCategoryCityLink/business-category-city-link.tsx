import { useEffect, useState } from "react";
import { getCities } from "@/services/cities";
import { getBusinessCategories } from "@/services/business-categories";
import {
  linkBusinessCategoryToCity,
  getBusinessCategoriesByCity,
} from "@/services/business-category-city";

export function BusinessCategoryCityLink() {
  const [cities, setCities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cityId, setCityId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [linkedCategories, setLinkedCategories] = useState<any[]>([]);

  async function loadInitial() {
    const citiesData = await getCities();
    const categoriesData = await getBusinessCategories();

    setCities(citiesData);
    setCategories(categoriesData);
  }

  async function loadLinked(cityId: string) {
    const data = await getBusinessCategoriesByCity(cityId);
    setLinkedCategories(data);
  }

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (cityId) {
      loadLinked(cityId);
    }
  }, [cityId]);

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();

    await linkBusinessCategoryToCity({
      businessCategoryId: categoryId,
      cityId,
    });

    setCategoryId("");
    loadLinked(cityId);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">
        Vincular Categoria de Negócio à Cidade
      </h1>

      <form onSubmit={handleLink} className="space-y-4">
        <select
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Selecione a Cidade</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Selecione a Categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Vincular
        </button>
      </form>

      {cityId && (
        <div>
          <h2 className="font-semibold mt-6">Categorias vinculadas</h2>

          <ul className="mt-2 space-y-2">
            {linkedCategories.map((cat) => (
              <li key={cat.id} className="border p-2 rounded bg-gray-50">
                {cat.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
