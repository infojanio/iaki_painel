// src/pages/products/ProductForm.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  cashback_percentage: number;
  subcategory_id?: string;
  status?: boolean;
};

export function ProductForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<ProductFormData>();

  const imageUrl = watch("image");

  const { mutateAsync: createProduct } = useMutation({
    mutationFn: async (data: ProductFormData) => {
      await api.post("/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate("/produtos");
    },
  });

  async function onSubmit(data: ProductFormData) {
    const payload = {
      ...data,
      price: Number(data.price),
      quantity: Number(data.quantity),
      cashback_percentage: Number(data.cashback_percentage),
      subcategory_id: data.subcategory_id || undefined,
    };
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
      <h1 className="text-2xl font-bold mb-4">Adicionar Produto</h1>
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
          <label className="block text-sm font-semibold">
            Estoque (quantidade)
          </label>
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
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {isSubmitting ? "Salvando..." : "Salvar Produto"}
        </button>
      </form>
    </div>
  );
}
