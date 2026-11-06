"use client";

import React, { useEffect, useState, useRef } from "react";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";
import { Loader2, AlertCircle, CreditCard, ShieldCheck } from "lucide-react";

interface CardPaymentFormProps {
  price: number;
  userEmail: string;
  userName: string;
  userCpf?: string;
  userId: string;
  sector?: string;
  couponCode?: string;
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
  couponCode,
  onSuccess,
  onProcessingChange,
  onSwitchToPix,
}: CardPaymentFormProps) {
  const [initialized, setInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

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

  // Garante estilização limpa e integrada no Card Branco Oficial do Mercado Pago
  const sanitizeBrickElements = () => {
    if (!containerRef.current) return;

    // 1. Blindagem de iframes com fundo branco e contraste perfeito
    const iframes = containerRef.current.querySelectorAll("iframe");
    iframes.forEach((iframe) => {
      iframe.setAttribute("allowtransparency", "true");
      iframe.style.setProperty("background-color", "#ffffff", "important");
      iframe.style.setProperty("color-scheme", "light", "important");
      iframe.style.setProperty("border-radius", "10px", "important");
      iframe.style.setProperty("border", "none", "important");
    });

    // 2. Trava e estiliza o seletor de documento como prefixo elegante "CPF |"
    const selects = containerRef.current.querySelectorAll<HTMLSelectElement>("select");
    selects.forEach((sel) => {
      sel.style.setProperty("pointer-events", "none", "important");
      sel.style.setProperty("-webkit-appearance", "none", "important");
      sel.style.setProperty("appearance", "none", "important");
      sel.style.setProperty("background-color", "#f3f4f6", "important");
      sel.style.setProperty("color", "#111827", "important");
      sel.style.setProperty("font-weight", "700", "important");
      sel.style.setProperty("font-size", "13px", "important");
      sel.style.setProperty("letter-spacing", "0.05em", "important");
      sel.style.setProperty("border-radius", "10px 0 0 10px", "important");
      sel.style.setProperty("border", "none", "important");
      sel.style.setProperty("border-right", "1px solid #d1d5db", "important");
      sel.style.setProperty("outline", "none", "important");
      sel.style.setProperty("box-shadow", "none", "important");
      sel.style.setProperty("cursor", "default", "important");

      const parent = sel.parentElement;
      if (parent) {
        parent.style.setProperty("border-radius", "10px", "important");
        parent.style.setProperty("overflow", "hidden", "important");
        parent.style.setProperty("border", "1px solid #d1d5db", "important");
        parent.style.setProperty("background-color", "#ffffff", "important");

        // Oculta setinhas/chevrons SVG
        const svgs = parent.querySelectorAll<SVGElement>("svg");
        svgs.forEach((svg) => {
          svg.style.setProperty("display", "none", "important");
        });

        // Se o usuário clicar na área do prefixo CPF, redireciona o foco para o input de número
        if (!parent.getAttribute("data-click-bound")) {
          parent.setAttribute("data-click-bound", "true");
          parent.addEventListener("click", () => {
            const docInput = containerRef.current?.querySelector<HTMLInputElement>(
              'input[name*="identificationNumber"], input[id*="identificationNumber"], input[type="text"]'
            );
            docInput?.focus();
          });
        }
      }
    });

    // 3. Document Number Input (fundo branco, texto escuro nítido)
    const docInput = containerRef.current.querySelector<HTMLInputElement>(
      'input[name*="identificationNumber"], input[id*="identificationNumber"]'
    );
    if (docInput) {
      docInput.style.setProperty("border-radius", "0 10px 10px 0", "important");
      docInput.style.setProperty("border", "none", "important");
      docInput.style.setProperty("box-shadow", "none", "important");
      docInput.style.setProperty("outline", "none", "important");
      docInput.style.setProperty("background-color", "#ffffff", "important");
      docInput.style.setProperty("color", "#111827", "important");
    }

    // 4. Centraliza o ícone de cartão no código de segurança
    const icons = containerRef.current.querySelectorAll<HTMLElement>(
      '[class*="icon"], [class*="securityCode"] svg, [class*="cvv"] svg, [class*="securityCode"] img, [class*="cvv"] img'
    );
    icons.forEach((ic) => {
      ic.style.setProperty("transform", "translateY(-50%)", "important");
      ic.style.setProperty("top", "50%", "important");
      ic.style.setProperty("opacity", "0.75", "important");
    });

    // 5. Preenche o nome do titular com o nome real do comprador caso esteja vazio
    try {
      const nameInput = containerRef.current.querySelector<HTMLInputElement>(
        'input[name*="cardholderName"], input[id*="cardholderName"]'
      );
      if (nameInput) {
        nameInput.style.setProperty("color", "#111827", "important");
        nameInput.style.setProperty("background-color", "#ffffff", "important");
        if (!nameInput.value && userName) {
          nameInput.value = userName.trim();
          nameInput.dispatchEvent(new Event("input", { bubbles: true }));
          nameInput.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    } catch {
      // Ignora erro silenciosamente
    }
  };

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
          couponCode: couponCode || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.error || data.message || "Pagamento recusado pela operadora.";
        setCardError(errorMsg);
        throw new Error(errorMsg);
      }

      // Pagamento Aprovado com sucesso!
      onSuccess(data.ticketId);
    } catch (err: any) {
      console.error("[CardPaymentForm] Erro ao submeter pagamento:", err);
      const msg = err.message || "Erro inesperado ao processar o cartão.";
      setCardError(msg);
      throw err; // Rejeita a promise do Brick para que o formulário continue utilizável
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
    <div className="relative rounded-3xl bg-white p-5 sm:p-7 border-2 border-[#c9a227]/40 shadow-[0_15px_40px_rgba(0,0,0,0.45)] text-gray-900">
      {/* Cabeçalho do Card Branco Oficial */}
      <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-gray-100">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-gray-900">
          <CreditCard className="w-4 h-4 text-[#c9a227]" />
          <span>Dados do Cartão de Crédito</span>
        </div>
        <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200 flex items-center gap-1 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Ambiente PCI-DSS Seguro</span>
        </span>
      </div>

      {/* Alerta de Erro de Pagamento */}
      {cardError && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-300 flex items-start gap-2.5 text-xs text-red-800 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Transação não concluída:</strong>
            <span>{cardError}</span>
          </div>
        </div>
      )}

      {/* Container Oficial do Brick */}
      <div ref={containerRef} className="card-payment-wrapper relative min-h-[380px]">
        {/* Skeleton enquanto o iframe do Mercado Pago monta */}
        {(!initialized || !isReady) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 rounded-2xl bg-gray-50/90 border border-gray-200 text-center">
            <Loader2 className="w-8 h-8 text-[#c9a227] animate-spin mb-3" />
            <p className="text-xs text-gray-900 font-extrabold">Carregando formulário seguro...</p>
            <span className="text-[11px] text-gray-500 mt-1">Conectando criptografia PCI-DSS</span>
          </div>
        )}

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
                  theme: "default",
                  customVariables: {
                    baseColor: "#c9a227",
                    formBackgroundColor: "#ffffff",
                    inputBackgroundColor: "#ffffff",
                    textPrimaryColor: "#111827",
                    textSecondaryColor: "#374151",
                    errorColor: "#ef4444",
                    successColor: "#10b981",
                    outlinePrimaryColor: "#c9a227",
                    outlineSecondaryColor: "#d1d5db",
                    borderRadiusMedium: "10px",
                    borderRadiusSmall: "8px",
                    borderRadiusLarge: "12px",
                    buttonTextColor: "#07090d",
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
            onReady={() => {
              setIsReady(true);
              sanitizeBrickElements();
              setTimeout(sanitizeBrickElements, 300);
              setTimeout(sanitizeBrickElements, 800);
            }}
            onError={(err) => {
              console.error("[CardPayment Brick Error]", err);
            }}
          />
        )}
      </div>

      {/* Overlay de carregamento durante a submissão */}
      {submitting && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl">
          <Loader2 className="w-10 h-10 text-[#c9a227] animate-spin mb-3" />
          <p className="text-sm font-extrabold text-gray-900">Processando Pagamento...</p>
          <span className="text-xs text-gray-600 mt-1">Aguardando autorização da operadora</span>
        </div>
      )}
    </div>
  );
}
