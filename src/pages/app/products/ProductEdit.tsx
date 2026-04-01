import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

import { ProductForm } from "./ProductForm";
import {
  getProduct,
  updateProduct,
  type ProductPayload,
} from "@/services/products";

export function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["product", id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) throw new Error("Produto inválido.");
      return getProduct(id);
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (payload: ProductPayload) => {
      if (!id) throw new Error("Produto inválido.");
      return updateProduct(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      alert("✅ Produto atualizado com sucesso!");
      navigate("/products");
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ?? "Erro ao atualizar produto.";
      alert(message);
    },
  });

  async function handleSubmit(payload: ProductPayload) {
    await mutateAsync(payload);
  }

  if (isLoading) {
    return <div className="p-6 text-gray-600">Carregando produto...</div>;
  }

  if (error || !data) {
    return <div className="p-6 text-red-600">Erro ao carregar produto.</div>;
  }

  return (
    <ProductForm
      title="Editar Produto"
      submitLabel="Salvar alterações"
      defaultValues={data}
      isSubmitting={isPending}
      onSubmit={handleSubmit}
    />
  );
}
