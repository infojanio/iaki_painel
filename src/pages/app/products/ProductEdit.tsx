import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "@/lib/axios";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

type ProductFormData = {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  status: boolean;
  image?: string;
  subcategory_id: string;
  cashback_percentage: number;
};

type Subcategory = {
  id: string;
  name: string;
};

export function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<ProductFormData>();

  const imageUrl = watch("image");

  const { data: subcategories = [] } = useQuery<Subcategory[]>({
    queryKey: ["subcategories"],
    queryFn: async () => {
      const response = await api.get("/subcategories");
      console.log("🔍 Resposta bruta da API /subcategories:", response.data);
      return Array.isArray(response.data)
        ? response.data
        : response.data.subcategories ?? []; // prettier-ignore
    },
  });

  // prettier-ignore
  const { data: product, isLoading, error } = useQuery<ProductFormData>({
    queryKey: ["product", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await api.get(`/products/${id}`);
      const data = response.data;

      return {
        ...data,
        price: Number(data.price),
        quantity: Number(data.quantity),
        cashback_percentage: Number(data.cashback_percentage),
      };
    },
  });

  useEffect(() => {
    if (product) {
      reset(product);
    }
  }, [product, reset]);

  const { mutateAsync: updateProduct } = useMutation({
    mutationFn: async (data: ProductFormData) => {
      await api.patch(`/products/${id}`, data);
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
      quantity: Number(data.status ? data.quantity : 0), // Zera estoque se inativo
      cashback_percentage: Number(data.cashback_percentage),
    };

    await updateProduct(payload);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadToCloudinary(file);
    setValue("image", url);
  }

  if (isLoading) return <p>Carregando produto...</p>;
  if (error) return <p>Erro ao carregar produto.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Produto</h1>
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

        {/*
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("status")}
            id="status"
            className="w-4 h-4"
            onChange={(e) => {
              const checked = e.target.checked;
              setValue("status", checked);
              if (!checked) setValue("quantity", 0); // Produto inativo => zera estoque
            }}
          />
          <label
            htmlFor="status"
            className="text-2xl font-semibold from-red-600 space-x-4 border-r-background"
          >
            Produto Ativo
          </label>
        </div>
          */}

        <div>
          <label className="block text-sm font-semibold">
            Estoque (quantidade)
          </label>
          <input
            type="number"
            {...register("quantity")}
            className="w-full border p-2 rounded"
            required
            disabled={!watch("status")} // desabilita se status for false
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
          {isSubmitting ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}
