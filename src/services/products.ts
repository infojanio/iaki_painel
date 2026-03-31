import { api } from "@/lib/axios";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  minStock: number;
  image: string | null;
  status: boolean;
  cashbackPercentage: number;
  subcategoryId: string;
  subcategoryName?: string | null;
  categoryName?: string | null;
  createdAt?: string;
};

export type SearchProductsParams = {
  page?: number;
  query?: string;
  pageSize?: number;
};

export type SearchProductsResponse = {
  products: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
};

export type ProductPayload = {
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  minStock: number;
  image: string | null;
  status: boolean;
  cashbackPercentage: number;
  subcategoryId: string;
};

function normalizeProduct(raw: any): Product {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? null,
    price: Number(raw.price ?? 0),
    quantity: Number(raw.quantity ?? 0),
    minStock: Number(raw.minStock ?? 5),
    image: raw.image ?? null,
    status: Boolean(raw.status),

    // TODO: remover fallback snake_case futuramente
    cashbackPercentage: Number(
      raw.cashbackPercentage ?? raw.cashback_percentage ?? 0,
    ),

    subcategoryId: raw.subcategoryId ?? raw.subcategory_id ?? "",

    subcategoryName:
      raw.subcategoryName ??
      raw.subcategory?.name ??
      raw.SubCategory?.name ??
      null,

    categoryName:
      raw.categoryName ??
      raw.subcategory?.category?.name ??
      raw.SubCategory?.Category?.name ??
      null,

    createdAt: raw.createdAt,
  };
}

export async function searchProducts(
  params: SearchProductsParams,
): Promise<SearchProductsResponse> {
  const response = await api.get("/products/me", { params });

  console.log("Produtos RAW:", response.data);

  const data = response.data?.data ?? response.data;

  // 🔥 FIX AQUI
  const rawProducts = Array.isArray(data)
    ? data
    : Array.isArray(data?.products)
      ? data.products
      : [];

  const products = rawProducts.map(normalizeProduct);

  const total = Number(data?.total ?? rawProducts.length);
  const pageSize = Number(params.pageSize ?? 10);

  return {
    products,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    currentPage: Number(params.page ?? 1),
  };
}

export async function getProduct(productId: string): Promise<Product> {
  const response = await api.get(`/products/${productId}`);
  const data = response.data?.data ?? response.data;
  return normalizeProduct(data);
}

export async function createProduct(payload: ProductPayload) {
  const response = await api.post("/products", payload);
  return response.data?.data ?? response.data;
}

export async function updateProduct(
  productId: string,
  payload: ProductPayload,
) {
  const response = await api.patch(`/products/${productId}`, payload);
  return response.data?.data ?? response.data;
}

export async function deactivateProduct(productId: string) {
  const response = await api.patch(`/products/${productId}`, {
    status: false,
    quantity: 0,
  });

  return response.data?.data ?? response.data;
}
