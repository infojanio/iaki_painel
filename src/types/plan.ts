export interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  maxProducts: number | null;
  maxBanners: number | null;
  maxReels: number | null;
  maxCategories: number | null;
  isActive: boolean;
  createdAt: string;
}
