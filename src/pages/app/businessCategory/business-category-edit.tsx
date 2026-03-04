import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "@/lib/axios";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

type BusinessCategoryFormData = {
  name: string;
  image?: string;
};

type BusinessCategory = {
  id: string;
  name: string;
  image?: string | null;
};

export function BusinessCategoryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<BusinessCategoryFormData>();

  const imageUrl = watch("image");

  useEffect(() => {
    async function load() {
      if (!id) return;

      const { data } = await api.get<BusinessCategory>(
        `/business-categories/${id}`,
      );

      reset({
        name: data.name ?? "",
        image: data.image ?? "",
      });
    }

    load().catch((err) => {
      console.log("ERRO:", err?.response?.data ?? err);
      alert("Erro ao carregar categoria.");
    });
  }, [id, reset]);

  const { mutateAsync: updateBusinessCategory } = useMutation({
    mutationFn: async (payload: BusinessCategoryFormData) => {
      if (!id) return;
      await api.patch(`/business-categories/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-categories"] });
      alert("✅ Categoria atualizada com sucesso!");
      navigate("/business-categories");
    },
  });

  async function onSubmit(data: BusinessCategoryFormData) {
    await updateBusinessCategory(data);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadToCloudinary(file);
    setValue("image", url, { shouldDirty: true });
  }

  if (!id) return <p>ID inválido.</p>;

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Categoria de Negócio</h1>

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

          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-32 h-32 object-cover mt-2 rounded border"
            />
          ) : (
            <p className="text-gray-600 mt-2">Sem imagem cadastrada.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? "Salvando..." : "Atualizar"}
        </button>
      </form>
    </div>
  );
}
