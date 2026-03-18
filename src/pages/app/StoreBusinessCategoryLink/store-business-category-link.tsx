import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { getBusinessCategories } from "@/services/business-categories";
import {
  getStoreBusinessCategoriesByCategory,
  linkStoreToBusinessCategory,
} from "@/services/store-business-category";

export function StoreBusinessCategoryLinkPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [linkedStores, setLinkedStores] = useState<any[]>([]);

  async function loadInitial() {
    const { data: storesData } = await api.get("/stores");
    const categoriesData = await getBusinessCategories();

    setStores(
      Array.isArray(storesData) ? storesData : (storesData?.stores ?? []),
    );
    setCategories(categoriesData);
  }

  async function loadLinked(categoryId: string) {
    const data = await getStoreBusinessCategoriesByCategory(categoryId);
    setLinkedStores(data);
  }

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (categoryId) {
      loadLinked(categoryId);
    }
  }, [categoryId]);

  async function handleLink(e: React.FormEvent) {
    e.preventDefault();

    if (!categoryId || !storeId) {
      alert("Selecione a categoria e a loja.");
      return;
    }

    await linkStoreToBusinessCategory({
      categoryId,
      storeId,
    });

    setStoreId("");
    loadLinked(categoryId);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">
        Vincular Categoria de Negócio à Loja
      </h1>

      <form onSubmit={handleLink} className="space-y-4">
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

        <select
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">Selecione a Loja</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Vincular
        </button>
      </form>

      {categoryId && (
        <div>
          <h2 className="font-semibold mt-6">Lojas vinculadas</h2>

          <ul className="mt-2 space-y-2">
            {linkedStores.map((item) => (
              <li
                key={item.id ?? item.storeId}
                className="border p-2 rounded bg-gray-50"
              >
                {item.store?.name ?? item.name ?? item.storeId}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
