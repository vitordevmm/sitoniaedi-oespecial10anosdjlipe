"use client";

import React from "react";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "gold" | "glow" | "subtle";
  className?: string;
  hoverEffect?: boolean;
}

export function GlassCard({
  children,
  variant = "default",
  className = "",
  hoverEffect = true,
  ...props
}: GlassCardProps) {
  const variantStyles = {
    default:
      "bg-[#101116]/85 backdrop-blur-xl border border-[#0b1930] shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
    gold:
      "bg-gradient-to-br from-[#101116]/95 via-[#0b1930]/40 to-[#101116]/95 backdrop-blur-xl border border-[#c9a227]/40 shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_20px_rgba(201,162,39,0.12)]",
    glow:
      "bg-[#101116]/90 backdrop-blur-2xl border border-[#c9a227]/50 shadow-[0_0_30px_rgba(201,162,39,0.2),0_12px_40px_rgba(0,0,0,0.8)]",
    subtle:
      "bg-[#07090d]/80 backdrop-blur-md border border-[#0b1930]/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
  };

  const hoverClasses = hoverEffect
    ? "transition-all duration-300 hover:border-[#c9a227]/60 hover:shadow-[0_12px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(201,162,39,0.18)] hover:-translate-y-0.5"
    : "";

  return (
    <div
      className={`
        rounded-2xl relative overflow-hidden
        ${variantStyles[variant]}
        ${hoverClasses}
        ${className}
      `}
      style={{ forcedColorAdjust: "none" }}
      {...props}
    >
      {/* Subtle top rim light */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#f5e6b8]/20 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}
