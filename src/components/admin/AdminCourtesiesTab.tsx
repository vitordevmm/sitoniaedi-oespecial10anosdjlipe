"use client";

import React, { useState } from "react";
import {
  Gift,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

interface CourtesyItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userCpf: string;
  sector: string;
  sectorName: string;
  status: "approved" | "used" | "cancelled";
  purchaseDate: string;
  note?: string;
  checkedInAt?: string | null;
}

interface AdminCourtesiesTabProps {
  courtesies: CourtesyItem[];
  page: number;
  totalPages: number;
  totalCourtesies: number;
  maxCourtesies: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onSearchChange: (search: string) => void;
  onIssueCourtesy: (userEmail: string, sector: string, note?: string) => Promise<boolean>;
  onAction: (ticketId: string, action: "revoke" | "validate" | "transfer", targetUserEmail?: string) => Promise<boolean>;
}

export function AdminCourtesiesTab({
  courtesies,
  page,
  totalPages,
  totalCourtesies,
  maxCourtesies,
  loading,
  onPageChange,
  onSearchChange,
  onIssueCourtesy,
  onAction,
}: AdminCourtesiesTabProps) {
  const [searchInput, setSearchInput] = useState("");
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [targetEmail, setTargetEmail] = useState("");
  const [sector, setSector] = useState("pista");
  const [note, setNote] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchInput);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail.trim()) return;

    setIssuing(true);
    const success = await onIssueCourtesy(targetEmail.trim(), sector, note);
    setIssuing(false);
    if (success) {
      setIssueModalOpen(false);
      setTargetEmail("");
      setNote("");
    }
  };

  const percentageUsed = Math.min(100, Math.round((totalCourtesies / (maxCourtesies || 1)) * 100));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* BARRA SUPERIOR: CONTADOR DE CORTESIAS & BOTÃO DE EMISSÃO */}
      <div className="p-5 rounded-2xl bg-[#101116] border border-[#c9a227]/30 shadow-[0_4px_25px_rgba(0,0,0,0.7)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-[#f6f8fc]">
              Gestão de Cortesias VIPs da Produção
            </h2>
          </div>
          <p className="text-xs text-[#a8b2c3] mt-0.5">
            Emita ingressos gratuitos para parceiros e convidados VIPs com QR Code nominal
          </p>

          {/* Barra de progresso do limite de cortesias */}
          <div className="mt-3 flex items-center gap-3">
            <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                style={{ width: `${percentageUsed}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-[#f5e6b8] rounded-full transition-all duration-500"
              />
            </div>
            <span className="text-xs font-bold text-[#f5e6b8]">
              {totalCourtesies} / {maxCourtesies} emitidas ({percentageUsed}%)
            </span>
          </div>
        </div>

        {/* Botão de Emitir Cortesia */}
        <button
          type="button"
          onClick={() => setIssueModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-extrabold text-[#07090d] bg-gradient-to-r from-amber-400 to-[#f5e6b8] hover:brightness-110 shadow-[0_0_20px_rgba(251,191,36,0.35)] transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Emitir Nova Cortesia</span>
        </button>
      </div>

      {/* BARRA DE BUSCA */}
      <div className="p-4 rounded-xl bg-[#101116] border border-[#0b1930] flex items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#a8b2c3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar cortesia por código, nome ou e-mail..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#07090d] border border-[#0b1930] focus:border-amber-400 text-xs text-[#f6f8fc] placeholder:text-[#a8b2c3]/50 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-xs font-bold text-[#07090d] bg-amber-400 hover:bg-amber-300 transition-all"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* TABELA DE CORTESIAS (50 POR PÁGINA) */}
      <div className="rounded-2xl bg-[#101116] border border-[#0b1930] shadow-[0_4px_25px_rgba(0,0,0,0.7)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#0b1930] flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[#a8b2c3]">
            Cortesias Emitidas ({totalCourtesies} registros) • 50 por página
          </p>
          <div className="text-xs text-[#a8b2c3]">
            Página <strong className="text-[#f6f8fc]">{page}</strong> de{" "}
            <strong className="text-[#f6f8fc]">{totalPages}</strong>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest text-[#a8b2c3]">Carregando cortesias...</p>
          </div>
        ) : courtesies.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#a8b2c3]/60 italic">
            Nenhuma cortesia emitida ainda. Clique em &quot;Emitir Nova Cortesia&quot; para presentear convidados VIPs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#a8b2c3]">
              <thead className="bg-[#07090d]/80 text-[10px] font-bold uppercase tracking-wider text-[#a8b2c3] border-b border-[#0b1930]">
                <tr>
                  <th className="py-3 px-4">Código / Voucher</th>
                  <th className="py-3 px-4">Convidado VIP</th>
                  <th className="py-3 px-4">Setor</th>
                  <th className="py-3 px-4">Anotação / Motivo</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0b1930]/50">
                {courtesies.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{c.id}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(c.id)}
                          className="text-[#a8b2c3]/60 hover:text-amber-400 transition-colors"
                        >
                          {copiedId === c.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] font-normal text-[#a8b2c3]/60 block font-sans">
                        {c.purchaseDate.split("T")[0]}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#f6f8fc] leading-tight">{c.userName}</p>
                      <p className="text-[10px] text-[#a8b2c3]/70 truncate max-w-[180px]">{c.userEmail}</p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-[#f6f8fc]">{c.sectorName}</span>
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-[#a8b2c3] max-w-[160px] truncate">
                      {c.note || "Cortesia Oficial da Produção"}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {c.status === "used" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" />
                          Utilizada na Entrada
                        </span>
                      )}
                      {c.status === "approved" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" />
                          Válida / Cortesia VIP
                        </span>
                      )}
                      {c.status === "cancelled" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1 w-max">
                          <XCircle className="w-3 h-3" />
                          Revogada
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.status === "approved" && (
                          <button
                            type="button"
                            onClick={() => onAction(c.id, "validate")}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#07090d] bg-emerald-400 hover:bg-emerald-300 transition-all active:scale-95"
                            title="Validar entrada na catraca"
                          >
                            Validar Entrada
                          </button>
                        )}
                        {c.status !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Deseja revogar a cortesia ${c.id} de ${c.userName}?`)) {
                                onAction(c.id, "revoke");
                              }
                            }}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                            title="Revogar cortesia"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
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

      {/* ========================================================
          MODAL: EMITIR NOVA CORTESIA
          ======================================================== */}
      {issueModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#101116] border border-amber-400/50 shadow-[0_10px_40px_rgba(0,0,0,0.9)] p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#0b1930] pb-3">
              <div className="flex items-center gap-2 text-[#f5e6b8] font-bold text-sm">
                <Gift className="w-5 h-5 text-amber-400" />
                <span>Emitir Ingresso Cortesia VIP</span>
              </div>
              <button
                type="button"
                onClick={() => setIssueModalOpen(false)}
                className="text-[#a8b2c3] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#a8b2c3] block mb-1.5">
                  E-mail do Usuário Cadastrado:
                </label>
                <input
                  type="email"
                  required
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090d] border border-[#0b1930] focus:border-amber-400 text-xs text-[#f6f8fc] focus:outline-none"
                />
                <p className="text-[10px] text-[#a8b2c3]/60 mt-1">
                  * O usuário precisa já possuir conta cadastrada no site.
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#a8b2c3] block mb-1.5">
                  Setor da Cortesia:
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090d] border border-[#0b1930] focus:border-amber-400 text-xs text-[#f6f8fc] focus:outline-none"
                >
                  <option value="pista">Pista Geral & Bar Central</option>
                  <option value="camarote">Camarote no Palco Oficial</option>
                  <option value="lounge_rosa">Lounge Rosa</option>
                  <option value="lounge_azul">Lounge Azul</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#a8b2c3] block mb-1.5">
                  Anotação / Observação Interna (Opcional):
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex: Convidado do DJ Lipe / Influenciador"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090d] border border-[#0b1930] focus:border-amber-400 text-xs text-[#f6f8fc] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a8b2c3] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={issuing}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#07090d] bg-gradient-to-r from-amber-400 to-[#f5e6b8] disabled:opacity-50"
                >
                  {issuing ? "Emitindo Cortesia..." : "Confirmar Emissão VIP"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
