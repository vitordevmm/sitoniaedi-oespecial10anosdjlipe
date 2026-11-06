"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Tag,
  Trophy,
  Users,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Edit3,
  Trash2,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Percent,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Mail,
  Phone,
  Calendar,
  Ticket as TicketIcon,
  Crown,
  Medal,
} from "lucide-react";
import { GlowBadge } from "@/components/ui/GlowBadge";
import { CustomDropdown, DropdownOption } from "@/components/ui/CustomDropdown";
import { NumberInput } from "@/components/ui/NumberInput";
import { Checkbox } from "@/components/ui/Checkbox";
import { useConfirm } from "@/context/ConfirmContext";
import {
  Coupon,
  CouponDiscountType,
  CouponPurchaseRecord,
  CouponApplicationRecord,
  CouponRankingEntry,
} from "@/types/coupon";
import { normalizeCouponCode } from "@/lib/validations/coupon";

interface AdminCouponsTabProps {
  getIdToken: () => Promise<string>;
  showToast: (message: string, type?: "success" | "error") => void;
}

type SubTab = "cupons" | "ranking";
type RankingMetric = "soldCount" | "totalRevenue" | "conversionRate";

export function AdminCouponsTab({ getIdToken, showToast }: AdminCouponsTabProps) {
  const { confirm } = useConfirm();

  // Estados principais
  const [subTab, setSubTab] = useState<SubTab>("cupons");
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [ranking, setRanking] = useState<CouponRankingEntry[]>([]);
  const [kpis, setKpis] = useState<{
    totalCoupons: number;
    activeCoupons: number;
    totalSoldWithCoupon: number;
    totalRevenueWithCoupon: number;
    totalDiscountGiven: number;
    totalApplications: number;
    averageConversionRate: number;
  }>({
    totalCoupons: 0,
    activeCoupons: 0,
    totalSoldWithCoupon: 0,
    totalRevenueWithCoupon: 0,
    totalDiscountGiven: 0,
    totalApplications: 0,
    averageConversionRate: 0,
  });

  // Filtros da aba cupons
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Critério de ranking
  const [rankingMetric, setRankingMetric] = useState<RankingMetric>("soldCount");

  // Estado do Modal de Criar/Editar
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [savingCoupon, setSavingCoupon] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Formulário do cupom
  const [formCode, setFormCode] = useState("");
  const [formDisplayCode, setFormDisplayCode] = useState("");
  const [formInfluencerName, setFormInfluencerName] = useState("");
  const [formInfluencerPhone, setFormInfluencerPhone] = useState("");
  const [formInfluencerInstagram, setFormInfluencerInstagram] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<CouponDiscountType>("percentage");
  const [formDiscountValue, setFormDiscountValue] = useState<number>(10);
  const [formIsUnlimited, setFormIsUnlimited] = useState<boolean>(true);
  const [formMaxUses, setFormMaxUses] = useState<number>(50);
  const [formActive, setFormActive] = useState<boolean>(true);
  const [formNotes, setFormNotes] = useState("");

  // Estado do Modal de Detalhes / Compradores
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [detailsPurchases, setDetailsPurchases] = useState<CouponPurchaseRecord[]>([]);
  const [detailsAbandoned, setDetailsAbandoned] = useState<CouponApplicationRecord[]>([]);
  const [detailsActiveTab, setDetailsActiveTab] = useState<"purchases" | "abandoned">("purchases");

  // Estado de feedback de cópia de link
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // ==========================================
  // CARREGAR CUPONS DA API
  // ==========================================
  const loadCoupons = async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/coupons", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCoupons(data.coupons || []);
        setRanking(data.ranking || []);
        if (data.kpis) setKpis(data.kpis);
      } else {
        showToast(data.error || "Erro ao carregar cupons.", "error");
      }
    } catch (err: any) {
      console.error("[AdminCouponsTab] Erro ao carregar cupons:", err);
      showToast("Falha na comunicação com o servidor.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  // ==========================================
  // MODAL CRIAR / EDITAR
  // ==========================================
  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setFormCode("");
    setFormDisplayCode("");
    setFormInfluencerName("");
    setFormInfluencerPhone("");
    setFormInfluencerInstagram("");
    setFormDiscountType("percentage");
    setFormDiscountValue(10);
    setFormIsUnlimited(true);
    setFormMaxUses(50);
    setFormActive(true);
    setFormNotes("");
    setFormError(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setIsEditing(true);
    setFormCode(coupon.code);
    setFormDisplayCode(coupon.displayCode || coupon.code);
    setFormInfluencerName(coupon.influencerName);
    setFormInfluencerPhone(coupon.influencerPhone || "");
    setFormInfluencerInstagram(coupon.influencerInstagram || "");
    setFormDiscountType(coupon.discountType);
    setFormDiscountValue(coupon.discountValue || 0);
    setFormIsUnlimited(Boolean(coupon.isUnlimited));
    setFormMaxUses(coupon.maxUses || 50);
    setFormActive(coupon.active);
    setFormNotes(coupon.notes || "");
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanCode = normalizeCouponCode(formCode);
    if (!cleanCode) {
      setFormError("Código do cupom é obrigatório e deve conter letras ou números.");
      return;
    }

    if (!formInfluencerName.trim()) {
      setFormError("Nome do influenciador é obrigatório.");
      return;
    }

    if (formDiscountType === "percentage" && (formDiscountValue <= 0 || formDiscountValue > 100)) {
      setFormError("A porcentagem de desconto deve ser entre 1% e 100%.");
      return;
    }

    if (formDiscountType === "fixed" && formDiscountValue <= 0) {
      setFormError("O valor de desconto fixo deve ser maior que R$ 0,00.");
      return;
    }

    if (!formIsUnlimited && (formMaxUses <= 0 || isNaN(formMaxUses))) {
      setFormError("Informe um limite de usos válido (maior que 0) ou marque como Ilimitado.");
      return;
    }

    setSavingCoupon(true);

    try {
      const token = await getIdToken();
      const payload = {
        code: cleanCode,
        displayCode: formDisplayCode.trim() || cleanCode,
        influencerName: formInfluencerName.trim(),
        influencerPhone: formInfluencerPhone.trim() || undefined,
        influencerInstagram: formInfluencerInstagram.trim() || undefined,
        discountType: formDiscountType,
        discountValue: formDiscountType === "none" ? 0 : Number(formDiscountValue),
        isUnlimited: formIsUnlimited,
        maxUses: formIsUnlimited ? undefined : Number(formMaxUses),
        active: formActive,
        notes: formNotes.trim() || undefined,
      };

      const url = "/api/admin/coupons";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao salvar cupom.");
      }

      showToast(isEditing ? "Cupom atualizado com sucesso!" : "Cupom criado com sucesso!", "success");
      setModalOpen(false);
      loadCoupons();
    } catch (err: any) {
      setFormError(err.message || "Erro inesperado ao salvar cupom.");
    } finally {
      setSavingCoupon(false);
    }
  };

  // ==========================================
  // TOGGLE STATUS ATIVO / INATIVO
  // ==========================================
  const handleToggleActive = async (coupon: Coupon) => {
    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: coupon.code,
          active: !coupon.active,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao alterar status.");
      }

      showToast(`Cupom ${coupon.displayCode} ${!coupon.active ? "ativado" : "desativado"} com sucesso!`);
      // Atualiza estado local imediatamente
      setCoupons((prev) =>
        prev.map((c) => (c.code === coupon.code ? { ...c, active: !c.active } : c))
      );
    } catch (err: any) {
      showToast(err.message || "Erro ao alterar status.", "error");
    }
  };

  // ==========================================
  // EXCLUIR CUPOM
  // ==========================================
  const handleDeleteCoupon = async (coupon: Coupon) => {
    const confirmed = await confirm({
      title: `Excluir cupom ${coupon.displayCode}?`,
      description: (
        <div className="space-y-2 text-sm text-[#a8b2c3]">
          <p>
            Você está prestes a excluir o cupom do influenciador{" "}
            <strong className="text-[#f6f8fc]">{coupon.influencerName}</strong>.
          </p>
          {coupon.soldCount > 0 && (
            <p className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200">
              ⚠️ Este cupom já possui <strong>{coupon.soldCount} compras registradas</strong>. O histórico de compradores em relatórios continuará preservado, mas novos acessos com este código serão bloqueados.
            </p>
          )}
        </div>
      ),
      confirmText: "Sim, Excluir Cupom",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      const token = await getIdToken();
      const res = await fetch(`/api/admin/coupons?code=${encodeURIComponent(coupon.code)}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao excluir cupom.");
      }

      showToast(`Cupom ${coupon.displayCode} excluído com sucesso!`, "success");
      loadCoupons();
    } catch (err: any) {
      showToast(err.message || "Erro ao excluir cupom.", "error");
    }
  };

  // ==========================================
  // COPIAR LINK DE DIVULGAÇÃO
  // ==========================================
  const handleCopyLink = (code: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://sintoniaedicaoespecial.online";
    const shareUrl = `${origin}/?cupom=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedCode(code);
    showToast(`Link copiado: ${shareUrl}`, "success");
    setTimeout(() => setCopiedCode(null), 3000);
  };

  // ==========================================
  // MODAL DETALHES & COMPRADORES DO CUPOM
  // ==========================================
  const handleOpenDetails = async (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setDetailsModalOpen(true);
    setDetailsLoading(true);
    setDetailsPurchases([]);
    setDetailsAbandoned([]);
    setDetailsActiveTab("purchases");

    try {
      const token = await getIdToken();
      const res = await fetch(`/api/admin/coupons/${encodeURIComponent(coupon.code)}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDetailsPurchases(data.purchases || []);
        setDetailsAbandoned(data.abandonedApplications || []);
        if (data.coupon) {
          setSelectedCoupon(data.coupon);
        }
      } else {
        showToast(data.error || "Erro ao carregar detalhes.", "error");
      }
    } catch (err: any) {
      console.error("[AdminCouponsTab] Erro ao carregar detalhes:", err);
      showToast("Falha ao consultar compradores.", "error");
    } finally {
      setDetailsLoading(false);
    }
  };

  // ==========================================
  // FILTRAGEM DE CUPONS
  // ==========================================
  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const search = searchTerm.toLowerCase().trim();
      const matchSearch =
        !search ||
        c.code.toLowerCase().includes(search) ||
        (c.displayCode && c.displayCode.toLowerCase().includes(search)) ||
        c.influencerName.toLowerCase().includes(search) ||
        (c.influencerInstagram && c.influencerInstagram.toLowerCase().includes(search));

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && c.active) ||
        (statusFilter === "inactive" && !c.active);

      return matchSearch && matchStatus;
    });
  }, [coupons, searchTerm, statusFilter]);

  // ==========================================
  // ORDENAÇÃO DO RANKING
  // ==========================================
  const sortedRanking = useMemo(() => {
    const list = [...ranking];
    list.sort((a, b) => {
      if (rankingMetric === "soldCount") {
        return b.soldCount - a.soldCount || b.totalRevenue - a.totalRevenue;
      }
      if (rankingMetric === "totalRevenue") {
        return b.totalRevenue - a.totalRevenue || b.soldCount - a.soldCount;
      }
      if (rankingMetric === "conversionRate") {
        return b.conversionRate - a.conversionRate || b.soldCount - a.soldCount;
      }
      return 0;
    });
    return list.map((item, idx) => ({ ...item, position: idx + 1 }));
  }, [ranking, rankingMetric]);

  const maxRankingValue = useMemo(() => {
    if (sortedRanking.length === 0) return 1;
    const top = sortedRanking[0];
    if (rankingMetric === "soldCount") return Math.max(1, top.soldCount);
    if (rankingMetric === "totalRevenue") return Math.max(1, top.totalRevenue);
    if (rankingMetric === "conversionRate") return 100;
    return 1;
  }, [sortedRanking, rankingMetric]);

  // Opções para CustomDropdown
  const discountTypeOptions: DropdownOption[] = [
    { value: "percentage", label: "Porcentagem (%) de Desconto", icon: <Percent className="w-4 h-4 text-[#c9a227]" /> },
    { value: "fixed", label: "Valor Fixo em Reais (R$)", icon: <DollarSign className="w-4 h-4 text-emerald-400" /> },
    { value: "none", label: "Apenas Rastreamento (0% Desconto)", icon: <Tag className="w-4 h-4 text-[#a8b2c3]" /> },
  ];

  const statusFilterOptions: DropdownOption[] = [
    { value: "all", label: "Todos os Status" },
    { value: "active", label: "Apenas Ativos" },
    { value: "inactive", label: "Apenas Inativos" },
  ];

  const rankingMetricOptions: DropdownOption[] = [
    { value: "soldCount", label: "Mais Ingressos Vendidos", icon: <TicketIcon className="w-4 h-4 text-[#c9a227]" /> },
    { value: "totalRevenue", label: "Maior Receita Gerada (R$)", icon: <DollarSign className="w-4 h-4 text-emerald-400" /> },
    { value: "conversionRate", label: "Maior Taxa de Conversão (%)", icon: <TrendingUp className="w-4 h-4 text-[#f5e6b8]" /> },
  ];

  return (
    <div className="space-y-6">
      {/* ========================================================
          4 CARDS DE KPIS GLOBAIS NO TOPO
          ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Cupons Ativos */}
        <div className="rounded-2xl bg-[#0b1930]/60 border border-[#c9a227]/30 p-4 sm:p-5 relative overflow-hidden group hover:border-[#c9a227]/60 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#a8b2c3] font-medium">Cupons Ativos</span>
            <div className="w-8 h-8 rounded-xl bg-[#c9a227]/15 border border-[#c9a227]/30 flex items-center justify-center text-[#f5e6b8]">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#f6f8fc] tracking-tight">
            {kpis.activeCoupons} <span className="text-sm font-normal text-[#a8b2c3]">/ {kpis.totalCoupons}</span>
          </div>
          <p className="text-[11px] text-[#a8b2c3] mt-1 truncate">
            {kpis.totalCoupons === 0 ? "Nenhum cupom gerado" : "Cupons cadastrados no festival"}
          </p>
        </div>

        {/* KPI 2: Ingressos Vendidos */}
        <div className="rounded-2xl bg-[#0b1930]/60 border border-[#c9a227]/30 p-4 sm:p-5 relative overflow-hidden group hover:border-[#c9a227]/60 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#a8b2c3] font-medium">Vendas com Cupom</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TicketIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
            {kpis.totalSoldWithCoupon}
          </div>
          <p className="text-[11px] text-[#a8b2c3] mt-1 truncate">
            Ingressos emitidos via influenciadores
          </p>
        </div>

        {/* KPI 3: Faturamento Total */}
        <div className="rounded-2xl bg-[#0b1930]/60 border border-[#c9a227]/30 p-4 sm:p-5 relative overflow-hidden group hover:border-[#c9a227]/60 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#a8b2c3] font-medium">Receita Influencers</span>
            <div className="w-8 h-8 rounded-xl bg-[#c9a227]/20 border border-[#c9a227]/40 flex items-center justify-center text-[#f5e6b8]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#f5e6b8] tracking-tight">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
              kpis.totalRevenueWithCoupon
            )}
          </div>
          <p className="text-[11px] text-[#a8b2c3] mt-1 truncate">
            Descontos dados: R$ {kpis.totalDiscountGiven.toFixed(2).replace(".", ",")}
          </p>
        </div>

        {/* KPI 4: Conversão Média */}
        <div className="rounded-2xl bg-[#0b1930]/60 border border-[#c9a227]/30 p-4 sm:p-5 relative overflow-hidden group hover:border-[#c9a227]/60 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#a8b2c3] font-medium">Conversão Média</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#f6f8fc] tracking-tight">
            {kpis.averageConversionRate}%
          </div>
          <p className="text-[11px] text-[#a8b2c3] mt-1 truncate">
            {kpis.totalSoldWithCoupon} compras de {kpis.totalApplications} aplicações
          </p>
        </div>
      </div>

      {/* ========================================================
          SUB-ABAS: CUPONS vs RANKING
          ======================================================== */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-[#0b1930]">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0b1930] border border-[#c9a227]/30">
          <button
            type="button"
            onClick={() => setSubTab("cupons")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              subTab === "cupons"
                ? "bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] shadow-[0_0_12px_rgba(201,162,39,0.3)]"
                : "text-[#a8b2c3] hover:text-[#f6f8fc]"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Gerenciar Cupons ({coupons.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("ranking")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              subTab === "ranking"
                ? "bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d] shadow-[0_0_12px_rgba(201,162,39,0.3)]"
                : "text-[#a8b2c3] hover:text-[#f6f8fc]"
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Ranking de Vendas</span>
          </button>
        </div>

        {subTab === "cupons" && (
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] hover:brightness-110 shadow-[0_0_20px_rgba(201,162,39,0.3)] active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cupom</span>
          </button>
        )}
      </div>

      {/* ========================================================
          CONTEÚDO DA SUB-ABA 1: GERENCIAR CUPONS
          ======================================================== */}
      {subTab === "cupons" && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8b2c3]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código, nome do influenciador ou Instagram..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#0b1930] border border-[#c9a227]/30 text-xs sm:text-sm text-[#f6f8fc] placeholder:text-[#a8b2c3]/60 focus:outline-none focus:border-[#c9a227]"
              />
            </div>

            <div>
              <CustomDropdown
                value={statusFilter}
                onChange={(val) => setStatusFilter(val as any)}
                options={statusFilterOptions}
                size="md"
                buttonClassName="h-11 rounded-xl"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-[#0b1930]/30 border border-[#c9a227]/20 text-center">
              <Loader2 className="w-8 h-8 text-[#c9a227] animate-spin mb-3" />
              <p className="text-xs text-[#f5e6b8] font-bold">Carregando cupons de influenciadores...</p>
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="p-10 rounded-2xl bg-[#0b1930]/30 border border-[#c9a227]/20 text-center">
              <Tag className="w-10 h-10 text-[#c9a227]/50 mx-auto mb-3" />
              <h4 className="text-base font-bold text-[#f6f8fc]">Nenhum cupom encontrado</h4>
              <p className="text-xs text-[#a8b2c3] max-w-sm mx-auto mt-1 mb-5">
                {searchTerm || statusFilter !== "all"
                  ? "Tente ajustar seus termos de busca ou filtros."
                  : "Cadastre o primeiro cupom de influenciador para começar a rastrear vendas e conversão."}
              </p>
              {(!searchTerm && statusFilter === "all") && (
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Cupom</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* TABELA DESKTOP */}
              <div className="hidden md:block overflow-hidden rounded-2xl bg-[#0b1930]/40 border border-[#c9a227]/30 shadow-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0b1930] text-[#a8b2c3] uppercase text-[10px] tracking-wider border-b border-[#c9a227]/20">
                    <tr>
                      <th className="py-3.5 px-4">Código / Divulgação</th>
                      <th className="py-3.5 px-4">Influenciador(a)</th>
                      <th className="py-3.5 px-4">Benefício</th>
                      <th className="py-3.5 px-4">Usos / Limite</th>
                      <th className="py-3.5 px-4 text-center">Vendas</th>
                      <th className="py-3.5 px-4 text-center">Abandonos</th>
                      <th className="py-3.5 px-4 text-center">Conversão</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0b1930]/80 text-[#f6f8fc]">
                    {filteredCoupons.map((c) => {
                      const limitDisplay = c.isUnlimited ? "Ilimitado" : `${c.soldCount} / ${c.maxUses || 0}`;
                      const usagePercent = !c.isUnlimited && c.maxUses ? Math.min(100, Math.round((c.soldCount / c.maxUses) * 100)) : 0;

                      return (
                        <tr key={c.code} className="hover:bg-white/[0.02] transition-colors">
                          {/* Código e Botão de Cópia */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-extrabold text-sm text-[#f5e6b8] tracking-wider bg-[#101116] px-2.5 py-1 rounded-lg border border-[#c9a227]/30">
                                {c.displayCode || c.code}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyLink(c.code)}
                                title="Copiar link com cupom pré-ativado"
                                className={`p-1.5 rounded-lg border transition-all ${
                                  copiedCode === c.code
                                    ? "bg-emerald-500 text-black border-emerald-500 font-bold"
                                    : "bg-[#0b1930] hover:bg-[#c9a227]/20 text-[#c9a227] border-[#c9a227]/30"
                                }`}
                              >
                                {copiedCode === c.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          {/* Influenciador */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#f6f8fc]">{c.influencerName}</div>
                            <div className="text-[11px] text-[#a8b2c3] flex items-center gap-2 mt-0.5">
                              {c.influencerInstagram && (
                                <span className="text-[#f5e6b8]">@{c.influencerInstagram.replace("@", "")}</span>
                              )}
                              {c.influencerPhone && (
                                <span>{c.influencerPhone}</span>
                              )}
                            </div>
                          </td>

                          {/* Benefício */}
                          <td className="py-3.5 px-4">
                            {c.discountType === "percentage" && (
                              <GlowBadge variant="emerald" size="xs">
                                {c.discountValue}% OFF
                              </GlowBadge>
                            )}
                            {c.discountType === "fixed" && (
                              <GlowBadge variant="emerald" size="xs">
                                R$ {c.discountValue.toFixed(2).replace(".", ",")} OFF
                              </GlowBadge>
                            )}
                            {c.discountType === "none" && (
                              <GlowBadge variant="neutral" size="xs">
                                0% (Rastreamento)
                              </GlowBadge>
                            )}
                          </td>

                          {/* Usos / Limite */}
                          <td className="py-3.5 px-4">
                            <span className="text-xs font-semibold">{limitDisplay}</span>
                            {!c.isUnlimited && (
                              <div className="w-24 h-1.5 rounded-full bg-[#101116] mt-1 overflow-hidden border border-white/5">
                                <div
                                  className="h-full bg-gradient-to-r from-[#c9a227] to-[#f5e6b8]"
                                  style={{ width: `${usagePercent}%` }}
                                />
                              </div>
                            )}
                          </td>

                          {/* Vendas */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-extrabold text-sm text-emerald-400">
                              {c.soldCount}
                            </span>
                            <div className="text-[10px] text-[#a8b2c3]">
                              R$ {c.totalRevenue.toFixed(2).replace(".", ",")}
                            </div>
                          </td>

                          {/* Abandonos */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-bold text-xs text-amber-400">
                              {c.appliedNotBoughtCount}
                            </span>
                            <div className="text-[10px] text-[#a8b2c3]">
                              não concluíram
                            </div>
                          </td>

                          {/* Conversão */}
                          <td className="py-3.5 px-4 text-center">
                            <span className="font-extrabold text-xs text-[#f5e6b8]">
                              {c.conversionRate}%
                            </span>
                          </td>

                          {/* Status Switch */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(c)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                                c.active
                                  ? "bg-emerald-950/70 text-emerald-400 border-emerald-500/40 hover:bg-emerald-900/80"
                                  : "bg-red-950/70 text-red-400 border-red-500/40 hover:bg-red-900/80"
                              }`}
                            >
                              {c.active ? "Ativo" : "Inativo"}
                            </button>
                          </td>

                          {/* Ações */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenDetails(c)}
                                title="Ver lista de compradores e aplicações deste cupom"
                                className="p-1.5 rounded-lg text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-white/10 transition-colors"
                              >
                                <Users className="w-4 h-4 text-[#c9a227]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(c)}
                                title="Editar cupom"
                                className="p-1.5 rounded-lg text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-white/10 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCoupon(c)}
                                title="Excluir cupom"
                                className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-950/50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* CARDS MOBILE */}
              <div className="block md:hidden space-y-3">
                {filteredCoupons.map((c) => {
                  const limitDisplay = c.isUnlimited ? "Ilimitado" : `${c.soldCount} / ${c.maxUses || 0}`;

                  return (
                    <div
                      key={c.code}
                      className="rounded-2xl bg-[#0b1930]/60 border border-[#c9a227]/30 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-sm text-[#f5e6b8] tracking-wider bg-[#101116] px-2.5 py-1 rounded-lg border border-[#c9a227]/30">
                            {c.displayCode || c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(c.code)}
                            className="p-1.5 rounded-lg bg-[#0b1930] text-[#c9a227] border border-[#c9a227]/30"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(c)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            c.active
                              ? "bg-emerald-950/70 text-emerald-400 border-emerald-500/40"
                              : "bg-red-950/70 text-red-400 border-red-500/40"
                          }`}
                        >
                          {c.active ? "Ativo" : "Inativo"}
                        </button>
                      </div>

                      <div>
                        <div className="font-bold text-sm text-[#f6f8fc]">{c.influencerName}</div>
                        <div className="text-xs text-[#a8b2c3] mt-0.5">
                          {c.influencerInstagram && <span>@{c.influencerInstagram.replace("@", "")} • </span>}
                          <span>Benefício: </span>
                          <strong className="text-emerald-400">
                            {c.discountType === "percentage"
                              ? `${c.discountValue}% OFF`
                              : c.discountType === "fixed"
                              ? `R$ ${c.discountValue.toFixed(2)} OFF`
                              : "Rastreamento Puro (0%)"}
                          </strong>
                        </div>
                      </div>

                      {/* Grade de estatísticas compacta */}
                      <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-[#101116] text-center text-xs">
                        <div>
                          <div className="text-[10px] text-[#a8b2c3]">Vendas</div>
                          <div className="font-extrabold text-emerald-400">{c.soldCount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#a8b2c3]">Desistências</div>
                          <div className="font-bold text-amber-400">{c.appliedNotBoughtCount}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#a8b2c3]">Conversão</div>
                          <div className="font-extrabold text-[#f5e6b8]">{c.conversionRate}%</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-[#0b1930]">
                        <span className="text-[#a8b2c3]">
                          Limite: <strong className="text-[#f6f8fc]">{limitDisplay}</strong>
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(c)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#0b1930] hover:bg-[#c9a227]/20 text-[#f5e6b8] border border-[#c9a227]/30 flex items-center gap-1"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Compradores</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(c)}
                            className="p-1.5 rounded-lg bg-[#0b1930] text-[#a8b2c3] hover:text-[#f6f8fc]"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(c)}
                            className="p-1.5 rounded-lg bg-[#0b1930] text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================
          CONTEÚDO DA SUB-ABA 2: RANKING DE VENDAS
          ======================================================== */}
      {subTab === "ranking" && (
        <div className="space-y-6">
          {/* Seletor de Métrica do Ranking */}
          <div className="flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl bg-[#0b1930]/40 border border-[#c9a227]/30">
            <div>
              <h4 className="text-sm font-bold text-[#f6f8fc] flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#c9a227]" />
                <span>Classificação de Desempenho dos Influenciadores</span>
              </h4>
              <p className="text-xs text-[#a8b2c3] mt-0.5">
                Acompanhe quem mais converte ingressos e engaja o público do festival.
              </p>
            </div>

            <div className="w-full sm:w-auto">
              <CustomDropdown
                value={rankingMetric}
                onChange={(val) => setRankingMetric(val as any)}
                options={rankingMetricOptions}
                size="md"
                buttonClassName="min-w-[240px] rounded-xl"
              />
            </div>
          </div>

          {sortedRanking.length === 0 ? (
            <div className="p-10 rounded-2xl bg-[#0b1930]/30 border border-[#c9a227]/20 text-center">
              <Trophy className="w-10 h-10 text-[#c9a227]/40 mx-auto mb-3" />
              <h4 className="text-base font-bold text-[#f6f8fc]">Nenhum influenciador ranqueado</h4>
              <p className="text-xs text-[#a8b2c3] max-w-sm mx-auto mt-1">
                Gere cupons e compartilhe com os influenciadores para acompanhar o pódio em tempo real.
              </p>
            </div>
          ) : (
            <>
              {/* PÓDIO TOP 3 VISUAL */}
              {sortedRanking.length >= 2 && (
                <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto pt-6 pb-2">
                  {/* #2 Prata */}
                  {sortedRanking[1] && (
                    <div className="text-center order-1">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 rounded-2xl bg-slate-300/10 border-2 border-slate-300/40 flex items-center justify-center text-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.2)]">
                        <Medal className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      <div className="font-extrabold text-xs sm:text-sm text-[#f6f8fc] truncate px-1">
                        {sortedRanking[1].influencerName}
                      </div>
                      <span className="font-mono text-[10px] sm:text-xs text-slate-300 font-bold">
                        {sortedRanking[1].displayCode}
                      </span>
                      <div className="h-24 sm:h-28 mt-2 rounded-t-2xl bg-gradient-to-t from-slate-400/20 to-slate-400/5 border-t-2 border-slate-300 flex flex-col items-center justify-center p-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-300">2º Lugar</span>
                        <span className="text-xs sm:text-base font-extrabold text-[#f6f8fc]">
                          {rankingMetric === "soldCount" && `${sortedRanking[1].soldCount} vendas`}
                          {rankingMetric === "totalRevenue" && `R$ ${sortedRanking[1].totalRevenue.toFixed(0)}`}
                          {rankingMetric === "conversionRate" && `${sortedRanking[1].conversionRate}%`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* #1 Ouro (Líder em Destaque) */}
                  {sortedRanking[0] && (
                    <div className="text-center order-2">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2 rounded-2xl bg-[#c9a227]/25 border-2 border-[#c9a227] flex items-center justify-center text-[#f5e6b8] shadow-[0_0_30px_rgba(201,162,39,0.5)] animate-pulse">
                        <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-[#f5e6b8]" />
                      </div>
                      <div className="font-extrabold text-sm sm:text-base text-[#f5e6b8] truncate px-1">
                        {sortedRanking[0].influencerName}
                      </div>
                      <span className="font-mono text-xs sm:text-sm text-[#c9a227] font-extrabold">
                        {sortedRanking[0].displayCode}
                      </span>
                      <div className="h-32 sm:h-36 mt-2 rounded-t-2xl bg-gradient-to-t from-[#c9a227]/30 to-[#f5e6b8]/10 border-t-2 border-[#c9a227] flex flex-col items-center justify-center p-2">
                        <span className="text-xs sm:text-sm font-bold text-[#f5e6b8]">👑 1º Lugar</span>
                        <span className="text-sm sm:text-xl font-extrabold text-[#f6f8fc]">
                          {rankingMetric === "soldCount" && `${sortedRanking[0].soldCount} vendas`}
                          {rankingMetric === "totalRevenue" && `R$ ${sortedRanking[0].totalRevenue.toFixed(0)}`}
                          {rankingMetric === "conversionRate" && `${sortedRanking[0].conversionRate}%`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* #3 Bronze */}
                  {sortedRanking[2] && (
                    <div className="text-center order-3">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 rounded-2xl bg-amber-700/10 border-2 border-amber-600/40 flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(217,119,6,0.2)]">
                        <Medal className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                      <div className="font-extrabold text-xs sm:text-sm text-[#f6f8fc] truncate px-1">
                        {sortedRanking[2].influencerName}
                      </div>
                      <span className="font-mono text-[10px] sm:text-xs text-amber-500 font-bold">
                        {sortedRanking[2].displayCode}
                      </span>
                      <div className="h-20 sm:h-24 mt-2 rounded-t-2xl bg-gradient-to-t from-amber-600/20 to-amber-600/5 border-t-2 border-amber-500 flex flex-col items-center justify-center p-2">
                        <span className="text-xs sm:text-sm font-bold text-amber-400">3º Lugar</span>
                        <span className="text-xs sm:text-base font-extrabold text-[#f6f8fc]">
                          {rankingMetric === "soldCount" && `${sortedRanking[2].soldCount} vendas`}
                          {rankingMetric === "totalRevenue" && `R$ ${sortedRanking[2].totalRevenue.toFixed(0)}`}
                          {rankingMetric === "conversionRate" && `${sortedRanking[2].conversionRate}%`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* LISTA COMPLETA ORDENADA */}
              <div className="rounded-2xl bg-[#0b1930]/40 border border-[#c9a227]/30 divide-y divide-[#0b1930] overflow-hidden">
                {sortedRanking.map((item) => {
                  const currentValue =
                    rankingMetric === "soldCount"
                      ? item.soldCount
                      : rankingMetric === "totalRevenue"
                      ? item.totalRevenue
                      : item.conversionRate;

                  const percentOfLeader = Math.round((currentValue / maxRankingValue) * 100);

                  return (
                    <div
                      key={item.code}
                      className="p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Posição */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 ${
                          item.position === 1
                            ? "bg-gradient-to-br from-[#c9a227] to-[#f5e6b8] text-[#07090d] shadow-[0_0_12px_rgba(201,162,39,0.5)]"
                            : item.position === 2
                            ? "bg-slate-300 text-slate-900"
                            : item.position === 3
                            ? "bg-amber-600 text-white"
                            : "bg-[#101116] border border-[#c9a227]/20 text-[#a8b2c3]"
                        }`}
                      >
                        #{item.position}
                      </div>

                      {/* Dados do Criador e Barra de Progresso */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-bold text-sm text-[#f6f8fc] truncate">
                              {item.influencerName}
                            </span>
                            <span className="font-mono text-xs text-[#f5e6b8] bg-[#101116] px-2 py-0.5 rounded border border-[#c9a227]/30">
                              {item.displayCode}
                            </span>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="font-extrabold text-sm text-emerald-400">
                              {item.soldCount} vendas
                            </span>
                            <span className="text-xs text-[#a8b2c3] ml-2">
                              (R$ {item.totalRevenue.toFixed(2).replace(".", ",")})
                            </span>
                          </div>
                        </div>

                        {/* Barra relativa ao líder */}
                        <div className="w-full h-2 rounded-full bg-[#101116] overflow-hidden border border-white/5">
                          <div
                            className={`h-full transition-all duration-500 ${
                              item.position === 1
                                ? "bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227]"
                                : "bg-gradient-to-r from-[#0b1930] to-[#c9a227]"
                            }`}
                            style={{ width: `${Math.max(4, percentOfLeader)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-[#a8b2c3] mt-1">
                          <span>Conversão: <strong className="text-[#f6f8fc]">{item.conversionRate}%</strong></span>
                          <span>Não compraram: <strong className="text-amber-400">{item.appliedNotBoughtCount}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================
          MODAL: NOVO / EDITAR CUPOM
          ======================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg my-8 rounded-3xl bg-[#101116] border-2 border-[#c9a227]/40 p-6 sm:p-8 text-[#f6f8fc] shadow-[0_0_50px_rgba(201,162,39,0.25)] max-h-[92vh] overflow-y-auto">
            {/* Fechar */}
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-[#0b1930] hover:bg-[#c9a227]/20 text-[#a8b2c3] hover:text-[#f6f8fc] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-5 h-5 text-[#c9a227]" />
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#f6f8fc]">
                {isEditing ? "Editar Cupom" : "Novo Cupom de Influenciador"}
              </h3>
            </div>
            <p className="text-xs text-[#a8b2c3] mb-6">
              Configure o código, regras de desconto e rastreamento para o criador.
            </p>

            {formError && (
              <div className="mb-4 p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              {/* Código do Cupom */}
              <div>
                <label className="block text-xs font-bold text-[#f6f8fc] mb-1">
                  Código do Cupom *
                </label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  disabled={isEditing}
                  placeholder="Ex: LIPE10"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0b1930] border border-[#c9a227]/30 text-xs sm:text-sm font-mono tracking-wider text-[#f5e6b8] font-bold focus:outline-none focus:border-[#c9a227] disabled:opacity-50"
                  required
                />
                <span className="text-[10px] text-[#a8b2c3] mt-0.5 block">
                  Sem espaços ou acentos. O comprador pode digitar maiúsculo ou minúsculo.
                </span>
              </div>

              {/* Nome do Influenciador */}
              <div>
                <label className="block text-xs font-bold text-[#f6f8fc] mb-1">
                  Nome do Influenciador(a) *
                </label>
                <input
                  type="text"
                  value={formInfluencerName}
                  onChange={(e) => setFormInfluencerName(e.target.value)}
                  placeholder="Ex: DJ Lipe ou Nome da Produtora"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0b1930] border border-[#c9a227]/30 text-xs sm:text-sm text-[#f6f8fc] focus:outline-none focus:border-[#c9a227]"
                  required
                />
              </div>

              {/* Contatos (WhatsApp e Instagram) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#a8b2c3] mb-1">
                    WhatsApp do Influenciador
                  </label>
                  <input
                    type="text"
                    value={formInfluencerPhone}
                    onChange={(e) => setFormInfluencerPhone(e.target.value)}
                    placeholder="Ex: (34) 99999-9999"
                    className="w-full h-10 px-3 rounded-xl bg-[#0b1930] border border-[#c9a227]/30 text-xs text-[#f6f8fc] focus:outline-none focus:border-[#c9a227]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#a8b2c3] mb-1">
                    Instagram (@handle)
                  </label>
                  <input
                    type="text"
                    value={formInfluencerInstagram}
                    onChange={(e) => setFormInfluencerInstagram(e.target.value)}
                    placeholder="Ex: @djlipe"
                    className="w-full h-10 px-3 rounded-xl bg-[#0b1930] border border-[#c9a227]/30 text-xs text-[#f6f8fc] focus:outline-none focus:border-[#c9a227]"
                  />
                </div>
              </div>

              {/* Tipo de Desconto */}
              <div>
                <label className="block text-xs font-bold text-[#f6f8fc] mb-1">
                  Benefício / Desconto Aplicado *
                </label>
                <CustomDropdown
                  value={formDiscountType}
                  onChange={(val) => setFormDiscountType(val as any)}
                  options={discountTypeOptions}
                  size="md"
                  buttonClassName="h-11 rounded-xl"
                />
              </div>

              {/* Valor do Desconto */}
              {formDiscountType !== "none" && (
                <div>
                  <label className="block text-xs font-bold text-[#f6f8fc] mb-1">
                    {formDiscountType === "percentage" ? "Porcentagem (%) de Desconto *" : "Valor Fixo em Reais (R$) *"}
                  </label>
                  <NumberInput
                    value={formDiscountValue}
                    onChange={(val) => setFormDiscountValue(val)}
                    min={1}
                    max={formDiscountType === "percentage" ? 100 : 500}
                    step={formDiscountType === "percentage" ? 1 : 5}
                    suffixText={formDiscountType === "percentage" ? "%" : undefined}
                    prefixText={formDiscountType === "fixed" ? "R$" : undefined}
                    className="h-11 rounded-xl"
                  />
                  <span className="text-[10px] text-[#a8b2c3] mt-0.5 block">
                    {formDiscountType === "percentage"
                      ? "Calculado automaticamente sobre o preço ativo do lote no checkout."
                      : "Subtraído do total. O sistema garante o piso mínimo de R$ 1,00 para compensação no Mercado Pago."}
                  </span>
                </div>
              )}

              {/* Limite de Usos */}
              <div className="p-3.5 rounded-2xl bg-[#0b1930]/60 border border-[#c9a227]/20 space-y-3">
                <Checkbox
                  checked={formIsUnlimited}
                  onCheckedChange={(checked) => setFormIsUnlimited(Boolean(checked))}
                  label={<span className="font-bold text-xs text-[#f6f8fc]">Sem Limite de Usos (Ilimitado)</span>}
                  description={<span className="text-[11px] text-[#a8b2c3]">O cupom poderá ser utilizado enquanto o lote de ingressos estiver disponível.</span>}
                />

                {!formIsUnlimited && (
                  <div className="pt-2 border-t border-[#0b1930]">
                    <label className="block text-xs font-bold text-[#f6f8fc] mb-1">
                      Quantidade Máxima de Compras Aprovadas
                    </label>
                    <NumberInput
                      value={formMaxUses}
                      onChange={(val) => setFormMaxUses(val)}
                      min={1}
                      max={10000}
                      step={5}
                      className="h-10 rounded-xl"
                    />
                    <span className="text-[10px] text-[#a8b2c3] mt-0.5 block">
                      Apenas compras com pagamento confirmado consomem a cota.
                    </span>
                  </div>
                )}
              </div>

              {/* Status Ativo */}
              <div className="p-3.5 rounded-2xl bg-[#0b1930]/60 border border-[#c9a227]/20">
                <Checkbox
                  checked={formActive}
                  onCheckedChange={(checked) => setFormActive(Boolean(checked))}
                  label={<span className="font-bold text-xs text-[#f6f8fc]">Cupom Ativo para Compras</span>}
                  description={<span className="text-[11px] text-[#a8b2c3]">Se desmarcado, compradores que tentarem aplicar verão a mensagem de cupom indisponível.</span>}
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#0b1930]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingCoupon}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-[#07090d] bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] hover:brightness-110 shadow-[0_0_20px_rgba(201,162,39,0.3)] disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {savingCoupon ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>{isEditing ? "Salvar Alterações" : "Criar Cupom"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: DETALHES & COMPRADORES DO CUPOM
          ======================================================== */}
      {detailsModalOpen && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8 rounded-3xl bg-[#101116] border-2 border-[#c9a227]/40 p-6 sm:p-8 text-[#f6f8fc] shadow-[0_0_50px_rgba(201,162,39,0.3)] max-h-[92vh] overflow-y-auto">
            {/* Fechar */}
            <button
              type="button"
              onClick={() => setDetailsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-[#0b1930] hover:bg-[#c9a227]/20 text-[#a8b2c3] hover:text-[#f6f8fc] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho do Cupom Selecionado */}
            <div className="flex items-start justify-between flex-wrap gap-3 pb-5 border-b border-[#0b1930] mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-base sm:text-lg text-[#f5e6b8] bg-[#0b1930] px-3 py-1 rounded-xl border border-[#c9a227]/40">
                    {selectedCoupon.displayCode || selectedCoupon.code}
                  </span>
                  <GlowBadge variant={selectedCoupon.active ? "emerald" : "red"} size="sm">
                    {selectedCoupon.active ? "Ativo" : "Inativo"}
                  </GlowBadge>
                </div>
                <h3 className="text-xl font-extrabold text-[#f6f8fc] mt-2">
                  {selectedCoupon.influencerName}
                </h3>
                <p className="text-xs text-[#a8b2c3] mt-0.5">
                  {selectedCoupon.influencerInstagram && `@${selectedCoupon.influencerInstagram.replace("@", "")} • `}
                  {selectedCoupon.influencerPhone && `${selectedCoupon.influencerPhone} • `}
                  Link: <span className="font-mono text-[#f5e6b8]">/?cupom={selectedCoupon.code}</span>
                </p>
              </div>

              {/* Botão Copiar Link Direto */}
              <button
                type="button"
                onClick={() => handleCopyLink(selectedCoupon.code)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#07090d] bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] hover:opacity-95 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Link</span>
              </button>
            </div>

            {/* Resumo Rápido */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 p-3 rounded-2xl bg-[#0b1930]/60 border border-[#c9a227]/20 text-center">
              <div>
                <span className="text-[10px] text-[#a8b2c3]">Ingressos Vendidos</span>
                <div className="text-base sm:text-lg font-extrabold text-emerald-400">
                  {selectedCoupon.soldCount}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-[#a8b2c3]">Receita Gerada</span>
                <div className="text-base sm:text-lg font-extrabold text-[#f5e6b8]">
                  R$ {selectedCoupon.totalRevenue.toFixed(2).replace(".", ",")}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-[#a8b2c3]">Não Concluíram</span>
                <div className="text-base sm:text-lg font-extrabold text-amber-400">
                  {selectedCoupon.appliedNotBoughtCount}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-[#a8b2c3]">Taxa de Conversão</span>
                <div className="text-base sm:text-lg font-extrabold text-[#f6f8fc]">
                  {selectedCoupon.conversionRate}%
                </div>
              </div>
            </div>

            {/* Tabs Internas: Compradores vs Abandonos */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0b1930] border border-[#c9a227]/30 mb-5">
              <button
                type="button"
                onClick={() => setDetailsActiveTab("purchases")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  detailsActiveTab === "purchases"
                    ? "bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d]"
                    : "text-[#a8b2c3] hover:text-[#f6f8fc]"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Compradores Oficiais ({detailsPurchases.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setDetailsActiveTab("abandoned")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  detailsActiveTab === "abandoned"
                    ? "bg-gradient-to-r from-[#c9a227] to-[#f5e6b8] text-[#07090d]"
                    : "text-[#a8b2c3] hover:text-[#f6f8fc]"
                }`}
              >
                <AlertCircle className="w-4 h-4" />
                <span>Aplicaram e Não Compraram ({detailsAbandoned.length})</span>
              </button>
            </div>

            {detailsLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 text-[#c9a227] animate-spin mx-auto mb-2" />
                <p className="text-xs text-[#a8b2c3]">Consultando histórico nominal no banco de dados...</p>
              </div>
            ) : detailsActiveTab === "purchases" ? (
              /* TAB 1: LISTA NOMINAL DE COMPRADORES */
              detailsPurchases.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#a8b2c3] bg-[#0b1930]/30 rounded-2xl border border-white/5">
                  Nenhum ingresso emitido com este cupom até o momento.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#c9a227]/20">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0b1930] text-[#a8b2c3] uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Comprador</th>
                        <th className="py-2.5 px-3">CPF</th>
                        <th className="py-2.5 px-3">Ingresso</th>
                        <th className="py-2.5 px-3">Valor Pago</th>
                        <th className="py-2.5 px-3">Método</th>
                        <th className="py-2.5 px-3 text-right">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0b1930] text-[#f6f8fc]">
                      {detailsPurchases.map((p) => (
                        <tr key={p.ticketId} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3">
                            <div className="font-bold">{p.userName}</div>
                            <div className="text-[10px] text-[#a8b2c3]">{p.userEmail}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-[#a8b2c3]">
                            {p.userCpf ? p.userCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.***.***-$4") : "—"}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[#f5e6b8] font-bold text-[11px]">
                            {p.ticketId}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-emerald-400">
                              R$ {p.finalPrice.toFixed(2).replace(".", ",")}
                            </span>
                            {p.discountAmount > 0 && (
                              <div className="text-[10px] text-[#a8b2c3]">
                                - R$ {p.discountAmount.toFixed(2).replace(".", ",")}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0b1930] text-[#f5e6b8] uppercase">
                              {p.paymentMethod === "credit_card" ? "Cartão" : "PIX"}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right text-[11px] text-[#a8b2c3]">
                            {p.purchasedAt ? new Date(p.purchasedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              /* TAB 2: QUEM APLICOU E NÃO COMPROU */
              detailsAbandoned.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#a8b2c3] bg-[#0b1930]/30 rounded-2xl border border-white/5">
                  Nenhum carrinho abandonado registrado para este cupom.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-[#c9a227]/20">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0b1930] text-[#a8b2c3] uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Usuário</th>
                        <th className="py-2.5 px-3">E-mail</th>
                        <th className="py-2.5 px-3 text-center">Tentativas</th>
                        <th className="py-2.5 px-3">Última Aplicação</th>
                        <th className="py-2.5 px-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0b1930] text-[#f6f8fc]">
                      {detailsAbandoned.map((a, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 font-bold">{a.userName || "Usuário"}</td>
                          <td className="py-2.5 px-3 text-[#a8b2c3] font-mono text-[11px]">
                            {a.userEmail || "—"}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-amber-400">
                            {a.appliedCount}x
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-[#a8b2c3]">
                            {a.lastAppliedAt ? new Date(a.lastAppliedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—"}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {a.userEmail && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (a.userEmail) {
                                    navigator.clipboard.writeText(a.userEmail);
                                    showToast(`E-mail ${a.userEmail} copiado!`);
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#0b1930] hover:bg-[#c9a227]/20 text-[#c9a227] border border-[#c9a227]/30 inline-flex items-center gap-1"
                              >
                                <Mail className="w-3 h-3" />
                                <span>Copiar E-mail</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
