"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check,
} from "lucide-react";

interface DatePickerProps {
  value: string; // ISO format: YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  mode?: "birthdate" | "future" | "any";
  className?: string;
  id?: string;
}

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const MONTH_SHORT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = "DD/MM/AAAA",
  required = false,
  minDate,
  maxDate,
  mode = "birthdate",
  className = "",
  id,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial view date safely without timezone offset issues
  const parseIso = (isoStr: string) => {
    if (!isoStr || !/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) return null;
    const [y, m, d] = isoStr.split("-").map(Number);
    return { year: y, month: m - 1, day: d };
  };

  const parsedValue = parseIso(value);

  // Default displayed month/year in calendar view
  const today = new Date();
  const defaultYear =
    parsedValue?.year || (mode === "birthdate" ? today.getFullYear() - 22 : today.getFullYear());
  const defaultMonth = parsedValue?.month !== undefined ? parsedValue.month : (mode === "birthdate" ? 0 : today.getMonth());

  const [currentYear, setCurrentYear] = useState(defaultYear);
  const [currentMonth, setCurrentMonth] = useState(defaultMonth);

  // Formatted display in input: DD/MM/AAAA
  const formatDisplay = (isoStr: string) => {
    const p = parseIso(isoStr);
    if (!p) return "";
    const dd = String(p.day).padStart(2, "0");
    const mm = String(p.month + 1).padStart(2, "0");
    return `${dd}/${mm}/${p.year}`;
  };

  const [inputText, setInputText] = useState(formatDisplay(value));

  // Sync internal state when external value changes
  useEffect(() => {
    setInputText(formatDisplay(value));
    if (value) {
      const p = parseIso(value);
      if (p) {
        setCurrentYear(p.year);
        setCurrentMonth(p.month);
      }
    }
  }, [value]);

  const [dropUp, setDropUp] = useState(false);

  // Detect available viewport space to open up or down intelligently
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 340 && spaceAbove > 320) {
        setDropUp(true);
      } else {
        setDropUp(false);
      }
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setViewMode("days");
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle direct text typing with automatic mask (DD/MM/AAAA)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 8);
    let formatted = "";

    if (raw.length > 4) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
    } else if (raw.length > 2) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    } else {
      formatted = raw;
    }

    setInputText(formatted);

    // If complete date (8 digits), check validity and trigger onChange
    if (raw.length === 8) {
      const d = parseInt(raw.slice(0, 2), 10);
      const m = parseInt(raw.slice(2, 4), 10);
      const y = parseInt(raw.slice(4, 8), 10);

      // Validate range
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1920 && y <= today.getFullYear() + 10) {
        // Validate days in month
        const daysInM = new Date(y, m, 0).getDate();
        if (d <= daysInM) {
          const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          onChange(iso);
          setCurrentYear(y);
          setCurrentMonth(m - 1);
        }
      }
    } else if (raw.length === 0) {
      onChange("");
    }
  };

  // Day navigation
  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Generate days for grid
  const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const handleSelectDay = (day: number) => {
    const iso = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(iso);
    setIsOpen(false);
    setViewMode("days");
  };

  // Year Range (e.g., 1930 to current year + 2 for birthdate)
  const maxYear = mode === "birthdate" ? today.getFullYear() : today.getFullYear() + 10;
  const minYear = 1930;
  const yearsList = [];
  for (let y = maxYear; y >= minYear; y--) {
    yearsList.push(y);
  }

  // Clear value
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setInputText("");
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-[11px] uppercase tracking-wider text-[#a8b2c3] font-semibold mb-1.5"
        >
          {label} {required && <span className="text-[#c9a227]">*</span>}
        </label>
      )}

      {/* Input Trigger Box */}
      <div
        className={`relative flex items-center w-full rounded-xl bg-[#07090d] border transition-all ${
          isOpen
            ? "border-[#c9a227] shadow-[0_0_15px_rgba(201,162,39,0.2)] ring-1 ring-[#c9a227]"
            : "border-[#0b1930] hover:border-[#c9a227]/40"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="pl-3.5 pr-2 py-2.5 text-[#c9a227] hover:text-[#f5e6b8] transition-colors focus:outline-none"
          title="Abrir calendário"
        >
          <CalendarIcon className="w-4 h-4" />
        </button>

        <input
          id={id}
          type="text"
          value={inputText}
          onChange={handleInputChange}
          onClick={() => {
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={placeholder}
          required={required}
          className="w-full py-3 pr-14 bg-transparent text-base sm:text-sm font-mono text-[#f6f8fc] placeholder-[#a8b2c3]/40 focus:outline-none font-medium tracking-wider"
        />

        {/* Clear & Dropdown Icon Controls */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-[#0b1930] transition-colors"
              title="Limpar data"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1 rounded text-[#a8b2c3] hover:text-[#f5e6b8] transition-colors"
            title="Expandir calendário"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-[#c9a227]" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* CUSTOM CALENDAR POPUP */}
      {isOpen && (
        <div
          className={`absolute z-50 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-0 ${
            dropUp ? "bottom-full mb-2" : "top-full mt-2"
          } w-[calc(100vw-48px)] max-w-[325px] sm:w-[325px] rounded-2xl bg-[#101116] border border-[#0b1930] p-3.5 sm:p-4 shadow-[0_15px_50px_rgba(0,0,0,0.95)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 select-none`}
        >
          {/* Subtle Golden Glow Line */}
          <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-[#c9a227]/40 to-transparent" />

          {/* VIEW: DAYS (DEFAULT) */}
          {viewMode === "days" && (
            <>
              {/* Header: Month & Year Title + Navigation */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("months")}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#f6f8fc] hover:text-[#f5e6b8] hover:bg-[#0b1930] transition-colors flex items-center gap-1"
                  >
                    <span>{MONTH_NAMES[currentMonth]}</span>
                    <ChevronDown className="w-3 h-3 text-[#a8b2c3]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("years")}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#f5e6b8] hover:bg-[#0b1930] transition-colors flex items-center gap-1"
                  >
                    <span>{currentYear}</span>
                    <ChevronDown className="w-3 h-3 text-[#a8b2c3]" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-1.5 rounded-lg text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-[#0b1930] transition-colors"
                    title="Mês anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-1.5 rounded-lg text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-[#0b1930] transition-colors"
                    title="Próximo mês"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Weekdays Row */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1.5 text-[11px] font-semibold text-[#a8b2c3]/70">
                {WEEKDAYS.map((w, idx) => (
                  <div key={idx} className="py-1">
                    {w}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Previous month fill days */}
                {Array.from({ length: firstDayIndex }).map((_, idx) => {
                  const dayNum = daysInPrevMonth - firstDayIndex + idx + 1;
                  return (
                    <div
                      key={`prev-${idx}`}
                      className="h-8 flex items-center justify-center text-xs text-[#a8b2c3]/20 select-none cursor-default"
                    >
                      {dayNum}
                    </div>
                  );
                })}

                {/* Current month days */}
                {Array.from({ length: daysInCurrentMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const isSelected =
                    parsedValue &&
                    parsedValue.year === currentYear &&
                    parsedValue.month === currentMonth &&
                    parsedValue.day === dayNum;

                  const isToday =
                    today.getFullYear() === currentYear &&
                    today.getMonth() === currentMonth &&
                    today.getDate() === dayNum;

                  return (
                    <button
                      key={`day-${dayNum}`}
                      type="button"
                      onClick={() => handleSelectDay(dayNum)}
                      className={`h-8 w-full rounded-xl text-xs font-semibold transition-all flex items-center justify-center ${
                        isSelected
                          ? "bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] font-extrabold shadow-[0_0_12px_rgba(201,162,39,0.4)] scale-105 z-10"
                          : isToday
                          ? "border border-[#c9a227]/40 text-[#f5e6b8] hover:bg-[#0b1930]"
                          : "text-[#f6f8fc] hover:bg-[#0b1930] hover:text-[#f5e6b8]"
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>

              {/* Quick Action Footer */}
              <div className="mt-3 pt-2.5 border-t border-[#0b1930] flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                    onChange(iso);
                    setIsOpen(false);
                  }}
                  className="text-[#a8b2c3] hover:text-[#f5e6b8] transition-colors font-medium px-2 py-1 rounded"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-[#c9a227] hover:text-[#f5e6b8] transition-colors font-bold px-2 py-1 rounded"
                >
                  Confirmar
                </button>
              </div>
            </>
          )}

          {/* VIEW: MONTHS SELECTOR */}
          {viewMode === "months" && (
            <div className="py-1">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-[#f6f8fc]">Selecione o Mês</span>
                <span className="text-xs font-semibold text-[#c9a227]">{currentYear}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {MONTH_SHORT.map((mShort, idx) => {
                  const isCurrent = currentMonth === idx;
                  return (
                    <button
                      key={mShort}
                      type="button"
                      onClick={() => {
                        setCurrentMonth(idx);
                        setViewMode("days");
                      }}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] shadow-[0_0_10px_rgba(201,162,39,0.3)]"
                          : "text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-[#0b1930]"
                      }`}
                    >
                      {mShort}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: YEARS SELECTOR (Instant 1-Click Jump) */}
          {viewMode === "years" && (
            <div className="py-1">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-bold text-[#f6f8fc]">Selecione o Ano</span>
                <button
                  type="button"
                  onClick={() => setViewMode("days")}
                  className="text-[11px] text-[#c9a227] hover:underline"
                >
                  Voltar aos dias
                </button>
              </div>
              <div className="grid grid-cols-4 gap-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#0b1930]">
                {yearsList.map((y) => {
                  const isSelected = currentYear === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setCurrentYear(y);
                        setViewMode("months");
                      }}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] shadow-sm"
                          : "text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-[#0b1930]"
                      }`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
