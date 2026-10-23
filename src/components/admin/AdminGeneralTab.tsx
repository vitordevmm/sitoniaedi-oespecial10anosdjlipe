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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 4 CARDS PRINCIPAIS DE KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Valor Arrecadado */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#101116] via-[#0b1930]/40 to-[#101116] border border-[#c9a227]/40 shadow-[0_4px_20px_rgba(0,0,0,0.6)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#c9a227]/10 rounded-full blur-2xl -z-10 group-hover:bg-[#c9a227]/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
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
          <p className="text-[11px] text-[#a8b2c3] mt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">{metrics.totalSoldTickets}</span> ingressos pagos
          </p>
        </div>

        {/* Card 2: Ingressos Vendidos */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#101116] via-[#0b1930]/40 to-[#101116] border border-[#0b1930] shadow-[0_4px_20px_rgba(0,0,0,0.6)] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
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
          <p className="text-[11px] text-[#a8b2c3] mt-1.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{metrics.totalUsed} já validados na portaria</span>
          </p>
        </div>

        {/* Card 3: Usuários Cadastrados */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#101116] via-[#0b1930]/40 to-[#101116] border border-[#0b1930] shadow-[0_4px_20px_rgba(0,0,0,0.6)] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
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
          <p className="text-[11px] text-[#a8b2c3] mt-1.5">
            Cadastros oficiais no banco
          </p>
        </div>

        {/* Card 4: Cortesias */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#101116] via-[#0b1930]/40 to-[#101116] border border-[#0b1930] shadow-[0_4px_20px_rgba(0,0,0,0.6)] relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
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
          <p className="text-[11px] text-[#a8b2c3] mt-1.5 flex items-center gap-1.5">
            {metrics.totalCancelled > 0 && (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400 font-semibold">{metrics.totalCancelled} cancelados</span>
              </>
            )}
            {metrics.totalCancelled === 0 && <span>Cortesias da produção</span>}
          </p>
        </div>
      </div>

      {/* GRÁFICO DE VENDAS DIÁRIAS COMPLETO */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#101116] border border-[#c9a227]/30 shadow-[0_4px_25px_rgba(0,0,0,0.7)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#c9a227]" />
              <h2 className="text-base sm:text-lg font-bold text-[#f6f8fc]">
                Gráfico de Vendas Diárias
              </h2>
            </div>
            <p className="text-xs text-[#a8b2c3] mt-0.5">
              Histórico diário de quantidade de ingressos emitidos e valor financeiro arrecadado
            </p>
          </div>

          {/* Tooltip Dinâmico do Dia Focado */}
          {hoveredDay ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-[#0b1930] border border-[#c9a227]/50 text-xs flex items-center gap-3 shadow-[0_0_15px_rgba(201,162,39,0.3)] animate-in fade-in duration-200">
              <span className="text-[#a8b2c3] font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#c9a227]" />
                {hoveredDay.date}
              </span>
              <span className="text-[#f6f8fc] font-bold">
                {hoveredDay.count} ingressos
              </span>
              <span className="text-[#f5e6b8] font-extrabold">
                {formatCurrency(hoveredDay.revenue)}
              </span>
            </div>
          ) : (
            <div className="text-[11px] text-[#a8b2c3] italic">
              Passe o mouse sobre as barras para detalhes diários
            </div>
          )}
        </div>

        {/* Visualização de Gráfico de Barras Responsivo */}
        {metrics.dailySales.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#a8b2c3]/60 italic">
            Nenhuma venda diária registrada ainda.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="h-64 sm:h-72 w-full flex items-end gap-1.5 sm:gap-3 pt-6 pb-2 px-2 overflow-x-auto border-b border-[#0b1930]/80">
              {metrics.dailySales.map((day) => {
                const heightPercent = Math.max(12, Math.round((day.count / maxDayCount) * 100));
                const isHovered = hoveredDay?.date === day.date;

                return (
                  <div
                    key={day.date}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="flex-1 min-w-[28px] max-w-[48px] h-full flex flex-col justify-end items-center cursor-pointer group transition-all"
                  >
                    {/* Indicador de Valor no Topo */}
                    <span
                      className={`text-[9px] font-bold transition-all mb-1 ${
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
                      className={`text-[9px] font-semibold mt-2 whitespace-nowrap ${
                        isHovered ? "text-[#f5e6b8]" : "text-[#a8b2c3]/60"
                      }`}
                    >
                      {formatDateLabel(day.date)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legenda do Gráfico */}
            <div className="flex flex-wrap items-center justify-between text-xs text-[#a8b2c3] pt-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-gradient-to-r from-[#c9a227] to-[#f5e6b8]" />
                <span>Barras: Volume de ingressos emitidos por dia</span>
              </div>
              <div className="text-[11px] text-[#a8b2c3]">
                Total de dias com emissão: <strong className="text-[#f6f8fc]">{metrics.dailySales.length}</strong>
              </div>
            </div>
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
