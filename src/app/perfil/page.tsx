"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Ticket as TicketIcon,
  Settings,
  Mail,
  Phone,
  Lock,
  Calendar,
  IdCard,
  ShieldCheck,
  Download,
  Printer,
  Sparkles,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  MapPin,
  Clock,
  Car,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { TicketQRCode } from "@/components/tickets/TicketQRCode";
import { AuthModal } from "@/components/auth/AuthModal";
import { MinorAuthorizationContract } from "@/components/legal/MinorAuthorizationContract";
import { downloadTicketPass, downloadPureQrCode } from "@/lib/tickets/downloadTicket";
import type { Ticket } from "@/types/ticket";

type ProfileTab = "informacoes" | "ingressos" | "configuracoes" | "autorizacao";

const MASTER_ADMIN_EMAIL = "vitorhugonascimentosique@gmail.com";

function ProfileContent() {
  const {
    user,
    profile,
    tickets,
    hasTicket,
    loading,
    ticketsLoading,
    updateUserEmail,
    updateUserPhone,
    updateUserPassword,
    issueDemoTicket,
  } = useAuth();

  const searchParams = useSearchParams();
  const router = useRouter();

  const isMaster = (user?.email || "").toLowerCase().trim() === MASTER_ADMIN_EMAIL.toLowerCase();
  const isAdmin = profile?.role === "admin" || isMaster;

  const [activeTab, setActiveTab] = useState<ProfileTab>("informacoes");
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Settings form states
  const [newEmail, setNewEmail] = useState("");
  const [emailCurrentPassword, setEmailCurrentPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [newPhone, setNewPhone] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [demoTicketLoading, setDemoTicketLoading] = useState(false);
  const [minAgeRequired, setMinAgeRequired] = useState(17);

  // Carrega a idade mínima configurada pelo Painel Admin
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch("/api/admin/config");
        if (res.ok) {
          const data = await res.json();
          if (data?.config?.minAgeUnaccompanied) {
            setMinAgeRequired(data.config.minAgeUnaccompanied);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar configuração de idade mínima:", err);
      }
    }
    loadConfig();
  }, []);

  const isMinor = Boolean(profile?.idade && profile.idade < minAgeRequired);

  // Sync tab with URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab") as ProfileTab | null;
    if (tabParam && ["informacoes", "ingressos", "configuracoes", "autorizacao"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Pre-fill phone in settings
  useEffect(() => {
    if (profile?.telefone && !newPhone) {
      let p = profile.telefone.replace(/\D/g, "");
      if (p.length === 11) {
        setNewPhone(`(${p.slice(0, 2)}) ${p.slice(2, 7)}-${p.slice(7, 11)}`);
      } else {
        setNewPhone(profile.telefone);
      }
    }
    if (user?.email && !newEmail) {
      setNewEmail(user.email);
    }
  }, [profile, user]);

  const changeTab = (tab: ProfileTab) => {
    setActiveTab(tab);
    router.replace(`/perfil?tab=${tab}`, { scroll: false });
  };

  // Format CPF 000.000.000-00
  const formatCpf = (cpf?: string) => {
    if (!cpf) return "Não informado";
    const clean = cpf.replace(/\D/g, "");
    if (clean.length === 11) {
      return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
    }
    return cpf;
  };

  // Format Phone (00) 00000-0000
  const formatPhone = (phone?: string) => {
    if (!phone) return "Não informado";
    const clean = phone.replace(/\D/g, "");
    if (clean.length === 11) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
    }
    if (clean.length === 10) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6, 10)}`;
    }
    return phone;
  };

  // Format Date DD/MM/AAAA
  const formatDate = (isoString?: string) => {
    if (!isoString) return "Não informada";
    try {
      const parts = isoString.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return isoString;
    } catch {
      return isoString;
    }
  };

  // Handle Phone input mask
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    setNewPhone(v);
  };

  // Handle Email Update
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailMessage(null);
    if (!emailCurrentPassword) {
      setEmailMessage({ type: "error", text: "Digite sua senha atual para confirmar a troca de e-mail." });
      return;
    }
    try {
      setEmailLoading(true);
      await updateUserEmail(newEmail, emailCurrentPassword);
      setEmailMessage({ type: "success", text: "E-mail atualizado com sucesso!" });
      setEmailCurrentPassword("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar e-mail.";
      if (message.includes("auth/wrong-password") || message.includes("invalid-credential")) {
        setEmailMessage({ type: "error", text: "Senha atual incorreta." });
      } else if (message.includes("auth/email-already-in-use")) {
        setEmailMessage({ type: "error", text: "Este e-mail já está em uso por outra conta." });
      } else {
        setEmailMessage({ type: "error", text: message });
      }
    } finally {
      setEmailLoading(false);
    }
  };

  // Handle Phone Update
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneMessage(null);
    try {
      setPhoneLoading(true);
      await updateUserPhone(newPhone);
      setPhoneMessage({ type: "success", text: "Número de celular/WhatsApp atualizado com sucesso!" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar telefone.";
      setPhoneMessage({ type: "error", text: message });
    } finally {
      setPhoneLoading(false);
    }
  };

  // Handle Password Update
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "A nova senha deve ter pelo menos 6 caracteres." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "A confirmação de senha não confere." });
      return;
    }
    try {
      setPasswordLoading(true);
      await updateUserPassword(currentPassword, newPassword);
      setPasswordMessage({ type: "success", text: "Senha alterada com sucesso!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao atualizar senha.";
      if (message.includes("auth/wrong-password") || message.includes("invalid-credential")) {
        setPasswordMessage({ type: "error", text: "Senha atual incorreta." });
      } else {
        setPasswordMessage({ type: "error", text: message });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle Demo Ticket Generation (Apenas Admins)
  const handleIssueDemoTicket = async () => {
    if (!isAdmin) {
      alert("Apenas administradores podem emitir ingressos de teste.");
      return;
    }
    try {
      setDemoTicketLoading(true);
      await issueDemoTicket("pista");
      changeTab("ingressos");
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Não foi possível gerar o ingresso de teste.";
      alert(message);
    } finally {
      setDemoTicketLoading(false);
    }
  };

  // Download Real de Voucher / QR Code como imagem PNG
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadTicket = async (ticket: Ticket) => {
    try {
      setDownloadingId(ticket.id);
      await downloadTicketPass(ticket, { nome: profile?.nome, cpf: profile?.cpf });
    } catch (err) {
      console.error("Erro ao baixar voucher completo, tentando QR Code puro:", err);
      await downloadPureQrCode(ticket);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadQrOnly = async (ticket: Ticket) => {
    try {
      setDownloadingId(ticket.id);
      await downloadPureQrCode(ticket);
    } catch (err) {
      console.error("Erro ao baixar QR code puro:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#c9a227]" />
        <p className="text-sm text-[#a8b2c3] mt-4">Carregando seu perfil...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#101116] border border-[#0b1930] flex items-center justify-center text-[#c9a227] shadow-[0_0_30px_rgba(201,162,39,0.2)] mb-4">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#f6f8fc]">Acesso ao Perfil</h2>
        <p className="text-sm text-[#a8b2c3] max-w-md mt-2 mb-6">
          Você precisa estar conectado à sua conta oficial para visualizar suas informações, ingressos e configurações.
        </p>
        <button
          type="button"
          onClick={() => setAuthModalOpen(true)}
          className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] shadow-[0_0_20px_rgba(201,162,39,0.35)] hover:scale-105 active:scale-95 transition-all"
        >
          Entrar ou Criar Conta
        </button>
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} defaultTab="login" />
      </div>
    );
  }

  const firstName = profile?.nome ? profile.nome.split(" ")[0] : user.email?.split("@")[0] || "Membro";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Profile Header Card */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#101116] to-[#07090d] border border-[#0b1930] p-6 sm:p-8 shadow-2xl mb-8 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c9a227]/10 blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#0b1930]/40 blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar Circle with Gold Gradient */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#c9a227] via-[#e2bd44] to-[#f5e6b8] p-0.5 shadow-[0_0_25px_rgba(201,162,39,0.35)]">
              <div className="w-full h-full rounded-[14px] bg-[#07090d] flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#f5e6b8] tracking-wider">
                  {firstName.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#07090d] flex items-center justify-center shadow-lg" title="Conta Verificada">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#07090d] stroke-[3]" />
            </span>
          </div>

          {/* User Info Details */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
              <h1 className="text-xl sm:text-2xl font-black text-[#f6f8fc] tracking-tight truncate">
                {profile?.nome || "Membro Oficial"}
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#c9a227]/15 text-[#f5e6b8] border border-[#c9a227]/40 tracking-wider">
                Especial 10 Anos
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#a8b2c3] truncate">{user.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#07090d] border border-[#0b1930] text-[#a8b2c3]">
                <IdCard className="w-3.5 h-3.5 text-[#c9a227]" />
                <span>CPF: {formatCpf(profile?.cpf)}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#07090d] border border-[#0b1930] text-[#a8b2c3]">
                <TicketIcon className="w-3.5 h-3.5 text-[#c9a227]" />
                <span className="text-[#f6f8fc] font-bold">
                  {tickets.length > 0
                    ? `${tickets.length} Ingresso${tickets.length > 1 ? "s" : ""} Ativo${tickets.length > 1 ? "s" : ""}`
                    : "Sem ingressos ativos"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick CTA inside header */}
          <div className="sm:self-center">
            {hasTicket ? (
              <button
                type="button"
                onClick={() => changeTab("ingressos")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-xs font-bold text-[#07090d] shadow-[0_0_15px_rgba(201,162,39,0.3)] hover:scale-105 active:scale-95 transition-all"
              >
                <QrCode className="w-4 h-4" />
                <span>Ver Meu Ingresso</span>
              </button>
            ) : (
              <Link
                href="/#ingressos"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0b1930] border border-[#c9a227]/40 text-xs font-bold text-[#f5e6b8] hover:border-[#c9a227] hover:scale-105 active:scale-95 transition-all"
              >
                <TicketIcon className="w-4 h-4 text-[#c9a227]" />
                <span>Comprar Ingresso</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Profile Navigation Tabs (Informações, Ingressos, Configurações, Autorização) - 100% Responsivo */}
      <div className={`w-full grid ${isMinor ? "grid-cols-4" : "grid-cols-3"} gap-1 rounded-2xl bg-[#101116] p-1 sm:p-1.5 border border-[#0b1930] mb-8 shadow-xl overflow-hidden`}>
        {/* TAB 1: INFORMAÇÕES / PERFIL */}
        <button
          type="button"
          onClick={() => changeTab("informacoes")}
          className={`py-2.5 sm:py-3 px-1 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all min-h-[44px] ${
            activeTab === "informacoes"
              ? "bg-[#0b1930] text-[#f5e6b8] shadow-md border border-[#c9a227]/40"
              : "text-[#a8b2c3] hover:text-[#f6f8fc] border border-transparent"
          }`}
        >
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c9a227] flex-shrink-0" />
          <span className="hidden sm:inline">Informações</span>
          <span className="sm:hidden">Perfil</span>
        </button>

        {/* TAB 2: INGRESSOS */}
        <button
          type="button"
          onClick={() => changeTab("ingressos")}
          className={`py-2.5 sm:py-3 px-1 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all relative min-h-[44px] ${
            activeTab === "ingressos"
              ? "bg-[#0b1930] text-[#f5e6b8] shadow-md border border-[#c9a227]/40"
              : "text-[#a8b2c3] hover:text-[#f6f8fc] border border-transparent"
          }`}
        >
          <TicketIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c9a227] flex-shrink-0" />
          <span>Ingressos</span>
          {hasTicket && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] flex-shrink-0" />
          )}
        </button>

        {/* TAB 3: CONFIGURAÇÕES / AJUSTES */}
        <button
          type="button"
          onClick={() => changeTab("configuracoes")}
          className={`py-2.5 sm:py-3 px-1 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all min-h-[44px] ${
            activeTab === "configuracoes"
              ? "bg-[#0b1930] text-[#f5e6b8] shadow-md border border-[#c9a227]/40"
              : "text-[#a8b2c3] hover:text-[#f6f8fc] border border-transparent"
          }`}
        >
          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c9a227] flex-shrink-0" />
          <span className="hidden sm:inline">Configurações</span>
          <span className="sm:hidden">Ajustes</span>
        </button>

        {/* TAB 4: AUTORIZAÇÃO (MENORES DE IDADE) */}
        {isMinor && (
          <button
            type="button"
            onClick={() => changeTab("autorizacao")}
            className={`py-2.5 sm:py-3 px-1 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all relative min-h-[44px] ${
              activeTab === "autorizacao"
                ? "bg-[#0b1930] text-[#f5e6b8] shadow-md border border-[#c9a227]/40"
                : "text-amber-400/90 hover:text-amber-300 border border-transparent"
            }`}
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />
            <span className="hidden sm:inline">Autorização</span>
            <span className="sm:hidden">Termo</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] flex-shrink-0" />
          </button>
        )}
      </div>

      {/* Banner de Aviso de Menor de Idade se não estiver na aba de autorização */}
      {isMinor && activeTab !== "autorizacao" && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-[#f5e6b8]">
                Entrada com Autorização Obrigatória (Menor de {minAgeRequired} Anos)
              </p>
              <p className="text-[11px] sm:text-xs text-[#a8b2c3] mt-0.5">
                Por ter {profile?.idade} anos, você deve levar o Termo de Autorização impresso e assinado pelo seu responsável legal.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => changeTab("autorizacao")}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-xs font-bold text-[#f5e6b8] flex items-center justify-center gap-1.5 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Emitir Termo</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: INFORMAÇÕES DA CONTA                                               */}
      {/* ========================================================================= */}
      {activeTab === "informacoes" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="rounded-2xl sm:rounded-3xl bg-[#101116] border border-[#0b1930] p-4 sm:p-6 md:p-8 shadow-xl">
            <h3 className="text-base sm:text-lg font-bold text-[#f6f8fc] mb-6 flex items-center gap-2.5">
              <IdCard className="w-5 h-5 text-[#c9a227]" />
              <span>Dados Cadastrais Oficiais</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Nome Completo */}
              <div className="p-4 rounded-2xl bg-[#07090d] border border-[#0b1930]/80">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#a8b2c3] flex items-center gap-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-[#c9a227]" />
                  Nome Completo
                </span>
                <p className="text-sm sm:text-base font-bold text-[#f6f8fc]">{profile?.nome || "Não informado"}</p>
              </div>

              {/* E-mail */}
              <div className="p-4 rounded-2xl bg-[#07090d] border border-[#0b1930]/80">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#a8b2c3] flex items-center gap-1.5 mb-1">
                  <Mail className="w-3.5 h-3.5 text-[#c9a227]" />
                  E-mail Principal
                </span>
                <p className="text-sm sm:text-base font-bold text-[#f6f8fc] truncate">{user.email}</p>
              </div>

              {/* CPF */}
              <div className="p-4 rounded-2xl bg-[#07090d] border border-[#0b1930]/80">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#a8b2c3] flex items-center gap-1.5 mb-1">
                  <IdCard className="w-3.5 h-3.5 text-[#c9a227]" />
                  CPF do Titular
                </span>
                <p className="text-sm sm:text-base font-bold text-[#f6f8fc] tracking-wider font-mono">
                  {formatCpf(profile?.cpf)}
                </p>
                <p className="text-[11px] text-[#a8b2c3]/70 mt-0.5">Vinculado aos seus vouchers para entrada</p>
              </div>

              {/* Telefone / WhatsApp */}
              <div className="p-4 rounded-2xl bg-[#07090d] border border-[#0b1930]/80">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#a8b2c3] flex items-center gap-1.5 mb-1">
                  <Phone className="w-3.5 h-3.5 text-[#c9a227]" />
                  Celular / WhatsApp
                </span>
                <p className="text-sm sm:text-base font-bold text-[#f6f8fc]">{formatPhone(profile?.telefone)}</p>
                <p className="text-[11px] text-[#a8b2c3]/70 mt-0.5">Contato para envio de avisos e suporte</p>
              </div>

              {/* Data de Nascimento */}
              <div className="p-4 rounded-2xl bg-[#07090d] border border-[#0b1930]/80">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#a8b2c3] flex items-center gap-1.5 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-[#c9a227]" />
                  Data de Nascimento
                </span>
                <p className="text-sm sm:text-base font-bold text-[#f6f8fc]">
                  {formatDate(profile?.dataNascimento)}
                </p>
                {profile?.idade !== undefined && (
                  <p className="text-[11px] text-[#a8b2c3]/70 mt-0.5">Idade: {profile.idade} anos</p>
                )}
              </div>

              {/* Status de Acesso */}
              <div className="p-4 rounded-2xl bg-[#07090d] border border-[#0b1930]/80">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#a8b2c3] flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c9a227]" />
                  Segurança & Proteção
                </span>
                <p className="text-sm sm:text-base font-bold text-emerald-400">Conta Ativa & Protegida</p>
                <p className="text-[11px] text-[#a8b2c3]/70 mt-0.5">Criptografia oficial Firebase & Mercado Pago</p>
              </div>
            </div>
          </div>

          {/* Legal Notice Box */}
          <div className="p-5 rounded-2xl bg-[#0b1930]/40 border border-[#0b1930] flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-[#c9a227] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#a8b2c3] leading-relaxed">
              <strong className="text-[#f6f8fc]">Identificação Nominal Obrigatória:</strong> De acordo com o regulamento oficial da Sintonia Especial 10 Anos DJ Lipe, todos os ingressos emitidos ficam estritamente vinculados ao nome e CPF do titular cadastrado. Na portaria do Capitu, poderá ser exigida a apresentação de documento original com foto para validação da catraca.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INGRESSOS & VOUCHERS (QR CODE, DOWNLOAD, DETALHES)                 */}
      {/* ========================================================================= */}
      {activeTab === "ingressos" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {ticketsLoading ? (
            <div className="p-12 text-center rounded-3xl bg-[#101116] border border-[#0b1930]">
              <Loader2 className="w-8 h-8 animate-spin text-[#c9a227] mx-auto mb-3" />
              <p className="text-sm text-[#a8b2c3]">Consultando seus ingressos na base segura...</p>
            </div>
          ) : tickets.length > 0 ? (
            <div className="space-y-6">
              {tickets.map((ticket, idx) => (
                <div
                  key={ticket.id}
                  id={`ticket-${ticket.id}`}
                  className="relative rounded-3xl bg-gradient-to-b from-[#101116] via-[#101116] to-[#07090d] border border-[#c9a227]/40 p-6 sm:p-8 shadow-[0_0_40px_rgba(201,162,39,0.15)] overflow-hidden"
                >
                  {/* Top Gold Bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] absolute top-0 left-0 right-0" />

                  {/* Festival Watermark Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#0b1930] pb-5 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-8 flex-shrink-0">
                        <Image
                          src="/assets/logos/logo-sintonia-360-simbolo.svg"
                          alt="Sintonia"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-black tracking-widest uppercase text-[#f5e6b8]">
                          Sintonia Edição Especial 10 Anos DJ Lipe
                        </p>
                        <p className="text-[11px] text-[#a8b2c3]">Voucher Oficial de Acesso • Portaria Capitu</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Voucher Ativo
                      </span>
                    </div>
                  </div>

                  {/* Main Ticket Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
                    {/* Left & Middle: Ticket Specs */}
                    <div className="lg:col-span-2 space-y-4">
                      {/* Sector, Ticket Number & Value Highlight */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="px-3 py-1 rounded-full text-xs font-black tracking-wider bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] shadow-[0_0_15px_rgba(201,162,39,0.35)] font-mono">
                            {ticket.ticketNumberFormatted || `#${String(idx + 1).padStart(4, "0")}`}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#a8b2c3] px-2.5 py-0.5 rounded-full bg-[#07090d] border border-[#0b1930]">
                            {ticket.lotName || "1º Lote Oficial"}
                          </span>
                        </div>

                        <h4 className="text-xl sm:text-2xl font-black text-[#f6f8fc] tracking-tight">
                          {ticket.sectorName}
                        </h4>

                        <p className="text-sm text-[#a8b2c3] mt-1">
                          Valor do Ingresso:{" "}
                          <strong className="text-base font-black text-[#f5e6b8]">
                            {ticket.isCourtesy || ticket.price === 0
                              ? "Cortesia VIP (R$ 0,00)"
                              : `R$ ${ticket.price.toFixed(2).replace(".", ",")}`}
                          </strong>
                        </p>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                        <div className="p-3 rounded-xl bg-[#07090d] border border-[#0b1930]">
                          <span className="text-[10px] uppercase text-[#a8b2c3] block">Titular do Ingresso</span>
                          <span className="text-xs font-bold text-[#f6f8fc] truncate block">
                            {ticket.userName || profile?.nome || "Titular Oficial"}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-[#07090d] border border-[#0b1930]">
                          <span className="text-[10px] uppercase text-[#a8b2c3] block">Documento CPF</span>
                          <span className="text-xs font-bold text-[#f6f8fc] font-mono block">
                            {formatCpf(ticket.userCpf || profile?.cpf)}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-[#07090d] border border-[#0b1930]">
                          <span className="text-[10px] uppercase text-[#a8b2c3] block">Número do Ingresso</span>
                          <span className="text-xs font-bold text-[#c9a227] font-mono truncate block">
                            {ticket.ticketNumberFormatted || `#${String(idx + 1).padStart(4, "0")}`}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-[#07090d] border border-[#0b1930]">
                          <span className="text-[10px] uppercase text-[#a8b2c3] block">Data do Evento</span>
                          <span className="text-xs font-bold text-[#f6f8fc] block">10 de Abril de 2027</span>
                        </div>

                        <div className="p-3 rounded-xl bg-[#07090d] border border-[#0b1930]">
                          <span className="text-[10px] uppercase text-[#a8b2c3] block">Local</span>
                          <span className="text-xs font-bold text-[#f6f8fc] block">Capitu, Tupaciguara - MG</span>
                        </div>

                        <div className="p-3 rounded-xl bg-[#07090d] border border-[#0b1930]">
                          <span className="text-[10px] uppercase text-[#a8b2c3] block">Status da Catraca</span>
                          <span
                            className={`text-xs font-bold block ${
                              ticket.status === "used" ? "text-amber-400" : "text-emerald-400"
                            }`}
                          >
                            {ticket.status === "used" ? "Entrada Validada" : "Pronto para Entrada"}
                          </span>
                        </div>
                      </div>

                      {/* Warning Notice */}
                      <div className="p-3.5 rounded-xl bg-[#07090d] border border-[#0b1930] text-[11px] text-[#a8b2c3] leading-relaxed">
                        🔒 <strong className="text-[#f6f8fc]">Segurança do Voucher:</strong> Apresente este código QR diretamente na portaria do Capitu. O leitor óptico do fiscal validará sua entrada instantaneamente.
                      </div>
                    </div>

                    {/* Right Column: QR Code & Download Action */}
                    <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-[#07090d] border border-[#0b1930] text-center">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#c9a227] mb-2 flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Apresente na Catraca</span>
                      </span>

                      {/* High-Fidelity QR Code */}
                      <TicketQRCode payload={ticket.qrPayload || ticket.id} size={180} />

                      <p className="text-[11px] font-mono text-[#f5e6b8] font-bold mt-3 tracking-wider">
                        {ticket.ticketNumberFormatted || `#${String(idx + 1).padStart(4, "0")}`}
                      </p>

                      {/* Download Buttons (PNG Direto sem Print Dialog) */}
                      <div className="w-full space-y-2 mt-4">
                        <button
                          type="button"
                          onClick={() => handleDownloadQrOnly(ticket)}
                          disabled={downloadingId === ticket.id}
                          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] via-[#e2bd44] to-[#f5e6b8] hover:opacity-95 active:scale-95 transition-all shadow-[0_0_20px_rgba(201,162,39,0.35)] disabled:opacity-50"
                        >
                          {downloadingId === ticket.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-[#07090d]" />
                          ) : (
                            <QrCode className="w-4 h-4 text-[#07090d]" />
                          )}
                          <span>Baixar QR Code do Ingresso (PNG)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadTicket(ticket)}
                          disabled={downloadingId === ticket.id}
                          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[11px] font-semibold text-[#a8b2c3] hover:text-[#f5e6b8] hover:bg-[#0b1930] transition-colors disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5 text-[#c9a227]" />
                          <span>Baixar Cartão Completo (VIP Pass)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State: No Tickets */
            <div className="rounded-3xl bg-[#101116] border border-[#0b1930] p-8 sm:p-12 text-center shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-[#07090d] border border-[#0b1930] flex items-center justify-center text-[#c9a227] mx-auto mb-4 shadow-[0_0_25px_rgba(201,162,39,0.2)]">
                <TicketIcon className="w-8 h-8" />
              </div>

              <h3 className="text-xl font-extrabold text-[#f6f8fc] tracking-tight">
                Você ainda não possui ingressos confirmados
              </h3>
              <p className="text-xs sm:text-sm text-[#a8b2c3] max-w-md mx-auto mt-2 mb-8">
                Garanta seu lugar na comemoração oficial da década! Os lotes são estritamente limitados para garantir o conforto e a magnitude do festival.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/#ingressos"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] shadow-[0_0_20px_rgba(201,162,39,0.35)] hover:scale-105 active:scale-95 transition-all"
                >
                  <TicketIcon className="w-4 h-4" />
                  <span>Garantir Meu Ingresso Agora (1º Lote R$ 60)</span>
                </Link>

                {/* Botão de Emissão de Teste: Exclusivo para administradores */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={handleIssueDemoTicket}
                    disabled={demoTicketLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-xs font-semibold text-[#f5e6b8] bg-[#0b1930] border border-[#c9a227]/40 hover:border-[#c9a227] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {demoTicketLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#c9a227]" />
                    ) : (
                      <QrCode className="w-4 h-4 text-[#c9a227]" />
                    )}
                    <span>Emitir Ingresso de Teste (Demonstração)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#c9a227]/20 text-[#f5e6b8] font-bold border border-[#c9a227]/40 ml-1">
                      Admin
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CONFIGURAÇÕES DA CONTA (E-MAIL, TELEFONE, SENHA)                   */}
      {/* ========================================================================= */}
      {activeTab === "configuracoes" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Banner Informativo de Dados Inalteráveis */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0b1930]/40 border border-[#0b1930] flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-[#c9a227] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#a8b2c3] leading-relaxed">
              <strong className="text-[#f6f8fc]">Identificação Oficial Inalterável:</strong> Por determinação de segurança e emissão nominal de vouchers, o <strong className="text-[#f6f8fc]">Nome Completo</strong>, <strong className="text-[#f6f8fc]">CPF</strong> e <strong className="text-[#f6f8fc]">Data de Nascimento</strong> são estritamente definitivos e inalteráveis. Abaixo você pode gerenciar seu contato de WhatsApp, e-mail e senha.
            </div>
          </div>

          {/* Card 1: Alterar Telefone / WhatsApp */}
          <div className="rounded-2xl sm:rounded-3xl bg-[#101116] border border-[#0b1930] p-4 sm:p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-[#07090d] border border-[#0b1930] text-[#c9a227] flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm sm:text-base font-bold text-[#f6f8fc] truncate">Alterar Celular / WhatsApp</h4>
                <p className="text-[11px] sm:text-xs text-[#a8b2c3] truncate">Utilizado para contato e notificações do seu pedido</p>
              </div>
            </div>

            {phoneMessage && (
              <div
                className={`p-3.5 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                  phoneMessage.type === "success"
                    ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/40"
                    : "bg-red-950/40 text-red-300 border border-red-800/40"
                }`}
              >
                {phoneMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{phoneMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a8b2c3] mb-1.5 uppercase tracking-wider">
                  Novo Número de Celular / WhatsApp
                </label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={handlePhoneChange}
                  placeholder="(34) 90000-0000"
                  className="w-full h-12 px-4 rounded-xl bg-[#07090d] border border-[#0b1930] focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-base sm:text-sm text-[#f6f8fc] placeholder-[#a8b2c3]/40 outline-none transition-all font-mono"
                />
                <p className="text-[11px] text-[#a8b2c3]/60 mt-1">Contato para confirmação de compras e avisos de portaria</p>
              </div>

              <button
                type="submit"
                disabled={phoneLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
              >
                {phoneLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Atualizar Número de Telefone</span>
              </button>
            </form>
          </div>

          {/* Card 2: Alterar E-mail */}
          <div className="rounded-2xl sm:rounded-3xl bg-[#101116] border border-[#0b1930] p-4 sm:p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-[#07090d] border border-[#0b1930] text-[#c9a227] flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm sm:text-base font-bold text-[#f6f8fc] truncate">Alterar E-mail Principal</h4>
                <p className="text-[11px] sm:text-xs text-[#a8b2c3] truncate">O endereço onde você recebe comprovantes e notificações</p>
              </div>
            </div>

            {emailMessage && (
              <div
                className={`p-3.5 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                  emailMessage.type === "success"
                    ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/40"
                    : "bg-red-950/40 text-red-300 border border-red-800/40"
                }`}
              >
                {emailMessage.type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{emailMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#a8b2c3] mb-1.5 uppercase tracking-wider">
                    Novo E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="w-full h-12 px-4 rounded-xl bg-[#07090d] border border-[#0b1930] focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-base sm:text-sm text-[#f6f8fc] placeholder-[#a8b2c3]/40 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a8b2c3] mb-1.5 uppercase tracking-wider">
                    Sua Senha Atual (Confirmação)
                  </label>
                  <input
                    type="password"
                    required
                    value={emailCurrentPassword}
                    onChange={(e) => setEmailCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 px-4 rounded-xl bg-[#07090d] border border-[#0b1930] focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-base sm:text-sm text-[#f6f8fc] placeholder-[#a8b2c3]/40 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={emailLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
              >
                {emailLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Salvar Novo E-mail</span>
              </button>
            </form>
          </div>

          {/* Card 3: Alterar Senha */}
          <div className="rounded-2xl sm:rounded-3xl bg-[#101116] border border-[#0b1930] p-4 sm:p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-[#07090d] border border-[#0b1930] text-[#c9a227]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#f6f8fc]">Alterar Senha de Acesso</h4>
                <p className="text-xs text-[#a8b2c3]">Escolha uma senha forte para proteção da sua conta e ingressos</p>
              </div>
            </div>

            {passwordMessage && (
              <div
                className={`p-3.5 rounded-xl mb-4 text-xs flex items-center gap-2 ${
                  passwordMessage.type === "success"
                    ? "bg-emerald-950/40 text-emerald-300 border border-emerald-800/40"
                    : "bg-red-950/40 text-red-300 border border-red-800/40"
                }`}
              >
                {passwordMessage.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a8b2c3] mb-1.5 uppercase tracking-wider">
                  Senha Atual
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 rounded-xl bg-[#07090d] border border-[#0b1930] focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-base sm:text-sm text-[#f6f8fc] placeholder-[#a8b2c3]/40 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#a8b2c3] mb-1.5 uppercase tracking-wider">
                    Nova Senha (Mínimo 6 dígitos)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nova senha secreta"
                    className="w-full h-12 px-4 rounded-xl bg-[#07090d] border border-[#0b1930] focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-base sm:text-sm text-[#f6f8fc] placeholder-[#a8b2c3]/40 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a8b2c3] mb-1.5 uppercase tracking-wider">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full h-12 px-4 rounded-xl bg-[#07090d] border border-[#0b1930] focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227] text-base sm:text-sm text-[#f6f8fc] placeholder-[#a8b2c3]/40 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
              >
                {passwordLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Atualizar Senha de Acesso</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: AUTORIZAÇÃO DE MENOR (SOMENTE PARA QUEM TEM MENOS QUE A IDADE)     */}
      {/* ========================================================================= */}
      {activeTab === "autorizacao" && isMinor && (
        <MinorAuthorizationContract
          minorName={profile?.nome || ""}
          minorCpf={profile?.cpf || ""}
          minorBirthDate={profile?.dataNascimento || ""}
          minorAge={profile?.idade || 0}
          minAgeRequired={minAgeRequired}
        />
      )}
    </div>
  );
}

export default function PerfilPage() {
  return (
    <div className="min-h-screen bg-[#07090d] text-[#f6f8fc] selection:bg-[#c9a227] selection:text-[#07090d]">
      {/* Top Header Glow Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] fixed top-0 left-0 right-0 z-50" />

      {/* A NAVBAR CONTINUA APARECENDO LÁ NO TOPO */}
      <Navbar />

      <Suspense
        fallback={
          <div className="min-h-[70vh] flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#c9a227]" />
            <p className="text-sm text-[#a8b2c3] mt-4">Carregando painel do usuário...</p>
          </div>
        }
      >
        <ProfileContent />
      </Suspense>
    </div>
  );
}
