import { ProductForm } from "@/components/ProductForm";
import { createProduct } from "@/services/products";

export default function NewProductPage() {
  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Novo Produto</h1>
      <ProductForm onSubmit={createProduct} />
    </div>
  );
}
