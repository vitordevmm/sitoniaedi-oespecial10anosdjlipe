"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  User,
  LogOut,
  Ticket,
  QrCode,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Phone,
  ShieldCheck,
  UserCircle,
  Settings,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  onOpenAuth?: (tab: "login" | "register") => void;
}

export function Navbar({ onOpenAuth }: NavbarProps) {
  const { user, profile, loading, logout, hasTicket } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const firstName = profile?.nome
    ? profile.nome.split(" ")[0]
    : user?.email?.split("@")[0] || "Conta";

  const handleNavClick = (hash: string) => {
    setMobileMenuOpen(false);
    if (pathname !== "/") {
      window.location.href = `/${hash}`;
    }
  };

  return (
    <header className="w-full border-b border-[#0b1930]/80 bg-[#07090d]/85 backdrop-blur-xl sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Announcement: Sintonia 360 */}
        <Link
          href="/"
          onClick={() => {
            if (pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
          title="Voltar ao início da Sintonia"
        >
          {/* Sintonia 360 Symbol */}
          <div className="relative h-11 w-8 sm:h-14 sm:w-11 flex-shrink-0">
            <Image
              src="/assets/logos/logo-sintonia-360-simbolo.svg"
              alt="Símbolo Sintonia 360"
              fill
              className="object-contain group-hover:brightness-110 transition-all"
              priority
            />
          </div>
          {/* Apresenta Badge in Primary Gold */}
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase px-2 sm:px-2.5 py-0.5 rounded border border-[#c9a227]/40 bg-[#c9a227]/10 text-[#c9a227] shadow-[0_0_12px_rgba(201,162,39,0.15)] select-none group-hover:border-[#c9a227] group-hover:shadow-[0_0_16px_rgba(201,162,39,0.3)] transition-all">
            Apresenta
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#a8b2c3]">
          <Link
            href="/#evento"
            className="hover:text-[#f5e6b8] transition-colors"
          >
            O Evento
          </Link>
          <Link
            href="/#experiencia"
            className="hover:text-[#f5e6b8] transition-colors"
          >
            Experiência
          </Link>
          <Link
            href="/#ingressos"
            className="hover:text-[#f5e6b8] transition-colors"
          >
            Ingressos
          </Link>
          <Link
            href="/#faq"
            className="hover:text-[#f5e6b8] transition-colors"
          >
            Dúvidas
          </Link>
          <Link
            href="/termos"
            className={`transition-colors ${
              pathname === "/termos" ? "text-[#f5e6b8] font-bold" : "hover:text-[#f5e6b8]"
            }`}
          >
            Termos
          </Link>
        </nav>

        {/* Desktop Auth & Ticket Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-20 bg-[#101116] animate-pulse rounded-full border border-[#0b1930]" />
          ) : user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101116] border border-[#c9a227]/40 text-xs font-semibold text-[#f5e6b8] hover:border-[#c9a227] hover:shadow-[0_0_12px_rgba(201,162,39,0.2)] transition-all"
              >
                <User className="w-3.5 h-3.5 text-[#c9a227]" />
                <span className="max-w-[120px] truncate">{firstName}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#c9a227] transition-transform duration-200 ${
                    userDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 py-2 rounded-2xl bg-[#101116] border border-[#0b1930] shadow-[0_10px_35px_rgba(0,0,0,0.8)] z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-[#0b1930] text-xs">
                    <p className="font-bold text-[#f6f8fc] truncate">
                      {profile?.nome || "Membro da Sintonia"}
                    </p>
                    <p className="truncate text-[11px] text-[#a8b2c3]">{user.email}</p>
                  </div>

                  {/* MEU PERFIL */}
                  <Link
                    href="/perfil"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-[#f6f8fc] hover:bg-[#0b1930] hover:text-[#f5e6b8] flex items-center gap-2.5 transition-colors"
                  >
                    <UserCircle className="w-4 h-4 text-[#c9a227]" />
                    <span>Meu Perfil</span>
                  </Link>

                  {/* MEUS INGRESSOS */}
                  <Link
                    href="/perfil?tab=ingressos"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full px-4 py-2 text-left text-xs text-[#a8b2c3] hover:bg-[#0b1930] hover:text-[#f6f8fc] flex items-center gap-2.5 transition-colors"
                  >
                    <QrCode className="w-4 h-4 text-[#c9a227]" />
                    <span>Meus Ingressos</span>
                    {hasTicket && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    )}
                  </Link>

                  {/* CONFIGURAÇÕES */}
                  <Link
                    href="/perfil?tab=configuracoes"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full px-4 py-2 text-left text-xs text-[#a8b2c3] hover:bg-[#0b1930] hover:text-[#f6f8fc] flex items-center gap-2.5 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-[#a8b2c3]" />
                    <span>Configurações</span>
                  </Link>

                  <div className="my-1 border-t border-[#0b1930]" />

                  {/* SAIR DA CONTA */}
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    type="button"
                    className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-red-950/30 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair da Conta</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth?.("login")}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-[#f6f8fc] bg-[#101116] border border-[#0b1930] hover:border-[#c9a227]/50 hover:text-[#f5e6b8] transition-all"
            >
              <User className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>Entrar</span>
            </button>
          )}

          {/* Flexible Action Button (Garantir Ingresso OU Meu Ingresso) */}
          {hasTicket ? (
            <Link
              href="/perfil?tab=ingressos"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] hover:opacity-95 shadow-[0_0_22px_rgba(201,162,39,0.4)] transition-all hover:scale-105 active:scale-95 border border-[#f5e6b8]"
            >
              <QrCode className="w-4 h-4" />
              <span>Meu Ingresso</span>
            </Link>
          ) : (
            <Link
              href="/#ingressos"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] hover:opacity-95 shadow-[0_0_20px_rgba(201,162,39,0.35)] transition-all hover:scale-105 active:scale-95"
            >
              <Ticket className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Garantir Ingresso</span>
            </Link>
          )}
        </div>

        {/* Mobile Sandwich Button */}
        <div className="flex sm:hidden items-center gap-2">
          {/* Profile pill shortcut if logged in */}
          {user && (
            <Link
              href="/perfil"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101116] border border-[#c9a227]/40 text-xs font-semibold text-[#f5e6b8]"
            >
              <User className="w-3 h-3 text-[#c9a227]" />
              <span className="max-w-[80px] truncate">{firstName}</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Abrir menu"
            className="p-2.5 rounded-xl bg-[#101116] border border-[#0b1930] text-[#f6f8fc] hover:border-[#c9a227]/50 active:scale-95 transition-all"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#f5e6b8]" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER / GAVETA (Foco Absoluto em Conversão Mobile) */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-[#0b1930] bg-[#07090d]/98 backdrop-blur-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="px-5 pt-4 pb-6 space-y-4">
            {/* User Account Section */}
            {user ? (
              <div className="p-4 rounded-2xl bg-[#101116] border border-[#0b1930] shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a227] to-[#f5e6b8] flex items-center justify-center text-[#07090d] font-bold text-sm shadow-[0_0_12px_rgba(201,162,39,0.3)]">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#f6f8fc] truncate">
                      {profile?.nome || "Membro Oficial"}
                    </p>
                    <p className="text-xs text-[#a8b2c3] truncate">{user.email}</p>
                  </div>
                </div>

                {/* 2 Main Action Buttons for Logged In User */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#0b1930]">
                  <Link
                    href="/perfil"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0b1930] border border-[#c9a227]/40 text-xs font-bold text-[#f5e6b8] hover:border-[#c9a227] active:scale-95 transition-all"
                  >
                    <UserCircle className="w-4 h-4 text-[#c9a227]" />
                    <span>Meu Perfil</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#101116] border border-red-900/30 text-xs font-semibold text-red-400 hover:bg-red-950/30 active:scale-95 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth?.("login");
                  }}
                  className="py-3 px-4 rounded-xl text-center text-xs font-bold text-[#f6f8fc] bg-[#101116] border border-[#0b1930] hover:border-[#c9a227]/40 active:scale-95 transition-all"
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth?.("register");
                  }}
                  className="py-3 px-4 rounded-xl text-center text-xs font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] active:scale-95 transition-all"
                >
                  Criar Conta
                </button>
              </div>
            )}

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col space-y-1 pt-2">
              <Link
                href="/#evento"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl text-sm font-medium text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-[#101116] transition-colors"
              >
                O Evento
              </Link>
              <Link
                href="/#experiencia"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl text-sm font-medium text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-[#101116] transition-colors"
              >
                Experiência
              </Link>
              <Link
                href="/#ingressos"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl text-sm font-medium text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-[#101116] transition-colors"
              >
                Ingressos & Setores
              </Link>
              <Link
                href="/#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl text-sm font-medium text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-[#101116] transition-colors"
              >
                Dúvidas Frequentes
              </Link>
              <Link
                href="/termos"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-xl text-sm font-medium text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-[#101116] transition-colors"
              >
                Termos & Regulamento
              </Link>
            </nav>

            {/* High Conversion Mobile CTA Bar */}
            <div className="pt-2">
              {hasTicket ? (
                <Link
                  href="/perfil?tab=ingressos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] shadow-[0_0_24px_rgba(201,162,39,0.4)] active:scale-95 transition-all border border-[#f5e6b8]"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Acessar Meu Ingresso (QR Code)</span>
                </Link>
              ) : (
                <Link
                  href="/#ingressos"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] shadow-[0_0_20px_rgba(201,162,39,0.35)] active:scale-95 transition-all"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Garantir Ingresso • 1º Lote R$ 60</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
