"use client";

import React from "react";

export type GlowBadgeVariant =
  | "gold"
  | "emerald"
  | "blue"
  | "red"
  | "purple"
  | "amber"
  | "neutral";

export type GlowBadgeSize = "xs" | "sm" | "md";

export interface GlowBadgeProps {
  children: React.ReactNode;
  variant?: GlowBadgeVariant;
  size?: GlowBadgeSize;
  pulse?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const variantStyles: Record<
  GlowBadgeVariant,
  {
    badge: string;
    dot: string;
    glow: string;
  }
> = {
  gold: {
    badge:
      "bg-gradient-to-r from-[#c9a227]/20 via-[#f5e6b8]/15 to-[#c9a227]/20 text-[#f5e6b8] border-[#c9a227]/40 shadow-[0_0_12px_rgba(201,162,39,0.2)]",
    dot: "bg-[#c9a227] shadow-[0_0_8px_#c9a227]",
    glow: "bg-[#c9a227]",
  },
  emerald: {
    badge:
      "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
    dot: "bg-emerald-400 shadow-[0_0_8px_#34d399]",
    glow: "bg-emerald-400",
  },
  blue: {
    badge:
      "bg-sky-500/15 text-sky-300 border-sky-500/40 shadow-[0_0_12px_rgba(14,165,233,0.2)]",
    dot: "bg-sky-400 shadow-[0_0_8px_#38bdf8]",
    glow: "bg-sky-400",
  },
  red: {
    badge:
      "bg-red-500/15 text-red-300 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)]",
    dot: "bg-red-400 shadow-[0_0_8px_#f87171]",
    glow: "bg-red-400",
  },
  purple: {
    badge:
      "bg-purple-500/15 text-purple-300 border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]",
    dot: "bg-purple-400 shadow-[0_0_8px_#c084fc]",
    glow: "bg-purple-400",
  },
  amber: {
    badge:
      "bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]",
    dot: "bg-amber-400 shadow-[0_0_8px_#fbbf24]",
    glow: "bg-amber-400",
  },
  neutral: {
    badge:
      "bg-[#101116] text-[#a8b2c3] border-[#0b1930] shadow-[0_0_8px_rgba(0,0,0,0.5)]",
    dot: "bg-[#a8b2c3]",
    glow: "bg-[#a8b2c3]",
  },
};

const sizeStyles: Record<GlowBadgeSize, string> = {
  xs: "px-2 py-0.5 text-[9px] gap-1",
  sm: "px-2.5 py-1 text-[10px] gap-1.5",
  md: "px-3 py-1.5 text-xs gap-2",
};

export function GlowBadge({
  children,
  variant = "gold",
  size = "sm",
  pulse = false,
  icon,
  className = "",
}: GlowBadgeProps) {
  const currentVariant = variantStyles[variant] || variantStyles.gold;
  const currentSize = sizeStyles[size] || sizeStyles.sm;

  return (
    <span
      className={`
        inline-flex items-center font-bold uppercase tracking-wider rounded-full border
        transition-all duration-200 select-none backdrop-blur-sm
        ${currentVariant.badge}
        ${currentSize}
        ${className}
      `}
      style={{ forcedColorAdjust: "none" }}
    >
      {pulse ? (
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentVariant.glow}`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${currentVariant.dot}`}
          />
        </span>
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      <span className="truncate">{children}</span>
    </span>
  );
}
