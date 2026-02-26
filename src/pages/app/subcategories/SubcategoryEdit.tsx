import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "@/lib/axios";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

type SubcategoryFormData = {
  name: string;
  image?: string;
  category_id: string;
};

type Category = {
  id: string;
  name: string;
};

export function SubcategoryEdit() {
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
  } = useForm<SubcategoryFormData>();

  const imageUrl = watch("image");

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get("/categories");
      console.log("🔍 Resposta bruta da API /categories:", response.data);
      return Array.isArray(response.data)
        ? response.data
        : response.data.categories ?? []; // prettier-ignore
    },
  });

  // prettier-ignore
  const { data: subcategory, isLoading, error } = useQuery<SubcategoryFormData>({
    queryKey: ["subcategory", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await api.get(`/subcategories/${id}`);
      const data = response.data;

      return {
        ...data,
        };
    },
  });

  useEffect(() => {
    if (subcategory) {
      reset(subcategory);
    }
  }, [subcategory, reset]);

  const { mutateAsync: updateSubcategory } = useMutation({
    mutationFn: async (data: SubcategoryFormData) => {
      await api.patch(`/subcategories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      alert("✅ Atualizado com sucesso!");
      navigate("/subcategorias/todos");
    },
  });

  async function onSubmit(data: SubcategoryFormData) {
    const payload = {
      ...data,
    };

    await updateSubcategory(payload);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadToCloudinary(file);
    setValue("image", url);
  }

  if (isLoading) return <p>Carregando subcategoria...</p>;
  if (error) return <p>Erro ao carregar subcategoria.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Subcategoria</h1>
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
          <label className="block text-sm font-semibold">Categoria</label>
          <select
            {...register("category_id")}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
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
