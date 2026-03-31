import { z } from "zod";

export const planSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  price: z.coerce.number().min(0, "Preço inválido"),
  durationDays: z.coerce.number().min(1, "Duração inválida"),
  maxProducts: z.coerce.number().nullable(),
  maxBanners: z.coerce.number().nullable(),
  maxReels: z.coerce.number().nullable(),
  maxCategories: z.coerce.number().nullable(),
  isActive: z.boolean(),
});

export type PlanFormData = z.infer<typeof planSchema>;
