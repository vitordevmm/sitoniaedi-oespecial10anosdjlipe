"use client";
 
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Ticket,
  ShieldCheck,
  Zap,
  Users,
  Clock,
  ArrowRight,
  ChevronDown,
  Check,
  Music2,
  Volume2,
  Radio,
  Car,
  HelpCircle,
  CreditCard,
  MessageCircle,
  User,
  LogOut,
  QrCode,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { TermsModal, TermsTab } from "@/components/legal/TermsModal";
import { Navbar } from "@/components/layout/Navbar";
import { EventCountdown } from "@/components/home/EventCountdown";
import { EventConfig, DEFAULT_EVENT_CONFIG } from "@/types/config";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { GlowBadge } from "@/components/ui/GlowBadge";
import { CheckoutModal } from "@/components/checkout/CheckoutModal";
import Link from "next/link";

export default function Home() {
  const { user, profile, loading, logout, hasTicket } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login");
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsInitialTab, setTermsInitialTab] = useState<TermsTab>("geral");
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Toast divertido de bloqueio de acesso não autorizado a /admin
  const [espertinhoToast, setEspertinhoToast] = useState(false);

  // Configurações dinâmicas de lotes e preços do evento
  const [eventConfig, setEventConfig] = useState<EventConfig>(DEFAULT_EVENT_CONFIG);

  useEffect(() => {
    // 1. Detecta redirecionamento de tentativa de acesso não autorizada a /admin
    if (typeof window !== "undefined" && window.location.search.includes("toast=espertinho")) {
      setEspertinhoToast(true);
      window.history.replaceState({}, "", "/");
      const timer = setTimeout(() => setEspertinhoToast(false), 5500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // 2. Carrega configurações ativas do evento para atualizar lotes e preços
    fetch("/api/admin/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setEventConfig(data.config);
        }
      })
      .catch(() => {});
  }, []);

  // Lote ativo da pista
  const activePistaLot =
    eventConfig.lotes.find((l) => l.sector === "pista" && l.active) || {
      name: "1º Lote Oficial",
      price: 60,
    };

  const toggleFaq = (index: number) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  const faqs = [
    {
      question: "Quando e onde acontecerá a Sintonia Edição Especial 10 Anos DJ Lipe?",
      answer:
        "O festival acontecerá no dia 10 de Abril de 2027 (10/04/2027), no Capitu, em Tupaciguara - MG. A arena foi preparada com cenografia monumental para receber o público em uma megaestrutura de alto nível.",
    },
    {
      question: "Como recebo o meu ingresso após a aprovação do pagamento?",
      answer:
        "O envio é imediato. Assim que o pagamento for aprovado pelo Mercado Pago (instantâneo no PIX ou na análise do cartão), você recebe seu voucher nominal com QR Code único no e-mail cadastrado. Basta salvar o arquivo ou apresentar o QR Code diretamente na tela do seu celular na portaria do evento.",
    },
    {
      question: "Por que os ingressos são limitados por lotes?",
      answer:
        "A Sintonia Edição Especial 10 Anos foi planejada para priorizar conforto, acústica de alto nível e circulação livre. Com o controle rigoroso por lotes, garantimos atendimento ágil nos bares, visão desimpedida do palco e controle perimetral seguro. Ao atingir o limite de cada lote, os valores são atualizados automaticamente.",
    },
    {
      question: "Quais são as formas de pagamento disponíveis?",
      answer:
        "Aceitamos PIX com compensação em tempo real e Cartão de Crédito com parcelamento através do ambiente seguro do Mercado Pago, com proteção antifraude e criptografia SSL de ponta a ponta.",
    },
    {
      question: "Haverá bilheteria física para compra de ingressos no dia?",
      answer:
        "Apenas se restarem unidades após a venda dos lotes online. Devido à grande procura e aos lotes limitados, a recomendação oficial é garantir a compra antecipada para assegurar sua entrada pelo menor valor de lote e evitar esgotamento.",
    },
    {
      question: "Como funciona a contratação dos Lounges (Rosa e Azul) e Camarotes no Palco?",
      answer:
        "Esses setores são exclusivos e possuem número restrito de vagas (12 vagas no Lounge Rosa, 12 vagas no Lounge Azul e apenas 4 camarotes montados no palco). As reservas e condições para grupos são tratadas diretamente com a equipe de produção oficial da GHVE Eventos e RL Produções.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090d] text-[#f6f8fc] selection:bg-[#c9a227] selection:text-[#07090d] relative overflow-hidden pb-24 sm:pb-0">
      {/* TOAST DIVERTIDO: TENTOU SER ESPERTINHO NÉ? */}
      {espertinhoToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92vw] p-4 rounded-2xl bg-[#101116]/95 border-2 border-[#c9a227] shadow-[0_10px_40px_rgba(201,162,39,0.5)] backdrop-blur-xl flex items-center gap-3.5 animate-in slide-in-from-top-6 duration-300">
          <div className="w-11 h-11 rounded-xl bg-[#c9a227]/20 border border-[#c9a227]/40 flex items-center justify-center text-2xl flex-shrink-0 shadow-[0_0_15px_rgba(201,162,39,0.3)]">
            😏
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-sm font-extrabold text-[#f5e6b8] tracking-tight">
              Tentou ser espertinho, né?
            </h4>
            <p className="text-xs text-[#a8b2c3] mt-0.5 leading-tight">
              O Painel Administrativo é restrito e monitorado exclusivamente pela produção oficial.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEspertinhoToast(false)}
            className="text-[#a8b2c3] hover:text-[#f6f8fc] text-sm font-bold p-1 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* Background Lighting & Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#c9a227]/15 via-[#0b1930]/40 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-80 right-0 w-[500px] h-[500px] bg-[#0b1930]/30 blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-96 left-0 w-[500px] h-[500px] bg-[#c9a227]/10 blur-3xl pointer-events-none -z-10" />

      {/* HEADER / NAVIGATION UNIFICADA */}
      <Navbar
        onOpenAuth={(tab) => {
          setAuthModalTab(tab);
          setAuthModalOpen(true);
        }}
      />

      {/* HERO SECTION */}
      <section id="evento" className="relative pt-10 pb-16 sm:pt-14 sm:pb-20 md:pt-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {/* MAIN HEADLINER LOGO: ESPECIAL 10 ANOS DJ LIPE */}
          <div className="relative w-full max-w-[92vw] sm:max-w-[650px] h-[220px] sm:h-[380px] md:h-[440px] mb-6 sm:mb-8 flex items-center justify-center">
            {/* Glow halo behind main logo */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#c9a227]/25 to-transparent rounded-full filter blur-2xl -z-10" />
            <Image
              src="/assets/logos/logo-especial-10-anos-lipe.svg"
              alt="Especial 10 Anos DJ Lipe"
              fill
              className="object-contain drop-shadow-[0_10px_35px_rgba(201,162,39,0.45)]"
              priority
            />
          </div>

          {/* Subtitle / Event Hook */}
          <p className="max-w-2xl text-base sm:text-lg md:text-xl text-[#a8b2c3] leading-relaxed mb-6 sm:mb-8">
            Uma década de histórias, e em comemoração a isso, uma noite especial.
            Seja bem-vindo à <strong className="text-[#f6f8fc]">Sintonia Edição Especial 10 Anos DJ Lipe</strong> com{" "}
            <strong className="text-[#f5e6b8]">milhares de pessoas</strong> vibrando na mesma sintonia.
          </p>

          {/* OFFICIAL EVENT COUNTDOWN (Com inteligência de ocultação de unidades e alta performance) */}
          <EventCountdown />

          {/* Event Quick Details (Clean sem moldura externa) */}
          <div className="w-full max-w-2xl mb-10">
            <div className="grid grid-cols-3 divide-x divide-[#0b1930]/80 py-2 px-1 sm:px-4">
              {/* Item 1: Data */}
              <div className="flex flex-col items-center text-center px-1 sm:px-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#c9a227]/20 to-[#0b1930] border border-[#c9a227]/40 flex items-center justify-center text-[#f5e6b8] shadow-[0_0_12px_rgba(201,162,39,0.25)] mb-1.5 sm:mb-2 flex-shrink-0">
                  <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#c9a227]" />
                </div>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#a8b2c3] font-semibold mb-0.5">
                  Data Oficial
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#f6f8fc] leading-tight mb-0.5">
                  <span className="sm:hidden">10 ABR 2027</span>
                  <span className="hidden sm:inline">10 de Abril de 2027</span>
                </p>
                <p className="text-[10px] sm:text-xs text-[#c9a227] font-medium truncate max-w-full">
                  Sábado
                </p>
              </div>

              {/* Item 2: Local */}
              <div className="flex flex-col items-center text-center px-1 sm:px-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#c9a227]/20 to-[#0b1930] border border-[#c9a227]/40 flex items-center justify-center text-[#f5e6b8] shadow-[0_0_12px_rgba(201,162,39,0.25)] mb-1.5 sm:mb-2 flex-shrink-0">
                  <MapPin className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#c9a227]" />
                </div>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#a8b2c3] font-semibold mb-0.5">
                  Local
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#f6f8fc] leading-tight mb-0.5">
                  Capitu
                </p>
                <p className="text-[10px] sm:text-xs text-[#a8b2c3] truncate max-w-full">
                  Tupaciguara - MG
                </p>
              </div>

              {/* Item 3: Ingressos */}
              <div className="flex flex-col items-center text-center px-1 sm:px-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#c9a227]/20 to-[#0b1930] border border-[#c9a227]/40 flex items-center justify-center text-[#f5e6b8] shadow-[0_0_12px_rgba(201,162,39,0.25)] mb-1.5 sm:mb-2 flex-shrink-0">
                  <Ticket className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#c9a227]" />
                </div>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#a8b2c3] font-semibold mb-0.5">
                  Ingressos
                </p>
                <p className="text-xs sm:text-sm font-bold text-[#f5e6b8] leading-tight">
                  1º Lote
                </p>
              </div>
            </div>
          </div>

          {/* CTA Primary */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {hasTicket ? (
              <Link
                href="/perfil?tab=ingressos"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-extrabold text-[#07090d] bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] hover:opacity-95 shadow-[0_0_30px_rgba(201,162,39,0.4)] transition-all flex items-center justify-center gap-3 hover:scale-105 active:scale-95 border border-[#f5e6b8]"
              >
                <span>ACESSAR MEU INGRESSO (QR CODE)</span>
                <QrCode className="w-5 h-5" />
              </Link>
            ) : (
              <a
                href="#ingressos"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-extrabold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] hover:opacity-95 shadow-[0_0_30px_rgba(201,162,39,0.4)] transition-all flex items-center justify-center gap-3 hover:scale-105 active:scale-95"
              >
                <span>GARANTIR INGRESSO NO LOTE ATUAL</span>
                <ArrowRight className="w-5 h-5" />
              </a>
            )}
            <a
              href="#experiencia"
              className="w-full sm:w-auto px-6 py-4 rounded-xl text-base font-semibold text-[#f6f8fc] bg-[#101116] border border-[#0b1930] hover:border-[#c9a227]/50 hover:bg-[#0b1930]/40 transition-all"
            >
              Conhecer a Experiência
            </a>
          </div>
        </div>
      </section>

      {/* VALUE & EXPERIENCE SECTION */}
      <section id="experiencia" className="py-20 border-t border-[#0b1930]/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b1930] border border-[#c9a227]/30 text-xs text-[#f5e6b8] mb-4">
              <Music2 className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>Produção & Estrutura Oficial</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#f6f8fc] tracking-tight mb-4">
              Uma Noite Histórica Projetada nos Mínimos Detalhes
            </h2>
            <p className="text-sm sm:text-base text-[#a8b2c3] leading-relaxed">
              Cenografia de grande porte, acústica de alta pressão e organização rigorosa para celebrar 10 anos de carreira em um ambiente seguro e memorável.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-[#101116] border border-[#0b1930] hover:border-[#c9a227]/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#0b1930] border border-[#c9a227]/30 flex items-center justify-center mb-6 text-[#c9a227]">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#f6f8fc] mb-3">Palco Frontal Monumental</h3>
              <p className="text-sm text-[#a8b2c3] leading-relaxed">
                Painéis de LED de alta definição e iluminação sincronizada. Mesa central do DJ Lipe posicionada para proporcionar visão limpa e desimpedida de toda a arena, pista e camarotes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-[#101116] border border-[#0b1930] hover:border-[#c9a227]/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-[#0b1930] border border-[#c9a227]/30 flex items-center justify-center mb-6 text-[#c9a227]">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#f6f8fc] mb-3">Conforto e Lotação Controlada</h3>
              <p className="text-sm text-[#a8b2c3] leading-relaxed">
                Formato planejado para evitar superlotação e filas desnecessárias. Circulação ampla, atendimento rápido no Bar Central e milhares de pessoas vibrando na mesma sintonia.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-[#101116] border border-[#0b1930] hover:border-[#c9a227]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#0b1930] border border-[#c9a227]/30 flex items-center justify-center mb-6 text-[#c9a227]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#f6f8fc] mb-3">Produção Oficial GHVE & RL</h3>
                <p className="text-sm text-[#a8b2c3] leading-relaxed">
                  Realização conjunta pelas produtoras GHVE Eventos e RL Produções, garantindo segurança perimetral reforçada, equipe de apoio treinada e controle de acesso antifraude.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#0b1930] flex items-center gap-5 opacity-80 hover:opacity-100 transition-opacity">
                <Image
                  src="/assets/logos/logo-ghve-branca.svg"
                  alt="GHVE Eventos"
                  width={110}
                  height={32}
                  className="object-contain max-h-8 w-auto"
                  style={{ width: "auto", height: "auto" }}
                  unoptimized
                />
                <span className="text-xs text-[#a8b2c3]/30 font-light select-none">|</span>
                <Image
                  src="/assets/logos/logo-rl-producoes.svg"
                  alt="RL Produções"
                  width={44}
                  height={36}
                  className="object-contain max-h-9 w-auto"
                  style={{ width: "auto", height: "auto" }}
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKET PACKAGES / LOTES SECTION */}
      <section id="ingressos" className="py-20 bg-gradient-to-b from-transparent via-[#101116]/80 to-transparent relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b1930] border border-[#c9a227]/30 text-xs text-[#f5e6b8] mb-4">
              <Zap className="w-3.5 h-3.5" />
              <span>Venda de Lotes Antecipados</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#f6f8fc] tracking-tight mb-4">
              Garanta seu Ingresso no Lote Atual
            </h2>
            <p className="text-sm sm:text-base text-[#a8b2c3] leading-relaxed">
              Os lotes viram automaticamente conforme a quantidade disponível é preenchida. Pagamento instantâneo via PIX ou Cartão de Crédito com processamento oficial do Mercado Pago.
            </p>
          </div>

          {/* Lotes Grid (4 Setores Oficiais) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch pt-3">
            {/* CARD 1: PISTA (FAVORITO DO PÚBLICO) */}
            <div className="rounded-2xl bg-[#101116] border-2 border-[#c9a227] p-6 flex flex-col h-full relative shadow-[0_0_35px_rgba(201,162,39,0.2)] hover:-translate-y-1 transition-all duration-300">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] shadow-md whitespace-nowrap">
                Favorito do Público
              </div>
              <div className="flex justify-between items-center h-7 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded bg-[#0b1930] text-[#f5e6b8] border border-[#c9a227]/30">
                  {activePistaLot.name}
                </span>
                <span className="text-xs text-[#a8b2c3] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#c9a227]" /> Arena Principal
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#f6f8fc] mb-2 min-h-[28px] flex items-center">Pista</h3>
              <p className="text-xs text-[#a8b2c3] mb-6 min-h-[52px] leading-relaxed">
                Acesso à arena principal com visão frontal de todo o show e atendimento direto no mega Bar Central.
              </p>

              <div className="space-y-2.5 mb-6 flex-1 text-xs text-[#f6f8fc]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#c9a227] flex-shrink-0" />
                  <span>Visão frontal de todo o espetáculo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#c9a227] flex-shrink-0" />
                  <span>Acesso aos bares centrais da arena</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#c9a227] flex-shrink-0" />
                  <span>Banheiros exclusivos de pista</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#c9a227] flex-shrink-0" />
                  <span>Entrada facilitada com QR Code seguro</span>
                </div>
              </div>

              <div className="mt-auto">
                <div className="pt-4 border-t border-[#0b1930] h-[78px] flex flex-col justify-center mb-5">
                  <span className="text-xs text-[#a8b2c3] uppercase tracking-wider font-medium leading-none">Valor Oficial</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-sm font-semibold text-[#f5e6b8]">R$</span>
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#f5e6b8] leading-none">{activePistaLot.price}</span>
                    <span className="text-xs text-[#f5e6b8]">,00</span>
                  </div>
                  <p className="text-[11px] text-[#a8b2c3] mt-1 leading-none">{activePistaLot.name} Disponível</p>
                </div>
                {hasTicket ? (
                  <Link
                    href="/perfil?tab=ingressos"
                    className="h-12 w-full px-4 rounded-xl text-sm font-extrabold text-[#07090d] bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] hover:opacity-95 shadow-[0_0_20px_rgba(201,162,39,0.35)] transition-all flex items-center justify-center gap-2 border border-[#f5e6b8]"
                  >
                    <QrCode className="w-4 h-4 flex-shrink-0" />
                    <span>VER MEU INGRESSO</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        setAuthModalTab("register");
                        setAuthModalOpen(true);
                      } else {
                        setCheckoutModalOpen(true);
                      }
                    }}
                    className="h-12 w-full px-4 rounded-xl text-sm font-extrabold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] hover:opacity-95 shadow-[0_0_20px_rgba(201,162,39,0.35)] transition-all flex items-center justify-center gap-2"
                  >
                    <Ticket className="w-4 h-4 flex-shrink-0" />
                    <span>GARANTIR PISTA</span>
                  </button>
                )}
              </div>
            </div>

            {/* CARD 2: LOUNGE ROSA (ALA ESQUERDA) */}
            <div className="rounded-2xl bg-[#101116] border border-[#0b1930] p-6 flex flex-col h-full hover:border-pink-500/40 transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-center h-7 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded bg-[#0b1930] text-pink-400 border border-pink-500/30">
                  12 Vagas
                </span>
                <span className="text-xs text-[#a8b2c3] flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-pink-400" /> Ala Esquerda
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#f6f8fc] mb-2 min-h-[28px] flex items-center">Lounge Rosa</h3>
              <p className="text-xs text-[#a8b2c3] mb-6 min-h-[52px] leading-relaxed">
                Área segura na ala lateral esquerda com gradil separando carros e grupos, com atendimento exclusivo por garçons.
              </p>

              <div className="space-y-2.5 mb-6 flex-1 text-xs text-[#a8b2c3]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <span>Entre com seu carro na festa (12 vagas)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <span>Espaço privado para seu grupo e seu carro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <span>Área segura com gradil separando carros e grupos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <span>Garçons para que não pegue filas</span>
                </div>
              </div>

              <div className="mt-auto">
                <div className="pt-4 border-t border-[#0b1930] h-[78px] flex flex-col justify-center mb-5">
                  <span className="text-xs text-[#a8b2c3] uppercase tracking-wider font-medium leading-none">Ala Lateral Esquerda</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#f6f8fc] leading-none">Sob Consulta</span>
                  </div>
                  <p className="text-[11px] text-[#a8b2c3] mt-1 leading-none">Reserva antecipada por veículo</p>
                </div>
                <a
                  href="https://wa.me/553491535921?text=Ol%C3%A1%21%20Vim%20pelo%20site%20oficial%20da%20Sintonia%20Edi%C3%A7%C3%A3o%20Especial%2010%20Anos%20DJ%20Lipe%20e%20gostaria%20de%20consultar%20valores%20e%20vagas%20para%20o%20Lounge%20Rosa%20(Ala%20Esquerda)."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 w-full px-4 rounded-xl text-sm font-bold text-[#f6f8fc] bg-[#0b1930] hover:bg-[#25D366] hover:text-[#07090d] transition-all flex items-center justify-center gap-2 border border-[#25D366]/40 hover:border-[#25D366] group"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:text-[#07090d] transition-colors flex-shrink-0" />
                  <span>Consultar no WhatsApp</span>
                </a>
              </div>
            </div>

            {/* CARD 3: LOUNGE AZUL (ALA DIREITA) */}
            <div className="rounded-2xl bg-[#101116] border border-[#0b1930] p-6 flex flex-col h-full hover:border-sky-500/40 transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-center h-7 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded bg-[#0b1930] text-sky-400 border border-sky-500/30">
                  12 Vagas
                </span>
                <span className="text-xs text-[#a8b2c3] flex items-center gap-1">
                  <Car className="w-3.5 h-3.5 text-sky-400" /> Ala Direita
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#f6f8fc] mb-2 min-h-[28px] flex items-center">Lounge Azul</h3>
              <p className="text-xs text-[#a8b2c3] mb-6 min-h-[52px] leading-relaxed">
                Área segura na ala lateral direita com gradil separando carros e grupos, com atendimento exclusivo por garçons.
              </p>

              <div className="space-y-2.5 mb-6 flex-1 text-xs text-[#a8b2c3]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span>Entre com seu carro na festa (12 vagas)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span>Espaço privado para seu grupo e seu carro</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span>Área segura com gradil separando carros e grupos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-sky-400 flex-shrink-0" />
                  <span>Garçons para que não pegue filas</span>
                </div>
              </div>

              <div className="mt-auto">
                <div className="pt-4 border-t border-[#0b1930] h-[78px] flex flex-col justify-center mb-5">
                  <span className="text-xs text-[#a8b2c3] uppercase tracking-wider font-medium leading-none">Ala Lateral Direita</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#f6f8fc] leading-none">Sob Consulta</span>
                  </div>
                  <p className="text-[11px] text-[#a8b2c3] mt-1 leading-none">Reserva antecipada por veículo</p>
                </div>
                <a
                  href="https://wa.me/553491535921?text=Ol%C3%A1%21%20Vim%20pelo%20site%20oficial%20da%20Sintonia%20Edi%C3%A7%C3%A3o%20Especial%2010%20Anos%20DJ%20Lipe%20e%20gostaria%20de%20consultar%20valores%20e%20vagas%20para%20o%20Lounge%20Azul%20(Ala%20Direita)."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 w-full px-4 rounded-xl text-sm font-bold text-[#f6f8fc] bg-[#0b1930] hover:bg-[#25D366] hover:text-[#07090d] transition-all flex items-center justify-center gap-2 border border-[#25D366]/40 hover:border-[#25D366] group"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:text-[#07090d] transition-colors flex-shrink-0" />
                  <span>Consultar no WhatsApp</span>
                </a>
              </div>
            </div>

            {/* CARD 4: CAMAROTE NO PALCO (WHATSAPP) */}
            <div className="rounded-2xl bg-[#101116] border border-[#0b1930] p-6 flex flex-col h-full hover:border-[#c9a227]/40 transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-center h-7 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded bg-[#0b1930] text-[#f5e6b8] border border-[#c9a227]/30">
                  Apenas 4 Unidades
                </span>
                <span className="text-xs text-[#a8b2c3] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#c9a227]" /> No Palco
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#f6f8fc] mb-2 min-h-[28px] flex items-center">Camarote no Palco</h3>
              <p className="text-xs text-[#a8b2c3] mb-6 min-h-[52px] leading-relaxed">
                Área privativa montada no palco ao lado da mesa do DJ Lipe, com banheiro exclusivo e atendimento por garçons.
              </p>

              <div className="space-y-2.5 mb-6 flex-1 text-xs text-[#a8b2c3]">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#c9a227] flex-shrink-0" />
                  <span>Área privativa em cima do palco</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#c9a227] flex-shrink-0" />
                  <span>Banheiro privativo e exclusivo</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#c9a227] flex-shrink-0" />
                  <span>Atendimento dedicado por garçons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#c9a227] flex-shrink-0" />
                  <span>Entrada prioritária sem filas</span>
                </div>
              </div>

              <div className="mt-auto">
                <div className="pt-4 border-t border-[#0b1930] h-[78px] flex flex-col justify-center mb-5">
                  <span className="text-xs text-[#a8b2c3] uppercase tracking-wider font-medium leading-none">Reserva Exclusiva</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#f6f8fc] leading-none">Sob Consulta</span>
                  </div>
                  <p className="text-[11px] text-[#a8b2c3] mt-1 leading-none">Atendimento direto com a produção</p>
                </div>
                <a
                  href="https://wa.me/553491535921?text=Ol%C3%A1%21%20Vim%20pelo%20site%20oficial%20da%20Sintonia%20Edi%C3%A7%C3%A3o%20Especial%2010%20Anos%20DJ%20Lipe%20e%20gostaria%20de%20consultar%20informa%C3%A7%C3%B5es%20e%20valores%20para%20o%20Camarote%20no%20Palco."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 w-full px-4 rounded-xl text-sm font-bold text-[#f6f8fc] bg-[#0b1930] hover:bg-[#25D366] hover:text-[#07090d] transition-all flex items-center justify-center gap-2 border border-[#25D366]/40 hover:border-[#25D366] group"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366] group-hover:text-[#07090d] transition-colors flex-shrink-0" />
                  <span>Consultar no WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Support Banner */}
          <div className="mt-8 p-5 rounded-2xl bg-[#0b1930]/30 border border-[#c9a227]/25 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center flex-shrink-0 text-[#25D366]">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#f6f8fc]">
                  Central de Atendimento & Reservas no WhatsApp
                </p>
                <p className="text-xs text-[#a8b2c3] mt-0.5">
                  Dúvidas sobre setores, ingressos ou reservas para grupos? Fale diretamente com a produção no <strong className="text-[#f5e6b8]">+55 (34) 9153-5921</strong>.
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/553491535921?text=Ol%C3%A1%21%20Vim%20pelo%20site%20oficial%20da%20Sintonia%20Edi%C3%A7%C3%A3o%20Especial%2010%20Anos%20DJ%20Lipe%20e%20tenho%20uma%20d%C3%BAvida%20sobre%20o%20evento."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#07090d] bg-[#25D366] hover:bg-[#20ba59] transition-all whitespace-nowrap shadow-[0_0_15px_rgba(37,211,102,0.3)] flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chamar no WhatsApp</span>
            </a>
          </div>

          {/* Security & Payment Trust Badge */}
          <div className="mt-12 p-4 rounded-xl bg-[#0b1930]/40 border border-[#0b1930] flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-[#a8b2c3]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#c9a227]" />
              <span>Compra 100% Segura & Criptografada</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#c9a227]" />
              <span>Liberação Instantânea no PIX</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#c9a227]" />
              <span>Checkout Oficial Mercado Pago</span>
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#c9a227]" />
              <span>Ingresso Nominal com QR Code Antifraude</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ / OBJECTION HANDLING SECTION */}
      <section id="faq" className="py-20 border-t border-[#0b1930]/60 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b1930] border border-[#c9a227]/30 text-xs text-[#f5e6b8] mb-4">
              <HelpCircle className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>Dúvidas Frequentes</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#f6f8fc] tracking-tight mb-4">
              Perguntas e Respostas
            </h2>
            <p className="text-sm sm:text-base text-[#a8b2c3]">
              Informações claras sobre o processo de compra, acesso e setores do evento.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className="rounded-xl border border-[#0b1930] bg-[#101116] overflow-hidden transition-all duration-200 hover:border-[#c9a227]/30"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#f6f8fc]"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#c9a227] transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#a8b2c3] leading-relaxed border-t border-[#0b1930]/40">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Final Reassurance CTA */}
          <div className="mt-12 text-center p-8 rounded-2xl bg-[#0b1930]/20 border border-[#0b1930]">
            <h3 className="text-lg font-bold text-[#f6f8fc] mb-2">
              Pronto para fazer parte dessa história?
            </h3>
            <p className="text-xs sm:text-sm text-[#a8b2c3] mb-6">
              Com ingressos e lotes limitados, o acesso é garantido por ordem de confirmação de pagamento.
            </p>
            <a
              href="#ingressos"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] hover:opacity-95 shadow-[0_0_25px_rgba(201,162,39,0.3)] transition-all hover:scale-105 active:scale-95"
            >
              <Ticket className="w-4 h-4" />
              <span>Garantir Meu Ingresso Agora</span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER & OFFICIAL PRODUCERS */}
      <footer className="w-full border-t border-[#0b1930] bg-[#07090d] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          {/* Main Logo & Description */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8">
                <Image
                  src="/assets/logos/logo-especial-10-anos-lipe.svg"
                  alt="Especial 10 Anos DJ Lipe"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-sm tracking-wide text-[#f6f8fc]">
                Especial 10 Anos DJ Lipe
              </span>
            </div>
            <p className="text-xs text-[#a8b2c3] max-w-sm">
              Sintonia Edição Especial 10 Anos DJ Lipe: a comemoração oficial de 10 anos de trajetória musical do DJ Lipe.
            </p>
          </div>

          {/* Producers & Credits */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <span className="text-[11px] uppercase tracking-wider text-[#a8b2c3] font-medium">
              Realização & Produção Oficial:
            </span>
            <div className="flex items-center gap-6">
              {/* GHVE Logo Branca */}
              <div className="relative w-32 h-10 flex items-center justify-center opacity-90 hover:opacity-100 transition-all hover:-translate-y-0.5">
                <Image
                  src="/assets/logos/logo-ghve-branca.svg"
                  alt="GHVE Eventos"
                  width={128}
                  height={38}
                  className="object-contain max-h-9 w-auto"
                  style={{ width: "auto", height: "auto" }}
                  unoptimized
                />
              </div>

              <span className="text-xs text-[#a8b2c3]/40 font-light select-none">|</span>

              {/* RL Produções */}
              <div className="relative w-14 h-11 flex items-center justify-center opacity-90 hover:opacity-100 transition-all hover:-translate-y-0.5">
                <Image
                  src="/assets/logos/logo-rl-producoes.svg"
                  alt="RL Produções"
                  width={52}
                  height={42}
                  className="object-contain max-h-10 w-auto"
                  style={{ width: "auto", height: "auto" }}
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-[#0b1930]/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#a8b2c3] gap-4">
          <p>© 2026 GHVE Eventos & RL Produções. Todos os direitos reservados.</p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setTermsInitialTab("geral");
                setTermsModalOpen(true);
              }}
              className="hover:text-[#f5e6b8] transition-colors"
            >
              Termos de Uso
            </button>
            <span className="text-[#0b1930]">|</span>
            <button
              type="button"
              onClick={() => {
                setTermsInitialTab("lounges");
                setTermsModalOpen(true);
              }}
              className="hover:text-[#f5e6b8] transition-colors"
            >
              Regulamento dos Lounges
            </button>
            <span className="text-[#0b1930]">|</span>
            <button
              type="button"
              onClick={() => {
                setTermsInitialTab("privacidade");
                setTermsModalOpen(true);
              }}
              className="hover:text-[#f5e6b8] transition-colors"
            >
              Política de Privacidade
            </button>
            <span className="text-[#0b1930]">|</span>
            <Link
              href="/termos"
              className="text-[#c9a227] hover:underline"
            >
              Ver Tudo
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating Mobile Bottom Conversion Bar */}
      <div className="sm:hidden fixed bottom-3 left-3 right-3 z-40 animate-in slide-in-from-bottom duration-300">
        <div className="p-2 rounded-2xl bg-[#101116]/95 backdrop-blur-xl border border-[#c9a227]/40 shadow-[0_10px_30px_rgba(0,0,0,0.9)] flex items-center gap-2">
          {hasTicket ? (
            <Link
              href="/perfil?tab=ingressos"
              className="flex-1 py-3 px-4 rounded-xl text-center text-xs font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(201,162,39,0.3)] border border-[#f5e6b8]"
            >
              <QrCode className="w-4 h-4" />
              <span>Ver Meu Ingresso • QR Code</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  setAuthModalTab("register");
                  setAuthModalOpen(true);
                } else {
                  setCheckoutModalOpen(true);
                }
              }}
              className="flex-1 py-3 px-4 rounded-xl text-center text-xs font-extrabold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(201,162,39,0.3)]"
            >
              <Ticket className="w-4 h-4" />
              <span>Garantir Ingresso • {activePistaLot.name} R$ {activePistaLot.price}</span>
            </button>
          )}
        </div>
      </div>

      {/* FLOATING QUICK ACTIONS */}
      <ScrollToTop />

      {/* AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />

      {/* TERMS & PRIVACY MODAL */}
      <TermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        initialTab={termsInitialTab}
      />

      {/* CHECKOUT MERCADO PAGO MODAL */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        sector="pista"
        lotName={activePistaLot.name}
        price={activePistaLot.price}
      />
    </div>
  );
}
