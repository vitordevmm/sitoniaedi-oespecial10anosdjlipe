"use client";

import React, { useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  QrCode,
  Camera,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertCircle,
  Copy,
  Check,
  User,
  Layers,
  Music2,
  Car,
  Crown,
} from "lucide-react";
import { CustomDropdown, DropdownOption } from "@/components/ui/CustomDropdown";
import { GlowBadge } from "@/components/ui/GlowBadge";
import { UserSearchAutocomplete } from "@/components/admin/UserSearchAutocomplete";
import { AutocompleteUserItem } from "@/app/api/admin/users/search/route";

interface TicketItem {
  id: string;
  ticketNumber?: number;
  ticketNumberFormatted?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userCpf: string;
  sector: string;
  sectorName: string;
  lotName: string;
  price: number;
  status: "approved" | "used" | "cancelled";
  isCourtesy: boolean;
  purchaseDate: string;
  paymentMethod: string;
  checkedInAt?: string | null;
  checkedInBy?: string | null;
}

interface AdminTicketsTabProps {
  tickets: TicketItem[];
  page: number;
  totalPages: number;
  totalTickets: number;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onSearchChange: (search: string) => void;
  onSectorFilterChange: (sector: string) => void;
  onStatusFilterChange: (status: string) => void;
  onAction: (ticketId: string, action: "revoke" | "validate" | "transfer", targetUserEmail?: string) => Promise<boolean>;
  onVerifyScanner: (rawCode: string) => Promise<any>;
}

export function AdminTicketsTab({
  tickets,
  page,
  totalPages,
  totalTickets,
  loading,
  onPageChange,
  onSearchChange,
  onSectorFilterChange,
  onStatusFilterChange,
  onAction,
  onVerifyScanner,
}: AdminTicketsTabProps) {
  const [searchInput, setSearchInput] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerCodeInput, setScannerCodeInput] = useState("");
  const [scannerResult, setScannerResult] = useState<any>(null);
  const [scannerLoading, setScannerLoading] = useState(false);

  // Transfer Modal State
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [targetEmail, setTargetEmail] = useState("");
  const [selectedTransferUser, setSelectedTransferUser] = useState<AutocompleteUserItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sectorFilter, setSectorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const sectorOptions: DropdownOption[] = [
    { value: "all", label: "Todos os Setores", icon: <Layers className="w-3.5 h-3.5 text-[#c9a227]" /> },
    { value: "pista", label: "Pista Geral & Bar Central", icon: <Music2 className="w-3.5 h-3.5 text-[#f5e6b8]" /> },
    { value: "lounge_rosa", label: "Lounge Rosa (12 Vagas)", icon: <Car className="w-3.5 h-3.5 text-pink-400" />, badge: "Rosa", badgeColor: "bg-pink-500/20 text-pink-300 border border-pink-500/40" },
    { value: "lounge_azul", label: "Lounge Azul (12 Vagas)", icon: <Car className="w-3.5 h-3.5 text-blue-400" />, badge: "Azul", badgeColor: "bg-blue-500/20 text-blue-300 border border-blue-500/40" },
    { value: "camarote", label: "Camarote no Palco", icon: <Crown className="w-3.5 h-3.5 text-[#c9a227]" />, badge: "VIP", badgeColor: "bg-[#c9a227]/20 text-[#f5e6b8] border border-[#c9a227]/40" },
  ];

  const statusOptions: DropdownOption[] = [
    { value: "all", label: "Todos os Status", icon: <Filter className="w-3.5 h-3.5 text-[#a8b2c3]" /> },
    { value: "approved", label: "Aprovados / Válidos", icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> },
    { value: "used", label: "Já Validados (Catraca)", icon: <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> },
    { value: "cancelled", label: "Revogados / Cancelados", icon: <XCircle className="w-3.5 h-3.5 text-red-400" /> },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchInput);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleScannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannerCodeInput.trim()) return;

    setScannerLoading(true);
    setScannerResult(null);
    try {
      const res = await onVerifyScanner(scannerCodeInput.trim());
      setScannerResult(res);
    } catch {
      setScannerResult({ found: false, message: "Erro ao comunicar com o servidor." });
    } finally {
      setScannerLoading(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !targetEmail.trim()) return;

    setActionLoading(true);
    const success = await onAction(selectedTicket.id, "transfer", targetEmail.trim());
    setActionLoading(false);
    if (success) {
      setTransferModalOpen(false);
      setSelectedTicket(null);
      setTargetEmail("");
      setSelectedTransferUser(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* BARRA SUPERIOR: BUSCA, FILTROS E SCANNER DE PORTARIA */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#101116] border border-[#c9a227]/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Formulário de Busca com Autocomplete */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 max-w-xl">
          <UserSearchAutocomplete
            value={searchInput}
            onChange={(val) => setSearchInput(val)}
            placeholder="Buscar por código, nome, e-mail ou CPF..."
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

        {/* Filtros e Scanner */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filtro Setor */}
          <CustomDropdown
            value={sectorFilter}
            onChange={(val) => {
              setSectorFilter(val);
              onSectorFilterChange(val);
            }}
            options={sectorOptions}
            size="md"
            className="w-full sm:w-auto"
            buttonClassName="rounded-xl min-w-[200px]"
          />

          {/* Filtro Status */}
          <CustomDropdown
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              onStatusFilterChange(val);
            }}
            options={statusOptions}
            size="md"
            className="w-full sm:w-auto"
            buttonClassName="rounded-xl min-w-[200px]"
          />

          {/* Botão Scanner Portaria */}
          <button
            type="button"
            onClick={() => {
              setScannerOpen(true);
              setScannerResult(null);
              setScannerCodeInput("");
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#07090d] bg-[#c9a227] hover:bg-[#f5e6b8] transition-all shadow-[0_0_15px_rgba(201,162,39,0.3)] active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Validar na Portaria</span>
          </button>
        </div>
      </div>

      {/* TABELA DE INGRESSOS (50 POR PÁGINA) */}
      <div className="rounded-2xl bg-[#101116] border border-[#0b1930] shadow-[0_4px_25px_rgba(0,0,0,0.7)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#0b1930] flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-[#a8b2c3]">
            Listagem de Ingressos ({totalTickets} registros) • 50 por página
          </p>
          <div className="text-xs text-[#a8b2c3]">
            Página <strong className="text-[#f6f8fc]">{page}</strong> de{" "}
            <strong className="text-[#f6f8fc]">{totalPages}</strong>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs uppercase tracking-widest text-[#a8b2c3]">Buscando ingressos...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#a8b2c3]/60 italic">
            Nenhum ingresso encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#a8b2c3]">
              <thead className="bg-[#07090d]/80 text-[10px] font-bold uppercase tracking-wider text-[#a8b2c3] border-b border-[#0b1930]">
                <tr>
                  <th className="py-3 px-4">Código / Voucher</th>
                  <th className="py-3 px-4">Titular (Dono)</th>
                  <th className="py-3 px-4">CPF</th>
                  <th className="py-3 px-4">Setor / Lote</th>
                  <th className="py-3 px-4">Valor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações de Gestão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0b1930]/50">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Código / Voucher com Número Sequencial */}
                    <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-black bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] shadow-sm">
                          {t.ticketNumberFormatted || `#${String(t.ticketNumber || 1).padStart(4, "0")}`}
                        </span>
                        <span className="text-xs text-[#f5e6b8]">{t.id}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(t.id)}
                          className="text-[#a8b2c3]/60 hover:text-[#f5e6b8] transition-colors"
                          title="Copiar código"
                        >
                          {copiedId === t.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] font-normal text-[#a8b2c3]/60 block font-sans">
                        {t.purchaseDate.split("T")[0]}
                      </span>
                    </td>

                    {/* Titular */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#f6f8fc] leading-tight">{t.userName}</p>
                      <p className="text-[10px] text-[#a8b2c3]/70 truncate max-w-[180px]">{t.userEmail}</p>
                    </td>

                    {/* CPF */}
                    <td className="py-3.5 px-4 font-mono whitespace-nowrap text-[#f6f8fc]">
                      {t.userCpf || "-"}
                    </td>

                    {/* Setor */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-[#f6f8fc] block">{t.sectorName}</span>
                      <span className="text-[10px] text-[#c9a227]">{t.lotName}</span>
                    </td>

                    {/* Valor */}
                    <td className="py-3.5 px-4 font-bold whitespace-nowrap">
                      {t.isCourtesy ? (
                        <GlowBadge variant="amber" size="xs">
                          CORTESIA
                        </GlowBadge>
                      ) : (
                        <span className="text-[#f5e6b8]">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(t.price)}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {t.status === "used" && (
                        <GlowBadge
                          variant="blue"
                          size="sm"
                          icon={<CheckCircle2 className="w-3 h-3" />}
                        >
                          Utilizado na Entrada
                        </GlowBadge>
                      )}
                      {t.status === "approved" && (
                        <GlowBadge
                          variant="emerald"
                          size="sm"
                          pulse
                          icon={<CheckCircle2 className="w-3 h-3" />}
                        >
                          Aprovado / Válido
                        </GlowBadge>
                      )}
                      {t.status === "cancelled" && (
                        <GlowBadge
                          variant="red"
                          size="sm"
                          icon={<XCircle className="w-3 h-3" />}
                        >
                          Revogado
                        </GlowBadge>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Validar Entrada */}
                        {t.status === "approved" && (
                          <button
                            type="button"
                            onClick={() => onAction(t.id, "validate")}
                            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-[#07090d] bg-emerald-400 hover:bg-emerald-300 transition-all active:scale-95"
                            title="Validar entrada na catraca"
                          >
                            Validar Entrada
                          </button>
                        )}

                        {/* Transferir */}
                        {t.status !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTicket(t);
                              setTargetEmail("");
                              setTransferModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-[#a8b2c3] hover:text-[#f5e6b8] hover:bg-[#0b1930] transition-all"
                            title="Transferir ingresso para outro usuário cadastrado"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                        )}

                        {/* Revogar */}
                        {t.status !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja REVOGAR e cancelar o ingresso ${t.id} de ${t.userName}? A entrada será bloqueada.`)) {
                                onAction(t.id, "revoke");
                              }
                            }}
                            className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                            title="Revogar ingresso"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#a8b2c3] hover:text-[#f6f8fc] bg-[#07090d] border border-[#0b1930] disabled:opacity-40 disabled:pointer-events-none transition-all"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#a8b2c3] hover:text-[#f6f8fc] bg-[#07090d] border border-[#0b1930] disabled:opacity-40 disabled:pointer-events-none transition-all"
            >
              <span>Próxima</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL: SCANNER / VALIDAÇÃO DE ENTRADA NA CATRACA
          ======================================================== */}
      {scannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#101116] border border-[#c9a227]/50 shadow-[0_10px_40px_rgba(0,0,0,0.9)] p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#0b1930] pb-3">
              <div className="flex items-center gap-2 text-[#f5e6b8] font-bold text-sm">
                <QrCode className="w-5 h-5 text-[#c9a227]" />
                <span>Portaria Oficial • Validador de QR Code</span>
              </div>
              <button
                type="button"
                onClick={() => setScannerOpen(false)}
                className="text-[#a8b2c3] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScannerSubmit} className="space-y-3">
              <label className="text-xs font-semibold text-[#a8b2c3] block">
                Bipe com o leitor ou digite o Código / Voucher do Ingresso:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  value={scannerCodeInput}
                  onChange={(e) => setScannerCodeInput(e.target.value)}
                  placeholder="Ex: SINTONIA-10A-8492041 ou cole o payload"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#07090d] border border-[#0b1930] focus:border-[#c9a227] text-xs text-[#f6f8fc] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={scannerLoading}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] disabled:opacity-50"
                >
                  {scannerLoading ? "Buscando..." : "Consultar"}
                </button>
              </div>
            </form>

            {/* Resultado da Leitura do Scanner */}
            {scannerResult && (
              <div
                className={`p-4 rounded-xl border ${
                  scannerResult.valid
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                    : "bg-red-500/10 border-red-500/40 text-red-300"
                } space-y-2.5`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {scannerResult.valid ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>INGRESSO VÁLIDO!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span>{scannerResult.message || "INGRESSO INVÁLIDO OU UTILIZADO"}</span>
                    </>
                  )}
                </div>

                {scannerResult.ticket && (
                  <div className="text-xs text-[#f6f8fc] space-y-1 pt-2 border-t border-white/10">
                    <p>
                      <strong>Titular:</strong> {scannerResult.ticket.userName}
                    </p>
                    <p>
                      <strong>CPF:</strong> {scannerResult.ticket.userCpf}
                    </p>
                    <p>
                      <strong>Setor:</strong> {scannerResult.ticket.sectorName}
                    </p>
                    <p>
                      <strong>Voucher:</strong> {scannerResult.ticket.id}
                    </p>
                    {scannerResult.ticket.status === "used" && (
                      <p className="text-red-400 font-bold">
                        ⚠️ Já utilizado em: {scannerResult.ticket.checkedInAt}
                      </p>
                    )}
                  </div>
                )}

                {scannerResult.valid && scannerResult.ticket && (
                  <button
                    type="button"
                    onClick={async () => {
                      const ok = await onAction(scannerResult.ticket.id, "validate");
                      if (ok) {
                        setScannerResult({
                          valid: false,
                          message: `Ingresso ${scannerResult.ticket.id} VALIDADO com sucesso na catraca!`,
                        });
                      }
                    }}
                    className="w-full mt-2 py-2.5 rounded-xl text-xs font-bold text-[#07090d] bg-emerald-400 hover:bg-emerald-300 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  >
                    Confirmar Entrada na Catraca
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: TRANSFERIR INGRESSO PARA USUÁRIO CADASTRADO
          ======================================================== */}
      {transferModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#101116] border border-[#c9a227]/50 shadow-[0_10px_40px_rgba(0,0,0,0.9)] p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#0b1930] pb-3">
              <div className="flex items-center gap-2 text-[#f5e6b8] font-bold text-sm">
                <ArrowRightLeft className="w-5 h-5 text-[#c9a227]" />
                <span>Transferir Titularidade do Ingresso</span>
              </div>
              <button
                type="button"
                onClick={() => setTransferModalOpen(false)}
                className="text-[#a8b2c3] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-[#a8b2c3] space-y-1 p-3 rounded-xl bg-[#07090d] border border-[#0b1930]">
              <p>
                <strong>Voucher:</strong> <span className="text-[#f5e6b8]">{selectedTicket.id}</span>
              </p>
              <p>
                <strong>Titular Atual:</strong> {selectedTicket.userName} ({selectedTicket.userEmail})
              </p>
              <p>
                <strong>Setor:</strong> {selectedTicket.sectorName}
              </p>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#a8b2c3] block mb-1.5">
                  Buscar Novo Titular por CPF, Nome ou E-mail:
                </label>
                <UserSearchAutocomplete
                  value={targetEmail}
                  onChange={(val) => {
                    setTargetEmail(val);
                    if (!val) setSelectedTransferUser(null);
                  }}
                  placeholder="Comece a digitar CPF, nome ou e-mail..."
                  onSelectUser={(selectedUser: AutocompleteUserItem) => {
                    setTargetEmail(selectedUser.email);
                    setSelectedTransferUser(selectedUser);
                  }}
                  size="md"
                />

                {/* Card de Confirmação do Usuário Selecionado */}
                {selectedTransferUser ? (
                  <div className="mt-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs animate-in fade-in">
                    <div>
                      <p className="font-bold text-[#f6f8fc]">{selectedTransferUser.nome}</p>
                      <p className="text-[11px] text-emerald-400 font-mono">
                        CPF: {selectedTransferUser.cpfFormatted || selectedTransferUser.cpf || "Não informado"}
                      </p>
                      <p className="text-[10px] text-[#a8b2c3]">{selectedTransferUser.email}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ✓ Selecionado
                    </span>
                  </div>
                ) : (
                  <p className="text-[10px] text-[#a8b2c3]/60 mt-1">
                    * Digite o CPF ou nome do usuário cadastrado e selecione com Enter ou clique. O QR Code será regerado no nome dele.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTransferModalOpen(false);
                    setSelectedTransferUser(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#a8b2c3] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] disabled:opacity-50"
                >
                  {actionLoading ? "Transferindo..." : "Confirmar Transferência"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
