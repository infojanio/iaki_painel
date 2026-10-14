import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { api } from "@/lib/axios";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import type { ProductPayload } from "@/services/products";

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

function normalizeSubcategories(payload: unknown): Subcategory[] {
  if (Array.isArray(payload)) {
    return payload as Subcategory[];
  }

  if (payload && typeof payload === "object") {
    const response = payload as Record<string, unknown>;

    if (Array.isArray(response.subcategories)) {
      return response.subcategories as Subcategory[];
    }

    if (Array.isArray(response.data)) {
      return response.data as Subcategory[];
    }

    if (response.data && typeof response.data === "object") {
      const nested = response.data as Record<string, unknown>;

      if (Array.isArray(nested.subcategories)) {
        return nested.subcategories as Subcategory[];
      }
    }
  }

  throw new Error("Formato inválido na resposta das subcategorias.");
}

function buildFormValues(values?: Partial<ProductPayload>): ProductFormFields {
  return {
    name: values?.name ?? "",
    description: values?.description ?? "",
    price: Number(values?.price ?? 0),
    quantity: Number(values?.quantity ?? 0),
    minStock: Number(values?.minStock ?? 5),
    image: values?.image ?? "",
    status: values?.status ?? true,
    cashbackPercentage: Number(values?.cashbackPercentage ?? 0),
    subcategoryId: values?.subcategoryId ?? "",
  };
}

export function ProductForm({
  title,
  submitLabel,
  defaultValues,
  isSubmitting = false,
  onSubmit,
}: ProductFormProps) {
  const navigate = useNavigate();

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const isEditing = Boolean(defaultValues);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<ProductFormFields>({
    defaultValues: buildFormValues(defaultValues),
  });

  // Atualiza o formulário quando os dados do produto mudarem.
  useEffect(() => {
    if (defaultValues) {
      reset(buildFormValues(defaultValues));
    }
  }, [defaultValues, reset]);

  const imageUrl = watch("image");
  const selectedSubcategoryId = watch("subcategoryId");

  // SUBCATEGORIAS
  const {
    data: subcategories = [],
    isLoading: isLoadingSubcategories,
    isError: isSubcategoriesError,
    refetch: refetchSubcategories,
  } = useQuery<Subcategory[]>({
    queryKey: ["subcategories", "product-form"],
    queryFn: async () => {
      const response = await api.get("/subcategories/me");

      return normalizeSubcategories(response.data);
    },
    staleTime: 60_000,
    refetchOnMount: "always",
  });

  const selectedSubcategoryExists = subcategories.some(
    (subcategory) => subcategory.id === selectedSubcategoryId,
  );

  // LIMITES DO PLANO
  const { data: usageData } = useQuery<UsageResponse>({
    queryKey: ["usage-products"],
    queryFn: async () => {
      const response = await api.get("/stores/me/usage");

      return response.data?.data ?? response.data;
    },
  });

  const usage = Number(usageData?.usage?.products ?? 0);
  const limit = usageData?.limits?.maxProducts ?? null;

  const isLimitReached = limit !== null && usage >= limit && !isEditing;

  const usagePercentage =
    limit !== null && limit > 0 ? Math.min((usage / limit) * 100, 100) : 0;

  // UPLOAD DA IMAGEM
  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setIsUploadingImage(true);

      const url = await uploadToCloudinary(file);

      setValue("image", url, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      alert("Erro ao enviar imagem. Tente novamente.");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  }

  // SALVAR PRODUTO
  async function handleFormSubmit(data: ProductFormFields) {
    if (isUploadingImage) {
      alert("Aguarde o envio da imagem.");
      return;
    }

    if (isLoadingSubcategories) {
      alert("Aguarde o carregamento das subcategorias.");
      return;
    }

    if (isSubcategoriesError) {
      alert("Não foi possível validar a subcategoria.");
      return;
    }

    if (!selectedSubcategoryExists) {
      alert(
        "A subcategoria selecionada não está disponível. " +
          "Atualize a lista e selecione novamente.",
      );
      return;
    }

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
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* CABEÇALHO */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("/products")}
          className="text-gray-600 hover:text-black"
          aria-label="Voltar para produtos"
        >
          <ArrowLeft />
        </button>

        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      </div>

      {/* LIMITES DO PLANO */}
      {limit !== null && (
        <div className="rounded-lg bg-gray-100 p-4">
          <div className="mb-2 flex justify-between text-sm">
            <span>Uso de produtos</span>

            <span className="font-semibold">
              {usage} / {limit}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full transition-all ${
                usage >= limit
                  ? "bg-red-500"
                  : usage >= limit * 0.8
                    ? "bg-yellow-500"
                    : "bg-blue-500"
              }`}
              style={{
                width: `${usagePercentage}%`,
              }}
            />
          </div>

          {isLimitReached && (
            <div className="mt-3 flex items-center justify-between gap-3 text-sm text-red-600">
              <span>Limite de produtos atingido.</span>

              <button
                type="button"
                onClick={() => navigate("/plans/subscribe")}
                className="whitespace-nowrap text-blue-600 underline"
              >
                Fazer upgrade
              </button>
            </div>
          )}
        </div>
      )}

      {/* FORMULÁRIO */}
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="space-y-5 rounded-lg border bg-white p-6 shadow"
      >
        {/* NOME */}
        <div>
          <label className="mb-1 block text-sm font-medium">Nome</label>

          <input
            {...register("name", {
              required: "Informe o nome do produto",
            })}
            className="w-full rounded border p-2"
            placeholder="Ex: Detergente Ypê 500ml"
          />

          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* DESCRIÇÃO */}
        <div>
          <label className="mb-1 block text-sm font-medium">Descrição</label>

          <textarea
            {...register("description")}
            className="min-h-[96px] w-full rounded border p-2"
            placeholder="Descrição do produto"
          />
        </div>

        {/* PREÇO / QUANTIDADE / ESTOQUE */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Preço</label>

            <input
              type="number"
              step="0.01"
              min="0.01"
              {...register("price", {
                required: "Informe o preço",
                valueAsNumber: true,
                min: {
                  value: 0.01,
                  message: "Informe um preço maior que zero",
                },
              })}
              className="w-full rounded border p-2"
            />

            {errors.price && (
              <p className="mt-1 text-sm text-red-600">
                {errors.price.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Quantidade</label>

            <input
              type="number"
              step="1"
              min="0"
              {...register("quantity", {
                required: "Informe a quantidade",
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: "Quantidade inválida",
                },
              })}
              className="w-full rounded border p-2"
            />

            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">
                {errors.quantity.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Estoque mínimo
            </label>

            <input
              type="number"
              step="1"
              min="0"
              {...register("minStock", {
                required: "Informe o estoque mínimo",
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: "Estoque mínimo inválido",
                },
              })}
              className="w-full rounded border p-2"
            />

            {errors.minStock && (
              <p className="mt-1 text-sm text-red-600">
                {errors.minStock.message}
              </p>
            )}
          </div>
        </div>

        {/* DESCONTO */}
        <div>
          <label className="mb-1 block text-sm font-medium">Desconto (%)</label>

          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            {...register("cashbackPercentage", {
              required: "Informe o desconto",
              valueAsNumber: true,
              min: {
                value: 0,
                message: "O desconto não pode ser negativo",
              },
              max: {
                value: 100,
                message: "O desconto não pode ultrapassar 100%",
              },
            })}
            className="w-full rounded border p-2"
          />

          {errors.cashbackPercentage && (
            <p className="mt-1 text-sm text-red-600">
              {errors.cashbackPercentage.message}
            </p>
          )}
        </div>

        {/* SUBCATEGORIA - CORRIGIDA */}
        <div>
          <label className="mb-1 block text-sm font-medium">Subcategoria</label>

          <Controller
            name="subcategoryId"
            control={control}
            rules={{
              required: "Selecione a subcategoria",
            }}
            render={({ field }) => (
              <select
                {...field}
                value={field.value ?? ""}
                disabled={isLoadingSubcategories || isSubcategoriesError}
                className="w-full rounded border border-gray-300 bg-white p-2 focus:border-green-500 focus:outline-none"
              >
                <option value="">
                  {isLoadingSubcategories
                    ? "Carregando subcategorias..."
                    : isSubcategoriesError
                      ? "Erro ao carregar subcategorias"
                      : "Selecione uma subcategoria"}
                </option>

                {/* Preserva a seleção durante o carregamento */}
                {field.value &&
                  !selectedSubcategoryExists &&
                  !isLoadingSubcategories &&
                  !isSubcategoriesError && (
                    <option value={field.value} disabled>
                      Subcategoria atual indisponível
                    </option>
                  )}

                {subcategories.map((subcategory) => {
                  const categoryName =
                    subcategory.category?.name ??
                    subcategory.Category?.name ??
                    "";

                  return (
                    <option key={subcategory.id} value={subcategory.id}>
                      {categoryName ? `${categoryName} • ` : ""}
                      {subcategory.name}
                    </option>
                  );
                })}
              </select>
            )}
          />

          {isLoadingSubcategories && (
            <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Carregando opções...
            </p>
          )}

          {isSubcategoriesError && (
            <button
              type="button"
              onClick={() => refetchSubcategories()}
              className="mt-2 text-sm text-blue-600 underline"
            >
              Tentar carregar novamente
            </button>
          )}

          {!isLoadingSubcategories &&
            !isSubcategoriesError &&
            selectedSubcategoryId &&
            !selectedSubcategoryExists && (
              <p className="mt-2 text-xs text-amber-600">
                A subcategoria vinculada ao produto não foi encontrada na lista
                disponível para esta loja.
              </p>
            )}

          {errors.subcategoryId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.subcategoryId.message}
            </p>
          )}
        </div>

        {/* IMAGEM */}
        <div>
          <label className="mb-1 block text-sm font-medium">Imagem</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploadingImage || isSubmitting}
            className="w-full rounded border p-2 text-sm"
          />

          {isUploadingImage && (
            <p className="mt-2 flex items-center gap-2 text-sm text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Enviando imagem...
            </p>
          )}

          {imageUrl && (
            <div className="mt-3 flex h-40 w-40 items-center justify-center overflow-hidden rounded-lg border bg-gray-50 p-3">
              <img
                src={imageUrl}
                alt="Imagem do produto"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          )}
        </div>

        {/* STATUS */}
        <div>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              {...register("status")}
              className="h-4 w-4 accent-green-600"
            />

            <span className="text-sm font-medium">Produto ativo</span>
          </label>
        </div>

        {/* BOTÕES */}
        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              isUploadingImage ||
              isLimitReached ||
              isLoadingSubcategories ||
              isSubcategoriesError
            }
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-white ${
              isSubmitting ||
              isUploadingImage ||
              isLimitReached ||
              isLoadingSubcategories ||
              isSubcategoriesError
                ? "cursor-not-allowed bg-gray-400"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}

            {isSubmitting ? "Salvando..." : submitLabel}
          </button>
        </div>

        {isLimitReached && (
          <p className="text-sm text-red-600">
            Você atingiu o limite do seu plano. Exclua produtos ou faça upgrade.
          </p>
        )}
      </form>
    </div>
  );
}
