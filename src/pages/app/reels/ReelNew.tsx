// src/pages/app/subcategories/SubcategoryNew.tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { api } from "@/lib/axios";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

type ReelFormData = {
  title: string;
  image_url?: string;
  link?: string;
};

export function ReelNew() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<ReelFormData>();

  const imageUrl = watch("image_url");

  const { mutateAsync: createReel } = useMutation({
    mutationFn: async (data: ReelFormData) => {
      await api.post("/reels", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reels"] });
      alert("✅ Cadastrado com sucesso!");
      navigate("/reels/todos");
    },
  });

  async function onSubmit(data: ReelFormData) {
    await createReel(data);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadToCloudinary(file);
    setValue("image_url", url);
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Novo Reel</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold">Nome</label>
          <input
            {...register("title")}
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

        <div>
          <label className="block text-sm font-semibold">Link</label>
          <input
            {...register("link")}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {isSubmitting ? "Salvando..." : "Criar reel"}
        </button>
      </form>
    </div>
  );
}
