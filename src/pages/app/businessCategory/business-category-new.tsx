import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { api } from "@/lib/axios";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

type BusinessCategoryFormData = {
  name: string;
  image?: string;
};

export function BusinessCategoryNew() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<BusinessCategoryFormData>();

  const imageUrl = watch("image");

  const { mutateAsync: createBusinessCategory } = useMutation({
    mutationFn: async (data: BusinessCategoryFormData) => {
      await api.post("/business-categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-categories"] });
      alert("✅ Categoria de negócio cadastrada com sucesso!");
      navigate("/business-categories");
    },
  });

  async function onSubmit(data: BusinessCategoryFormData) {
    await createBusinessCategory(data);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadToCloudinary(file);
    setValue("image", url);
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nova Categoria de Negócio</h1>

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
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {isSubmitting ? "Salvando..." : "Criar Categoria"}
        </button>
      </form>
    </div>
  );
}
