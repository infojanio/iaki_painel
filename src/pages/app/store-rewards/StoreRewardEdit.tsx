import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useForm } from "react-hook-form";

import { useNavigate, useParams } from "react-router-dom";

import { getStoreReward, updateStoreReward } from "@/services/store-rewards";

import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

type FormData = {
  title: string;

  description?: string;

  pointsCost: number;

  stock: number;

  image?: string;

  expiresAt?: string;

  maxPerUser?: number;

  isActive?: boolean;
};

export function StoreRewardEdit() {
  const { rewardId } = useParams();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<FormData>();

  const image = watch("image");

  /**
   * =========================
   * LOAD REWARD
   * =========================
   */

  const { isLoading } = useQuery({
    queryKey: ["store-reward", rewardId],

    queryFn: async () => {
      const reward = await getStoreReward(rewardId!);

      reset({
        title: reward.title,

        description: reward.description ?? "",

        pointsCost: reward.pointsCost,

        stock: reward.stock,

        image: reward.image ?? "",

        expiresAt: reward.expiresAt ? reward.expiresAt.slice(0, 10) : "",

        maxPerUser: reward.maxPerUser ?? undefined,

        isActive: reward.isActive,
      });

      return reward;
    },

    enabled: !!rewardId,
  });

  /**
   * =========================
   * UPDATE
   * =========================
   */

  const mutation = useMutation({
    mutationFn: (data: FormData) => updateStoreReward(rewardId!, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["store-rewards"],
      });

      queryClient.invalidateQueries({
        queryKey: ["store-reward", rewardId],
      });

      alert("Brinde atualizado com sucesso!");

      navigate("/store-rewards");
    },

    onError: (err: any) => {
      alert(err?.response?.data?.message ?? "Erro ao atualizar brinde.");
    },
  });

  /**
   * =========================
   * SUBMIT
   * =========================
   */

  async function onSubmit(data: FormData) {
    await mutation.mutateAsync(data);
  }

  /**
   * =========================
   * IMAGE
   * =========================
   */

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    const url = await uploadToCloudinary(file);

    setValue("image", url);
  }

  if (isLoading) {
    return <div className="p-10 text-center">Carregando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Editar Brinde</h1>

        <p className="text-sm text-muted-foreground">
          Atualize as informações da recompensa.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* TITLE */}

        <div>
          <label className="block text-sm font-medium mb-1">
            Nome do brinde
          </label>

          <input
            {...register("title")}
            className="w-full border rounded-xl p-3"
          />
        </div>

        {/* DESCRIPTION */}

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>

          <textarea
            {...register("description")}
            className="w-full border rounded-xl p-3 min-h-[120px]"
          />
        </div>

        {/* GRID */}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Pontos necessários
            </label>

            <input
              type="number"
              {...register("pointsCost", {
                valueAsNumber: true,
              })}
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Estoque</label>

            <input
              type="number"
              {...register("stock", {
                valueAsNumber: true,
              })}
              className="w-full border rounded-xl p-3"
            />
          </div>
        </div>

        {/* GRID 2 */}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Expiração</label>

            <input
              type="date"
              {...register("expiresAt")}
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Máx por usuário
            </label>

            <input
              type="number"
              {...register("maxPerUser", {
                valueAsNumber: true,
              })}
              className="w-full border rounded-xl p-3"
            />
          </div>
        </div>

        {/* STATUS */}

        <div className="flex items-center gap-3">
          <input type="checkbox" {...register("isActive")} />

          <label className="text-sm">Brinde ativo</label>
        </div>

        {/* IMAGE */}

        <div>
          <label className="block text-sm font-medium mb-2">Imagem</label>

          <input type="file" accept="image/*" onChange={handleImageUpload} />

          {image && (
            <img
              src={image}
              className="w-40 h-40 object-cover rounded-2xl mt-4 border"
            />
          )}
        </div>

        {/* ACTIONS */}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/store-rewards")}
            className="border px-5 py-3 rounded-xl"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-green-600 text-white px-5 py-3 rounded-xl hover:bg-green-700"
          >
            {mutation.isPending ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
