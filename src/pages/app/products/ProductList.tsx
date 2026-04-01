import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

import { searchProducts, SearchProductsResponse } from "@/services/products";
import { useAuth } from "@/contexts/AuthContext";

export function ProductList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [minCashback, setMinCashback] = useState<number | null>(null);

  // 🔥 debounce
  const [debouncedQuery] = useDebounce(query, 1500);

  const { data, isLoading, error } = useQuery<SearchProductsResponse>({
    queryKey: ["products", "search", page, debouncedQuery],
    enabled: !!user?.id,
    queryFn: () =>
      searchProducts({
        page,
        query: debouncedQuery?.trim() || undefined, // 🔥 NÃO envia ""
        pageSize: 10,
      }),
  });

  const filteredProducts = data?.products.filter((product) => {
    // 🔥 filtro leve (refino visual)
    if (query && !product.name.toLowerCase().includes(query.toLowerCase())) {
      return false;
    }

    if (statusFilter === "active" && !product.status) return false;
    if (statusFilter === "inactive" && product.status) return false;

    if (lowStockOnly && product.quantity > product.minStock) return false;

    if (minCashback !== null && product.cashbackPercentage < minCashback)
      return false;

    return true;
  });

  if (isLoading) return <div>Carregando produtos...</div>;
  if (error) return <div>Erro ao carregar produtos</div>;

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Produtos</h1>
          <p className="text-sm text-gray-500">
            Gerencie os produtos da sua loja
          </p>
        </div>

        <button
          onClick={() => navigate("/products/new")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Novo Produto
        </button>
      </div>

      {/* BUSCA + FILTROS */}
      <div className="bg-white border rounded-xl p-4 space-y-4 shadow-sm">
        <input
          type="text"
          placeholder="Buscar produto..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1); // 🔥 reset página
          }}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />
            Estoque baixo
          </label>

          <input
            type="number"
            placeholder="Cashback mínimo (%)"
            className="border rounded-lg px-3 py-2 w-48"
            onChange={(e) =>
              setMinCashback(e.target.value ? Number(e.target.value) : null)
            }
          />
        </div>
      </div>

      {/* LISTA */}
      {filteredProducts?.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Nenhum produto encontrado
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts?.map((product) => (
            <div
              key={product.id}
              className="bg-white border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <div className="h-40 bg-gray-100 flex items-center justify-center">
                {product.image ? (
                  <img
                    src={product.image}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-sm">Sem imagem</span>
                )}
              </div>

              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h2 className="font-semibold text-lg">{product.name}</h2>

                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      product.status
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {product.status ? "Ativo" : "Inativo"}
                  </span>
                </div>

                <p className="text-sm text-gray-500 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex justify-between text-sm mt-2">
                  <span className="font-medium">
                    R$ {product.price.toFixed(2)}
                  </span>

                  <span
                    className={`${
                      product.quantity <= product.minStock
                        ? "text-red-500"
                        : "text-gray-600"
                    }`}
                  >
                    Estoque: {product.quantity}
                  </span>
                </div>

                <div className="text-xs text-blue-600 font-medium">
                  Cashback: {product.cashbackPercentage}%
                </div>

                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => navigate(`/products/edit/${product.id}`)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("Deseja desativar o produto?")) {
                        queryClient.invalidateQueries({
                          queryKey: ["products"],
                        });
                      }
                    }}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Desativar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINAÇÃO */}
      <div className="flex justify-between items-center pt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Anterior
        </button>

        <span className="text-sm text-gray-600">Página {page}</span>

        <button
          disabled={!data || page === data.totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    </div>
  );
}
