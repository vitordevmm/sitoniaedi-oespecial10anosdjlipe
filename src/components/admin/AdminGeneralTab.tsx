"use client";

import React, { useState } from "react";
import {
  DollarSign,
  Ticket,
  Users,
  Gift,
  TrendingUp,
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowBadge } from "@/components/ui/GlowBadge";

interface AdminMetrics {
  totalSoldTickets: number;
  totalRevenue: number;
  totalCourtesies: number;
  totalCancelled: number;
  totalUsed: number;
  totalUsers: number;
  sectorBreakdown: Record<string, { count: number; revenue: number; name: string }>;
  dailySales: Array<{ date: string; count: number; revenue: number }>;
}

interface AdminGeneralTabProps {
  metrics: AdminMetrics | null;
  loading: boolean;
}

export function AdminGeneralTab({ metrics, loading }: AdminGeneralTabProps) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number; revenue: number } | null>(null);
  const [chartMode, setChartMode] = useState<"bars" | "list">("bars");

  // Define o dia inicial em foco (o mais recente) para exibir dados de imediato no mobile
  React.useEffect(() => {
    if (metrics?.dailySales && metrics.dailySales.length > 0 && !hoveredDay) {
      setHoveredDay(metrics.dailySales[metrics.dailySales.length - 1]);
    }
  }, [metrics, hoveredDay]);

  if (loading || !metrics) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-[#a8b2c3]">Carregando métricas do festival...</p>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  const formatDateLabel = (isoDate: string) => {
    try {
      const [year, month, day] = isoDate.split("-");
      return `${day}/${month}`;
    } catch {
      return isoDate;
    }
  };

  // Cálculo para escala do gráfico de vendas diárias
  const maxDayCount = Math.max(...metrics.dailySales.map((d) => d.count), 1);
  const maxDayRevenue = Math.max(...metrics.dailySales.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* 4 CARDS PRINCIPAIS DE KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Valor Arrecadado */}
        <GlassCard variant="gold" className="p-4 sm:p-5 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#c9a227]/10 rounded-full blur-2xl -z-10 group-hover:bg-[#c9a227]/20 transition-all" />
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#a8b2c3]">
              Arrecadação Total
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#c9a227]/15 border border-[#c9a227]/40 flex items-center justify-center text-[#f5e6b8]">
              <DollarSign className="w-4 h-4 text-[#c9a227]" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] tracking-tight">
            {formatCurrency(metrics.totalRevenue)}
          </p>
          <div className="mt-2.5">
            <GlowBadge variant="emerald" size="xs" pulse icon={<TrendingUp className="w-3 h-3 text-emerald-400" />}>
              {metrics.totalSoldTickets} ingressos pagos
            </GlowBadge>
          </div>
        </GlassCard>

        {/* Card 2: Ingressos Vendidos */}
        <GlassCard variant="default" className="p-4 sm:p-5 group">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#a8b2c3]">
              Ingressos Vendidos
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#f6f8fc] tracking-tight">
            {metrics.totalSoldTickets}
          </p>
          <div className="mt-2.5">
            <GlowBadge variant="blue" size="xs" icon={<CheckCircle2 className="w-3 h-3 text-sky-400" />}>
              {metrics.totalUsed} validados na catraca
            </GlowBadge>
          </div>
        </GlassCard>

        {/* Card 3: Base de Usuários */}
        <GlassCard variant="default" className="p-4 sm:p-5 group">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#a8b2c3]">
              Base de Usuários
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#f6f8fc] tracking-tight">
            {metrics.totalUsers}
          </p>
          <div className="mt-2.5">
            <GlowBadge variant="purple" size="xs">
              Cadastros Oficiais
            </GlowBadge>
          </div>
        </GlassCard>

        {/* Card 4: Cortesias */}
        <GlassCard variant="default" className="p-4 sm:p-5 group">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#a8b2c3]">
              Cortesias VIPs
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#f5e6b8] tracking-tight">
            {metrics.totalCourtesies}
          </p>
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            <GlowBadge variant="amber" size="xs">
              VIP Oficial
            </GlowBadge>
            {metrics.totalCancelled > 0 && (
              <GlowBadge variant="red" size="xs" icon={<AlertTriangle className="w-3 h-3 text-red-400" />}>
                {metrics.totalCancelled} cancelados
              </GlowBadge>
            )}
          </div>
        </GlassCard>
      </div>

      {/* GRÁFICO DE VENDAS DIÁRIAS COMPLETO */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#101116] border border-[#c9a227]/30 shadow-[0_4px_25px_rgba(0,0,0,0.7)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#c9a227]" />
              <h2 className="text-base sm:text-lg font-bold text-[#f6f8fc]">
                Gráfico de Vendas Diárias
              </h2>
            </div>
            <p className="text-xs text-[#a8b2c3] mt-0.5">
              Histórico diário de quantidade de ingressos emitidos e valor arrecadado
            </p>
          </div>

          {/* Seletor de Modo no Mobile / Desktop: Barras vs Lista Diária */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#07090d] border border-[#0b1930]">
            <button
              type="button"
              onClick={() => setChartMode("bars")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                chartMode === "bars"
                  ? "bg-[#c9a227] text-[#07090d]"
                  : "text-[#a8b2c3] hover:text-[#f6f8fc]"
              }`}
            >
              Gráfico
            </button>
            <button
              type="button"
              onClick={() => setChartMode("list")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                chartMode === "list"
                  ? "bg-[#c9a227] text-[#07090d]"
                  : "text-[#a8b2c3] hover:text-[#f6f8fc]"
              }`}
            >
              Lista Detalhada
            </button>
          </div>
        </div>

        {/* Detalhe do Dia Focado (Card Responsivo) */}
        {hoveredDay && (
          <div className="mb-4 p-3 rounded-xl bg-[#0b1930]/80 border border-[#c9a227]/40 text-xs flex flex-wrap items-center justify-between gap-2.5 shadow-[0_0_15px_rgba(201,162,39,0.2)]">
            <span className="text-[#a8b2c3] font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#c9a227]" />
              <span>Dia: <strong className="text-[#f6f8fc]">{hoveredDay.date}</strong></span>
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[#f6f8fc] font-bold">
                {hoveredDay.count} ingressos
              </span>
              <span className="text-[#f5e6b8] font-extrabold text-sm font-mono">
                {formatCurrency(hoveredDay.revenue)}
              </span>
            </div>
          </div>
        )}

        {/* Visualização de Gráfico de Barras Responsivo */}
        {metrics.dailySales.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#a8b2c3]/60 italic">
            Nenhuma venda diária registrada ainda.
          </div>
        ) : chartMode === "bars" ? (
          <div className="space-y-4">
            <div className="h-56 sm:h-72 w-full flex items-end gap-1 sm:gap-2.5 pt-6 pb-2 px-1 border-b border-[#0b1930]/80 justify-between sm:justify-start">
              {metrics.dailySales.map((day) => {
                const heightPercent = Math.max(12, Math.round((day.count / maxDayCount) * 100));
                const isHovered = hoveredDay?.date === day.date;

                return (
                  <div
                    key={day.date}
                    onClick={() => setHoveredDay(day)}
                    onTouchStart={() => setHoveredDay(day)}
                    onMouseEnter={() => setHoveredDay(day)}
                    className="flex-1 min-w-[20px] sm:min-w-[32px] max-w-[56px] h-full flex flex-col justify-end items-center cursor-pointer group transition-all"
                  >
                    {/* Indicador de Valor no Topo */}
                    <span
                      className={`text-[8px] sm:text-[9px] font-bold transition-all mb-1 ${
                        isHovered ? "text-[#f5e6b8] scale-110" : "text-[#a8b2c3]/60"
                      }`}
                    >
                      {day.count}
                    </span>

                    {/* Barra Dourada Metálica */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isHovered
                          ? "bg-gradient-to-t from-[#c9a227] via-[#f5e6b8] to-[#ffffff] shadow-[0_0_15px_rgba(201,162,39,0.8)] scale-y-105"
                          : "bg-gradient-to-t from-[#c9a227]/60 via-[#c9a227] to-[#f5e6b8]/90 group-hover:from-[#c9a227] group-hover:to-[#f5e6b8]"
                      }`}
                    />

                    {/* Data no Eixo X */}
                    <span
                      className={`text-[8px] sm:text-[9px] font-semibold mt-2 whitespace-nowrap ${
                        isHovered ? "text-[#f5e6b8] font-bold" : "text-[#a8b2c3]/60"
                      }`}
                    >
                      {formatDateLabel(day.date)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legenda do Gráfico */}
            <div className="flex flex-wrap items-center justify-between text-xs text-[#a8b2c3] pt-1 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-gradient-to-r from-[#c9a227] to-[#f5e6b8]" />
                <span className="text-[11px]">Toque ou passe o mouse na barra para selecionar o dia</span>
              </div>
              <div className="text-[11px] text-[#a8b2c3]">
                Total: <strong className="text-[#f6f8fc]">{metrics.dailySales.length}</strong> dias
              </div>
            </div>
          </div>
        ) : (
          /* Modo Lista Detalhada (100% Amigável no Celular) */
          <div className="space-y-2 pt-2 divide-y divide-[#0b1930]">
            {metrics.dailySales.map((day) => {
              const heightPercent = Math.max(8, Math.round((day.count / maxDayCount) * 100));
              const isSelected = hoveredDay?.date === day.date;

              return (
                <div
                  key={day.date}
                  onClick={() => setHoveredDay(day)}
                  className={`pt-2.5 pb-2 px-3 rounded-xl cursor-pointer transition-all ${
                    isSelected ? "bg-[#0b1930] border border-[#c9a227]/40" : "hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-[#f6f8fc] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#c9a227]" />
                      {day.date}
                    </span>
                    <span className="text-[#f5e6b8] font-mono font-bold">
                      {formatCurrency(day.revenue)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-[#07090d] overflow-hidden border border-[#0b1930]">
                      <div
                        style={{ width: `${heightPercent}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-[#c9a227] to-[#f5e6b8]"
                      />
                    </div>
                    <span className="text-[11px] text-[#a8b2c3] font-bold w-16 text-right">
                      {day.count} ingr.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETALHAMENTO POR SETORES */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#101116] border border-[#0b1930] shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
        <h3 className="text-sm font-bold text-[#f6f8fc] uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>Distribuição de Vendas por Setor</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(metrics.sectorBreakdown).map(([key, sector]) => (
            <div
              key={key}
              className="p-4 rounded-xl bg-[#07090d]/80 border border-[#0b1930] flex flex-col justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-[#a8b2c3] truncate">{sector.name}</p>
                <p className="text-xl font-extrabold text-[#f6f8fc] mt-1">{sector.count} ingressos</p>
              </div>
              <p className="text-xs font-bold text-[#c9a227] mt-3 pt-2 border-t border-[#0b1930]">
                {formatCurrency(sector.revenue)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
