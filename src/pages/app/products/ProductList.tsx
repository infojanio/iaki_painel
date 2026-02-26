import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/axios";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: string;
  quantity: number;
  status: boolean;
  cashback_percentage: number;
  image: string;
  subcategoryName: string | null;
  categoryName: string | null;
};

type ProductResponse = {
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
};

export function ProductList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data, isLoading, error } = useQuery<ProductResponse>({
    queryKey: ["products", page, query],
    enabled: !!user,
    queryFn: async () => {
      const response = await api.get("/products/search", {
        params: {
          page,
          query,
          pageSize: 5,
        },
      });

      const totalPages = Math.ceil(response.data.total / 5);

      return {
        products: response.data.products,
        total: response.data.total,
        totalPages,
        currentPage: page,
      };
    },
  });

  const { mutateAsync: softDeleteProduct } = useMutation({
    mutationFn: async (product: Product) => {
      // Busca os dados completos do produto antes de atualizar
      const response = await api.get(`/products/${product.id}`);
      const fullProduct = response.data;

      await api.patch(`/products/${product.id}`, {
        name: fullProduct.name,
        description: fullProduct.description,
        price: Number(fullProduct.price),
        quantity: 0,
        status: false,
        image: fullProduct.image,
        subcategory_id: fullProduct.subcategory_id || "", // ⚠️ essencial
        cashback_percentage: Number(fullProduct.cashback_percentage),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1); // Resetar ao buscar
    setQuery(searchInput);
  }

  if (isLoading) return <p>Carregando produtos...</p>;

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <p className="text-lg font-semibold mb-2">
          ⚠️ Problemas ao carregar os produtos.
        </p>
        <p className="text-sm">
          Isso geralmente acontece quando o token de acesso expirou. Faça login
          novamente.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Produtos</h1>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Buscar por nome..."
          className="border p-2 rounded w-full max-w-md"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Buscar
        </button>
      </form>

      <table className="min-w-full bg-white shadow-md rounded border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Imagem</th>
            <th className="p-3 text-left">Nome</th>
            <th className="p-3 text-left">Descrição</th>
            <th className="p-3 text-left">Preço</th>
            <th className="p-3 text-left">Estoque</th>
            <th className="p-3 text-left">Cashback (%)</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Ações</th>
          </tr>
        </thead>
        <tbody>
          {data?.products?.map((product) => (
            <tr
              key={product.id}
              className={`border-b ${
                !product.status
                  ? "bg-red-100 text-gray-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <td className="p-3">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <span className="text-sm text-gray-400">Sem imagem</span>
                )}
              </td>
              <td className="p-3">{product.name}</td>
              <td className="p-3">{product.description}</td>
              <td className="p-3">R$ {parseFloat(product.price).toFixed(2)}</td>
              <td className="p-3">{product.quantity}</td>
              <td className="p-3">{product.cashback_percentage}%</td>
              <td className="p-3">{product.status ? "Ativo" : "Inativo"}</td>
              <td className="p-3 space-x-2">
                <button
                  onClick={() => navigate(`/produtos/editar/${product.id}`)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Editar"
                >
                  <Pencil size={18} />
                </button>
                {product.status && (
                  <button
                    onClick={async () => {
                      if (
                        confirm("Tem certeza que deseja excluir este produto?")
                      ) {
                        await softDeleteProduct(product);
                        alert("Produto excluído com sucesso.");
                      }
                    }}
                    className="text-red-600 hover:text-red-800"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginação */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span>
          Página {data?.currentPage} de {data?.totalPages}
        </span>
        <button
          disabled={page === data?.totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
