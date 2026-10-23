"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, User, Mail, CreditCard, Phone, X, Shield, ShieldAlert, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AutocompleteUserItem } from "@/app/api/admin/users/search/route";

export interface UserSearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectUser: (user: AutocompleteUserItem) => void;
  onSubmitSearch?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  inputClassName?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  autoFocus?: boolean;
  showClearButton?: boolean;
}

export function UserSearchAutocomplete({
  value,
  onChange,
  onSelectUser,
  onSubmitSearch,
  onClear,
  placeholder = "Buscar por CPF, Nome, E-mail ou WhatsApp...",
  className = "",
  containerClassName = "",
  inputClassName = "",
  size = "md",
  disabled = false,
  autoFocus = false,
  showClearButton = true,
}: UserSearchAutocompleteProps) {
  const { user } = useAuth();
  const [results, setResults] = useState<AutocompleteUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Buscar sugestões na API
  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (!user) return;
      if (!query.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const token = await user.getIdToken();
        const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query.trim())}&limit=8`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.users)) {
          setResults(data.users);
          setIsOpen(data.users.length > 0);
          setSelectedIndex(-1);
        } else {
          setResults([]);
          setIsOpen(false);
        }
      } catch (err) {
        console.error("[Autocomplete Fetch Error]:", err);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Debounce na digitação
  useEffect(() => {
    if (!value || value.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchSuggestions(value);
    }, 180);

    return () => clearTimeout(timer);
  }, [value, fetchSuggestions]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Rolagem suave para manter o item selecionado pelo teclado visível
  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  const handleSelect = (selectedUser: AutocompleteUserItem) => {
    setIsOpen(false);
    setSelectedIndex(-1);
    onSelectUser(selectedUser);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen && results.length > 0) {
        setIsOpen(true);
        setSelectedIndex(0);
        return;
      }
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      }
    } else if (e.key === "Enter") {
      if (isOpen && selectedIndex >= 0 && results[selectedIndex]) {
        e.preventDefault();
        handleSelect(results[selectedIndex]);
      } else {
        // Se nenhum item estiver focado, submete a busca
        setIsOpen(false);
        if (onSubmitSearch) {
          e.preventDefault();
          onSubmitSearch(value);
        }
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleClear = () => {
    onChange("");
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    if (onClear) onClear();
    if (onSubmitSearch) onSubmitSearch("");
    inputRef.current?.focus();
  };

  // Helper para destacar os termos coincidentes
  const highlightMatch = (text: string, query: string) => {
    if (!text || !query) return text;
    const cleanQ = query.trim().replace(/\D/g, "") || query.trim();
    if (!cleanQ) return text;

    const idx = text.toLowerCase().indexOf(cleanQ.toLowerCase());
    if (idx === -1) return text;

    return (
      <>
        {text.slice(0, idx)}
        <span className="text-[#f5e6b8] font-black underline decoration-[#c9a227]/70 underline-offset-2">
          {text.slice(idx, idx + cleanQ.length)}
        </span>
        {text.slice(idx + cleanQ.length)}
      </>
    );
  };

  const sizeClasses = {
    sm: "py-2 text-xs",
    md: "py-2.5 text-xs",
    lg: "py-3 text-sm",
  };

  return (
    <div ref={containerRef} className={`relative flex-1 ${containerClassName}`}>
      {/* Campo de Input com Ícones */}
      <div className={`relative flex items-center ${className}`}>
        <Search className="w-4 h-4 text-[#a8b2c3] absolute left-3.5 pointer-events-none" />

        <input
          ref={inputRef}
          type="text"
          value={value}
          autoFocus={autoFocus}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-10 rounded-xl bg-[#07090d] border border-[#0b1930]
            focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]/40 focus:shadow-[0_0_15px_rgba(201,162,39,0.25)]
            text-[#f6f8fc] placeholder:text-[#a8b2c3]/50 focus:outline-none transition-all duration-200
            ${sizeClasses[size]}
            ${inputClassName}
          `}
        />

        {/* Indicador de carregamento ou botão limpar */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {loading && <Loader2 className="w-3.5 h-3.5 text-[#c9a227] animate-spin" />}
          {showClearButton && !loading && value && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Limpar busca"
              className="p-1 rounded-full text-[#a8b2c3] hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Popover / Dropdown de Autocomplete */}
      {isOpen && results.length > 0 && (
        <div
          className="
            absolute left-0 right-0 mt-2 z-50 rounded-2xl bg-[#0a0c12] border border-[#c9a227]/40
            shadow-[0_12px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl overflow-hidden
            animate-in fade-in zoom-in-95 duration-150
          "
        >
          {/* Header informativo do Autocomplete */}
          <div className="px-3 py-2 bg-[#101116] border-b border-[#0b1930] flex items-center justify-between text-[10px] text-[#a8b2c3]">
            <span className="font-semibold flex items-center gap-1">
              <User className="w-3 h-3 text-[#c9a227]" />
              Sugestões encontradas ({results.length})
            </span>
            <span className="hidden sm:inline-block text-[9px] text-[#a8b2c3]/60">
              Use as setas ↑ ↓ e Enter para selecionar
            </span>
          </div>

          {/* Lista de Resultados */}
          <ul ref={listRef} className="max-h-72 overflow-y-auto divide-y divide-[#0b1930]/60 custom-scrollbar">
            {results.map((u, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <li
                  key={u.id || u.uid || idx}
                  ref={(el) => {
                    itemRefs.current[idx] = el;
                  }}
                  onClick={() => handleSelect(u)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`
                    p-3 transition-colors cursor-pointer flex flex-col gap-1.5 select-none
                    ${
                      isSelected
                        ? "bg-gradient-to-r from-[#c9a227]/20 via-[#c9a227]/10 to-transparent border-l-4 border-l-[#c9a227]"
                        : "hover:bg-[#101116]"
                    }
                  `}
                >
                  {/* Linha Superior: Nome + Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-xs text-[#f6f8fc] truncate">
                        {highlightMatch(u.nome, value)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {u.role === "admin" && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#c9a227]/20 text-[#f5e6b8] border border-[#c9a227]/40">
                          <ShieldAlert className="w-2.5 h-2.5" />
                          Admin
                        </span>
                      )}
                      {u.role === "staff" && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          <Shield className="w-2.5 h-2.5" />
                          Staff
                        </span>
                      )}
                      {isSelected && (
                        <span className="text-[10px] text-[#c9a227] font-bold flex items-center gap-0.5 ml-1 animate-pulse">
                          <Check className="w-3 h-3" />
                          Enter
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Linha Inferior: CPF + E-mail + Telefone */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#a8b2c3]">
                    {/* CPF em Destaque */}
                    <div className="flex items-center gap-1 font-mono text-amber-300/90 font-semibold">
                      <CreditCard className="w-3 h-3 text-[#c9a227] flex-shrink-0" />
                      <span>{highlightMatch(u.cpfFormatted || u.cpf || "Sem CPF", value)}</span>
                    </div>

                    {/* E-mail */}
                    <div className="flex items-center gap-1 truncate max-w-[200px] sm:max-w-xs text-[#a8b2c3]">
                      <Mail className="w-3 h-3 text-sky-400 flex-shrink-0" />
                      <span className="truncate">{highlightMatch(u.email, value)}</span>
                    </div>

                    {/* WhatsApp */}
                    {u.telefone && (
                      <div className="flex items-center gap-1 font-mono text-[#a8b2c3]/80">
                        <Phone className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span>{highlightMatch(u.telefoneFormatted || u.telefone, value)}</span>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
