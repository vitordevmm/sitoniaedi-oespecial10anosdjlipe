export type UserRole = "user" | "admin" | "staff";

export interface UserProfile {
  uid: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: string; // ISO YYYY-MM-DD
  idade: number;
  role: UserRole;
  createdAt: string | number | Date;
  updatedAt?: string | number | Date;
  viaBot?: boolean;
}

export interface UserCleanData {
  uid: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  idade: number;
  role: UserRole;
}
