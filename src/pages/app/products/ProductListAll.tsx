import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/axios";

type Product = {
  id: string;
  name: string;
  description: string;
  price: string;
  quantity: number;
  status: boolean;
  cashback_percentage: number;
  image: string;
  subcategory: {
    id: string;
    name: string;
    Category: {
      id: string;
      name: string;
    };
  };
};

export function ProductListAll() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    enabled: !!user,
    queryFn: async () => {
      const response = await api.get("/products");
      return Array.isArray(response.data)
        ? response.data
        : response.data.products;
    },
  });

  if (isLoading)
    return <p className="p-4 text-gray-600">Carregando produtos...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        📦 Lista de Produtos
      </h1>

      <div className="overflow-auto rounded-lg shadow">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50 text-gray-700 text-sm">
            <tr>
              <th className="p-4 text-left">Imagem</th>
              <th className="p-4 text-left">Nome</th>
              <th className="p-4 text-left">Categoria</th>
              <th className="p-4 text-left">Subcategoria</th>
              <th className="p-4 text-left">Descrição</th>
              <th className="p-4 text-left">Preço</th>
              <th className="p-4 text-left">Estoque</th>
              <th className="p-4 text-left">Cashback</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Ações</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm divide-y divide-gray-200">
            {products?.map((product, idx) => (
              <tr
                key={product.id}
                className={
                  product.status
                    ? idx % 2 === 0
                      ? "bg-white"
                      : "bg-gray-50"
                    : "bg-red-50 text-gray-500"
                }
              >
                <td className="p-4">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded border"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">Sem imagem</span>
                  )}
                </td>
                <td className="p-4 font-medium">{product.name}</td>
                <td className="p-4">{product.subcategory.Category.name}</td>
                <td className="p-4">{product.subcategory?.name}</td>
                <td className="p-4">{product.description}</td>
                <td className="p-4">
                  R$ {parseFloat(product.price).toFixed(2)}
                </td>
                <td className="p-4">{product.quantity}</td>
                <td className="p-4">{product.cashback_percentage}%</td>
                <td className="p-4">
                  {product.status ? (
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                      Ativo
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                      Inativo
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => navigate(`/produtos/editar/${product.id}`)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
