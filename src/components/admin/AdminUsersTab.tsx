"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

interface UserItem {
  id: string;
  uid: string;
  email: string;
  nome: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
  idade: number;
  role: "user" | "admin" | "staff";
  createdAt: string;
}

interface AdminUsersTabProps {
  users: UserItem[];
  page: number;
  totalPages: number;
  totalUsers: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onSearchChange: (search: string) => void;
  onRoleFilterChange: (role: string) => void;
  onUpdateRole: (userId: string, email: string, newRole: "user" | "admin" | "staff") => Promise<boolean>;
}

export function AdminUsersTab({
  users,
  page,
  totalPages,
  totalUsers,
  loading,
  onPageChange,
  onSearchChange,
  onRoleFilterChange,
  onUpdateRole,
}: AdminUsersTabProps) {
  const [searchInput, setSearchInput] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchInput);
  };

  const formatCpf = (cpfRaw: string) => {
    const clean = cpfRaw.replace(/\D/g, "");
    if (clean.length === 11) {
      return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
    }
    return cpfRaw;
  };

  const formatDateDisplay = (dateRaw: string) => {
    if (!dateRaw) return "-";
    try {
      const [y, m, d] = dateRaw.split("T")[0].split("-");
      if (y && m && d) return `${d}/${m}/${y}`;
      return dateRaw;
    } catch {
      return dateRaw;
    }
  };

  const handleRoleChange = async (user: UserItem, newRole: "user" | "admin" | "staff") => {
    if (user.role === newRole) return;
    if (
      confirm(
        `Confirma a alteração de cargo de ${user.nome} de "${user.role.toUpperCase()}" para "${newRole.toUpperCase()}"?`
      )
    ) {
      setUpdatingId(user.id);
      await onUpdateRole(user.uid || user.id, user.email, newRole);
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* BARRA SUPERIOR: BUSCA E FILTROS */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#101116] border border-[#c9a227]/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Formulário de Busca */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#a8b2c3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nome, e-mail, CPF ou WhatsApp..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07090d] border border-[#0b1930] focus:border-[#c9a227] text-xs text-[#f6f8fc] placeholder:text-[#a8b2c3]/50 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] hover:brightness-110 transition-all active:scale-95"
          >
            Buscar
          </button>
        </form>

        {/* Filtro Role */}
        <div className="flex items-center gap-2.5">
          <select
            onChange={(e) => onRoleFilterChange(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#07090d] border border-[#0b1930] text-xs text-[#f6f8fc] focus:outline-none focus:border-[#c9a227]"
          >
            <option value="all">Todos os Cargos</option>
            <option value="user">Usuários Comuns (Clientes)</option>
            <option value="admin">Administradores</option>
            <option value="staff">Staff / Equipe</option>
          </select>
        </div>
      </div>

      {/* TABELA DE USUÁRIOS (50 POR PÁGINA) */}
      <div className="rounded-2xl bg-[#101116] border border-[#0b1930] shadow-[0_4px_25px_rgba(0,0,0,0.7)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#0b1930] flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[#a8b2c3]">
            Base Oficial de Usuários ({totalUsers} cadastrados) • 50 por página
          </p>
          <div className="text-xs text-[#a8b2c3]">
            Página <strong className="text-[#f6f8fc]">{page}</strong> de{" "}
            <strong className="text-[#f6f8fc]">{totalPages}</strong>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest text-[#a8b2c3]">Carregando base de usuários...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#a8b2c3]/60 italic">
            Nenhum usuário encontrado com os filtros informados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#a8b2c3]">
              <thead className="bg-[#07090d]/80 text-[10px] font-bold uppercase tracking-wider text-[#a8b2c3] border-b border-[#0b1930]">
                <tr>
                  <th className="py-3 px-4">Nome Completo</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">CPF</th>
                  <th className="py-3 px-4">Celular / WhatsApp</th>
                  <th className="py-3 px-4">Nascimento / Idade</th>
                  <th className="py-3 px-4">Cargo / Função</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0b1930]/50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Nome */}
                    <td className="py-3.5 px-4 font-bold text-[#f6f8fc] whitespace-nowrap">
                      {u.nome}
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-[#f5e6b8]">
                      {u.email}
                    </td>

                    {/* CPF */}
                    <td className="py-3.5 px-4 font-mono whitespace-nowrap text-[#f6f8fc]">
                      {formatCpf(u.cpf)}
                    </td>

                    {/* Telefone */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {u.telefone ? (
                        <a
                          href={`https://wa.me/55${u.telefone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#a8b2c3] hover:text-emerald-400 flex items-center gap-1 transition-colors"
                        >
                          <Phone className="w-3 h-3 text-emerald-500" />
                          <span>{u.telefone}</span>
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Nascimento & Idade */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[#f6f8fc] block">{formatDateDisplay(u.dataNascimento)}</span>
                      <span className="text-[10px] text-[#c9a227] font-semibold">
                        {u.idade > 0 ? `${u.idade} anos` : "Idade calculada no login"}
                      </span>
                    </td>

                    {/* Role / Seletor de Cargo */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <select
                          value={u.role}
                          disabled={updatingId === u.id}
                          onChange={(e) =>
                            handleRoleChange(u, e.target.value as "user" | "admin" | "staff")
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer focus:outline-none ${
                            u.role === "admin"
                              ? "bg-[#c9a227]/15 text-[#f5e6b8] border-[#c9a227]/40"
                              : u.role === "staff"
                              ? "bg-purple-500/15 text-purple-300 border-purple-500/40"
                              : "bg-[#07090d] text-[#a8b2c3] border-[#0b1930] hover:border-[#c9a227]/40"
                          }`}
                        >
                          <option value="user">Usuário Comum</option>
                          <option value="admin">Administrador</option>
                          <option value="staff">Staff / Equipe</option>
                        </select>

                        {updatingId === u.id && (
                          <div className="w-3 h-3 border border-[#c9a227] border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINAÇÃO INFERIOR */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#0b1930] flex items-center justify-between">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#a8b2c3] hover:text-[#f6f8fc] bg-[#07090d] border border-[#0b1930] disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>
            <span className="text-xs text-[#a8b2c3]">
              Página <strong className="text-[#f6f8fc]">{page}</strong> de{" "}
              <strong className="text-[#f6f8fc]">{totalPages}</strong>
            </span>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#a8b2c3] hover:text-[#f6f8fc] bg-[#07090d] border border-[#0b1930] disabled:opacity-40"
            >
              <span>Próxima</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
