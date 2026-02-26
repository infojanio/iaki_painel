import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Product } from "@/types/product";

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: Partial<Product>) => void;
}

export function ProductForm({ product, onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    quantity: 0,
    cashback_percentage: 0,
    image: "",
    status: true,
    store_id: "",
    subcategory_id: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const navigate = useNavigate();

  useEffect(() => {
    if (product) setFormData(product);
  }, [product]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Nome é obrigatório";
    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = "Preço deve ser maior que 0";
    if (!formData.quantity || Number(formData.quantity) < 0)
      newErrors.quantity = "Quantidade não pode ser negativa";
    if (!formData.store_id) newErrors.store_id = "Loja é obrigatória";
    if (!formData.subcategory_id)
      newErrors.subcategory_id = "Subcategoria é obrigatória";
    return newErrors;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
    navigate("/products");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          placeholder="Nome"
          className="w-full rounded border p-2"
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>
      <div>
        <textarea
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          placeholder="Descrição"
          className="w-full rounded border p-2"
        />
      </div>
      <div>
        <input
          name="price"
          type="number"
          value={formData.price || 0}
          onChange={handleChange}
          placeholder="Preço"
          className="w-full rounded border p-2"
        />
        {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
      </div>
      <div>
        <input
          name="quantity"
          type="number"
          value={formData.quantity || 0}
          onChange={handleChange}
          placeholder="Quantidade"
          className="w-full rounded border p-2"
        />
        {errors.quantity && (
          <p className="text-sm text-red-500">{errors.quantity}</p>
        )}
      </div>
      <div>
        <input
          name="cashback_percentage"
          type="number"
          value={formData.cashback_percentage || 0}
          onChange={handleChange}
          placeholder="Cashback (%)"
          className="w-full rounded border p-2"
        />
      </div>
      <div>
        <input
          name="image"
          value={formData.image || ""}
          onChange={handleChange}
          placeholder="URL da Imagem"
          className="w-full rounded border p-2"
        />
      </div>
      <div>
        <input
          name="store_id"
          value={formData.store_id || ""}
          onChange={handleChange}
          placeholder="ID da Loja"
          className="w-full rounded border p-2"
        />
        {errors.store_id && (
          <p className="text-sm text-red-500">{errors.store_id}</p>
        )}
      </div>
      <div>
        <input
          name="subcategory_id"
          value={formData.subcategory_id || ""}
          onChange={handleChange}
          placeholder="ID da Subcategoria"
          className="w-full rounded border p-2"
        />
        {errors.subcategory_id && (
          <p className="text-sm text-red-500">{errors.subcategory_id}</p>
        )}
      </div>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="status"
          checked={formData.status}
          onChange={handleChange}
        />
        <span>Ativo</span>
      </label>
      <button
        type="submit"
        className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
      >
        Salvar
      </button>
    </form>
  );
}
