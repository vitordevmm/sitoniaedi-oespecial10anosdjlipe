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
import { CustomDropdown, DropdownOption } from "@/components/ui/CustomDropdown";
import { GlowBadge } from "@/components/ui/GlowBadge";
import { UserSearchAutocomplete } from "@/components/admin/UserSearchAutocomplete";
import { AutocompleteUserItem } from "@/app/api/admin/users/search/route";
import { useConfirm } from "@/context/ConfirmContext";

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
  const [roleFilter, setRoleFilter] = useState("all");

  const { confirm } = useConfirm();

  const roleFilterOptions: DropdownOption[] = [
    { value: "all", label: "Todos os Cargos", icon: <Users className="w-3.5 h-3.5 text-[#a8b2c3]" /> },
    { value: "user", label: "Usuários Comuns (Clientes)", icon: <UserCheck className="w-3.5 h-3.5 text-[#a8b2c3]" /> },
    { value: "admin", label: "Administradores", icon: <ShieldAlert className="w-3.5 h-3.5 text-[#c9a227]" />, badge: "Admin", badgeColor: "bg-[#c9a227]/20 text-[#f5e6b8] border border-[#c9a227]/40" },
    { value: "staff", label: "Staff / Equipe de Apoio", icon: <Shield className="w-3.5 h-3.5 text-purple-400" />, badge: "Staff", badgeColor: "bg-purple-500/20 text-purple-300 border border-purple-500/40" },
  ];

  const userRoleOptions: DropdownOption[] = [
    { value: "user", label: "Usuário Comum" },
    { value: "admin", label: "Administrador", badge: "Admin", badgeColor: "bg-[#c9a227]/20 text-[#f5e6b8] border border-[#c9a227]/40" },
    { value: "staff", label: "Staff / Equipe", badge: "Staff", badgeColor: "bg-purple-500/20 text-purple-300 border border-purple-500/40" },
  ];

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

  const getUserAge = (u: UserItem) => {
    if (typeof u.idade === "number" && u.idade > 0) return u.idade;
    if (u.dataNascimento) {
      try {
        const [y, m, d] = u.dataNascimento.split("T")[0].split("-").map(Number);
        if (y && m && d) {
          const birth = new Date(y, m - 1, d);
          const today = new Date();
          let age = today.getFullYear() - birth.getFullYear();
          const monthDiff = today.getMonth() - birth.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
          }
          if (age >= 0 && age < 120) return age;
        }
      } catch {}
    }
    return null;
  };

  const handleRoleChange = async (user: UserItem, newRole: "user" | "admin" | "staff") => {
    if (user.role === newRole) return;
    const ok = await confirm({
      title: "Alterar Cargo de Usuário",
      description: (
        <span>
          Confirma a alteração de cargo de <strong className="text-[#f6f8fc]">{user.nome}</strong> de{" "}
          <strong className="text-[#a8b2c3] uppercase font-mono">{user.role}</strong> para{" "}
          <strong className="text-[#f5e6b8] uppercase font-mono">{newRole}</strong>?
        </span>
      ),
      confirmText: "Sim, Alterar Cargo",
      cancelText: "Cancelar",
      variant: newRole === "admin" ? "warning" : "gold",
    });
    if (ok) {
      setUpdatingId(user.id);
      await onUpdateRole(user.uid || user.id, user.email, newRole);
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* BARRA SUPERIOR: BUSCA E FILTROS */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#101116] border border-[#c9a227]/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Formulário de Busca com Autocomplete */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 max-w-xl">
          <UserSearchAutocomplete
            value={searchInput}
            onChange={(val) => setSearchInput(val)}
            placeholder="Buscar por CPF, nome, e-mail ou WhatsApp..."
            onSelectUser={(selectedUser: AutocompleteUserItem) => {
              const targetCpf = selectedUser.cpfFormatted || selectedUser.cpf || selectedUser.nome;
              setSearchInput(targetCpf);
              onSearchChange(targetCpf);
            }}
            onSubmitSearch={(val) => onSearchChange(val)}
            onClear={() => onSearchChange("")}
            size="md"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] hover:brightness-110 transition-all active:scale-95 flex-shrink-0"
          >
            Buscar
          </button>
        </form>

        {/* Filtro Role */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <CustomDropdown
            value={roleFilter}
            onChange={(val) => {
              setRoleFilter(val);
              onRoleFilterChange(val);
            }}
            options={roleFilterOptions}
            size="md"
            className="w-full md:w-auto"
            buttonClassName="rounded-xl w-full sm:min-w-[200px]"
          />
        </div>
      </div>

      {/* TABELA DE USUÁRIOS (50 POR PÁGINA) */}
      <div className="rounded-2xl bg-[#101116] border border-[#0b1930] shadow-[0_4px_25px_rgba(0,0,0,0.7)] overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#0b1930] flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#a8b2c3]">
            Base de Usuários ({totalUsers} cadastrados)
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
          <>
            {/* 1. VISUALIZAÇÃO DESKTOP: TABELA */}
            <div className="hidden md:block overflow-x-auto">
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
                        {(() => {
                          const age = getUserAge(u);
                          if (age !== null) {
                            return (
                              <span className="text-[10px] text-[#c9a227] font-semibold">
                                {age} anos
                              </span>
                            );
                          }
                          return (
                            <span className="text-[10px] text-[#a8b2c3]/50 italic">
                              Não informada
                            </span>
                          );
                        })()}
                      </td>

                      {/* Role / Seletor de Cargo */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CustomDropdown
                            value={u.role}
                            disabled={updatingId === u.id}
                            onChange={(val) =>
                              handleRoleChange(u, val as "user" | "admin" | "staff")
                            }
                            options={userRoleOptions}
                            size="sm"
                            className="min-w-[150px]"
                            buttonClassName={`font-bold transition-all ${
                              u.role === "admin"
                                ? "bg-[#c9a227]/15 text-[#f5e6b8] border-[#c9a227]/40 shadow-[0_0_10px_rgba(201,162,39,0.15)]"
                                : u.role === "staff"
                                ? "bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                                : "bg-[#07090d] text-[#a8b2c3] border-[#0b1930] hover:border-[#c9a227]/40"
                            }`}
                          />

                          {updatingId === u.id && (
                            <div className="w-3.5 h-3.5 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 2. VISUALIZAÇÃO MOBILE: CARDS RESPONSIVOS (ZERO SCROLL LATERAL) */}
            <div className="block md:hidden divide-y divide-[#0b1930]/80">
              {users.map((u) => {
                const age = getUserAge(u);
                return (
                  <div key={u.id} className="p-4 space-y-3 hover:bg-white/[0.01] transition-colors">
                    {/* Top: Nome e Role Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-[#f6f8fc] text-xs truncate">{u.nome}</p>
                      <div className="flex-shrink-0">
                        {u.role === "admin" ? (
                          <GlowBadge variant="amber" size="xs">
                            Admin
                          </GlowBadge>
                        ) : u.role === "staff" ? (
                          <GlowBadge variant="purple" size="xs">
                            Staff
                          </GlowBadge>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#07090d] text-[#a8b2c3] border border-[#0b1930]">
                            Cliente
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Email e CPF */}
                    <div className="bg-[#07090d]/60 rounded-xl p-3 border border-[#0b1930] space-y-1">
                      <p className="text-[11px] text-[#f5e6b8] font-mono truncate">{u.email}</p>
                      <div className="flex items-center justify-between text-[11px] text-[#a8b2c3]">
                        <span>CPF: <strong className="text-[#f6f8fc] font-mono">{formatCpf(u.cpf)}</strong></span>
                        {age !== null && (
                          <span className="text-[#c9a227] font-semibold">{age} anos</span>
                        )}
                      </div>
                    </div>

                    {/* Telefone e Nascimento */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-[#07090d]/40 border border-[#0b1930]">
                        <span className="text-[9px] text-[#a8b2c3] block uppercase tracking-wider">WhatsApp</span>
                        {u.telefone ? (
                          <a
                            href={`https://wa.me/55${u.telefone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 font-semibold flex items-center gap-1 truncate mt-0.5"
                          >
                            <Phone className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                            <span className="truncate">{u.telefone}</span>
                          </a>
                        ) : (
                          <span className="text-[#a8b2c3]/50">-</span>
                        )}
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#07090d]/40 border border-[#0b1930]">
                        <span className="text-[9px] text-[#a8b2c3] block uppercase tracking-wider">Nascimento</span>
                        <span className="text-[#f6f8fc] font-semibold block truncate mt-0.5">
                          {formatDateDisplay(u.dataNascimento)}
                        </span>
                      </div>
                    </div>

                    {/* Gestão de Cargo no Mobile */}
                    <div className="pt-1 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-[#a8b2c3] font-semibold">Alterar Cargo:</span>
                      <div className="flex items-center gap-2 flex-1 max-w-[170px]">
                        <CustomDropdown
                          value={u.role}
                          disabled={updatingId === u.id}
                          onChange={(val) =>
                            handleRoleChange(u, val as "user" | "admin" | "staff")
                          }
                          options={userRoleOptions}
                          size="sm"
                          className="w-full"
                          buttonClassName={`font-bold transition-all w-full ${
                            u.role === "admin"
                              ? "bg-[#c9a227]/15 text-[#f5e6b8] border-[#c9a227]/40"
                              : u.role === "staff"
                              ? "bg-purple-500/15 text-purple-300 border-purple-500/40"
                              : "bg-[#07090d] text-[#a8b2c3] border-[#0b1930]"
                          }`}
                        />
                        {updatingId === u.id && (
                          <div className="w-3.5 h-3.5 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
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
