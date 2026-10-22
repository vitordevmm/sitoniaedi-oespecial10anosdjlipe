"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

/**
 * MobileSplashScreen - Tela de carregamento ultra-premium exclusiva para mobile
 * 
 * Estrutura oficial solicitada:
 * - Topo: Logo da Sintonia
 * - Meio: Logo do Especial 10 Anos DJ Lipe (com efeito de pulso e barra de progresso dourada)
 * - Embaixo de tudo: Logos oficiais das produtoras GHVE Eventos & RL Produções
 * 
 * Funcionalidade:
 * - Detecta dispositivos móveis / telas compactas (smartphones e tablets)
 * - Segura a tela preta oficial (#07090d) enquanto fontes, imagens e scripts carregam
 * - Quando tudo está pronto (window.onload + document.readyState === "complete"), faz um fade out suave
 * - O site é liberado 100% fluido ("lisinho") sem saltos visuais ou travamentos
 */
export function MobileSplashScreen() {
  const [mounted, setMounted] = useState(true);
  const [fade, setFade] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 1. Detecta se é dispositivo mobile ou viewport de celular/tablet (<= 1024px)
    const checkIsMobile = () => {
      const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "";
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isMobileWidth = typeof window !== "undefined" && window.innerWidth <= 1024;
      return isMobileUA || isMobileWidth;
    };

    const mobileDetected = checkIsMobile();

    // Se for desktop grande, dispensa imediatamente sem bloquear a navegação
    if (!mobileDetected) {
      setMounted(false);
      return;
    }

    setIsMobile(true);

    // 2. Trava a rolagem enquanto a splash estiver visível para garantir estabilidade
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // 3. Monitora o carregamento completo do site
    let isDismissed = false;
    const dismissSplash = () => {
      if (isDismissed) return;
      isDismissed = true;

      // Inicia a transição de fade out suave
      setFade(true);

      // Desmonta do DOM após a conclusão da animação (liberando a GPU do mobile)
      setTimeout(() => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        setMounted(false);
      }, 700);
    };

    const handleComplete = () => {
      // Garante tempo mínimo de 1.1s para apreciação da marca e estabilização de fontes
      setTimeout(dismissSplash, 1100);
    };

    // Se o documento já carregou completamente
    if (document.readyState === "complete") {
      handleComplete();
    } else {
      window.addEventListener("load", handleComplete);
    }

    // Timeout de segurança máximo (3.2s) para nunca prender o usuário em 3G lento
    const safetyTimer = setTimeout(() => {
      dismissSplash();
    }, 3200);

    return () => {
      window.removeEventListener("load", handleComplete);
      clearTimeout(safetyTimer);
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);

  if (!mounted || !isMobile) return null;

  return (
    <div
      id="mobile-splash-screen"
      style={{
        colorScheme: "dark",
        forcedColorAdjust: "none",
        WebkitPrintColorAdjust: "exact",
      }}
      className={`fixed inset-0 z-[99999] bg-[#07090d] w-full min-h-[100dvh] h-[100dvh] flex flex-col justify-between items-center px-6 py-8 select-none overflow-hidden touch-none transition-all duration-700 ease-out ${
        fade ? "opacity-0 pointer-events-none scale-105" : "opacity-100 scale-100"
      }`}
    >
      {/* Halo de iluminação ambiente Dark & Gold */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#c9a227]/20 via-[#0b1930]/35 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#c9a227]/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />

      {/* ========================================================
          1. TOPO: LOGO DA SINTONIA
          ======================================================== */}
      <header className="w-full flex flex-col items-center pt-2 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="relative w-36 sm:w-44 h-12 flex items-center justify-center">
          <Image
            src="/assets/logos/logo-sintonia-360-escrita.svg"
            alt="Sintonia"
            width={160}
            height={50}
            className="object-contain max-h-12 w-auto brightness-110 drop-shadow-[0_2px_12px_rgba(201,162,39,0.3)]"
            priority
          />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="h-[1px] w-6 bg-gradient-to-r from-transparent to-[#c9a227]/60" />
          <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-[#c9a227] drop-shadow-[0_0_8px_rgba(201,162,39,0.4)]">
            Apresenta
          </span>
          <span className="h-[1px] w-6 bg-gradient-to-l from-transparent to-[#c9a227]/60" />
        </div>
      </header>

      {/* ========================================================
          2. MEIO: LOGO DO ESPECIAL 10 ANOS DJ LIPE (DESTAQUE MÁXIMO)
          ======================================================== */}
      <main className="flex-1 flex flex-col items-center justify-center my-auto w-full max-w-sm px-2 animate-in zoom-in-95 duration-700">
        {/* Logo Central com Respiração Suave */}
        <div className="relative w-64 sm:w-72 max-w-[85vw] h-48 sm:h-56 flex items-center justify-center">
          <Image
            src="/assets/logos/logo-especial-10-anos-lipe.svg"
            alt="Sintonia Edição Especial 10 Anos DJ Lipe"
            fill
            className="object-contain drop-shadow-[0_0_40px_rgba(201,162,39,0.45)] animate-pulse"
            style={{ animationDuration: "3s" }}
            priority
          />
        </div>

        {/* Barra de Progresso Dourada Luxuosa */}
        <div className="mt-6 w-44 sm:w-52 h-[3px] bg-white/10 rounded-full overflow-hidden relative shadow-[0_0_10px_rgba(201,162,39,0.2)]">
          <div
            className="h-full w-full bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] rounded-full animate-[shimmer_1.8s_infinite]"
            style={{
              backgroundSize: "200% 100%",
              animation: "splashShimmer 1.8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
        </div>

        {/* Micro-legenda de Status */}
        <p className="mt-3 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.28em] text-[#a8b2c3] text-center">
          Carregando Experiência...
        </p>
      </main>

      {/* ========================================================
          3. EMBAIXO DE TUDO: LOGOS DAS PRODUTORAS (GHVE & RL)
          ======================================================== */}
      <footer className="w-full flex flex-col items-center pb-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#a8b2c3]/60 mb-2.5">
          Realização & Produção
        </p>

        <div className="flex items-center justify-center gap-5 px-4 py-2 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
          {/* Produtora 1: GHVE Eventos */}
          <div className="relative h-7 sm:h-8 flex items-center justify-center">
            <Image
              src="/assets/logos/logo-ghve-branca.svg"
              alt="GHVE Eventos"
              width={100}
              height={32}
              className="object-contain max-h-7 sm:max-h-8 w-auto opacity-85 brightness-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]"
              unoptimized
            />
          </div>

          <span className="text-[#a8b2c3]/30 text-xs font-light select-none">|</span>

          {/* Produtora 2: RL Produções */}
          <div className="relative h-8 sm:h-9 flex items-center justify-center">
            <Image
              src="/assets/logos/logo-rl-producoes.svg"
              alt="RL Produções"
              width={48}
              height={36}
              className="object-contain max-h-8 sm:max-h-9 w-auto opacity-85 brightness-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]"
              unoptimized
            />
          </div>
        </div>
      </footer>

      {/* Estilos de keyframes para o shimmer metálico */}
      <style jsx global>{`
        @keyframes splashShimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
