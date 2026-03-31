import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getPlanById, updatePlan } from "@/services/plans";
import { planSchema, PlanFormData } from "@/schemas/plan-schema";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";

export function EditPlanPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      isActive: true,
      maxProducts: null,
      maxBanners: null,
      maxReels: null,
      maxCategories: null,
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["plan", id],
    enabled: !!user && !!id,
    queryFn: () => getPlanById(id!),
  });

  // ✅ CORREÇÃO AQUI
  useEffect(() => {
    if (!data) return;

    const plan = data.plan ?? data;

    reset({
      name: plan.name,
      price: Number(plan.price),
      durationDays: plan.durationDays,
      maxProducts: plan.maxProducts,
      maxBanners: plan.maxBanners,
      maxReels: plan.maxReels,
      maxCategories: plan.maxCategories,
      isActive: plan.isActive,
    });
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (formData: PlanFormData) => updatePlan(id!, formData),
    onSuccess: () => {
      toast.success("Plano atualizado com sucesso!");
      navigate("/plans");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao atualizar plano.");
    },
  });

  function handleUnlimited(field: keyof PlanFormData, checked: boolean) {
    setValue(field, checked ? null : (0 as never), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  function onSubmit(data: PlanFormData) {
    mutation.mutate(data);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Editar Plano</h1>
        <p className="text-sm text-muted-foreground">
          Atualize as configurações do plano
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Plano</CardTitle>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            {/* Nome */}
            <div className="flex flex-col gap-2">
              <Label>Nome</Label>
              <Input {...register("name")} />
              {errors.name && (
                <span className="text-sm text-red-500">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Preço e duração */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Preço</Label>
                <Input type="number" {...register("price")} />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Duração</Label>
                <Input type="number" {...register("durationDays")} />
              </div>
            </div>

            {/* LIMITES */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Produtos", field: "maxProducts" },
                { label: "Banners", field: "maxBanners" },
                { label: "Reels", field: "maxReels" },
                { label: "Categorias", field: "maxCategories" },
              ].map(({ label, field }) => {
                const value = watch(field as keyof PlanFormData);

                return (
                  <div key={field} className="flex flex-col gap-2">
                    <Label>{label}</Label>

                    <Input
                      type="number"
                      disabled={value === null}
                      {...register(field as any)}
                    />

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={value === null}
                        onCheckedChange={(checked) =>
                          handleUnlimited(field as any, checked)
                        }
                      />
                      <span className="text-xs">Ilimitado</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* STATUS */}
            <div className="flex items-center gap-2">
              <Switch
                checked={watch("isActive")}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
              <span>Plano ativo</span>
            </div>

            {/* BOTÕES */}
            <div className="flex gap-2">
              <Button type="submit">
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
