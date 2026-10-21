"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  IdCard,
} from "lucide-react";
import { DatePicker } from "@/components/ui/DatePicker";
import { TermsModal, TermsTab } from "@/components/legal/TermsModal";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const { login, register, resetPassword } = useAuth();
  const [tab, setTab] = useState<"login" | "register" | "forgot">(defaultTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsInitialTab, setTermsInitialTab] = useState<TermsTab>("geral");

  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  // Mask helpers
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, "$1.$2");
    setCpf(v);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 11);
    if (v.length > 10) v = v.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
    else if (v.length > 6) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    else if (v.length > 2) v = v.replace(/(\d{2})(\d{0,5})/, "($1) $2");
    setTelefone(v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (tab === "login") {
        if (!email || !password) {
          throw new Error("Preencha e-mail e senha para entrar.");
        }
        await login(email, password);
        onClose();
      } else if (tab === "register") {
        if (!termsAccepted) {
          throw new Error("Você deve aceitar os Termos de Uso e a Política de Privacidade para criar sua conta.");
        }
        if (!nome || !email || !cpf || !telefone || !dataNascimento || !password) {
          throw new Error("Por favor, preencha todos os campos obrigatórios.");
        }
        const cleanCpf = cpf.replace(/\D/g, "");
        if (cleanCpf.length !== 11) {
          throw new Error("CPF inválido. Deve conter 11 dígitos.");
        }
        if (password.length < 6) {
          throw new Error("A senha deve ter no mínimo 6 caracteres.");
        }
        await register({
          nome,
          email,
          cpf,
          telefone,
          dataNascimento,
          password,
        });
        setSuccess("Conta criada com sucesso! Seja bem-vindo à Sintonia.");
        setTimeout(() => {
          onClose();
        }, 1200);
      } else if (tab === "forgot") {
        if (!email) {
          throw new Error("Informe o e-mail cadastrado.");
        }
        await resetPassword(email);
        setSuccess("Link de redefinição de senha enviado para seu e-mail!");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ocorreu um erro. Tente novamente.";
      if (message.includes("auth/user-not-found") || message.includes("auth/wrong-password") || message.includes("auth/invalid-credential")) {
        setError("E-mail ou senha incorretos.");
      } else if (message.includes("auth/email-already-in-use")) {
        setError("Este e-mail já está cadastrado. Faça login ou recupere a senha.");
      } else if (message.includes("auth/weak-password")) {
        setError("A senha escolhida é muito fraca. Use ao menos 6 dígitos.");
      } else if (message.includes("auth/invalid-email")) {
        setError("Formato de e-mail inválido.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 py-8 sm:py-12 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#101116] border border-[#0b1930] shadow-[0_0_50px_rgba(0,0,0,0.8)] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Glow */}
        <div className="h-1.5 w-full rounded-t-2xl bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-lg text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-[#0b1930] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Title and Subtitle */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-extrabold text-[#f6f8fc] tracking-tight">
              {tab === "login" && "Acesse sua Conta"}
              {tab === "register" && "Criar Conta Oficial"}
              {tab === "forgot" && "Recuperar Acesso"}
            </h3>
            <p className="text-xs text-[#a8b2c3] mt-1">
              {tab === "login" && "Compre e acesse seus ingressos para o Especial 10 Anos"}
              {tab === "register" && "Preencha seus dados para emissão segura de ingressos"}
              {tab === "forgot" && "Enviaremos um link seguro para o seu e-mail cadastrado"}
            </p>
          </div>

          {/* Tabs Navigation (Login / Cadastro) */}
          {tab !== "forgot" && (
            <div className="flex rounded-xl bg-[#07090d] p-1 border border-[#0b1930] mb-6">
              <button
                type="button"
                onClick={() => {
                  setTab("login");
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  tab === "login"
                    ? "bg-[#0b1930] text-[#f5e6b8] shadow-sm border border-[#c9a227]/30"
                    : "text-[#a8b2c3] hover:text-[#f6f8fc]"
                }`}
              >
                ENTRAR
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("register");
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  tab === "register"
                    ? "bg-[#0b1930] text-[#f5e6b8] shadow-sm border border-[#c9a227]/30"
                    : "text-[#a8b2c3] hover:text-[#f6f8fc]"
                }`}
              >
                CRIAR CONTA
              </button>
            </div>
          )}

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* REGISTER FIELDS */}
            {tab === "register" && (
              <>
                {/* Nome Completo */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#a8b2c3] font-semibold mb-1.5">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a8b2c3]" />
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07090d] border border-[#0b1930] text-sm text-[#f6f8fc] placeholder-[#a8b2c3]/40 focus:outline-none focus:border-[#c9a227] transition-colors"
                    />
                  </div>
                </div>

                {/* CPF e Telefone (Grid 2 colunas) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#a8b2c3] font-semibold mb-1.5">
                      CPF *
                    </label>
                    <div className="relative">
                      <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a8b2c3]" />
                      <input
                        type="text"
                        required
                        value={cpf}
                        onChange={handleCpfChange}
                        placeholder="000.000.000-00"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#07090d] border border-[#0b1930] text-sm text-[#f6f8fc] placeholder-[#a8b2c3]/40 focus:outline-none focus:border-[#c9a227] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#a8b2c3] font-semibold mb-1.5">
                      Telefone (WhatsApp) *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a8b2c3]" />
                      <input
                        type="text"
                        required
                        value={telefone}
                        onChange={handlePhoneChange}
                        placeholder="(34) 90000-0000"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#07090d] border border-[#0b1930] text-sm text-[#f6f8fc] placeholder-[#a8b2c3]/40 focus:outline-none focus:border-[#c9a227] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Data de Nascimento com Calendário Especial */}
                <DatePicker
                  label="Data de Nascimento"
                  required
                  value={dataNascimento}
                  onChange={(iso) => setDataNascimento(iso)}
                  mode="birthdate"
                  placeholder="DD/MM/AAAA"
                />
              </>
            )}

            {/* Email (Always required) */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#a8b2c3] font-semibold mb-1.5">
                E-mail *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a8b2c3]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07090d] border border-[#0b1930] text-sm text-[#f6f8fc] placeholder-[#a8b2c3]/40 focus:outline-none focus:border-[#c9a227] transition-colors"
                />
              </div>
            </div>

            {/* Password (for login and register) */}
            {tab !== "forgot" && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-[#a8b2c3] font-semibold">
                    Senha *
                  </label>
                  {tab === "login" && (
                    <button
                      type="button"
                      onClick={() => {
                        setTab("forgot");
                        setError(null);
                        setSuccess(null);
                      }}
                      className="text-[11px] text-[#c9a227] hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a8b2c3]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#07090d] border border-[#0b1930] text-sm text-[#f6f8fc] placeholder-[#a8b2c3]/40 focus:outline-none focus:border-[#c9a227] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a8b2c3] hover:text-[#f6f8fc]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Terms of Service & Privacy Policy Checkbox (Register Only) */}
            {tab === "register" && (
              <div className="pt-1">
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#07090d] border border-[#0b1930] hover:border-[#c9a227]/40 transition-colors cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-[#0b1930] bg-[#101116] text-[#c9a227] focus:ring-[#c9a227] accent-[#c9a227] cursor-pointer flex-shrink-0"
                  />
                  <span className="text-xs text-[#a8b2c3] leading-snug select-none">
                    Declaro que li e aceito os{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTermsInitialTab("geral");
                        setTermsModalOpen(true);
                      }}
                      className="text-[#c9a227] hover:text-[#f5e6b8] underline font-bold transition-colors"
                    >
                      Termos de Uso
                    </button>
                    , o{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTermsInitialTab("lounges");
                        setTermsModalOpen(true);
                      }}
                      className="text-[#c9a227] hover:text-[#f5e6b8] underline font-bold transition-colors"
                    >
                      Regulamento
                    </button>{" "}
                    e a{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTermsInitialTab("privacidade");
                        setTermsModalOpen(true);
                      }}
                      className="text-[#c9a227] hover:text-[#f5e6b8] underline font-bold transition-colors"
                    >
                      Política de Privacidade
                    </button>
                    .
                  </span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 mt-2 px-4 rounded-xl text-sm font-extrabold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] hover:opacity-95 shadow-[0_0_20px_rgba(201,162,39,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PROCESSANDO...</span>
                </>
              ) : tab === "login" ? (
                <span>ENTRAR NA CONTA</span>
              ) : tab === "register" ? (
                <span>FINALIZAR CADASTRO</span>
              ) : (
                <span>ENVIAR LINK DE RECUPERAÇÃO</span>
              )}
            </button>
          </form>

          {/* Bottom Back Button for Forgot */}
          {tab === "forgot" && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setTab("login");
                  setError(null);
                  setSuccess(null);
                }}
                className="text-xs text-[#a8b2c3] hover:text-[#f5e6b8] transition-colors underline"
              >
                Voltar para o login
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TERMS AND PRIVACY MODAL */}
      <TermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        initialTab={termsInitialTab}
      />
    </div>
  );
}
