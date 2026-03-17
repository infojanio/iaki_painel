import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { api } from "@/lib/axios";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

type Store = {
  id: string;
  name: string;
};

type BannerFormData = {
  title: string;
  imageUrl?: string;
  link?: string;
  storeId: string;
};

export function BannerNew() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<BannerFormData>({
    defaultValues: {
      storeId: "",
    },
  });

  const imageUrl = watch("imageUrl");

  const { data: stores, isLoading: isLoadingStores } = useQuery<Store[]>({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data } = await api.get("/stores");
      return Array.isArray(data) ? data : (data?.stores ?? []);
    },
  });

  const { mutateAsync: createBanner } = useMutation({
    mutationFn: async (data: BannerFormData) => {
      // validações mínimas aqui também
      if (!data.storeId) throw new Error("Selecione uma loja.");
      if (!data.imageUrl) throw new Error("Imagem obrigatória.");

      await api.post("/banners", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      alert("✅ Cadastrado com sucesso!");
      navigate("/banners");
    },
    onError: (err: any) => {
      alert(err?.message ?? "Erro ao cadastrar banner.");
    },
  });

  async function onSubmit(data: BannerFormData) {
    await createBanner(data);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadToCloudinary(file);
    setValue("imageUrl", url, { shouldValidate: true });
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Novo Banner</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* LOJA */}
        <div>
          <label className="block text-sm font-semibold">Loja</label>
          <select
            {...register("storeId", { required: true })}
            className="w-full border p-2 rounded"
            disabled={isLoadingStores}
          >
            <option value="">
              {isLoadingStores ? "Carregando lojas..." : "Selecione a loja"}
            </option>
            {stores?.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        {/* TÍTULO */}
        <div>
          <label className="block text-sm font-semibold">Nome</label>
          <input
            {...register("title", { required: true })}
            className="w-full border p-2 rounded"
            required
          />
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
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60"
        >
          {isSubmitting ? "Salvando..." : "Criar banner"}
        </button>
      </form>
    </div>
  );
}
