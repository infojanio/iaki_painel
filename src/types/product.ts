export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  image?: string;
  status: boolean;
  cashback_percentage: number;
  store_id: string;
  subcategory_id: string;
  created_at: string;
}
