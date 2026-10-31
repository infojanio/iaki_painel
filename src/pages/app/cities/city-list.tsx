import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Building2,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { getCities, deleteCity } from "@/services/cities";
import type { City } from "@/services/cities";

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function CityList() {
  const navigate = useNavigate();

  const [cities, setCities] = useState<City[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await getCities();

        if (active) setCities(data);
      } catch {
        if (active) {
          setError(
            "Não foi possível carregar as cidades. Atualize a página para tentar novamente.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, []);

  const filteredCities = useMemo(() => {
    const term = normalize(search.trim());

    return cities
      .filter((city) => normalize(city.name).includes(term))
      .sort((first, second) => first.name.localeCompare(second.name, "pt-BR"));
  }, [cities, search]);

  async function handleDelete(city: City) {
    if (deletingId) return;

    const confirmed = window.confirm(
      `Deseja realmente excluir a cidade "${city.name}"?`,
    );

    if (!confirmed) return;

    setDeletingId(city.id);
    setError(null);

    try {
      await deleteCity(city.id);

      setCities((current) => current.filter((item) => item.id !== city.id));
    } catch {
      setError(
        `Não foi possível excluir "${city.name}". Tente novamente. Caso o problema continue, verifique se existem registros vinculados à cidade.`,
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Cidades
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Gerencie as cidades disponíveis na plataforma.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/cities/new")}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <Plus size={18} aria-hidden="true" />
          Nova cidade
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={20} className="shrink-0" aria-hidden="true" />

          <p>{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-800">
              Cidades cadastradas
            </h2>

            {!loading && (
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {cities.length}
              </span>
            )}
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />

            <input
              type="search"
              aria-label="Buscar cidade pelo nome"
              placeholder="Buscar cidade..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              Cidades cadastradas e ações de edição e exclusão
            </caption>

            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Nome da cidade
                </th>

                <th scope="col" className="px-5 py-3 text-right font-semibold">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={2} className="px-5 py-12">
                    <div
                      role="status"
                      className="flex items-center justify-center gap-2 text-slate-500"
                    >
                      <Loader2
                        size={20}
                        className="animate-spin text-blue-600"
                        aria-hidden="true"
                      />
                      Carregando cidades...
                    </div>
                  </td>
                </tr>
              ) : filteredCities.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-5 py-12 text-center">
                    <Building2
                      size={32}
                      className="mx-auto mb-3 text-slate-300"
                      aria-hidden="true"
                    />

                    <p className="font-medium text-slate-700">
                      {search.trim()
                        ? "Nenhuma cidade encontrada"
                        : error
                          ? "Lista indisponível"
                          : "Nenhuma cidade cadastrada"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {search.trim()
                        ? "Tente buscar por outro nome."
                        : error
                          ? "Atualize a página para tentar novamente."
                          : 'Clique em "Nova cidade" para começar.'}
                    </p>

                    {search.trim() && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        className="mt-4 rounded-lg px-3 py-2 font-medium text-blue-600 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      >
                        Limpar busca
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCities.map((city) => {
                  const isDeleting = deletingId === city.id;

                  return (
                    <tr
                      key={city.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                            <Building2 size={18} aria-hidden="true" />
                          </div>

                          <span className="font-medium text-slate-800">
                            {city.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/cities/edit/${city.id}`)}
                            disabled={isDeleting}
                            aria-label={`Editar ${city.name}`}
                            title={`Editar ${city.name}`}
                            className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-blue-700 transition hover:border-blue-200 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Pencil size={16} aria-hidden="true" />

                            <span className="hidden sm:inline">Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => void handleDelete(city)}
                            disabled={deletingId !== null}
                            aria-label={
                              isDeleting
                                ? `Excluindo ${city.name}`
                                : `Excluir ${city.name}`
                            }
                            title={`Excluir ${city.name}`}
                            className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 text-red-600 transition hover:border-red-200 hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                                aria-hidden="true"
                              />
                            ) : (
                              <Trash2 size={16} aria-hidden="true" />
                            )}

                            <span className="hidden sm:inline">
                              {isDeleting ? "Excluindo..." : "Excluir"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredCities.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
            Exibindo {filteredCities.length} de {cities.length} cidades
          </div>
        )}
      </div>
    </div>
  );
}
