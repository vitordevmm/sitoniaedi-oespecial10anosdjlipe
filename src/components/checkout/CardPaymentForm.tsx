"use client";

import React, { useEffect, useState } from "react";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";
import { Loader2, AlertCircle, ShieldCheck } from "lucide-react";

interface CardPaymentFormProps {
  price: number;
  userEmail: string;
  userName: string;
  userCpf?: string;
  userId: string;
  sector?: string;
  onSuccess: (ticketId?: string) => void;
  onProcessingChange?: (processing: boolean) => void;
  onSwitchToPix?: () => void;
}

export function CardPaymentForm({
  price,
  userEmail,
  userName,
  userCpf,
  userId,
  sector = "pista",
  onSuccess,
  onProcessingChange,
  onSwitchToPix,
}: CardPaymentFormProps) {
  const [initialized, setInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  useEffect(() => {
    const pubKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || "";
    if (!pubKey) {
      setInitError("Chave pública do Mercado Pago não configurada no ambiente.");
      return;
    }

    try {
      initMercadoPago(pubKey, { locale: "pt-BR" });
      setInitialized(true);
    } catch (err: any) {
      console.error("[CardPaymentForm] Erro ao inicializar Mercado Pago:", err);
      setInitError("Não foi possível carregar os serviços de pagamento. Verifique sua conexão ou bloqueador de anúncios.");
    }
  }, []);

  const cleanCpf = userCpf ? userCpf.replace(/\D/g, "") : "";

  const handleSubmit = async (cardFormData: any) => {
    setCardError(null);
    setSubmitting(true);
    if (onProcessingChange) onProcessingChange(true);

    try {
      const res = await fetch("/api/checkout/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: cardFormData.token,
          issuer_id: cardFormData.issuer_id,
          payment_method_id: cardFormData.payment_method_id,
          installments: cardFormData.installments || 1,
          userId,
          userEmail,
          userName,
          userCpf: cleanCpf,
          sector,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.error || data.message || "Pagamento recusado pela operadora.";
        setCardError(errorMsg);
        throw new Error(errorMsg);
      }

      // Pagamento Aprovado!
      onSuccess(data.ticketId);
    } catch (err: any) {
      console.error("[CardPaymentForm] Erro ao submeter pagamento:", err);
      const msg = err.message || "Erro inesperado ao processar o cartão.";
      setCardError(msg);
      throw err; // Rejeita a promise do Brick para mantê-lo interativo
    } finally {
      setSubmitting(false);
      if (onProcessingChange) onProcessingChange(false);
    }
  };

  if (initError) {
    return (
      <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/40 text-center text-xs text-red-200">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
        <p className="font-semibold mb-2">{initError}</p>
        <p className="text-[#a8b2c3] mb-4">
          Alguns bloqueadores de anúncios (AdBlock / Brave Shields) podem bloquear o script do gateway.
        </p>
        {onSwitchToPix && (
          <button
            type="button"
            onClick={onSwitchToPix}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] font-bold text-xs hover:opacity-95 transition-all"
          >
            Pagar com PIX Instantâneo
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Skeleton enquanto o iframe do Mercado Pago monta */}
      {(!initialized || !isReady) && (
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-[#0b1930]/40 border border-[#c9a227]/20 text-center min-h-[300px]">
          <Loader2 className="w-8 h-8 text-[#c9a227] animate-spin mb-3" />
          <p className="text-xs text-[#f5e6b8] font-bold">Carregando gateway seguro...</p>
          <span className="text-[11px] text-[#a8b2c3] mt-1">Conectando criptografia PCI-DSS</span>
        </div>
      )}

      {/* Alerta de Erro de Pagamento */}
      {cardError && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Transação não concluída:</strong>
            <span>{cardError}</span>
          </div>
        </div>
      )}

      {/* Aviso de Parcelamento Oficial */}
      <div className="mb-4 flex items-center justify-between px-3 py-2 rounded-xl bg-[#0b1930]/70 border border-[#c9a227]/30 text-[11px] text-[#a8b2c3]">
        <div className="flex items-center gap-1.5 text-[#f5e6b8]">
          <ShieldCheck className="w-4 h-4 text-[#c9a227]" />
          <span className="font-semibold">Parcelamento em até 12x</span>
        </div>
        <span className="text-[10px] text-[#a8b2c3]">Taxas calculadas pelo Mercado Pago</span>
      </div>

      {/* Container Oficial do Brick */}
      <div className={!isReady ? "hidden" : "block"}>
        {initialized && (
          <CardPayment
            initialization={{
              amount: Number(price),
              payer: {
                email: userEmail,
                identification:
                  cleanCpf.length === 11
                    ? {
                        type: "CPF",
                        number: cleanCpf,
                      }
                    : undefined,
              },
            }}
            customization={{
              visual: {
                style: {
                  theme: "dark",
                  customVariables: {
                    theme: "dark",
                    baseColor: "#c9a227",
                    primaryColor: "#c9a227",
                    outlinePrimaryColor: "#c9a227",
                  },
                },
                hideFormTitle: true,
                hidePaymentButton: false,
              },
              paymentMethods: {
                maxInstallments: 12,
                types: {
                  excluded: ["debit_card"],
                },
              },
            }}
            onSubmit={handleSubmit}
            onReady={() => setIsReady(true)}
            onError={(err) => {
              console.error("[CardPayment Brick Error]", err);
            }}
          />
        )}
      </div>

      {/* Overlay de carregamento durante a submissão */}
      {submitting && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#101116]/85 backdrop-blur-sm rounded-2xl">
          <Loader2 className="w-10 h-10 text-[#c9a227] animate-spin mb-3" />
          <p className="text-sm font-extrabold text-[#f6f8fc]">Processando Pagamento...</p>
          <span className="text-xs text-[#a8b2c3] mt-1">Aguardando autorização da operadora</span>
        </div>
      )}
    </div>
  );
}
