import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "@/lib/axios";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import { useAuth } from "@/contexts/AuthContext";

type Store = {
  id: string;
  name: string;
};

type BannerFormData = {
  title: string;
  imageUrl?: string;
  isActive: boolean;
  link?: string;
  storeId: string;
};

export function BannerEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<BannerFormData>({
    defaultValues: {
      isActive: true,
      storeId: "",
    },
  });

  const imageUrl = watch("imageUrl");

  // 🔵 Carregar banner
  const { data: banner, isLoading } = useQuery<BannerFormData>({
    queryKey: ["banner", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await api.get(`/banners/${id}`);

      return {
        title: data.title,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
        link: data.link,
        storeId: data.storeId,
      };
    },
  });

  // 🔵 Carregar lojas
  const { data: stores } = useQuery<Store[]>({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data } = await api.get("/stores");
      return Array.isArray(data) ? data : (data?.stores ?? []);
    },
  });

  // 🔵 Preencher form quando carregar
  useEffect(() => {
    if (banner) {
      reset(banner);
    }
  }, [banner, reset]);

  // 🔵 Mutation update
  const { mutateAsync: updateBanner } = useMutation({
    mutationFn: async (data: BannerFormData) => {
      const payload = {
        title: data.title,
        imageUrl: data.imageUrl,
        link: data.link,
        storeId: data.storeId,
        isActive: !!data.isActive,
      };
      console.log("PATCH /banners payload:", payload);
      await api.patch(`/banners/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      queryClient.invalidateQueries({ queryKey: ["banner", id] });

      alert("✅ Atualizado com sucesso!");
      navigate("/banners");
    },
    onError: (err: any) => {
      console.log(err?.response?.data);
      alert("Erro ao atualizar banner.");
    },
  });

  async function onSubmit(data: BannerFormData) {
    if (!id) return;

    await updateBanner({
      title: data.title,
      imageUrl: data.imageUrl,
      link: data.link,
      storeId: data.storeId, // ✅ agora vai
      isActive: !!data.isActive, // ✅ garante boolean
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadToCloudinary(file);
    setValue("imageUrl", url, { shouldValidate: true });
  }

  if (isLoading) return <p>Carregando banner...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Banner</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* LOJA */}
        {user?.role === "SUPER_ADMIN" && (
          <div>
            <label className="block text-sm font-semibold">Loja</label>

            <select
              {...register("storeId", { required: true })}
              className="w-full border p-2 rounded"
            >
              <option value="">Selecione a loja</option>

              {stores?.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* NOME */}
        <div>
          <label className="block text-sm font-semibold">Nome</label>

          <input
            {...register("title", { required: true })}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* STATUS */}
        <div className="flex items-center gap-2">
          <input type="checkbox" {...register("isActive")} />

          <span className="text-sm">Banner ativo</span>
        </div>

        {/* IMAGEM */}
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
              className="w-full h-40 object-cover mt-2 rounded border"
            />
          )}
        </div>

        {/* LINK */}
        <div>
          <label className="block text-sm font-semibold">Link</label>

          <input
            {...register("link")}
            className="w-full border p-2 rounded"
            placeholder="https://..."
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
