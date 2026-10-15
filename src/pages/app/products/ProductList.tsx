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
            placeholder="Desconto mínimo (%)"
            className="border rounded-lg px-3 py-2 w-48"
            onChange={(e) =>
              setMinCashback(e.target.value ? Number(e.target.value) : null)
            }
          />
        </div>
      </div>

      {/* LISTA */}
      {filteredProducts?.length === 0 ? (
        <div className="py-10 text-center text-gray-500">
          Nenhum produto encontrado
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredProducts?.map((product) => (
            <div
              key={product.id}
              className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* IMAGEM */}
              <div className="flex h-28 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-white to-gray-100 p-2">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name || "Imagem do produto"}
                    loading="lazy"
                    className="h-full w-full rounded-lg object-contain transition-transform duration-300 hover:scale-110"
                  />
                ) : (
                  <span className="text-xs text-gray-400">Sem imagem</span>
                )}
              </div>

              {/* INFORMAÇÕES */}
              <div className="flex flex-1 flex-col gap-2 p-3">
                {/* NOME */}
                <h2
                  className="line-clamp-2 min-h-9 text-sm font-semibold leading-5 text-gray-800"
                  title={product.name}
                >
                  {product.name}
                </h2>

                {/* STATUS */}
                <div>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      product.status
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {product.status ? "Ativo" : "Inativo"}
                  </span>
                </div>

                {/* DESCRIÇÃO */}
                <p className="line-clamp-2 min-h-8 text-xs text-gray-500">
                  {product.description}
                </p>

                {/* PREÇO */}
                <div className="text-base font-bold text-gray-900">
                  R$ {product.price.toFixed(2)}
                </div>

                {/* ESTOQUE */}
                <div
                  className={`text-xs ${
                    product.quantity <= product.minStock
                      ? "font-medium text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  Estoque: {product.quantity}
                </div>

                {/* DESCONTO */}
                <div className="text-xs font-medium text-blue-600">
                  Desconto: {product.cashbackPercentage}%
                </div>

                {/* AÇÕES */}
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-gray-100 pt-2">
                  <button
                    onClick={() => navigate(`/products/edit/${product.id}`)}
                    className="text-xs font-medium text-blue-600 hover:underline"
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
                    className="text-xs font-medium text-red-600 hover:underline"
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
