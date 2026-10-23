"use client";

import React, { useState, useEffect, use, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  User,
  IdCard,
  Calendar,
  Ticket as TicketIcon,
  Clock,
  Sparkles,
  ArrowLeft,
  Lock,
  Mail,
  AlertOctagon,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface TicketValidationData {
  id: string;
  ticketNumber: number;
  ticketNumberFormatted: string;
  userName: string;
  userEmail: string;
  userCpf: string;
  userAge: number | null;
  userBirthDate: string | null;
  sector: string;
  sectorName: string;
  lotName: string;
  price: number;
  status: "approved" | "used" | "cancelled";
  isCourtesy: boolean;
  purchaseDate: string | null;
  checkedInAt: string | null;
  checkedInBy: string | null;
  isMinor: boolean;
  minAgeRequired: number;
}

// Emite bip de feedback sonoro nativo via Web Audio API
function playSound(type: "success" | "error") {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === "success") {
      // Dois bips ascendentes harmônicos de confirmação (D5 -> A5)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc1.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.35);
    } else {
      // Tom grave descendente de erro
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(140, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    console.warn("Audio playback not supported or blocked by browser gesture policy", e);
  }
}

// Aciona vibração tátil no celular
function triggerVibration(type: "success" | "error") {
  if (typeof window !== "undefined" && "navigator" in window && navigator.vibrate) {
    if (type === "success") {
      navigator.vibrate([120, 80, 150]);
    } else {
      navigator.vibrate([300, 100, 300]);
    }
  }
}

function ValidarContent({ ticketId }: { ticketId: string }) {

  const { user, profile, loading: authLoading, login } = useAuth();

  const [ticket, setTicket] = useState<TicketValidationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de ação de validação
  const [validating, setValidating] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Estados do formulário de login para portaria
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Carrega dados do ingresso
  const fetchTicket = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      const token = await user.getIdToken();
      const res = await fetch(`/api/portaria/ticket/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao consultar ingresso.");
      }

      setTicket(data.ticket);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Não foi possível carregar os dados deste ingresso.");
      playSound("error");
      triggerVibration("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchTicket();
    }
  }, [user, authLoading, ticketId]);

  // Login direto para equipe de portaria
  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      await login(staffEmail.trim(), staffPassword);
    } catch (err: any) {
      console.error(err);
      setLoginError("Credenciais de portaria inválidas. Verifique seu e-mail e senha.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Ação de confirmar validação de entrada
  const handleConfirmValidation = async () => {
    if (!user || !ticket) return;
    try {
      setValidating(true);
      setValidationError(null);

      const token = await user.getIdToken();
      const res = await fetch("/api/admin/tickets/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ticketId: ticket.id,
          action: "validate",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Não foi possível validar a entrada.");
      }

      // Sucesso na catraca
      setValidationSuccess(true);
      playSound("success");
      triggerVibration("success");

      // Atualiza estado local
      setTicket((prev) =>
        prev
          ? {
              ...prev,
              status: "used",
              checkedInAt: data.checkedInAt || new Date().toISOString(),
              checkedInBy: user.email || "Portaria",
            }
          : null
      );
    } catch (err: any) {
      console.error(err);
      setValidationError(err.message || "Erro ao validar entrada.");
      playSound("error");
      triggerVibration("error");
    } finally {
      setValidating(false);
    }
  };

  // Formata CPF
  const formatCpf = (cpf?: string) => {
    if (!cpf) return "Não informado";
    const clean = cpf.replace(/\D/g, "");
    if (clean.length === 11) {
      return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
    }
    return cpf;
  };

  // Formata Data/Hora
  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "Horário não registrado";
    try {
      const d = new Date(iso);
      return d.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  // 1. Tela de Carregamento Geral de Autenticação
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#07090d] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#c9a227]" />
        <p className="text-xs text-[#a8b2c3] mt-3 tracking-widest uppercase">
          Carregando Validador de Portaria...
        </p>
      </div>
    );
  }

  // 2. Tela de Login Rápido da Portaria se o fiscal não estiver conectado
  if (!user) {
    return (
      <div className="min-h-screen bg-[#07090d] text-[#f6f8fc] flex items-center justify-center p-4 selection:bg-[#c9a227] selection:text-[#07090d]">
        <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#101116] to-[#07090d] border border-[#0b1930] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] absolute top-0 left-0 right-0" />

          {/* Logo Header */}
          <div className="flex flex-col items-center text-center mb-6 pt-2">
            <div className="relative w-16 h-16 mb-3">
              <Image
                src="/assets/logos/logo-especial-10-anos-lipe.svg"
                alt="Especial 10 Anos DJ Lipe"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full bg-[#c9a227]/15 text-[#f5e6b8] border border-[#c9a227]/30">
              Controle de Portaria & Catracas
            </span>
            <h2 className="text-xl font-black text-[#f6f8fc] mt-2">Acesso Restrito da Equipe</h2>
            <p className="text-xs text-[#a8b2c3] mt-1">
              Faça login com sua conta autorizada para validar este ingresso na portaria do evento.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#a8b2c3] mb-1.5 uppercase tracking-wider">
                E-mail Autorizado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#a8b2c3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="equipe@sintonia.com"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#07090d] border border-[#0b1930] focus:border-[#c9a227] text-sm text-[#f6f8fc] placeholder-[#a8b2c3]/40 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#a8b2c3] mb-1.5 uppercase tracking-wider">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#a8b2c3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-[#07090d] border border-[#0b1930] focus:border-[#c9a227] text-sm text-[#f6f8fc] placeholder-[#a8b2c3]/40 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full h-12 rounded-xl text-sm font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] via-[#e2bd44] to-[#f5e6b8] shadow-[0_0_20px_rgba(201,162,39,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Entrar & Validar Ingresso</span>
            </button>
          </form>

          <div className="text-center mt-6">
            <Link href="/" className="text-xs text-[#a8b2c3] hover:text-[#f5e6b8] transition-colors">
              ← Voltar ao Início do Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Verificação de Permissão: Apenas Admin ou Staff
  const isAuthorized = profile?.role === "admin" || profile?.role === "staff";
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#07090d] text-[#f6f8fc] flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-[#101116] border border-red-900/40 p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-800/40 text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#f6f8fc]">Acesso Não Autorizado</h2>
          <p className="text-xs text-[#a8b2c3] mt-2 leading-relaxed">
            Sua conta (<span className="text-[#f6f8fc] font-bold">{user.email}</span>) não possui permissão de
            equipe de portaria (<code className="text-[#c9a227]">staff</code>) ou administrador (<code className="text-[#c9a227]">admin</code>) para realizar a validação óptica de catracas.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/"
              className="w-full py-3 rounded-xl bg-[#0b1930] hover:bg-[#0b1930]/80 text-xs font-bold text-[#f5e6b8] transition-all"
            >
              Ir para a Página Inicial
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Carregamento dos dados do ingresso
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090d] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#c9a227]" />
        <p className="text-sm font-bold text-[#f6f8fc] mt-4">Consultando ingresso #{ticketId}...</p>
        <p className="text-xs text-[#a8b2c3] mt-1">Verificando autenticidade na base segura do Capitu</p>
      </div>
    );
  }

  // 5. Erro caso o ingresso não exista
  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#07090d] text-[#f6f8fc] flex items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-3xl bg-[#101116] border border-red-800/50 p-6 sm:p-8 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <XCircle className="w-9 h-9" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-red-950/60 text-red-300 border border-red-800/50">
            Código Inválido ou Falso
          </span>
          <h2 className="text-2xl font-black text-red-200 mt-3">Ingresso Não Encontrado</h2>
          <p className="text-sm text-[#a8b2c3] mt-2 leading-relaxed">
            {error || "O código deste QR Code não existe no banco de dados do festival."}
          </p>
          <div className="mt-4 p-3 rounded-xl bg-[#07090d] border border-[#0b1930] font-mono text-xs text-[#c9a227] break-all">
            Código lido: {ticketId}
          </div>
          <button
            type="button"
            onClick={fetchTicket}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0b1930] border border-[#c9a227]/40 text-xs font-bold text-[#f5e6b8] hover:scale-105 active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      </div>
    );
  }

  const isUsed = ticket.status === "used";
  const isCancelled = ticket.status === "cancelled";
  const isApproved = ticket.status === "approved";

  return (
    <div className="min-h-screen bg-[#07090d] text-[#f6f8fc] selection:bg-[#c9a227] selection:text-[#07090d] pb-12">
      {/* Top Header Glow Bar */}
      <div
        className={`h-2 w-full fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          validationSuccess
            ? "bg-emerald-500 shadow-[0_0_25px_rgba(52,211,153,0.8)]"
            : isUsed
            ? "bg-red-600 shadow-[0_0_25px_rgba(239,68,68,0.8)]"
            : "bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227]"
        }`}
      />

      {/* Mini Portaria Navbar */}
      <header className="border-b border-[#0b1930] bg-[#101116]/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 flex-shrink-0">
              <Image
                src="/assets/logos/logo-especial-10-anos-lipe.svg"
                alt="Sintonia 10 Anos"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-xs font-black text-[#f5e6b8] tracking-wider uppercase">
                Portaria Capitu
              </p>
              <p className="text-[10px] text-[#a8b2c3] truncate max-w-[180px] sm:max-w-none">
                Fiscal: <span className="text-[#f6f8fc] font-bold">{user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="text-[11px] font-bold text-[#c9a227] hover:text-[#f5e6b8] px-3 py-1.5 rounded-lg bg-[#07090d] border border-[#0b1930] transition-colors"
              >
                Painel Geral
              </Link>
            )}
            <button
              type="button"
              onClick={fetchTicket}
              title="Recarregar ingresso"
              className="p-2 rounded-lg bg-[#07090d] border border-[#0b1930] text-[#a8b2c3] hover:text-[#f5e6b8] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Validation Container */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* Banner de Status de Entrada Superior */}
        {validationSuccess ? (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-emerald-950/60 to-emerald-900/30 border-2 border-emerald-500 text-center shadow-[0_0_50px_rgba(52,211,153,0.35)] animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-[#07090d] flex items-center justify-center mx-auto mb-3 shadow-[0_0_30px_rgba(52,211,153,0.8)]">
              <CheckCircle2 className="w-10 h-10 stroke-[3]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-emerald-300 uppercase tracking-tight">
              ENTRADA LIBERADA!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 font-semibold">
              Catraca liberada para {ticket.userName} • {ticket.sectorName}
            </p>
            <p className="text-[11px] text-emerald-400/80 mt-2">
              Validado em {formatDateTime(ticket.checkedInAt)}
            </p>
          </div>
        ) : isUsed ? (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-red-950/80 to-red-900/40 border-2 border-red-500 text-center shadow-[0_0_50px_rgba(239,68,68,0.4)] animate-in pulse duration-700">
            <div className="w-16 h-16 rounded-full bg-red-600 text-[#f6f8fc] flex items-center justify-center mx-auto mb-3 shadow-[0_0_30px_rgba(239,68,68,0.8)]">
              <AlertOctagon className="w-10 h-10 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-red-200 uppercase tracking-tight">
              INGRESSO JÁ UTILIZADO!
            </h1>
            <p className="text-xs sm:text-sm text-red-300 mt-1 font-bold">
              ATENÇÃO: Este ingresso já realizou check-in e NÃO PODE entrar novamente!
            </p>
            <div className="mt-3 p-3 rounded-xl bg-[#07090d]/80 border border-red-800/50 text-xs text-red-200 text-left space-y-1">
              <p>
                🕒 <strong>Entrada efetuada em:</strong> {formatDateTime(ticket.checkedInAt)}
              </p>
              <p>
                👤 <strong>Fiscal responsável:</strong> {ticket.checkedInBy || "Portaria Oficial"}
              </p>
            </div>
          </div>
        ) : isCancelled ? (
          <div className="p-5 sm:p-6 rounded-3xl bg-red-950/60 border-2 border-red-500 text-center">
            <XCircle className="w-14 h-14 text-red-500 mx-auto mb-2" />
            <h1 className="text-2xl font-black text-red-200 uppercase">INGRESSO CANCELADO / REVOGADO</h1>
            <p className="text-xs text-red-300 mt-1">Este voucher foi cancelado administrativamente.</p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-between gap-3 text-emerald-300">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                VOUCHER VÁLIDO • AGUARDANDO LIBERAÇÃO
              </span>
            </div>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-200">
              OK
            </span>
          </div>
        )}

        {/* ALERTA OBRIGATÓRIO DE MENOR DE IDADE */}
        {ticket.isMinor && (
          <div className="p-5 rounded-3xl bg-amber-500/15 border-2 border-amber-500/80 text-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.25)] space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-[#07090d] flex items-center justify-center font-black flex-shrink-0 shadow-lg">
                <AlertTriangle className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#f5e6b8] tracking-tight uppercase">
                  ATENÇÃO: PARTICIPANTE MENOR DE {ticket.minAgeRequired} ANOS!
                </h3>
                <p className="text-xs font-bold text-amber-300">
                  Idade calculada do titular: {ticket.userAge} anos
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#07090d]/90 border border-amber-500/40 text-xs text-[#f6f8fc] space-y-1.5 leading-relaxed">
              <p className="font-bold text-amber-400">
                📋 Procedimento Obrigatório da Portaria:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[#a8b2c3]">
                <li>
                  Exigir o <strong className="text-[#f6f8fc]">Termo Físico de Autorização assinado</strong> pelos pais ou responsável legal com cópia de documento anexada;
                </li>
                <li>
                  <strong className="text-[#f6f8fc]">OU</strong> confirmar se o menor está no momento da entrada na presença do seu <strong className="text-[#f6f8fc]">responsável legal civilmente capaz</strong>.
                </li>
                <li>
                  Conferir se o documento oficial com foto bate rigorosamente com o CPF e Nome na tela.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Card Principal com Dados Oficiais do Titular */}
        <div className="rounded-3xl bg-gradient-to-b from-[#101116] to-[#07090d] border border-[#0b1930] p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
          {/* Header do Card com Número do Ingresso */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#0b1930] pb-5">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a8b2c3] block mb-1">
                Número do Ingresso
              </span>
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] font-mono tracking-tight">
                  {ticket.ticketNumberFormatted}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#07090d] border border-[#0b1930] text-[#a8b2c3] font-mono">
                  {ticket.id}
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#a8b2c3] block mb-1">
                Setor do Evento
              </span>
              <span className="text-sm sm:text-base font-black text-[#f6f8fc] block">
                {ticket.sectorName}
              </span>
              <span className="text-xs text-[#f5e6b8] font-bold">
                {ticket.isCourtesy
                  ? "Cortesia Oficial VIP"
                  : `Valor Pago: R$ ${ticket.price.toFixed(2).replace(".", ",")}`}
              </span>
            </div>
          </div>

          {/* Dados Pessoais do Portador */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome Completo */}
            <div className="p-4 rounded-2xl bg-[#07090d] border border-[#0b1930]">
              <span className="text-[10px] uppercase font-bold text-[#a8b2c3] flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-[#c9a227]" />
                Nome do Titular
              </span>
              <p className="text-base sm:text-lg font-black text-[#f6f8fc] break-words">
                {ticket.userName}
              </p>
            </div>

            {/* Idade & Nascimento */}
            <div
              className={`p-4 rounded-2xl border ${
                ticket.isMinor
                  ? "bg-amber-500/10 border-amber-500/40"
                  : "bg-[#07090d] border-[#0b1930]"
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-[#a8b2c3] flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#c9a227]" />
                Idade do Participante
              </span>
              <div className="flex items-baseline gap-2">
                <p
                  className={`text-base sm:text-lg font-black ${
                    ticket.isMinor ? "text-amber-300" : "text-[#f6f8fc]"
                  }`}
                >
                  {ticket.userAge !== null ? `${ticket.userAge} anos` : "Não informada"}
                </p>
                {ticket.userBirthDate && (
                  <span className="text-xs text-[#a8b2c3]">
                    (Nasc: {ticket.userBirthDate.split("-").reverse().join("/")})
                  </span>
                )}
              </div>
            </div>

            {/* Documento CPF */}
            <div className="p-4 rounded-2xl bg-[#07090d] border border-[#0b1930]">
              <span className="text-[10px] uppercase font-bold text-[#a8b2c3] flex items-center gap-1.5 mb-1">
                <IdCard className="w-3.5 h-3.5 text-[#c9a227]" />
                CPF (Conferir com Documento)
              </span>
              <p className="text-base sm:text-lg font-black text-[#f6f8fc] font-mono tracking-wider">
                {formatCpf(ticket.userCpf)}
              </p>
            </div>

            {/* Lote & Tipo */}
            <div className="p-4 rounded-2xl bg-[#07090d] border border-[#0b1930]">
              <span className="text-[10px] uppercase font-bold text-[#a8b2c3] flex items-center gap-1.5 mb-1">
                <TicketIcon className="w-3.5 h-3.5 text-[#c9a227]" />
                Lote de Compra
              </span>
              <p className="text-base sm:text-lg font-black text-[#f6f8fc]">
                {ticket.lotName}
              </p>
            </div>
          </div>

          {validationError && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* BOTÃO PRINCIPAL DE VALIDAÇÃO DE ENTRADA NA CATRACA */}
          <div className="pt-2">
            {isApproved ? (
              <button
                type="button"
                onClick={handleConfirmValidation}
                disabled={validating}
                className="w-full min-h-[64px] py-4 px-6 rounded-2xl text-base sm:text-lg font-black text-[#07090d] bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400 hover:from-emerald-300 hover:to-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-wider disabled:opacity-50"
              >
                {validating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Registrando Entrada...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                    <span>VALIDAR ENTRADA NA CATRACA</span>
                  </>
                )}
              </button>
            ) : isUsed ? (
              <div className="w-full py-4 px-6 rounded-2xl bg-red-950/30 border border-red-800/40 text-center text-red-300 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                <XCircle className="w-5 h-5 text-red-400" />
                <span>ENTRADA JÁ CONFIRMADA ANTERIORMENTE • CATRACA BLOQUEADA</span>
              </div>
            ) : (
              <div className="w-full py-4 px-6 rounded-2xl bg-red-950/30 border border-red-800/40 text-center text-red-300 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                <XCircle className="w-5 h-5 text-red-400" />
                <span>INGRESSO REVOGADO OU CANCELADO</span>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé Institucional da Portaria */}
        <div className="text-center text-xs text-[#a8b2c3] space-y-1">
          <p>Sintonia Edição Especial 10 Anos DJ Lipe • Parque Capitu, Tupaciguara - MG</p>
          <p className="text-[10px] text-[#a8b2c3]/60">
            Realização & Produção: GHVE Eventos & RL Produções
          </p>
        </div>
      </main>
    </div>
  );
}

function ValidarResolver({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <ValidarContent ticketId={resolvedParams.id} />;
}

export default function ValidarIngressoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090d] flex flex-col items-center justify-center p-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#c9a227]" />
          <p className="text-xs text-[#a8b2c3] mt-3 tracking-widest uppercase">
            Carregando Validador de Portaria...
          </p>
        </div>
      }
    >
      <ValidarResolver params={params} />
    </Suspense>
  );
}
