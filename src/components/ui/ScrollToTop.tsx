"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Voltar ao topo da página"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 p-3 rounded-full bg-[#101116]/90 border border-[#c9a227]/40 text-[#f5e6b8] shadow-[0_8px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(201,162,39,0.3)] backdrop-blur-xl hover:bg-[#c9a227] hover:text-[#07090d] hover:border-[#f5e6b8] transition-all duration-300 active:scale-90 animate-in fade-in slide-in-from-bottom-4 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#c9a227]"
      style={{ forcedColorAdjust: "none" }}
    >
      <ArrowUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
    </button>
  );
}
