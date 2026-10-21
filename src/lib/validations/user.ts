import { z } from "zod";

/**
 * Sanitizes and validates CPF (11 numeric digits)
 */
export function sanitizeCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

/**
 * Validates CPF algorithmically
 */
export function isValidCpf(cpf: string): boolean {
  const clean = sanitizeCpf(cpf);
  if (clean.length !== 11 || /^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  let remainder: number;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(clean.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(clean.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(10, 11))) return false;

  return true;
}

/**
 * Sanitizes phone numbers to digits only
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Calculates age based on ISO birth date (YYYY-MM-DD)
 */
export function calculateAge(birthDateIso: string): number {
  const [year, month, day] = birthDateIso.split("-").map(Number);
  const birth = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/**
 * Zod schema for clean user profiles
 */
export const userProfileSchema = z.object({
  uid: z.string().min(1, "UID é obrigatório"),
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres").trim(),
  email: z.string().email("E-mail inválido").trim().toLowerCase(),
  cpf: z.string().transform(sanitizeCpf).refine((val) => val.length === 11, "CPF deve ter 11 dígitos"),
  telefone: z.string().transform(sanitizePhone),
  dataNascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato AAAA-MM-DD"),
  idade: z.number().int().min(0),
  role: z.enum(["user", "admin", "staff"]).default("user"),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
  viaBot: z.boolean().optional(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;
