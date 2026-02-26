// src/pages/ProductNew.tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { api } from "@/lib/axios";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

type ProductFormData = {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
  store_id: string;
  subcategory_id: string;
  cashback_percentage: number;
};

type Store = {
  id: string;
  name: string;
};

type Subcategory = {
  id: string;
  name: string;
};

export function ProductNew() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<ProductFormData>();

  const imageUrl = watch("image");

  const { data: stores = [] } = useQuery<Store[]>({
    queryKey: ["stores"],
    queryFn: async () => {
      const response = await api.get("/stores");
      return Array.isArray(response.data)
        ? response.data
        : response.data.stores ?? []; // prettier-ignore
    },
  });

  const { data: subcategories = [] } = useQuery<Subcategory[]>({
    queryKey: ["subcategories"],
    queryFn: async () => {
      const response = await api.get("/subcategories");
      return Array.isArray(response.data)
        ? response.data
        : response.data.subcategories ?? []; // prettier-ignore
    },
  });

  const { mutateAsync: createProduct } = useMutation({
    mutationFn: async (data: ProductFormData) => {
      await api.post("/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      alert("✅ Cadastrado com sucesso!");
      navigate("/produtos");
    },
  });

  async function onSubmit(data: ProductFormData) {
    const payload = {
      ...data,
      price: Number(data.price),
      quantity: Number(data.quantity),
      cashback_percentage: Number(data.cashback_percentage),
    };
    console.log("🔍 Enviando dados para criação:", payload);

    await createProduct(payload);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadToCloudinary(file);
    setValue("image", url);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Novo Produto</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold">Nome</label>
          <input
            {...register("name")}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Loja</label>
          <select
            {...register("store_id")}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Selecione uma Loja</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold">Subcategoria</label>
          <select
            {...register("subcategory_id")}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Selecione uma subcategoria</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold">Descrição</label>
          <textarea
            {...register("description")}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Preço</label>
          <input
            type="number"
            step="0.01"
            {...register("price")}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Estoque</label>
          <input
            type="number"
            {...register("quantity")}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Cashback (%)</label>
          <input
            type="number"
            step="0.1"
            {...register("cashback_percentage")}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold">Imagem</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block mt-1"
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-32 h-32 object-cover mt-2 rounded border"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isSubmitting ? "Salvando..." : "Criar produto"}
        </button>
      </form>
    </div>
  );
}
