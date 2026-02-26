import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "@/lib/axios";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

type CategoryFormData = {
  name: string;
  image?: string;
};

export function CategoryEdit() {
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
  } = useForm<CategoryFormData>();

  const imageUrl = watch("image");

  // prettier-ignore
  const { data: category, isLoading, error } = useQuery<CategoryFormData>({
    queryKey: ["category", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await api.get(`/categories/${id}`);
      const data = response.data;

      return {
        ...data,
        };
    },
  });

  useEffect(() => {
    if (category) {
      reset(category);
    }
  }, [category, reset]);

  const { mutateAsync: updateCategory } = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      await api.patch(`/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      alert("✅ Atualizado com sucesso!");
      navigate("/categorias/todos");
    },
  });

  async function onSubmit(data: CategoryFormData) {
    const payload = {
      ...data,
    };

    await updateCategory(payload);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadToCloudinary(file);
    setValue("image", url);
  }

  if (isLoading) return <p>Carregando categoria...</p>;
  if (error) return <p>Erro ao carregar categoria.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Categoria</h1>
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
