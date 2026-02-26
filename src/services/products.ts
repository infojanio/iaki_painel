import axios from "axios";

import { env } from "@/env";
import { Product } from "@/types/product";

const api = axios.create({
  baseURL: env.VITE_API_URL,
});

export async function getProducts(): Promise<Product[]> {
  const response = await api.get("/products");
  return response.data;
}

export async function getProductById(id: string): Promise<Product> {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

export async function createProduct(data: Partial<Product>) {
  await api.post("/products", data);
}

export async function updateProduct(id: string, data: Partial<Product>) {
  await api.put(`/products/${id}`, data);
}

export async function deleteProduct(id: string) {
  await api.delete(`/products/delete/${id}`);
}
