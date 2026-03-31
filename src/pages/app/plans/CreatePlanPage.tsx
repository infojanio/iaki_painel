import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { createPlan } from "@/services/plans";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { toast } from "sonner";

// 🔥 schema
const planSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  price: z.coerce.number().min(0),
  durationDays: z.coerce.number().min(1),

  maxProducts: z.coerce.number().nullable(),
  maxBanners: z.coerce.number().nullable(),
  maxReels: z.coerce.number().nullable(),
  maxCategories: z.coerce.number().nullable(),

  isActive: z.boolean(),
});

type FormData = z.infer<typeof planSchema>;

export function CreatePlanPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      isActive: true,
      maxProducts: null,
      maxBanners: null,
      maxReels: null,
      maxCategories: null,
    },
  });

  const mutation = useMutation({
    mutationFn: createPlan,
    onSuccess: () => {
      toast.success("Plano criado com sucesso!");
      navigate("/plans");
    },
    onError: () => {
      toast.error("Erro ao criar plano");
    },
  });

  function onSubmit(data: FormData) {
    mutation.mutate(data);
  }

  function handleUnlimited(field: keyof FormData, checked: boolean) {
    setValue(field, checked ? null : 0);
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Novo Plano</h1>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Plano</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* NOME */}
            <div>
              <Label>Nome</Label>
              <Input {...register("name")} />
              {errors.name && (
                <span className="text-red-500 text-sm">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* PREÇO */}
            <div>
              <Label>Preço</Label>
              <Input type="number" step="0.01" {...register("price")} />
            </div>

            {/* DURAÇÃO */}
            <div>
              <Label>Duração (dias)</Label>
              <Input type="number" {...register("durationDays")} />
            </div>

            {/* LIMITES */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Produtos", field: "maxProducts" },
                { label: "Banners", field: "maxBanners" },
                { label: "Reels", field: "maxReels" },
                { label: "Categorias", field: "maxCategories" },
              ].map((item) => (
                <div key={item.field} className="flex flex-col gap-2">
                  <Label>{item.label}</Label>

                  <Input type="number" {...register(item.field as any)} />

                  <div className="flex items-center gap-2">
                    <Switch
                      onCheckedChange={(checked) =>
                        handleUnlimited(item.field as keyof FormData, checked)
                      }
                    />
                    <span className="text-xs">Ilimitado</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ATIVO */}
            <div className="flex items-center gap-2">
              <Switch
                checked={watch("isActive")}
                onCheckedChange={(v) => setValue("isActive", v)}
              />
              <span>Plano ativo</span>
            </div>

            {/* BOTÕES */}
            <div className="flex gap-2 mt-4">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Salvando..." : "Salvar"}
              </Button>

              <Button variant="outline" onClick={() => navigate("/plans")}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
