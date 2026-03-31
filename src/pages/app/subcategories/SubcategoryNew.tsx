import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { api } from "@/lib/axios";
import { uploadToCloudinary } from "@/utils/uploadToCloudinary";

type SubcategoryFormData = {
  name: string;
  image?: string;
  categoryId: string; // ✅ corrigido
};

type Category = {
  id: string;
  name: string;
};

export function SubcategoryNew() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<SubcategoryFormData>();

  const imageUrl = watch("image");

  /* ================= GET CATEGORIES ================= */
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get("/categories");

      return Array.isArray(response.data)
        ? response.data
        : (response.data.categories ?? []);
    },
  });

  /* ================= CREATE ================= */
  const { mutateAsync: createSubcategory } = useMutation({
    mutationFn: async (data: SubcategoryFormData) => {
      await api.post("/subcategories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      alert("✅ Subcategoria criada com sucesso!");
      navigate("/subcategories");
    },
    onError: () => {
      alert("❌ Erro ao criar subcategoria.");
    },
  });

  /* ================= SUBMIT ================= */
  async function onSubmit(data: SubcategoryFormData) {
    await createSubcategory(data);
  }

  /* ================= IMAGE ================= */
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadToCloudinary(file);
      setValue("image", url);
    } catch {
      alert("Erro ao enviar imagem");
    }
  }

  /* ================= LOADING ================= */
  if (isLoading) {
    return <div className="p-6 text-gray-600">Carregando categorias...</div>;
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/subcategories")}
          className="text-gray-600 hover:text-black"
        >
          <ArrowLeft />
        </button>

        <h1 className="text-2xl font-semibold">Nova Subcategoria</h1>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 bg-white p-6 rounded-lg shadow border"
      >
        {/* NAME */}
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input
            {...register("name", { required: true })}
            className="w-full border p-2 rounded"
            placeholder="Ex: Refrigerantes"
          />
        </div>

        {/* CATEGORY */}
        <div>
          <label className="block text-sm font-medium mb-1">Categoria</label>
          <select
            {...register("categoryId", { required: true })}
            className="w-full border p-2 rounded"
          >
            <option value="">Selecione uma categoria</option>

            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* IMAGE */}
        <div>
          <label className="block text-sm font-medium mb-1">Imagem</label>

          <input type="file" accept="image/*" onChange={handleImageUpload} />

          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-32 h-32 object-cover mt-3 rounded border"
            />
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/subcategorias")}
            className="px-4 py-2 border rounded"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {isSubmitting ? "Salvando..." : "Criar"}
          </button>
        </div>
      </form>
    </div>
  );
}
