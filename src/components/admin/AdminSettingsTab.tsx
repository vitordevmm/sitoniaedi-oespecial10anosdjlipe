"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Ticket,
  Layers,
  Calendar,
  Gift,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { EventConfig, LotConfig, DEFAULT_EVENT_CONFIG } from "@/types/config";
import { CustomDropdown, DropdownOption } from "@/components/ui/CustomDropdown";
import { NumberInput } from "@/components/ui/NumberInput";

interface AdminSettingsTabProps {
  initialConfig: EventConfig | null;
  loading: boolean;
  onSaveConfig: (updatedConfig: EventConfig) => Promise<boolean>;
}

type SubTab = "ingressos" | "lotes" | "idade" | "cortesias";

export function AdminSettingsTab({ initialConfig, loading, onSaveConfig }: AdminSettingsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("lotes");
  const [config, setConfig] = useState<EventConfig>(initialConfig || DEFAULT_EVENT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    const ok = await onSaveConfig(config);
    setSaving(false);
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  // Funções de manipulação de lotes
  const handleUpdateLot = (index: number, field: keyof LotConfig, value: any) => {
    const updated = [...config.lotes];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, lotes: updated });
  };

  const handleToggleLotActive = (index: number) => {
    const updated = [...config.lotes];
    // Se for do setor pista e estiver ativando, garante que apenas 1 lote de pista fique ativo por vez
    const currentSector = updated[index].sector;
    const willBeActive = !updated[index].active;

    if (currentSector === "pista" && willBeActive) {
      updated.forEach((lot, i) => {
        if (lot.sector === "pista") {
          lot.active = i === index;
        }
      });
    } else {
      updated[index].active = willBeActive;
    }

    setConfig({ ...config, lotes: updated });
  };

  const handleAddLot = () => {
    const newLot: LotConfig = {
      id: `pista_${Date.now()}`,
      name: `${config.lotes.filter((l) => l.sector === "pista").length + 1}º Lote Oficial`,
      sector: "pista",
      sectorName: "Pista Geral & Bar Central",
      price: 90,
      active: false,
      order: config.lotes.length + 1,
    };
    setConfig({ ...config, lotes: [...config.lotes, newLot] });
  };

  const handleRemoveLot = (index: number) => {
    if (confirm("Deseja remover este lote da lista de configurações?")) {
      const updated = config.lotes.filter((_, i) => i !== index);
      setConfig({ ...config, lotes: updated });
    }
  };

  if (loading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-[#a8b2c3]">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* BARRA SUPERIOR COM SUB-ABAS E BOTÃO SALVAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#101116] border border-[#c9a227]/30 shadow-[0_4px_25px_rgba(0,0,0,0.7)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Sub-abas Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#07090d] border border-[#0b1930]">
          <button
            type="button"
            onClick={() => setActiveSubTab("lotes")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === "lotes"
                ? "bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] shadow-[0_0_12px_rgba(201,162,39,0.3)]"
                : "text-[#a8b2c3] hover:text-[#f6f8fc]"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Lotes & Preços</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("ingressos")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === "ingressos"
                ? "bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] shadow-[0_0_12px_rgba(201,162,39,0.3)]"
                : "text-[#a8b2c3] hover:text-[#f6f8fc]"
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Ingressos (Capacidade)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("idade")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === "idade"
                ? "bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] shadow-[0_0_12px_rgba(201,162,39,0.3)]"
                : "text-[#a8b2c3] hover:text-[#f6f8fc]"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Idade & Autorização</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("cortesias")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === "cortesias"
                ? "bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] shadow-[0_0_12px_rgba(201,162,39,0.3)]"
                : "text-[#a8b2c3] hover:text-[#f6f8fc]"
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Cortesias (Limite)</span>
          </button>
        </div>

        {/* Botão de Salvar Global */}
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Configurações salvas!
            </span>
          )}

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] hover:brightness-110 shadow-[0_0_15px_rgba(201,162,39,0.3)] transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Salvando..." : "Salvar Alterações"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          SUB-ABA 1: LOTES & PREÇOS (DINÂMICO PARA A HOME E CHECKOUT)
          ======================================================== */}
      {activeSubTab === "lotes" && (
        <div className="p-6 rounded-2xl bg-[#101116] border border-[#0b1930] shadow-[0_4px_25px_rgba(0,0,0,0.7)] space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#0b1930] pb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#f6f8fc] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#c9a227]" />
                <span>Configuração de Lotes & Preços de Venda</span>
              </h3>
              <p className="text-xs text-[#a8b2c3] mt-0.5">
                Altere os nomes dos lotes e valores em R$. A alteração ativa reflete automaticamente nos cards da Home e no Checkout!
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddLot}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#f5e6b8] bg-[#0b1930] hover:bg-[#c9a227]/20 border border-[#c9a227]/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Novo Lote</span>
            </button>
          </div>

          {/* Grid de Lotes */}
          <div className="space-y-3.5">
            {config.lotes.map((lot, idx) => (
              <div
                key={lot.id || idx}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 ${
                  lot.active
                    ? "bg-[#0b1930]/40 border-[#c9a227]/60 shadow-[0_0_15px_rgba(201,162,39,0.15)]"
                    : "bg-[#07090d] border-[#0b1930] opacity-80"
                }`}
              >
                {/* Nome do Lote */}
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#a8b2c3] block mb-1">
                    Nome do Lote:
                  </label>
                  <input
                    type="text"
                    value={lot.name}
                    onChange={(e) => handleUpdateLot(idx, "name", e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#101116] border border-[#0b1930] focus:border-[#c9a227] text-xs font-bold text-[#f6f8fc] focus:outline-none"
                  />
                </div>

                {/* Setor Correspondente */}
                <div className="w-full md:w-52">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#a8b2c3] block mb-1">
                    Setor do Evento:
                  </label>
                  <CustomDropdown
                    value={lot.sector}
                    onChange={(newSector) => {
                      const names: Record<string, string> = {
                        pista: "Pista Geral & Bar Central",
                        lounge_rosa: "Lounge Rosa (Ala Esquerda)",
                        lounge_azul: "Lounge Azul (Ala Direita)",
                        camarote: "Camarote no Palco Oficial",
                      };
                      handleUpdateLot(idx, "sector", newSector);
                      handleUpdateLot(idx, "sectorName", names[newSector] || lot.sectorName);
                    }}
                    options={[
                      { value: "pista", label: "Pista Geral" },
                      { value: "lounge_rosa", label: "Lounge Rosa" },
                      { value: "lounge_azul", label: "Lounge Azul" },
                      { value: "camarote", label: "Camarote no Palco" },
                    ]}
                    size="sm"
                    className="w-full"
                    buttonClassName="w-full rounded-lg bg-[#101116] border-[#0b1930]"
                  />
                </div>

                {/* Valor em R$ */}
                <div className="w-full md:w-36">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#a8b2c3] block mb-1">
                    Valor (R$):
                  </label>
                  <NumberInput
                    value={lot.price}
                    step={5}
                    min={0}
                    prefixText="R$"
                    size="sm"
                    onChange={(val) => handleUpdateLot(idx, "price", val)}
                    containerClassName="bg-[#101116] rounded-lg border-[#0b1930]"
                    className="font-bold text-[#f5e6b8]"
                  />
                </div>

                {/* Toggle Ativo / Esgotado */}
                <div className="flex items-center gap-3 pt-2 md:pt-0">
                  <button
                    type="button"
                    onClick={() => handleToggleLotActive(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      lot.active
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        : "bg-[#07090d] text-[#a8b2c3] border border-[#0b1930]"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${lot.active ? "bg-emerald-400 animate-pulse" : "bg-neutral-600"}`} />
                    <span>{lot.active ? "Lote Ativo (Venda)" : "Inativo / Esgotado"}</span>
                  </button>

                  {/* Excluir Lote extra */}
                  {config.lotes.length > 4 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLot(idx)}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      title="Excluir Lote"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-ABA 2: INGRESSOS (CAPACIDADE TOTAL DISPONÍVEL)
          ======================================================== */}
      {activeSubTab === "ingressos" && (
        <div className="p-6 rounded-2xl bg-[#101116] border border-[#0b1930] shadow-[0_4px_25px_rgba(0,0,0,0.7)] space-y-6">
          <div className="border-b border-[#0b1930] pb-4">
            <h3 className="text-base font-bold text-[#f6f8fc] flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#c9a227]" />
              <span>Capacidade Total de Ingressos Disponíveis para Venda</span>
            </h3>
            <p className="text-xs text-[#a8b2c3] mt-0.5">
              Defina o limite máximo de ingressos comercializáveis na plataforma para controle perimetral seguro.
            </p>
          </div>

          <div className="max-w-md space-y-4">
            <div>
              <label className="text-xs font-bold text-[#a8b2c3] block mb-2">
                Quantidade Total de Ingressos à Venda:
              </label>
              <NumberInput
                value={config.ingressos.totalAvailable}
                min={100}
                step={50}
                size="md"
                onChange={(val) =>
                  setConfig({
                    ...config,
                    ingressos: { totalAvailable: val },
                  })
                }
                containerClassName="bg-[#07090d] rounded-xl border-[#0b1930]"
              />
              <p className="text-[11px] text-[#a8b2c3]/60 mt-1.5">
                * Quando a soma de ingressos vendidos atingir este número, a venda é pausada automaticamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-ABA 3: IDADE MÍNIMA & CONTRATO DE AUTORIZAÇÃO DE MENOR
          ======================================================== */}
      {activeSubTab === "idade" && (
        <div className="p-6 rounded-2xl bg-[#101116] border border-[#0b1930] shadow-[0_4px_25px_rgba(0,0,0,0.7)] space-y-6">
          <div className="border-b border-[#0b1930] pb-4">
            <h3 className="text-base font-bold text-[#f6f8fc] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#c9a227]" />
              <span>Regra de Idade & Termo de Autorização de Menores</span>
            </h3>
            <p className="text-xs text-[#a8b2c3] mt-0.5">
              Configure a idade para entrada desacompanhada. Usuários com idade menor que o valor estipulado terão acesso exclusivo à aba &quot;Autorização&quot; no perfil com o contrato oficial pré-preenchido.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Campo de Configuração */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#a8b2c3] block mb-2">
                  Idade Mínima para Entrar Desacompanhado (Anos):
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-36">
                    <NumberInput
                      value={config.idade.minAgeUnaccompanied}
                      min={14}
                      max={21}
                      step={1}
                      size="md"
                      onChange={(val) =>
                        setConfig({
                          ...config,
                          idade: { minAgeUnaccompanied: val || 17 },
                        })
                      }
                      containerClassName="bg-[#07090d] rounded-xl border-[#0b1930]"
                      className="text-center font-extrabold text-[#f5e6b8] text-base"
                    />
                  </div>
                  <span className="text-xs text-[#a8b2c3] font-semibold">Anos completos</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0b1930]/40 border border-[#c9a227]/30 text-xs text-[#a8b2c3] space-y-2">
                <p className="font-bold text-[#f5e6b8] flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#c9a227]" />
                  Como funciona esta regra:
                </p>
                <p>
                  Se você definir <strong>{config.idade.minAgeUnaccompanied} anos</strong>:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Usuários com <strong>{config.idade.minAgeUnaccompanied} anos ou mais</strong> entram desacompanhados normalmente (não veem a aba de autorização).
                  </li>
                  <li>
                    Usuários com <strong>menos de {config.idade.minAgeUnaccompanied} anos</strong> recebem uma aba exclusiva chamada <strong>&quot;Autorização&quot;</strong> no seu painel em <code>/perfil</code>.
                  </li>
                </ul>
              </div>
            </div>

            {/* Preview do Termo de Autorização */}
            <div className="lg:col-span-2 p-5 rounded-xl bg-[#07090d] border border-[#0b1930] space-y-3">
              <div className="flex items-center justify-between border-b border-[#0b1930] pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#f5e6b8] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#c9a227]" />
                  Modelo do Contrato Oficial de Autorização do Menor
                </span>
                <span className="text-[10px] text-[#a8b2c3] bg-white/5 px-2 py-0.5 rounded">
                  Jurídico Oficial
                </span>
              </div>

              <div className="text-[11px] text-[#a8b2c3] leading-relaxed max-h-56 overflow-y-auto space-y-2.5 pr-2 font-serif">
                <p className="font-bold text-center text-[#f6f8fc]">
                  AUTORIZAÇÃO DE ENTRADA E PERMANÊNCIA DE MENOR DE IDADE
                  <br />
                  SINTONIA EDIÇÃO ESPECIAL 10 ANOS DJ LIPE — 10/04/2027 (CAPITU, TUPACIGUARA - MG)
                </p>
                <p>
                  Eu, __________________________________________________, portador(a) do RG nº _______________ e CPF nº _______________, na qualidade de responsável legal (Pai / Mãe / Tutor) do(a) menor <strong>[Nome Completo do Usuário Menor]</strong>, nascido(a) em <strong>[Data de Nascimento]</strong>, AUTORIZO sua entrada e permanência no festival acima nominado, devidamente acompanhado(a) pelo(a) maior civilmente capaz __________________________________________________, portador(a) do RG nº _______________ e CPF nº _______________.
                </p>
                <p>
                  Declaro ter plena ciência do regulamento do evento e das penalidades legais cabíveis nos termos do Estatuto da Criança e do Adolescente (Lei nº 8.069/90).
                </p>
                <p className="pt-2 text-right">
                  _________________________, _____ de _______________ de 2027.
                </p>
                <p className="text-center pt-2">
                  __________________________________________________
                  <br />
                  Assinatura do Responsável Legal (com cópia de documento com foto)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          SUB-ABA 4: CORTESIAS (LIMITE MÁXIMO DA PRODUÇÃO)
          ======================================================== */}
      {activeSubTab === "cortesias" && (
        <div className="p-6 rounded-2xl bg-[#101116] border border-[#0b1930] shadow-[0_4px_25px_rgba(0,0,0,0.7)] space-y-6">
          <div className="border-b border-[#0b1930] pb-4">
            <h3 className="text-base font-bold text-[#f6f8fc] flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-400" />
              <span>Limite Máximo de Cortesias Disponíveis</span>
            </h3>
            <p className="text-xs text-[#a8b2c3] mt-0.5">
              Defina o teto de cortesias VIPs que podem ser geradas e entregues aos parceiros da organização.
            </p>
          </div>

          <div className="max-w-md space-y-4">
            <div>
              <label className="text-xs font-bold text-[#a8b2c3] block mb-2">
                Quantidade de Cortesias Disponíveis:
              </label>
              <NumberInput
                value={config.cortesias.totalAvailable}
                min={0}
                step={10}
                size="md"
                onChange={(val) =>
                  setConfig({
                    ...config,
                    cortesias: { totalAvailable: val },
                  })
                }
                containerClassName="bg-[#07090d] rounded-xl border-[#0b1930]"
              />
              <p className="text-[11px] text-[#a8b2c3]/60 mt-1.5">
                * A aba Cortesias respeita esse limite para impedir emissões em excesso.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
