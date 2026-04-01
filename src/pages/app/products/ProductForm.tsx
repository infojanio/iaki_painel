import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { api } from "@/lib/axios";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import type { ProductPayload } from "@/services/products";

type Category = {
  id: string;
  name: string;
};

type Subcategory = {
  id: string;
  name: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
  };
  Category?: {
    id: string;
    name: string;
  };
};

type UsageResponse = {
  usage?: {
    products?: number;
  };
  limits?: {
    maxProducts?: number | null;
  };
};

type ProductFormProps = {
  title: string;
  submitLabel: string;
  defaultValues?: Partial<ProductPayload>;
  isSubmitting?: boolean;
  onSubmit: (data: ProductPayload) => Promise<void> | void;
};

type ProductFormFields = {
  name: string;
  description: string;
  price: number;
  quantity: number;
  minStock: number;
  image: string;
  status: boolean;
  cashbackPercentage: number;
  subcategoryId: string;
};

export function ProductForm({
  title,
  submitLabel,
  defaultValues,
  isSubmitting = false,
  onSubmit,
}: ProductFormProps) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormFields>({
    defaultValues: {
      name: defaultValues?.name ?? "",
      description: defaultValues?.description ?? "",
      price: Number(defaultValues?.price ?? 0),
      quantity: Number(defaultValues?.quantity ?? 0),
      minStock: Number(defaultValues?.minStock ?? 5),
      image: defaultValues?.image ?? "",
      status: defaultValues?.status ?? true,
      cashbackPercentage: Number(defaultValues?.cashbackPercentage ?? 0),
      subcategoryId: defaultValues?.subcategoryId ?? "",
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        name: defaultValues.name ?? "",
        description: defaultValues.description ?? "",
        price: Number(defaultValues.price ?? 0),
        quantity: Number(defaultValues.quantity ?? 0),
        minStock: Number(defaultValues.minStock ?? 5),
        image: defaultValues.image ?? "",
        status: defaultValues.status ?? true,
        cashbackPercentage: Number(defaultValues.cashbackPercentage ?? 0),
        subcategoryId: defaultValues.subcategoryId ?? "",
      });
    }
  }, [defaultValues, reset]);

  const imageUrl = watch("image");

  const { isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get("/categories");
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : (data?.categories ?? []);
    },
  });

  const { data: subcategories = [], isLoading: isLoadingSubcategories } =
    useQuery<Subcategory[]>({
      queryKey: ["subcategories"],
      queryFn: async () => {
        const response = await api.get("/subcategories");
        const data = response.data?.data ?? response.data;
        return Array.isArray(data) ? data : (data?.subcategories ?? []);
      },
    });

  const { data: usageData } = useQuery<UsageResponse>({
    queryKey: ["usage-products"],
    queryFn: async () => {
      const response = await api.get("/stores/me/usage");
      return response.data?.data ?? response.data;
    },
  });

  const usage = Number(usageData?.usage?.products ?? 0);
  const limit = usageData?.limits?.maxProducts ?? null;
  const isLimitReached = limit !== null && usage >= limit && !defaultValues;

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadToCloudinary(file);
      setValue("image", url, { shouldValidate: true });
    } catch {
      alert("Erro ao enviar imagem.");
    }
  }

  async function handleFormSubmit(data: ProductFormFields) {
    const payload: ProductPayload = {
      name: data.name.trim(),
      description: data.description?.trim() || null,
      price: Number(data.price),
      quantity: Number(data.quantity),
      minStock: Number(data.minStock),
      image: data.image?.trim() || null,
      status: Boolean(data.status),
      cashbackPercentage: Number(data.cashbackPercentage),
      subcategoryId: data.subcategoryId,
    };

    await onSubmit(payload);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/products")}
          className="text-gray-600 hover:text-black"
          type="button"
        >
          <ArrowLeft />
        </button>

        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>

      {limit !== null && (
        <div className="bg-gray-100 p-4 rounded">
          <div className="flex justify-between text-sm mb-1">
            <span>Uso de produtos</span>
            <span>
              {usage} / {limit}
            </span>
          </div>

          <div className="h-2 bg-gray-200 rounded">
            <div
              className={`h-2 rounded ${
                usage >= limit
                  ? "bg-red-500"
                  : usage >= limit * 0.8
                    ? "bg-yellow-500"
                    : "bg-blue-500"
              }`}
              style={{
                width: `${Math.min((usage / limit) * 100, 100)}%`,
              }}
            />
          </div>

          {isLimitReached && (
            <div className="mt-2 text-sm text-red-600 flex justify-between items-center">
              <span>Limite de produtos atingido.</span>
              <button
                type="button"
                onClick={() => navigate("/plans/subscribe")}
                className="text-blue-600 underline"
              >
                Fazer upgrade
              </button>
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-5 bg-white p-6 rounded-lg shadow border"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            {...register("name", { required: "Informe o nome do produto" })}
            className="w-full border p-2 rounded"
            placeholder="Ex: Detergente Ypê 500ml"
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            {...register("description")}
            className="w-full border p-2 rounded min-h-[96px]"
            placeholder="Descrição do produto"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Preço</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              {...register("price", {
                required: "Informe o preço",
                valueAsNumber: true,
              })}
              className="w-full border p-2 rounded"
            />
            {errors.price && (
              <p className="text-sm text-red-600 mt-1">
                {errors.price.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quantidade</label>
            <input
              type="number"
              step="1"
              min="0"
              {...register("quantity", {
                required: "Informe a quantidade",
                valueAsNumber: true,
              })}
              className="w-full border p-2 rounded"
            />
            {errors.quantity && (
              <p className="text-sm text-red-600 mt-1">
                {errors.quantity.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Estoque mínimo
            </label>
            <input
              type="number"
              step="1"
              min="0"
              {...register("minStock", {
                required: "Informe o estoque mínimo",
                valueAsNumber: true,
              })}
              className="w-full border p-2 rounded"
            />
            {errors.minStock && (
              <p className="text-sm text-red-600 mt-1">
                {errors.minStock.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cashback (%)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            {...register("cashbackPercentage", {
              required: "Informe o cashback",
              valueAsNumber: true,
            })}
            className="w-full border p-2 rounded"
          />
          {errors.cashbackPercentage && (
            <p className="text-sm text-red-600 mt-1">
              {errors.cashbackPercentage.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Subcategoria</label>
          <select
            {...register("subcategoryId", {
              required: "Selecione a subcategoria",
            })}
            className="w-full border p-2 rounded"
            disabled={isLoadingSubcategories}
          >
            <option value="">
              {isLoadingSubcategories
                ? "Carregando subcategorias..."
                : "Selecione uma subcategoria"}
            </option>

            {subcategories.map((subcategory) => {
              const categoryName =
                subcategory.category?.name ?? subcategory.Category?.name ?? "";

              return (
                <option key={subcategory.id} value={subcategory.id}>
                  {categoryName ? `${categoryName} • ` : ""}
                  {subcategory.name}
                </option>
              );
            })}
          </select>
          {errors.subcategoryId && (
            <p className="text-sm text-red-600 mt-1">
              {errors.subcategoryId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Imagem</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-32 h-32 object-cover mt-3 rounded border"
            />
          )}
        </div>

        <div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" {...register("status")} />
            <span className="text-sm font-medium">Produto ativo</span>
          </label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="px-4 py-2 border rounded"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isLimitReached}
            className={`px-4 py-2 rounded text-white ${
              isSubmitting || isLimitReached
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isSubmitting ? "Salvando..." : submitLabel}
          </button>
        </div>

        {isLoadingCategories && (
          <p className="text-sm text-gray-500">Carregando categorias...</p>
        )}

        {isLimitReached && (
          <p className="text-sm text-red-600">
            Você atingiu o limite do seu plano. Exclua produtos ou faça upgrade.
          </p>
        )}
      </form>
    </div>
  );
}
