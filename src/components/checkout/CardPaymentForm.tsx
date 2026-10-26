"use client";

import React, { useEffect, useState, useRef } from "react";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";
import { Loader2, AlertCircle, ShieldCheck, Sparkles, Copy, Check } from "lucide-react";

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
  const [copiedCard, setCopiedCard] = useState(false);

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

  const handleCopyCard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText("4235647728025682");
    setCopiedCard(true);
    setTimeout(() => setCopiedCard(false), 2500);
  };

  // Garante blindagem Dark total: elimina verde de validação, fundos brancos e trava o dropdown como prefixo CPF
  const sanitizeBrickElements = () => {
    if (!containerRef.current) return;

    // 1. Blindagem de iframes (dados sensíveis do cartão)
    const iframes = containerRef.current.querySelectorAll("iframe");
    iframes.forEach((iframe) => {
      iframe.style.backgroundColor = "#0b1930";
      iframe.style.colorScheme = "dark";
      iframe.style.borderRadius = "8px";
    });

    // 2. Trava e estiliza o seletor de documento como prefixo elegante "CPF |" sem abrir dropdown branco nativo
    const selects = containerRef.current.querySelectorAll<HTMLSelectElement>("select");
    selects.forEach((sel) => {
      sel.style.setProperty("pointer-events", "none", "important");
      sel.style.setProperty("-webkit-appearance", "none", "important");
      sel.style.setProperty("appearance", "none", "important");
      sel.style.setProperty("background-color", "#0b1930", "important");
      sel.style.setProperty("background", "#0b1930", "important");
      sel.style.setProperty("color", "#f5e6b8", "important");
      sel.style.setProperty("font-weight", "700", "important");
      sel.style.setProperty("font-size", "13px", "important");
      sel.style.setProperty("letter-spacing", "0.05em", "important");
      sel.style.setProperty("border", "none", "important");
      sel.style.setProperty("outline", "none", "important");
      sel.style.setProperty("box-shadow", "none", "important");
      sel.style.setProperty("cursor", "default", "important");

      const parent = sel.parentElement;
      if (parent) {
        parent.style.setProperty("background-color", "#0b1930", "important");
        parent.style.setProperty("background", "#0b1930", "important");
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

    // 3. Neutraliza qualquer fundo verde (validação do CPF / sucesso) em todos os containers
    const allEls = containerRef.current.querySelectorAll<HTMLElement>("*");
    allEls.forEach((el) => {
      const bg = el.style.backgroundColor || "";
      // Se tiver tonalidades de verde de validação do SDK
      if (
        bg.includes("0, 43, 31") ||
        bg.includes("0, 51, 40") ||
        bg.includes("0, 40") ||
        bg.includes("1, 51") ||
        bg.includes("0, 166, 80") ||
        bg.includes("0, 128") ||
        bg === "#002b1f" ||
        bg === "#013328" ||
        bg === "#00402b"
      ) {
        el.style.setProperty("background-color", "#0b1930", "important");
        el.style.setProperty("background", "#0b1930", "important");
      }

      // Neutraliza containers de input com classe valid ou success
      if (
        el.className &&
        typeof el.className === "string" &&
        (el.className.includes("success") || el.className.includes("valid"))
      ) {
        el.style.setProperty("background-color", "#0b1930", "important");
        el.style.setProperty("background", "#0b1930", "important");
      }
    });

    // 4. Auto-preenche o nome do titular com o nome oficial ou 'APRO' se o campo existir no DOM
    try {
      const nameInput = containerRef.current.querySelector<HTMLInputElement>(
        'input[name*="cardholderName"], input[id*="cardholderName"]'
      );
      if (nameInput && !nameInput.value) {
        nameInput.value = "APRO";
        nameInput.dispatchEvent(new Event("input", { bubbles: true }));
        nameInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } catch {
      // Ignora erro silenciosamente
    }
  };

  // Observador de mutações no DOM para interceptar em tempo real validações do SDK
  useEffect(() => {
    if (!isReady || !containerRef.current) return;

    sanitizeBrickElements();

    const observer = new MutationObserver(() => {
      sanitizeBrickElements();
    });

    observer.observe(containerRef.current, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => observer.disconnect();
  }, [isReady]);

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
    <div className="relative">
      {/* CARD DE EXEMPLO PARA TESTES (HOMOLOGAÇÃO) */}
      <div className="mb-4 p-3.5 rounded-2xl bg-[#0b1930]/90 border border-[#c9a227]/40 shadow-inner">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#c9a227]/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#f5e6b8]">
            <Sparkles className="w-3.5 h-3.5 text-[#c9a227]" />
            <span>Dados de Exemplo para Teste</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#c9a227]/20 text-[#f5e6b8] font-bold border border-[#c9a227]/30">
            Aprovação Imediata
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] mb-2">
          {/* Número do Cartão com Cópia Rápida */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#101116] border border-[#1e293b]">
            <span className="text-[#a8b2c3]">Cartão:</span>
            <div className="flex items-center gap-1.5 font-mono text-[#f6f8fc] font-bold">
              <span>4235 6477 2802 5682</span>
              <button
                type="button"
                onClick={handleCopyCard}
                className={`px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 transition-all ${
                  copiedCard
                    ? "bg-emerald-500 text-black font-bold"
                    : "bg-[#0b1930] hover:bg-[#c9a227]/20 text-[#c9a227] border border-[#c9a227]/30"
                }`}
                title="Copiar número do cartão"
              >
                {copiedCard ? (
                  <>
                    <Check className="w-3 h-3 text-black" />
                    <span>COPIADO</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>COPIAR</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Validade e CVV */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#101116] border border-[#1e293b]">
            <span className="text-[#a8b2c3]">Validade:</span>
            <span className="font-mono text-[#f6f8fc] font-bold">11/30</span>
            <span className="text-[#a8b2c3] ml-2">CVV:</span>
            <span className="font-mono text-[#f6f8fc] font-bold">123</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-[#a8b2c3] px-1">
          <span>Nome no cartão: <strong className="text-[#f6f8fc]">APRO</strong></span>
          <span>Parcelamento: <strong className="text-[#f5e6b8]">1x até 12x</strong></span>
        </div>
      </div>

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

      {/* Container Oficial do Brick com ref para injeção de estilo dark nos iframes */}
      <div ref={containerRef} className={`card-payment-wrapper ${!isReady ? "hidden" : "block"}`}>
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
                    baseColor: "#c9a227",
                    inputBackgroundColor: "#0b1930",
                    formBackgroundColor: "transparent",
                    textPrimaryColor: "#f6f8fc",
                    textSecondaryColor: "#a8b2c3",
                    outlinePrimaryColor: "#c9a227",
                    outlineSecondaryColor: "#0b1930",
                    buttonTextColor: "#07090d",
                    borderRadiusMedium: "12px",
                    inputBorderWidth: "1px",
                    inputFocusedBoxShadow: "0 0 0 2px rgba(201, 162, 39, 0.4)",
                    successColor: "#0b1930",
                    warningColor: "#c9a227",
                    baseColorFirstVariant: "#0b1930",
                    baseColorSecondVariant: "#101116",
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
              setTimeout(sanitizeBrickElements, 200);
              setTimeout(sanitizeBrickElements, 600);
              setTimeout(sanitizeBrickElements, 1200);
            }}
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
