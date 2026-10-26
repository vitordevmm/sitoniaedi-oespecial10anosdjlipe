"use client";

import React, { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  CreditCard,
  Loader2,
  Clock,
  Ticket as TicketIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CardPaymentForm } from "./CardPaymentForm";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  sector?: string;
  lotName?: string;
  price?: number;
}

export function CheckoutModal({
  isOpen,
  onClose,
  sector = "pista",
  lotName = "1º Lote Oficial",
  price = 60.0,
}: CheckoutModalProps) {
  const { user, profile } = useAuth();

  const [selectedMethod, setSelectedMethod] = useState<"pix" | "card">("pix");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // PIX Data
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [solidQrUrl, setSolidQrUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  // Countdown timer (15 minutes)
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Limpa estado ao fechar
  useEffect(() => {
    if (!isOpen) {
      setSelectedMethod("pix");
      setLoading(false);
      setError(null);
      setPaymentId(null);
      setQrCode(null);
      setQrCodeBase64(null);
      setSolidQrUrl(null);
      setCopied(false);
      setIsApproved(false);
      setTimeLeft(15 * 60);
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
  }, [isOpen]);

  // Geração client-side do QR Code com pixels 100% opacos e blindagem contra auto-dark mode
  useEffect(() => {
    if (!qrCode) {
      setSolidQrUrl(null);
      return;
    }

    let isMounted = true;
    QRCode.toDataURL(qrCode, {
      width: 320,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (isMounted) setSolidQrUrl(url);
      })
      .catch((err) => {
        console.error("[CheckoutModal] Erro ao renderizar QR code sólido:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [qrCode]);

  // Timer countdown do PIX
  useEffect(() => {
    if (!isOpen || !qrCode || isApproved) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, qrCode, isApproved]);

  // Polling para checar se o PIX foi pago
  useEffect(() => {
    if (!paymentId || isApproved) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status?paymentId=${paymentId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "approved") {
            setIsApproved(true);
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        }
      } catch (err) {
        console.error("Erro no polling de status do PIX:", err);
      }
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [paymentId, isApproved]);

  if (!isOpen) return null;

  const handleGeneratePix = async () => {
    if (!user) {
      setError("Faça login para continuar com a compra.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout/pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          userName: profile?.nome || user.displayName || "Membro Oficial",
          userCpf: profile?.cpf || "",
          sector,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao gerar PIX");
      }

      setPaymentId(data.paymentId);
      setQrCode(data.qrCode);
      setQrCodeBase64(data.qrCodeBase64);
    } catch (err: any) {
      setError(err.message || "Erro inesperado ao conectar com Mercado Pago.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!qrCode) return;
    navigator.clipboard.writeText(qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const displayQr = solidQrUrl || (qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 max-h-[92vh] overflow-y-auto rounded-3xl bg-[#101116] border-2 border-[#c9a227]/40 shadow-[0_0_50px_rgba(201,162,39,0.25)] p-6 sm:p-8 text-[#f6f8fc]">
        {/* Glow de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#c9a227]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0b1930]/40 rounded-full blur-3xl pointer-events-none" />

        {/* Botão fechar */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#0b1930] hover:bg-[#c9a227]/20 text-[#a8b2c3] hover:text-[#f6f8fc] border border-[#0b1930] transition-colors z-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* TELA DE SUCESSO QUANDO APROVADO (PIX OU CARTÃO) */}
        {isApproved ? (
          <div className="text-center py-6">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[#c9a227]/20 border-2 border-[#c9a227] flex items-center justify-center shadow-[0_0_30px_rgba(201,162,39,0.5)] animate-bounce">
              <CheckCircle2 className="w-12 h-12 text-[#f5e6b8]" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#f6f8fc] tracking-tight mb-2">
              Pagamento Confirmado! 🎉
            </h3>
            <p className="text-sm text-[#a8b2c3] max-w-xs mx-auto mb-6">
              Seu ingresso oficial da <strong className="text-[#f5e6b8]">Sintonia Especial 10 Anos</strong> foi emitido com sucesso e enviado para o seu e-mail!
            </p>

            <a
              href="/perfil?tab=ingressos"
              className="inline-flex items-center justify-center gap-2 w-full h-13 px-6 rounded-xl font-extrabold text-sm text-[#07090d] bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] hover:opacity-95 shadow-[0_0_25px_rgba(201,162,39,0.4)] transition-all"
            >
              <TicketIcon className="w-5 h-5 flex-shrink-0" />
              <span>VISUALIZAR MEU INGRESSO</span>
            </a>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#0b1930] border border-[#c9a227]/30 text-xs text-[#f5e6b8] w-fit mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>Ambiente Seguro Mercado Pago</span>
            </div>

            <h3 className="text-2xl font-extrabold text-[#f6f8fc] tracking-tight mb-1">
              Finalizar Pedido
            </h3>
            <p className="text-xs text-[#a8b2c3] mb-5">
              Garanta sua vaga oficial com compensação em tempo real.
            </p>

            {/* SELETOR DE MÉTODO DE PAGAMENTO (TABS DARK & GOLD) */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-[#0b1930] border border-[#c9a227]/30 mb-5">
              <button
                type="button"
                onClick={() => setSelectedMethod("pix")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
                  selectedMethod === "pix"
                    ? "bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] shadow-[0_0_15px_rgba(201,162,39,0.35)]"
                    : "text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-[#101116]/50"
                }`}
              >
                <Zap className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">PIX Instantâneo</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMethod("card")}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
                  selectedMethod === "card"
                    ? "bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] shadow-[0_0_15px_rgba(201,162,39,0.35)]"
                    : "text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-[#101116]/50"
                }`}
              >
                <CreditCard className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Cartão (Até 12x)</span>
              </button>
            </div>

            {/* FLUXO 1: CARTÃO DE CRÉDITO */}
            {selectedMethod === "card" ? (
              <div>
                {/* Card de Resumo para Cartão */}
                <div className="rounded-2xl bg-[#0b1930]/60 border border-[#c9a227]/30 p-4 sm:p-5 mb-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-base font-bold text-[#f6f8fc]">Pista Geral & Bar Central</h4>
                      <span className="text-xs text-[#f5e6b8] font-medium">{lotName}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-extrabold text-[#f5e6b8] leading-none">
                        R$ {price.toFixed(2).replace(".", ",")}
                      </div>
                      <span className="text-[10px] text-[#a8b2c3]">em 1x sem acréscimo</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-[#a8b2c3]">
                    Parcelamento disponível em até 12x com juros repassados na fatura pelo Mercado Pago.
                  </div>
                </div>

                {/* Formulário Oficial do Cartão */}
                {user ? (
                  <CardPaymentForm
                    price={price}
                    userEmail={user.email || ""}
                    userName={profile?.nome || user.displayName || "Membro Oficial"}
                    userCpf={profile?.cpf || ""}
                    userId={user.uid}
                    sector={sector}
                    onSuccess={() => setIsApproved(true)}
                    onSwitchToPix={() => setSelectedMethod("pix")}
                  />
                ) : (
                  <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 text-center">
                    Faça login na sua conta para liberar o pagamento com cartão.
                  </div>
                )}
              </div>
            ) : !qrCode ? (
              /* FLUXO 2A: PIX (RESUMO ANTES DE GERAR) */
              <div>
                {/* Card de Resumo */}
                <div className="rounded-2xl bg-[#0b1930]/60 border border-[#c9a227]/30 p-5 mb-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-base font-bold text-[#f6f8fc]">Pista Geral & Bar Central</h4>
                      <span className="text-xs text-[#f5e6b8] font-medium">{lotName}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-extrabold text-[#f5e6b8] leading-none">
                        R$ {price.toFixed(2).replace(".", ",")}
                      </div>
                      <span className="text-[10px] text-[#a8b2c3]">Sem taxas extras</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#0b1930] text-xs text-[#a8b2c3] space-y-1">
                    <div className="flex justify-between">
                      <span>Titular:</span>
                      <span className="font-semibold text-[#f6f8fc]">
                        {profile?.nome || user?.displayName || "Membro Oficial"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>E-mail:</span>
                      <span className="font-semibold text-[#f6f8fc]">{user?.email || "—"}</span>
                    </div>
                    {profile?.cpf && (
                      <div className="flex justify-between">
                        <span>CPF:</span>
                        <span className="font-semibold text-[#f6f8fc]">{profile.cpf}</span>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 mb-5">
                    {error}
                  </div>
                )}

                {/* Botão Gerar PIX */}
                <button
                  type="button"
                  onClick={handleGeneratePix}
                  disabled={loading}
                  className="w-full h-13 px-6 rounded-xl font-extrabold text-sm text-[#07090d] bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] hover:opacity-95 shadow-[0_0_25px_rgba(201,162,39,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>GERANDO PIX NO MERCADO PAGO...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 flex-shrink-0" />
                      <span>GERAR QR CODE PIX</span>
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#a8b2c3]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
                  <span>Aprovação imediata e emissão do QR Code em segundos</span>
                </div>
              </div>
            ) : (
              /* FLUXO 2B: PIX GERADO (QR CODE + COPIA E COLA) */
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2.5 mb-5 pr-14 sm:pr-16">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-xs text-emerald-400 font-medium shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>PIX Gerado com Sucesso</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0b1930] border border-[#c9a227]/30 text-xs text-[#a8b2c3] shadow-inner">
                    <Clock className="w-3.5 h-3.5 text-[#c9a227] flex-shrink-0" />
                    <span className="text-[11px] text-[#a8b2c3] font-medium hidden xs:inline">Válido por:</span>
                    <span className="font-mono font-bold text-[#f5e6b8] tracking-wider">{formattedTime}</span>
                  </div>
                </div>

                <div className="text-center mb-5">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#f6f8fc]">
                    Escaneie ou Copie o Código
                  </h3>
                  <p className="text-xs text-[#a8b2c3] mt-1">
                    Abra o app do seu banco e pague com PIX para liberar seu ingresso.
                  </p>
                </div>

                {/* Imagem do QR Code Blindada contra auto-dark mode */}
                <div
                  data-darkreader-ignore="true"
                  style={{
                    colorScheme: "light",
                    forcedColorAdjust: "none",
                    backgroundColor: "#ffffff",
                    background: "#ffffff",
                    isolation: "isolate",
                  }}
                  className="w-56 h-56 sm:w-60 sm:h-60 mx-auto mb-5 p-3.5 rounded-2xl bg-white border-2 border-[#c9a227] shadow-[0_0_35px_rgba(201,162,39,0.3)] flex items-center justify-center qr-code-shield relative select-none"
                >
                  {displayQr ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={displayQr}
                      alt="QR Code PIX Mercado Pago"
                      width={240}
                      height={240}
                      data-darkreader-ignore="true"
                      style={{
                        colorScheme: "light",
                        forcedColorAdjust: "none",
                        backgroundColor: "#ffffff",
                        background: "#ffffff",
                        filter: "none",
                        WebkitFilter: "none",
                        mixBlendMode: "normal",
                        isolation: "isolate",
                        imageRendering: "pixelated",
                      }}
                      className="w-full h-full object-contain block rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-[#07090d]">
                      <Loader2 className="w-8 h-8 animate-spin text-[#c9a227] mb-2" />
                      <span className="text-[11px] font-bold text-[#07090d]">Gerando QR Code...</span>
                    </div>
                  )}
                </div>

                {/* Bloco Copia e Cola */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-[#a8b2c3] mb-2">
                    Código PIX Copia e Cola:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={qrCode}
                      className="w-full h-11 px-3 pr-28 rounded-xl bg-[#0b1930] border border-[#0b1930] text-xs font-mono text-[#f6f8fc] select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      className={`absolute right-1 top-1 bottom-1 px-3 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                        copied
                          ? "bg-emerald-500 text-black"
                          : "bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] hover:opacity-95"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>COPIADO!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>COPIAR</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Alerta de espera */}
                <div className="p-3.5 rounded-xl bg-[#0b1930]/80 border border-[#c9a227]/30 flex items-center gap-3 text-xs text-[#a8b2c3]">
                  <Loader2 className="w-5 h-5 text-[#c9a227] animate-spin flex-shrink-0" />
                  <span>
                    Identificando pagamento em tempo real... Não feche esta tela após pagar.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
