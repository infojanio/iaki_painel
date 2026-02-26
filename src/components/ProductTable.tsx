// src/components/ProductTable.tsx
import { Link } from "react-router-dom";

import { Product } from "@/types/product";

interface ProductTableProps {
  products: Product[];
  onDelete: (id: string) => void;
}

export function ProductTable({ products, onDelete }: ProductTableProps) {
  return (
    <table className="w-full table-auto border-collapse">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="p-2">Nome</th>
          <th className="p-2">Preço</th>
          <th className="p-2">Cashback (%)</th>
          <th className="p-2">Status</th>
          <th className="p-2">Ações</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.id} className="border-b">
            <td className="p-2">{product.name}</td>
            <td className="p-2">R$ {Number(product.price).toFixed(2)}</td>
            <td className="p-2">{product.cashback_percentage}%</td>
            <td className="p-2">{product.status ? "Ativo" : "Inativo"}</td>
            <td className="p-2">
              <Link
                to={`/products/edit/${product.id}`}
                className="mr-2 text-blue-600 hover:underline"
              >
                Editar
              </Link>
              <button
                onClick={() => onDelete(product.id)}
                className="text-red-600 hover:underline"
              >
                Excluir
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
