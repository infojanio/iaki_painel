import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { ProductForm } from "./ProductForm";
import { createProduct, type ProductPayload } from "@/services/products";

export function ProductNew() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["usage-products"] });
      alert("✅ Produto criado com sucesso!");
      navigate("/products");
    },
    onError: (err: any) => {
      if (err?.response?.data?.code === "PLAN_LIMIT_EXCEEDED") {
        alert(
          "Limite do plano atingido. Faça upgrade para criar mais produtos.",
        );
        return;
      }

      const message = err?.response?.data?.message ?? "Erro ao criar produto.";
      alert(message);
    },
  });

  async function handleSubmit(data: ProductPayload) {
    await mutateAsync(data);
  }

  return (
    <ProductForm
      title="Novo Produto"
      submitLabel="Criar produto"
      isSubmitting={isPending}
      onSubmit={handleSubmit}
    />
  );
}
