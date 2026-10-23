"use client";

import React, { useState, useEffect, useRef, useId } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  disabled?: boolean;
}

export interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  id?: string;
  ariaLabel?: string;
}

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = "Selecione uma opção...",
  label,
  disabled = false,
  size = "md",
  className = "",
  buttonClassName = "",
  menuClassName = "",
  id,
  ariaLabel,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const dropdownId = id || generatedId;

  const selectedOption = options.find((opt) => opt.value === value);

  // Fecha ao clicar ou tocar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside, { passive: true });
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Teclado para acessibilidade (Esc para fechar, setas para navegar)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const currentIndex = options.findIndex((opt) => opt.value === value);
      const nextIndex =
        currentIndex < options.length - 1 ? currentIndex + 1 : 0;
      const nextOpt = options[nextIndex];
      if (nextOpt && !nextOpt.disabled) {
        onChange(nextOpt.value);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const currentIndex = options.findIndex((opt) => opt.value === value);
      const prevIndex =
        currentIndex > 0 ? currentIndex - 1 : options.length - 1;
      const prevOpt = options[prevIndex];
      if (prevOpt && !prevOpt.disabled) {
        onChange(prevOpt.value);
      }
    }
  };

  // Configurações de tamanho responsivas
  const sizeStyles = {
    sm: {
      button: "px-2.5 py-1.5 text-[11px] rounded-lg min-h-[32px]",
      menuItem: "px-2.5 py-1.5 text-[11px]",
      icon: "w-3 h-3",
      chevron: "w-3 h-3",
    },
    md: {
      button: "px-3.5 py-2.5 text-xs rounded-xl min-h-[42px]",
      menuItem: "px-3 py-2.5 text-xs",
      icon: "w-3.5 h-3.5",
      chevron: "w-3.5 h-3.5",
    },
    lg: {
      button: "px-4 py-3 text-sm rounded-xl min-h-[48px]",
      menuItem: "px-3.5 py-3 text-sm",
      icon: "w-4 h-4",
      chevron: "w-4 h-4",
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left select-none ${className}`}
      style={{ colorScheme: "dark", forcedColorAdjust: "none" }}
    >
      {label && (
        <label
          htmlFor={dropdownId}
          className="block text-[10px] font-bold uppercase tracking-wider text-[#a8b2c3] mb-1.5"
        >
          {label}
        </label>
      )}

      {/* Disparador Principal (Botão) */}
      <button
        id={dropdownId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || label || placeholder}
        className={`
          w-full flex items-center justify-between gap-2.5
          bg-[#07090d] text-[#f6f8fc] border transition-all duration-200
          focus:outline-none cursor-pointer
          ${currentSize.button}
          ${
            isOpen
              ? "border-[#c9a227] shadow-[0_0_15px_rgba(201,162,39,0.25)] ring-1 ring-[#c9a227]/40"
              : "border-[#0b1930] hover:border-[#c9a227]/60 hover:bg-[#101116]"
          }
          ${
            disabled
              ? "opacity-50 cursor-not-allowed border-[#0b1930] hover:border-[#0b1930]"
              : "active:scale-[0.99]"
          }
          ${buttonClassName}
        `}
      >
        <div className="flex items-center gap-2 truncate text-left">
          {selectedOption?.icon && (
            <span className="flex-shrink-0 text-[#c9a227]">
              {selectedOption.icon}
            </span>
          )}
          <span
            className={`truncate font-medium ${
              selectedOption ? "text-[#f6f8fc]" : "text-[#a8b2c3]/60"
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span
              className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                selectedOption.badgeColor ||
                "bg-[#c9a227]/20 text-[#f5e6b8] border border-[#c9a227]/40"
              }`}
            >
              {selectedOption.badge}
            </span>
          )}
        </div>

        {/* Chevron Animado */}
        <ChevronDown
          className={`
            ${currentSize.chevron} flex-shrink-0 transition-transform duration-200 ease-out
            ${isOpen ? "rotate-180 text-[#c9a227]" : "text-[#a8b2c3] group-hover:text-[#f6f8fc]"}
          `}
        />
      </button>

      {/* Menu Suspenso (Dropdown Popover) */}
      {isOpen && (
        <div
          ref={menuRef}
          role="listbox"
          tabIndex={-1}
          className={`
            absolute left-0 z-50 mt-1.5 w-full min-w-[200px] max-w-[calc(100vw-2rem)]
            rounded-xl bg-[#101116]/98 backdrop-blur-xl border border-[#c9a227]/40
            shadow-[0_12px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(201,162,39,0.15)]
            overflow-hidden py-1 max-h-64 overflow-y-auto
            animate-in fade-in-0 zoom-in-95 duration-150
            scrollbar-thin scrollbar-thumb-[#c9a227]/30 scrollbar-track-transparent
            ${menuClassName}
          `}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                onClick={() => {
                  if (option.disabled) return;
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between gap-2.5 text-left
                  transition-all duration-150 cursor-pointer
                  ${currentSize.menuItem}
                  ${
                    option.disabled
                      ? "opacity-40 cursor-not-allowed text-[#a8b2c3]/40"
                      : isSelected
                      ? "bg-gradient-to-r from-[#c9a227]/25 via-[#c9a227]/15 to-transparent text-[#f5e6b8] font-bold"
                      : "text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-[#c9a227]/10"
                  }
                `}
              >
                <div className="flex items-center gap-2 truncate">
                  {option.icon && (
                    <span
                      className={`flex-shrink-0 ${
                        isSelected ? "text-[#c9a227]" : "text-[#a8b2c3]"
                      }`}
                    >
                      {option.icon}
                    </span>
                  )}
                  <span className="truncate">{option.label}</span>
                  {option.badge && (
                    <span
                      className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        option.badgeColor ||
                        "bg-[#c9a227]/20 text-[#f5e6b8] border border-[#c9a227]/40"
                      }`}
                    >
                      {option.badge}
                    </span>
                  )}
                </div>

                {/* Ícone Check dourado para item ativo */}
                {isSelected && (
                  <Check
                    className={`${currentSize.icon} text-[#c9a227] flex-shrink-0 animate-in zoom-in-50 duration-150`}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
