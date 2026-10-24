"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { AlertTriangle, XCircle, ShieldAlert, Sparkles, Info, X } from "lucide-react";

export type ConfirmVariant = "danger" | "warning" | "gold" | "info";

export interface AlertOptions {
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  variant?: ConfirmVariant;
  icon?: React.ReactNode;
}

export interface ConfirmOptions extends AlertOptions {
  cancelText?: string;
  hideCancel?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve?: (val: boolean) => void;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<ConfirmState>({
    isOpen: false,
    title: "",
    description: "",
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        ...options,
        confirmText: options.confirmText || "Confirmar",
        cancelText: options.cancelText || "Cancelar",
        hideCancel: options.hideCancel ?? false,
        variant: options.variant || "gold",
        resolve,
      });
    });
  }, []);

  const alert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        ...options,
        confirmText: options.confirmText || "Entendido",
        hideCancel: true,
        variant: options.variant || "gold",
        resolve: () => resolve(),
      });
    });
  }, []);

  const handleConfirm = () => {
    dialogState.resolve?.(true);
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    dialogState.resolve?.(false);
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  // Fecha no Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dialogState.isOpen) {
        handleCancel();
      }
    };
    if (dialogState.isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialogState.isOpen]);

  const renderIcon = () => {
    if (dialogState.icon) return dialogState.icon;

    switch (dialogState.variant) {
      case "danger":
        return <XCircle className="w-6 h-6 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-amber-400" />;
      case "info":
        return <Info className="w-6 h-6 text-sky-400" />;
      case "gold":
      default:
        return <Sparkles className="w-6 h-6 text-[#f5e6b8]" />;
    }
  };

  const getVariantStyles = () => {
    switch (dialogState.variant) {
      case "danger":
        return {
          iconBox: "bg-red-500/15 border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.25)]",
          topLine: "bg-gradient-to-r from-red-600 via-rose-500 to-red-600",
          confirmBtn:
            "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.35)]",
          border: "border-red-500/40",
        };
      case "warning":
        return {
          iconBox: "bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]",
          topLine: "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500",
          confirmBtn:
            "bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-[#07090d] font-bold shadow-[0_0_20px_rgba(245,158,11,0.35)]",
          border: "border-amber-500/40",
        };
      case "info":
        return {
          iconBox: "bg-sky-500/15 border-sky-500/30 text-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.25)]",
          topLine: "bg-gradient-to-r from-sky-500 via-sky-400 to-sky-500",
          confirmBtn:
            "bg-gradient-to-r from-sky-500 to-sky-400 hover:from-sky-400 hover:to-sky-300 text-[#07090d] font-bold shadow-[0_0_20px_rgba(14,165,233,0.35)]",
          border: "border-sky-500/40",
        };
      case "gold":
      default:
        return {
          iconBox: "bg-[#c9a227]/15 border-[#c9a227]/40 text-[#f5e6b8] shadow-[0_0_20px_rgba(201,162,39,0.25)]",
          topLine: "bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227]",
          confirmBtn:
            "bg-gradient-to-r from-[#c9a227] via-[#e2bd44] to-[#f5e6b8] hover:opacity-95 text-[#07090d] font-extrabold shadow-[0_0_20px_rgba(201,162,39,0.35)]",
          border: "border-[#c9a227]/40",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <ConfirmContext.Provider value={{ confirm, alert }}>
      {children}

      {/* MODAL GLOBAL DE CONFIRMAÇÃO */}
      {dialogState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Backdrop Escuro com Blur */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
            onClick={dialogState.hideCancel ? handleConfirm : handleCancel}
          />

          {/* Card do Modal */}
          <div
            role="dialog"
            aria-modal="true"
            className={`relative w-full max-w-md rounded-2xl sm:rounded-3xl bg-[#101116] border ${styles.border} shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden z-10 animate-in zoom-in-95 duration-200`}
          >
            {/* Linha de Destaque Superior */}
            <div className={`h-1.5 w-full ${styles.topLine}`} />

            {/* Botão de Fechar */}
            <button
              type="button"
              onClick={dialogState.hideCancel ? handleConfirm : handleCancel}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#a8b2c3]/60 hover:text-[#f6f8fc] hover:bg-white/5 transition-all"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-5 sm:p-7 space-y-5">
              {/* Ícone e Título */}
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 ${styles.iconBox}`}
                >
                  {renderIcon()}
                </div>

                <div className="space-y-1 pt-0.5 min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-[#f6f8fc] tracking-tight leading-snug">
                    {dialogState.title}
                  </h3>
                  <div className="text-xs sm:text-sm text-[#a8b2c3] leading-relaxed break-words">
                    {dialogState.description}
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 pt-2">
                {!dialogState.hideCancel && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#a8b2c3] hover:text-[#f6f8fc] bg-[#07090d] border border-[#0b1930] hover:bg-white/5 active:scale-95 transition-all"
                  >
                    {dialogState.cancelText}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleConfirm}
                  autoFocus
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold active:scale-95 transition-all ${styles.confirmBtn}`}
                >
                  {dialogState.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm deve ser utilizado dentro de um ConfirmProvider");
  }
  return context;
}
