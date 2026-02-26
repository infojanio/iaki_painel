import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/axios";

export function OrderActions({ orderId }: { orderId: string }) {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async () => {
      await api.patch(`/orders/${orderId}/validate`);
    },
    onSuccess: () => {
      toast.success("Pedido validado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
    },
    onError: () => toast.error("Erro ao validar pedido"),
  });

  return (
    <Button onClick={() => mutateAsync()} disabled={isPending}>
      Validar
    </Button>
  );
}
