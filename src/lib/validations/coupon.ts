import { z } from "zod";

/**
 * Normaliza o código do cupom:
 * Remove espaços laterais, converte para maiúsculas
 * e substitui caracteres inválidos.
 */
export function normalizeCouponCode(raw: string): string {
  if (!raw) return "";
  return raw
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^A-Z0-9_-]/g, ""); // Mantém apenas letras, números, _ e -
}

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(2, "Código deve ter ao menos 2 caracteres")
    .max(30, "Código deve ter no máximo 30 caracteres")
    .transform(normalizeCouponCode)
    .refine((val) => val.length >= 2, "Código inválido"),
  displayCode: z.string().max(30).optional(),
  influencerName: z
    .string()
    .min(2, "Nome do influencer deve ter ao menos 2 caracteres")
    .max(80, "Nome do influencer deve ter no máximo 80 caracteres")
    .trim(),
  influencerPhone: z.string().max(30).optional(),
  influencerEmail: z.string().email().optional().or(z.literal("")),
  influencerInstagram: z.string().max(60).optional(),
  discountType: z.enum(["none", "percentage", "fixed"]),
  discountValue: z.number().min(0, "Valor do desconto não pode ser negativo"),
  unlimited: z.boolean().default(true).optional(),
  isUnlimited: z.boolean().default(true).optional(),
  maxUses: z.number().int().min(1, "Limite mínimo é de 1 uso").nullable().optional(),
  active: z.boolean().default(true),
  notes: z.string().max(500).optional(),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;

export const updateCouponSchema = z.object({
  code: z.string().min(1).transform(normalizeCouponCode),
  displayCode: z.string().max(30).optional(),
  influencerName: z.string().min(2).max(80).trim().optional(),
  influencerPhone: z.string().max(30).optional(),
  influencerEmail: z.string().email().optional().or(z.literal("")),
  influencerInstagram: z.string().max(60).optional(),
  discountType: z.enum(["none", "percentage", "fixed"]).optional(),
  discountValue: z.number().min(0).optional(),
  unlimited: z.boolean().optional(),
  isUnlimited: z.boolean().optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  active: z.boolean().optional(),
  notes: z.string().max(500).optional(),
});

export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;

export const applyCouponSchema = z.object({
  code: z.string().min(1, "Informe o código do cupom").transform(normalizeCouponCode),
  sector: z.string().default("pista"),
  userId: z.string().optional(),
  userEmail: z.string().email().optional(),
  userName: z.string().optional(),
  userCpf: z.string().optional(),
});

export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
