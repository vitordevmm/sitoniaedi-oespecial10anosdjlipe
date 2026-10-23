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
} from "lucide-react";

interface TicketItem {
  id: string;
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
  const [actionLoading, setActionLoading] = useState(false);
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
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* BARRA SUPERIOR: BUSCA, FILTROS E SCANNER DE PORTARIA */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#101116] border border-[#c9a227]/30 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Formulário de Busca */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2 max-w-xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#a8b2c3] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por código, nome, e-mail ou CPF..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07090d] border border-[#0b1930] focus:border-[#c9a227] text-xs text-[#f6f8fc] placeholder:text-[#a8b2c3]/50 focus:outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] hover:brightness-110 transition-all active:scale-95"
          >
            Buscar
          </button>
        </form>

        {/* Filtros e Scanner */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filtro Setor */}
          <select
            onChange={(e) => onSectorFilterChange(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#07090d] border border-[#0b1930] text-xs text-[#f6f8fc] focus:outline-none focus:border-[#c9a227]"
          >
            <option value="all">Todos os Setores</option>
            <option value="pista">Pista</option>
            <option value="lounge_rosa">Lounge Rosa</option>
            <option value="lounge_azul">Lounge Azul</option>
            <option value="camarote">Camarote</option>
          </select>

          {/* Filtro Status */}
          <select
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#07090d] border border-[#0b1930] text-xs text-[#f6f8fc] focus:outline-none focus:border-[#c9a227]"
          >
            <option value="all">Todos os Status</option>
            <option value="approved">Aprovados / Válidos</option>
            <option value="used">Já Validados (Catraca)</option>
            <option value="cancelled">Revogados</option>
          </select>

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
                    {/* Código / Voucher */}
                    <td className="py-3.5 px-4 font-mono font-bold text-[#f5e6b8] whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{t.id}</span>
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
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px]">
                          CORTESIA
                        </span>
                      ) : (
                        <span className="text-[#f5e6b8]">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(t.price)}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {t.status === "used" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" />
                          Utilizado na Entrada
                        </span>
                      )}
                      {t.status === "approved" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" />
                          Aprovado / Válido
                        </span>
                      )}
                      {t.status === "cancelled" && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1 w-max">
                          <XCircle className="w-3 h-3" />
                          Revogado
                        </span>
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
                  E-mail do Novo Titular (deve ter conta criada no site):
                </label>
                <input
                  type="email"
                  required
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#07090d] border border-[#0b1930] focus:border-[#c9a227] text-xs text-[#f6f8fc] focus:outline-none"
                />
                <p className="text-[10px] text-[#a8b2c3]/60 mt-1">
                  * O QR Code será regerado no nome da nova pessoa e o voucher será enviado automaticamente para o e-mail dela.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
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
