"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, LogOut, ExternalLink, RefreshCw } from "lucide-react";

interface AdminHeaderProps {
  adminEmail: string;
  adminName: string;
  onRefreshAll: () => void;
  onLogout: () => void;
  refreshing?: boolean;
}

export function AdminHeader({
  adminEmail,
  adminName,
  onRefreshAll,
  onLogout,
  refreshing,
}: AdminHeaderProps) {
  return (
    <header className="w-full bg-[#101116]/95 border-b border-[#c9a227]/30 backdrop-blur-xl sticky top-0 z-40 px-3.5 sm:px-6 lg:px-8 py-3 shadow-[0_4px_25px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Title */}
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <div className="relative w-24 sm:w-36 h-8 sm:h-9 flex items-center flex-shrink-0">
            <Image
              src="/assets/logos/logo-especial-10-anos-lipe.svg"
              alt="Especial 10 Anos DJ Lipe"
              width={140}
              height={40}
              className="object-contain max-h-8 sm:max-h-9 w-auto drop-shadow-[0_0_15px_rgba(201,162,39,0.35)]"
              priority
            />
          </div>

          <div className="h-6 w-[1px] bg-[#0b1930] hidden sm:block" />

          <div className="flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#c9a227]/10 border border-[#c9a227]/40 shadow-[0_0_12px_rgba(201,162,39,0.2)] flex-shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-[#c9a227]" />
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#f5e6b8]">
              Admin
            </span>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Atualizar Dados */}
          <button
            type="button"
            onClick={onRefreshAll}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#a8b2c3] hover:text-[#f5e6b8] bg-[#0b1930]/60 hover:bg-[#0b1930] border border-[#c9a227]/20 transition-all active:scale-95 disabled:opacity-50"
            title="Recarregar dados do painel"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#c9a227] ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>

          {/* Link para o Site Normal */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#a8b2c3] hover:text-[#f6f8fc] bg-[#101116] hover:bg-white/5 border border-white/10 transition-all"
            title="Abrir o site oficial em nova aba"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver Site</span>
          </Link>

          {/* Admin Tag */}
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-[#f6f8fc] leading-tight truncate max-w-[180px]">
              {adminName}
            </p>
            <p className="text-[10px] text-[#c9a227] font-medium truncate max-w-[180px]">
              {adminEmail}
            </p>
          </div>

          {/* Sair */}
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all active:scale-95"
            title="Sair do painel"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
