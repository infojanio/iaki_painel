import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";
import {
  updateStore,
  getStoreById,
  StoreUpdatePayload,
} from "@/services/stores";
import { getCities, City } from "@/services/cities";

type StoreForm = {
  name: string;
  slug: string;
  isActive: boolean;
  latitude: string;
  longitude: string;
  phone: string;
  cnpj: string;
  avatar?: string;
  street: string;
  postalCode: string;
  cityId: string;
};

export function StoreEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [cities, setCities] = useState<City[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<StoreForm>();

  const avatarUrl = watch("avatar");

  useEffect(() => {
    (async () => {
      if (!id) return;

      const [citiesData, store] = await Promise.all([
        getCities(),
        getStoreById(id),
      ]);

      setCities(citiesData);

      reset({
        name: store.name,
        slug: store.slug,
        isActive: store.isActive,
        latitude: String(store.latitude),
        longitude: String(store.longitude),
        phone: store.phone,
        cnpj: store.cnpj,
        avatar: store.avatar ?? "",
        street: store.street,
        postalCode: store.postalCode,
        cityId: store.cityId,
      });
    })().catch((err) => {
      console.log("ERRO:", err?.response?.data ?? err);
      alert("Erro ao carregar loja.");
    });
  }, [id, reset]);

  const { mutateAsync: save } = useMutation({
    mutationFn: async (payload: StoreUpdatePayload) => {
      if (!id) return;
      await updateStore(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      alert("✅ Loja atualizada!");
      navigate("/stores");
    },
  });

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadToCloudinary(file);
    setValue("avatar", url, { shouldDirty: true });
  }

  async function onSubmit(data: StoreForm) {
    const payload: StoreUpdatePayload = {
      name: data.name.trim(),
      slug: data.slug.trim(),
      isActive: !!data.isActive,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      phone: data.phone.trim(),
      cnpj: data.cnpj.trim(),
      avatar: data.avatar,
      street: data.street.trim(),
      postalCode: data.postalCode.trim(),
      cityId: data.cityId,
    };

    await save(payload);
  }

  if (!id) return <p>ID inválido.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar Loja</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold">Nome</label>
            <input
              {...register("name")}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Slug</label>
            <input
              {...register("slug")}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Cidade</label>
            <select
              {...register("cityId")}
              className="w-full border p-2 rounded"
              required
            >
              <option value="">Selecione...</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 mt-6 md:mt-0">
            <input type="checkbox" {...register("isActive")} />
            <span className="text-sm">Loja ativa</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold">Avatar</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="block mt-1"
          />
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Preview"
              className="w-28 h-28 object-cover mt-2 rounded border"
            />
          ) : (
            <p className="text-gray-600 mt-2">Sem avatar.</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold">Telefone</label>
            <input
              {...register("phone")}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">CNPJ</label>
            <input
              {...register("cnpj")}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Latitude</label>
            <input
              {...register("latitude")}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Longitude</label>
            <input
              {...register("longitude")}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Rua</label>
            <input
              {...register("street")}
              className="w-full border p-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">CEP</label>
            <input
              {...register("postalCode")}
              className="w-full border p-2 rounded"
              required
            />
          </div>
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
