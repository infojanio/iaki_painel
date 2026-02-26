import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "@/lib/axios";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

type BannerFormData = {
  title: string;
  image_url?: string;
  link?: string;
};

export function BannerEdit() {
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
  } = useForm<BannerFormData>();

  const imageUrl = watch("image_url");

  // prettier-ignore
  const { data: banner, isLoading, error } = useQuery<BannerFormData>({
    queryKey: ["banner", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await api.get(`/banners/${id}`);
      const data = response.data;

      return {
        ...data,
        };
    },
  });

  useEffect(() => {
    if (banner) {
      reset(banner);
    }
  }, [banner, reset]);

  const { mutateAsync: updateBanner } = useMutation({
    mutationFn: async (data: BannerFormData) => {
      await api.patch(`/banners/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      alert("✅ Atualizado com sucesso!");
      navigate("/banners/todos");
    },
  });

  async function onSubmit(data: BannerFormData) {
    const payload = {
      ...data,
    };

    await updateBanner(payload);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadToCloudinary(file);
    setValue("image_url", url);
  }

  if (isLoading) return <p>Carregando banner...</p>;
  if (error) return <p>Erro ao carregar banner.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Banner</h1>
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
          <label className="block text-sm font-semibold">
            Imagem (740x296)
          </label>
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
              className="w-80 h-30 object-cover mt-2 rounded border"
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
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isSubmitting ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}
