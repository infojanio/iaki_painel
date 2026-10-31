import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ImagePlus,
  Loader2,
  MapPin,
  Save,
  Store,
} from "lucide-react";

import { updateStore, getStoreById } from "@/services/stores";
import type { StoreUpdatePayload } from "@/services/stores";
import { getCities } from "@/services/cities";
import type { City } from "@/services/cities";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

type StoreForm = {
  name: string;
  slug: string;
  isActive: boolean;
  latitude: string;
  longitude: string;
  phone: string;
  cnpj: string;
  avatar: string;
  street: string;
  postalCode: string;
  cityId: string;
};

type ImageField = "slug" | "avatar";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50";

const labelClass = "block text-sm font-medium text-slate-700";

function digits(value: string) {
  return value.replace(/\D/g, "");
}

function maskPhone(value: string) {
  const number = digits(value).slice(0, 11);

  if (!number) return "";
  if (number.length <= 2) return `(${number}`;

  const ddd = number.slice(0, 2);
  const local = number.slice(2);
  const prefixLength = number.length > 10 ? 5 : 4;

  if (local.length <= prefixLength) {
    return `(${ddd}) ${local}`;
  }

  return `(${ddd}) ${local.slice(0, prefixLength)}-${local.slice(prefixLength)}`;
}

function maskCnpj(value: string) {
  return digits(value)
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function maskCep(value: string) {
  return digits(value)
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, "$1-$2");
}

function parseCoordinate(value: string) {
  return Number(value.trim().replace(",", "."));
}

function validateCoordinate(value: string, limit: number) {
  if (!value.trim()) return "Informe a coordenada.";

  const number = parseCoordinate(value);

  return (
    (Number.isFinite(number) && Math.abs(number) <= limit) ||
    `Informe um valor entre -${limit} e ${limit}.`
  );
}

const maskedFields = [
  {
    name: "phone",
    label: "Telefone",
    placeholder: "(62) 99999-9999",
    mask: maskPhone,
    maxLength: 15,
    validate: (value: string) =>
      [10, 11].includes(digits(value).length) || "Informe o telefone com DDD.",
  },
  {
    name: "cnpj",
    label: "CNPJ",
    placeholder: "00.000.000/0000-00",
    mask: maskCnpj,
    maxLength: 18,
    validate: (value: string) =>
      digits(value).length === 14 || "Informe os 14 dígitos do CNPJ.",
  },
] as const;

function FormSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">{icon}</div>

        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function StoreEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const uploadLock = useRef(false);

  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<ImageField | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<StoreForm>({
    defaultValues: {
      name: "",
      slug: "",
      isActive: false,
      latitude: "",
      longitude: "",
      phone: "",
      cnpj: "",
      avatar: "",
      street: "",
      postalCode: "",
      cityId: "",
    },
  });

  const slugUrl = watch("slug");
  const avatarUrl = watch("avatar");
  const isActive = watch("isActive");

  useEffect(() => {
    if (!id) return;

    let active = true;

    async function load(storeId: string) {
      setLoading(true);
      setLoadError(null);
      setActionError(null);

      try {
        const [citiesData, store] = await Promise.all([
          getCities(),
          getStoreById(storeId),
        ]);

        if (!active) return;

        const relatedCity = (
          store as {
            city?: {
              id?: string;
              name?: string;
            } | null;
          }
        ).city;

        setCities(
          [...citiesData].sort((first, second) =>
            first.name.localeCompare(second.name, "pt-BR"),
          ),
        );

        reset({
          name: store.name ?? "",
          slug: store.slug ?? "",
          isActive: store.isActive ?? false,
          latitude: store.latitude == null ? "" : String(store.latitude),
          longitude: store.longitude == null ? "" : String(store.longitude),
          phone: maskPhone(store.phone ?? ""),
          cnpj: maskCnpj(store.cnpj ?? ""),
          avatar: store.avatar ?? "",
          street: store.street ?? "",
          postalCode: maskCep(store.postalCode ?? ""),
          cityId: String(store.cityId || relatedCity?.id || ""),
        });
      } catch {
        if (active) {
          setLoadError(
            "Não foi possível carregar a loja. Atualize a página para tentar novamente.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load(id);

    return () => {
      active = false;
    };
  }, [id, reset]);

  const { mutateAsync: save } = useMutation({
    mutationFn: async (payload: StoreUpdatePayload) => {
      if (!id) throw new Error("ID da loja inválido.");

      await updateStore(id, payload);
    },
    retry: false,
  });

  async function handleImageUpload(
    event: ChangeEvent<HTMLInputElement>,
    field: ImageField,
  ) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file || uploadLock.current) return;

    if (!file.type.startsWith("image/")) {
      setActionError("Selecione um arquivo de imagem.");
      input.value = "";
      return;
    }

    uploadLock.current = true;
    setUploading(field);
    setActionError(null);

    try {
      const url = await uploadToCloudinary(file);

      setValue(field, url, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } catch {
      setActionError("Não foi possível enviar a imagem. Tente novamente.");
    } finally {
      uploadLock.current = false;
      setUploading(null);
      input.value = "";
    }
  }

  async function onSubmit(data: StoreForm) {
    if (uploadLock.current || loading || loadError) return;

    setActionError(null);

    const payload: StoreUpdatePayload = {
      name: data.name.trim(),
      slug: data.slug,
      isActive: data.isActive,
      latitude: parseCoordinate(data.latitude),
      longitude: parseCoordinate(data.longitude),
      phone: digits(data.phone),
      cnpj: digits(data.cnpj),
      avatar: data.avatar,
      street: data.street.trim(),
      postalCode: digits(data.postalCode),
      cityId: data.cityId,
    };

    try {
      await save(payload);
    } catch {
      setActionError(
        "Não foi possível atualizar a loja. Verifique os dados e tente novamente.",
      );
      return;
    }

    void queryClient.invalidateQueries({ queryKey: ["stores"] });

    window.alert("Loja atualizada com sucesso!");
    navigate("/stores");
  }

  const busy = isSubmitting || uploading !== null;

  if (!id) {
    return <p className="text-red-600">ID da loja inválido.</p>;
  }

  if (loading) {
    return (
      <div
        role="status"
        className="flex items-center justify-center gap-3 py-20 text-sm text-slate-500"
      >
        <Loader2
          size={24}
          className="animate-spin text-blue-600"
          aria-hidden="true"
        />
        Carregando dados da loja...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={20} className="shrink-0" aria-hidden="true" />
          <p>{loadError}</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/stores")}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Voltar para lojas
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <button
          type="button"
          disabled={busy}
          onClick={() => navigate("/stores")}
          className="mb-4 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-slate-500 transition hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Voltar para lojas
        </button>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Editar loja
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Atualize as informações e a identidade visual da loja parceira.
        </p>
      </header>

      {actionError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={20} className="shrink-0" aria-hidden="true" />
          <p>{actionError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <fieldset disabled={busy} className="min-w-0 space-y-6">
          <FormSection
            title="Dados da loja"
            description="Identificação e contato do estabelecimento."
            icon={<Store size={20} aria-hidden="true" />}
          >
            <div className="sm:col-span-2">
              <label htmlFor="name" className={labelClass}>
                Nome da loja
              </label>

              <input
                id="name"
                autoComplete="organization"
                placeholder="Nome do estabelecimento"
                className={inputClass}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name", {
                  validate: (value) =>
                    Boolean(value.trim()) || "Informe o nome da loja.",
                })}
              />

              {errors.name && (
                <p id="name-error" className="mt-1 text-xs text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {maskedFields.map((item) => (
              <div key={item.name}>
                <label htmlFor={item.name} className={labelClass}>
                  {item.label}
                </label>

                <Controller
                  name={item.name}
                  control={control}
                  rules={{ validate: item.validate }}
                  render={({ field, fieldState }) => (
                    <>
                      <input
                        {...field}
                        id={item.name}
                        type={item.name === "phone" ? "tel" : "text"}
                        inputMode="numeric"
                        autoComplete={
                          item.name === "phone" ? "tel-national" : "off"
                        }
                        placeholder={item.placeholder}
                        maxLength={item.maxLength}
                        onChange={(event) =>
                          field.onChange(item.mask(event.target.value))
                        }
                        className={inputClass}
                        aria-invalid={Boolean(fieldState.error)}
                        aria-describedby={
                          fieldState.error ? `${item.name}-error` : undefined
                        }
                      />

                      {fieldState.error && (
                        <p
                          id={`${item.name}-error`}
                          className="mt-1 text-xs text-red-600"
                        >
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  )}
                />
              </div>
            ))}

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
              <div>
                <span className="block text-sm font-semibold text-slate-800">
                  Loja ativa
                </span>

                <span className="mt-1 block text-xs text-slate-500">
                  {isActive
                    ? "O cadastro está marcado como ativo."
                    : "O cadastro está marcado como inativo."}
                </span>
              </div>

              <input
                type="checkbox"
                {...register("isActive")}
                className="h-5 w-5 accent-blue-600"
              />
            </label>
          </FormSection>

          <FormSection
            title="Endereço e localização"
            description="Cidade, endereço e coordenadas geográficas."
            icon={<MapPin size={20} aria-hidden="true" />}
          >
            <div>
              <label htmlFor="cityId" className={labelClass}>
                Cidade
              </label>

              <Controller
                name="cityId"
                control={control}
                rules={{
                  required: "Selecione uma cidade.",
                  validate: (value) =>
                    cities.some((city) => String(city.id) === value) ||
                    "Selecione uma cidade disponível na lista.",
                }}
                render={({ field, fieldState }) => {
                  const missingCity =
                    Boolean(field.value) &&
                    !cities.some((city) => String(city.id) === field.value);

                  return (
                    <>
                      <select
                        {...field}
                        id="cityId"
                        value={field.value ?? ""}
                        className={inputClass}
                        aria-invalid={Boolean(fieldState.error)}
                        aria-describedby={
                          fieldState.error ? "cityId-error" : undefined
                        }
                      >
                        <option value="">Selecione uma cidade</option>

                        {missingCity && (
                          <option value={field.value} disabled>
                            Cidade vinculada indisponível — selecione outra
                          </option>
                        )}

                        {cities.map((city) => (
                          <option key={city.id} value={String(city.id)}>
                            {city.name}
                          </option>
                        ))}
                      </select>

                      {fieldState.error && (
                        <p
                          id="cityId-error"
                          className="mt-1 text-xs text-red-600"
                        >
                          {fieldState.error.message}
                        </p>
                      )}
                    </>
                  );
                }}
              />
            </div>

            <div>
              <label htmlFor="postalCode" className={labelClass}>
                CEP
              </label>

              <Controller
                name="postalCode"
                control={control}
                rules={{
                  validate: (value) =>
                    digits(value).length === 8 ||
                    "Informe os 8 dígitos do CEP.",
                }}
                render={({ field, fieldState }) => (
                  <>
                    <input
                      {...field}
                      id="postalCode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      placeholder="00000-000"
                      maxLength={9}
                      onChange={(event) =>
                        field.onChange(maskCep(event.target.value))
                      }
                      className={inputClass}
                      aria-invalid={Boolean(fieldState.error)}
                      aria-describedby={
                        fieldState.error ? "postalCode-error" : undefined
                      }
                    />

                    {fieldState.error && (
                      <p
                        id="postalCode-error"
                        className="mt-1 text-xs text-red-600"
                      >
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="street" className={labelClass}>
                Endereço
              </label>

              <input
                id="street"
                autoComplete="street-address"
                placeholder="Rua, número, bairro e complemento"
                className={inputClass}
                aria-invalid={Boolean(errors.street)}
                aria-describedby={errors.street ? "street-error" : undefined}
                {...register("street", {
                  validate: (value) =>
                    Boolean(value.trim()) || "Informe o endereço.",
                })}
              />

              {errors.street && (
                <p id="street-error" className="mt-1 text-xs text-red-600">
                  {errors.street.message}
                </p>
              )}
            </div>

            {(["latitude", "longitude"] as const).map((name) => (
              <div key={name}>
                <label htmlFor={name} className={labelClass}>
                  {name === "latitude" ? "Latitude" : "Longitude"}
                </label>

                <input
                  id={name}
                  type="text"
                  placeholder={
                    name === "latitude" ? "Ex.: -13.0367" : "Ex.: -46.7717"
                  }
                  className={inputClass}
                  aria-invalid={Boolean(errors[name])}
                  aria-describedby={errors[name] ? `${name}-error` : undefined}
                  {...register(name, {
                    validate: (value) =>
                      validateCoordinate(value, name === "latitude" ? 90 : 180),
                  })}
                />

                {errors[name] && (
                  <p id={`${name}-error`} className="mt-1 text-xs text-red-600">
                    {errors[name]?.message}
                  </p>
                )}
              </div>
            ))}
          </FormSection>

          <FormSection
            title="Identidade visual"
            description="Selecione uma imagem para substituir a atual."
            icon={<ImagePlus size={20} aria-hidden="true" />}
          >
            <input type="hidden" {...register("slug")} />
            <input type="hidden" {...register("avatar")} />

            {(
              [
                {
                  field: "slug",
                  title: "Imagem da loja",
                  url: slugUrl,
                },
                {
                  field: "avatar",
                  title: "Avatar / logotipo",
                  url: avatarUrl,
                },
              ] as const
            ).map(({ field, title, url }) => (
              <div
                key={field}
                className="rounded-xl border border-slate-200 p-4"
              >
                <label htmlFor={`${field}-upload`} className={labelClass}>
                  {title}
                </label>

                <div className="my-4 flex h-36 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-200 bg-slate-50">
                  {url ? (
                    <img
                      src={url}
                      alt={`Prévia: ${title}`}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImagePlus
                        size={28}
                        className="mx-auto mb-2"
                        aria-hidden="true"
                      />
                      <p className="text-xs">Nenhuma imagem cadastrada</p>
                    </div>
                  )}
                </div>

                <input
                  id={`${field}-upload`}
                  type="file"
                  accept="image/*"
                  onChange={(event) => void handleImageUpload(event, field)}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                />

                {uploading === field && (
                  <p
                    role="status"
                    className="mt-3 flex items-center gap-2 text-xs text-blue-600"
                  >
                    <Loader2
                      size={14}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                    Enviando imagem...
                  </p>
                )}
              </div>
            ))}
          </FormSection>
        </fieldset>

        <div className="flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={busy}
            onClick={() => navigate("/stores")}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            ) : (
              <Save size={18} aria-hidden="true" />
            )}

            {isSubmitting
              ? "Salvando..."
              : uploading
                ? "Enviando imagem..."
                : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
