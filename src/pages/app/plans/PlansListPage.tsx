import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loader2, Plus, Pencil, Trash2, Badge } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";

type Plan = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  maxProducts: number | null;
  maxBanners: number | null;
  maxReels: number | null;
  maxCategories: number | null;
  isActive: boolean;
  createdAt: string;
};

export function PlansListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data, isLoading } = useQuery<Plan[]>({
    queryKey: ["plans"],
    enabled: !!user,
    queryFn: async () => {
      const response = await api.get("/plans");
      return response.data?.plans ?? response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/plans/${id}`);
    },
    onSuccess: () => {
      toast.success("Plano excluído com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Erro ao excluir plano.");
    },
  });

  function handleDelete(planId: string, name: string) {
    const confirm = window.confirm(
      `Excluir o plano "${name}"?\n\nEssa ação não pode ser desfeita.`,
    );

    if (!confirm) return;

    deleteMutation.mutate(planId);
  }

  function isDeleting(id: string) {
    return deleteMutation.isPending && deleteMutation.variables === id;
  }

  function formatLimit(value: number | null) {
    return value === null ? "Ilimitado" : value;
  }

  function formatPrice(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os planos do sistema
          </p>
        </div>

        <Button onClick={() => navigate("/plans/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Planos</CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : data && data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plano</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Banners</TableHead>
                  <TableHead>Reels</TableHead>
                  <TableHead>Categorias</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>

                    <TableCell>{formatPrice(Number(plan.price))}</TableCell>

                    <TableCell>{plan.durationDays} dias</TableCell>

                    <TableCell>{formatLimit(plan.maxProducts)}</TableCell>

                    <TableCell>{formatLimit(plan.maxBanners)}</TableCell>

                    <TableCell>{formatLimit(plan.maxReels)}</TableCell>

                    <TableCell>{formatLimit(plan.maxCategories)}</TableCell>

                    <TableCell>
                      {plan.isActive ? (
                        <Badge>Ativo</Badge>
                      ) : (
                        <Badge fontVariant="secondary">Inativo</Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/plans/${plan.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={isDeleting(plan.id)}
                          onClick={() => handleDelete(plan.id, plan.name)}
                        >
                          {isDeleting(plan.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center py-10 gap-2">
              <p className="text-muted-foreground">Nenhum plano cadastrado</p>

              <Button
                variant="outline"
                onClick={() => navigate("/plans/create")}
              >
                Criar primeiro plano
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
