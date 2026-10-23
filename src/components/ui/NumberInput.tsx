"use client";

import React, { useRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "onChange"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefixText?: string;
  suffixText?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  containerClassName?: string;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  prefixText,
  suffixText,
  size = "md",
  className = "",
  containerClassName = "",
  disabled = false,
  ...props
}: NumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleIncrement = () => {
    if (disabled) return;
    const current = typeof value === "number" && !isNaN(value) ? value : 0;
    const next = current + step;
    if (max !== undefined && next > max) return;
    onChange(next);
  };

  const handleDecrement = () => {
    if (disabled) return;
    const current = typeof value === "number" && !isNaN(value) ? value : 0;
    const next = current - step;
    if (min !== undefined && next < min) return;
    onChange(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      onChange(0);
      return;
    }
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) {
      if (min !== undefined && parsed < min) {
        onChange(min);
      } else if (max !== undefined && parsed > max) {
        onChange(max);
      } else {
        onChange(parsed);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      handleDecrement();
    }
  };

  const sizeStyles = {
    sm: {
      container: "min-h-[32px] text-xs",
      input: "py-1 text-xs",
      chevron: "w-3 h-3",
      stepperBtn: "h-[15px] px-1.5",
    },
    md: {
      container: "min-h-[42px] text-xs",
      input: "py-2 text-xs",
      chevron: "w-3.5 h-3.5",
      stepperBtn: "h-[20px] px-2",
    },
    lg: {
      container: "min-h-[48px] text-sm",
      input: "py-2.5 text-sm",
      chevron: "w-4 h-4",
      stepperBtn: "h-[23px] px-2.5",
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      className={`
        relative inline-flex items-center w-full rounded-xl bg-[#07090d] border border-[#0b1930]
        focus-within:border-[#c9a227] focus-within:shadow-[0_0_15px_rgba(201,162,39,0.25)] focus-within:ring-1 focus-within:ring-[#c9a227]/40
        hover:border-[#c9a227]/50 transition-all duration-200 overflow-hidden
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${currentSize.container}
        ${containerClassName}
      `}
      style={{ forcedColorAdjust: "none" }}
    >
      {/* Prefixo opcional (ex: R$) */}
      {prefixText && (
        <span className="pl-3 pr-1 text-xs font-bold text-[#c9a227] select-none flex-shrink-0">
          {prefixText}
        </span>
      )}

      {/* Input de número real */}
      <input
        ref={inputRef}
        type="number"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className={`
          w-full bg-transparent text-[#f6f8fc] font-bold focus:outline-none px-2.5
          appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none
          ${currentSize.input}
          ${className}
        `}
        {...props}
      />

      {/* Sufixo opcional (ex: anos, un) */}
      {suffixText && (
        <span className="pr-2 text-[11px] font-semibold text-[#a8b2c3] select-none flex-shrink-0">
          {suffixText}
        </span>
      )}

      {/* Setinhas Customizadas Dark & Gold (Estilo Dropdown) */}
      <div className="flex flex-col border-l border-[#0b1930] bg-[#101116] flex-shrink-0 select-none divide-y divide-[#0b1930]">
        {/* Setinha Para Cima (Incremento) */}
        <button
          type="button"
          tabIndex={-1}
          aria-label="Aumentar valor"
          disabled={disabled || (max !== undefined && value >= max)}
          onClick={handleIncrement}
          className={`
            ${currentSize.stepperBtn}
            flex items-center justify-center text-[#a8b2c3]
            hover:text-[#f5e6b8] hover:bg-[#c9a227]/20 active:bg-[#c9a227]/30
            disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#a8b2c3]
            transition-colors duration-150 cursor-pointer
          `}
        >
          <ChevronUp className={`${currentSize.chevron} transition-transform active:scale-75`} />
        </button>

        {/* Setinha Para Baixo (Decremento) */}
        <button
          type="button"
          tabIndex={-1}
          aria-label="Diminuir valor"
          disabled={disabled || (min !== undefined && value <= min)}
          onClick={handleDecrement}
          className={`
            ${currentSize.stepperBtn}
            flex items-center justify-center text-[#a8b2c3]
            hover:text-[#f5e6b8] hover:bg-[#c9a227]/20 active:bg-[#c9a227]/30
            disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#a8b2c3]
            transition-colors duration-150 cursor-pointer
          `}
        >
          <ChevronDown className={`${currentSize.chevron} transition-transform active:scale-75`} />
        </button>
      </div>
    </div>
  );
}
