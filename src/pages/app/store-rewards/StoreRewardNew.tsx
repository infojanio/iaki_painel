import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useForm } from "react-hook-form";

import { useNavigate } from "react-router-dom";

import { createStoreReward } from "@/services/store-rewards";

import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

type FormData = {
  title: string;

  description?: string;

  pointsCost: number;

  stock: number;

  image?: string;

  expiresAt?: string;

  maxPerUser?: number;
};

export function StoreRewardNew() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch } = useForm<FormData>();

  const image = watch("image");

  const mutation = useMutation({
    mutationFn: createStoreReward,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["store-rewards"],
      });

      navigate("/store-rewards");
    },
  });

  async function onSubmit(data: FormData) {
    await mutation.mutateAsync(data);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const url = await uploadToCloudinary(file);

    setValue("image", url);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Novo Brinde</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <input
          {...register("title")}
          placeholder="Nome do brinde"
          className="w-full border rounded-lg p-3"
        />

        <textarea
          {...register("description")}
          placeholder="Descrição"
          className="w-full border rounded-lg p-3"
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            {...register("pointsCost", {
              valueAsNumber: true,
            })}
            placeholder="Pontos necessários"
            className="border rounded-lg p-3"
          />

          <input
            type="number"
            {...register("stock", {
              valueAsNumber: true,
            })}
            placeholder="Estoque"
            className="border rounded-lg p-3"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Expiração do brinde
              </label>

              <input
                type="date"
                {...register("expiresAt")}
                className="w-full border rounded-lg p-3"
              />
            </div>
          </div>

          <input
            type="number"
            {...register("maxPerUser", {
              valueAsNumber: true,
            })}
            placeholder="Máx por usuário"
            className="border rounded-lg p-3"
          />
        </div>

        <div>
          <input type="file" accept="image/*" onChange={handleImageUpload} />

          {image && (
            <img
              src={image}
              className="w-40 h-40 object-cover rounded-xl mt-4"
            />
          )}
        </div>

        <button className="bg-green-600 text-white px-5 py-3 rounded-xl">
          Salvar Brinde
        </button>
      </form>
    </div>
  );
}
