import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ProductTable } from "@/components/ProductTable";
import { deleteProduct, getProducts } from "@/services/products";
import { Product } from "@/types/product";

export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    const data = await getProducts();
    setProducts(data);
  }

  async function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      await deleteProduct(id);
      loadProducts();
    }
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Link
          to="/products/new"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Novo Produto
        </Link>
      </div>
      <ProductTable products={products} onDelete={handleDelete} />
    </div>
  );
}
