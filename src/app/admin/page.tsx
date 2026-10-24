"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminGeneralTab } from "@/components/admin/AdminGeneralTab";
import { AdminTicketsTab } from "@/components/admin/AdminTicketsTab";
import { AdminCourtesiesTab } from "@/components/admin/AdminCourtesiesTab";
import { AdminUsersTab } from "@/components/admin/AdminUsersTab";
import { AdminSettingsTab } from "@/components/admin/AdminSettingsTab";
import {
  BarChart3,
  Ticket,
  Gift,
  Users,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { EventConfig } from "@/types/config";

const MASTER_ADMIN_EMAIL = "vitorhugonascimentosique@gmail.com";

type AdminMainTab = "geral" | "ingressos" | "cortesias" | "usuarios" | "configuracoes";

export default function AdminPage() {
  const { user, profile, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AdminMainTab>("geral");
  const [refreshing, setRefreshing] = useState(false);

  // Estados de Dados do Admin
  const [metrics, setMetrics] = useState<any>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Ingressos
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketsPage, setTicketsPage] = useState(1);
  const [ticketsTotalPages, setTicketsTotalPages] = useState(1);
  const [ticketsTotalCount, setTicketsTotalCount] = useState(0);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketSector, setTicketSector] = useState("all");
  const [ticketStatus, setTicketStatus] = useState("all");

  // Cortesias
  const [courtesies, setCourtesies] = useState<any[]>([]);
  const [courtesiesPage, setCourtesiesPage] = useState(1);
  const [courtesiesTotalPages, setCourtesiesTotalPages] = useState(1);
  const [courtesiesTotalCount, setCourtesiesTotalCount] = useState(0);
  const [courtesiesLoading, setCourtesiesLoading] = useState(false);
  const [courtesySearch, setCourtesySearch] = useState("");

  // Usuários
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersTotalCount, setUsersTotalCount] = useState(0);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");

  // Configurações
  const [config, setConfig] = useState<EventConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(false);

  // Toast flutuante interno de notificações do painel
  const [adminToast, setAdminToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setAdminToast({ message, type });
    setTimeout(() => setAdminToast(null), 4000);
  };

  // Helper para obter o ID Token autenticado do Firebase
  const getIdToken = useCallback(async (): Promise<string> => {
    if (!user) throw new Error("Usuário não autenticado");
    return await user.getIdToken(true);
  }, [user]);

  // ===============================================================
  // 1. GUARDIÃO DE ACESSO RESTRITO AO /admin
  // ===============================================================
  useEffect(() => {
    if (authLoading) return;

    const email = (user?.email || "").toLowerCase().trim();
    const isMaster = email === MASTER_ADMIN_EMAIL.toLowerCase();
    const isAdmin = profile?.role === "admin" || isMaster;

    // Se não estiver logado ou não for admin: redireciona para a home com a mensagem "tentou ser espertinho né?"
    if (!user || !isAdmin) {
      router.replace("/?toast=espertinho");
    }
  }, [user, profile, authLoading, router]);

  // ===============================================================
  // 2. CARREGAMENTO DAS MÉTRICAS GERAIS
  // ===============================================================
  const loadMetrics = useCallback(async () => {
    if (!user) return;
    setMetricsLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/metrics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.metrics) {
        setMetrics(data.metrics);
      } else {
        showToast(data.error || "Erro ao carregar métricas.", "error");
      }
    } catch (err: any) {
      console.error("[Load Metrics Error]:", err);
    } finally {
      setMetricsLoading(false);
    }
  }, [user, getIdToken]);

  // ===============================================================
  // 3. CARREGAMENTO DE INGRESSOS
  // ===============================================================
  const loadTickets = useCallback(
    async (pageToLoad = ticketsPage, search = ticketSearch, sector = ticketSector, status = ticketStatus) => {
      if (!user) return;
      setTicketsLoading(true);
      try {
        const token = await getIdToken();
        const params = new URLSearchParams({
          page: String(pageToLoad),
          limit: "50",
          search,
          sector,
          status,
          type: "paid",
        });

        const res = await fetch(`/api/admin/tickets?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setTickets(data.tickets || []);
          setTicketsTotalPages(data.totalPages || 1);
          setTicketsTotalCount(data.totalTickets || 0);
          setTicketsPage(data.page || 1);
        }
      } catch (err) {
        console.error("[Load Tickets Error]:", err);
      } finally {
        setTicketsLoading(false);
      }
    },
    [user, ticketsPage, ticketSearch, ticketSector, ticketStatus, getIdToken]
  );

  // ===============================================================
  // 4. CARREGAMENTO DE CORTESIAS
  // ===============================================================
  const loadCourtesies = useCallback(
    async (pageToLoad = courtesiesPage, search = courtesySearch) => {
      if (!user) return;
      setCourtesiesLoading(true);
      try {
        const token = await getIdToken();
        const params = new URLSearchParams({
          page: String(pageToLoad),
          limit: "50",
          search,
          type: "courtesy",
        });

        const res = await fetch(`/api/admin/tickets?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setCourtesies(data.tickets || []);
          setCourtesiesTotalPages(data.totalPages || 1);
          setCourtesiesTotalCount(data.totalTickets || 0);
          setCourtesiesPage(data.page || 1);
        }
      } catch (err) {
        console.error("[Load Courtesies Error]:", err);
      } finally {
        setCourtesiesLoading(false);
      }
    },
    [user, courtesiesPage, courtesySearch, getIdToken]
  );

  // ===============================================================
  // 5. CARREGAMENTO DE USUÁRIOS
  // ===============================================================
  const loadUsers = useCallback(
    async (pageToLoad = usersPage, search = userSearch, role = userRoleFilter) => {
      if (!user) return;
      setUsersLoading(true);
      try {
        const token = await getIdToken();
        const params = new URLSearchParams({
          page: String(pageToLoad),
          limit: "50",
          search,
          role,
        });

        const res = await fetch(`/api/admin/users?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUsersList(data.users || []);
          setUsersTotalPages(data.totalPages || 1);
          setUsersTotalCount(data.totalUsers || 0);
          setUsersPage(data.page || 1);
        }
      } catch (err) {
        console.error("[Load Users Error]:", err);
      } finally {
        setUsersLoading(false);
      }
    },
    [user, usersPage, userSearch, userRoleFilter, getIdToken]
  );

  // ===============================================================
  // 6. CARREGAMENTO DE CONFIGURAÇÕES
  // ===============================================================
  const loadConfig = useCallback(async () => {
    setConfigLoading(true);
    try {
      const res = await fetch("/api/admin/config");
      const data = await res.json();
      if (res.ok && data.config) {
        setConfig(data.config);
      }
    } catch (err) {
      console.error("[Load Config Error]:", err);
    } finally {
      setConfigLoading(false);
    }
  }, []);

  // Recarrega todos os dados
  const handleRefreshAll = async () => {
    setRefreshing(true);
    await Promise.all([
      loadMetrics(),
      loadTickets(ticketsPage),
      loadCourtesies(courtesiesPage),
      loadUsers(usersPage),
      loadConfig(),
    ]);
    setRefreshing(false);
    showToast("Dados do painel atualizados!", "success");
  };

  // Carregamento inicial ao montar com permissão
  useEffect(() => {
    if (user && (profile?.role === "admin" || user.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase())) {
      loadMetrics();
      loadTickets(1);
      loadCourtesies(1);
      loadUsers(1);
      loadConfig();
    }
  }, [user, profile, loadMetrics, loadTickets, loadCourtesies, loadUsers, loadConfig]);

  // ===============================================================
  // AÇÕES NOS INGRESSOS (REVOGAR, VALIDAR, TRANSFERIR)
  // ===============================================================
  const handleTicketAction = async (
    ticketId: string,
    action: "revoke" | "validate" | "transfer" | "delete",
    targetUserEmail?: string
  ): Promise<boolean> => {
    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/tickets/action", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketId, action, targetUserEmail }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(data.message || "Ação executada com sucesso!", "success");
        // Atualiza listas e métricas
        loadTickets();
        loadCourtesies();
        loadMetrics();
        return true;
      } else {
        showToast(data.error || "Falha ao processar ação.", "error");
        return false;
      }
    } catch (err: any) {
      showToast(err?.message || "Erro de conexão.", "error");
      return false;
    }
  };

  // Validador de Scanner de Portaria
  const handleVerifyScanner = async (rawCode: string) => {
    const token = await getIdToken();
    const res = await fetch("/api/admin/scanner/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ rawCode }),
    });
    return await res.json();
  };

  // Emitir Cortesia VIP
  const handleIssueCourtesy = async (userEmail: string, sector: string, note?: string): Promise<boolean> => {
    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/courtesies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userEmail, sector, note }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(data.message, "success");
        loadCourtesies();
        loadMetrics();
        return true;
      } else {
        showToast(data.error || "Falha ao emitir cortesia.", "error");
        return false;
      }
    } catch (err: any) {
      showToast(err?.message || "Erro de conexão.", "error");
      return false;
    }
  };

  // Atualizar Role de Usuário
  const handleUpdateRole = async (userId: string, email: string, newRole: "user" | "admin" | "staff"): Promise<boolean> => {
    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: userId, targetEmail: email, newRole }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(data.message, "success");
        loadUsers();
        return true;
      } else {
        showToast(data.error || "Falha ao alterar cargo.", "error");
        return false;
      }
    } catch (err: any) {
      showToast(err?.message || "Erro de conexão.", "error");
      return false;
    }
  };

  // Salvar Configurações
  const handleSaveConfig = async (updatedConfig: EventConfig): Promise<boolean> => {
    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedConfig),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(data.message, "success");
        setConfig(data.config);
        return true;
      } else {
        showToast(data.error || "Falha ao salvar configurações.", "error");
        return false;
      }
    } catch (err: any) {
      showToast(err?.message || "Erro de conexão.", "error");
      return false;
    }
  };

  // Se estiver avaliando permissões ou redirecionando curiosos
  if (authLoading || !user || (profile?.role !== "admin" && user.email?.toLowerCase() !== MASTER_ADMIN_EMAIL.toLowerCase())) {
    return (
      <div className="min-h-screen bg-[#07090d] flex flex-col items-center justify-center p-6 gap-3">
        <div className="w-10 h-10 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-[0.25em] text-[#a8b2c3] font-semibold">
          Autenticando sessão administrativa...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090d] text-[#f6f8fc] flex flex-col relative selection:bg-[#c9a227] selection:text-[#07090d]">
      {/* Background Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#c9a227]/10 via-[#0b1930]/30 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* HEADER FIXO DO ADMIN */}
      <AdminHeader
        adminEmail={user.email || ""}
        adminName={profile?.nome || "Administrador Master"}
        onRefreshAll={handleRefreshAll}
        onLogout={() => {
          logout();
          router.replace("/");
        }}
        refreshing={refreshing}
      />

      {/* TOAST DE NOTIFICAÇÃO FLUTUANTE */}
      {adminToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-xs font-bold flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-200 ${
            adminToast.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300"
              : "bg-red-500/15 border-red-500/50 text-red-300"
          }`}
        >
          <span>{adminToast.message}</span>
        </div>
      )}

      {/* CONTAINER PRINCIPAL */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 space-y-6">
        {/* BARRA DE NAVEGAÇÃO DAS 5 ABAS PRINCIPAIS */}
        <div className="p-1.5 rounded-2xl bg-[#101116] border border-[#0b1930] shadow-[0_4px_25px_rgba(0,0,0,0.7)] grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap items-center gap-1.5">
          {/* Aba 1: Geral */}
          <button
            type="button"
            onClick={() => setActiveTab("geral")}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "geral"
                ? "bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] text-[#07090d] shadow-[0_0_15px_rgba(201,162,39,0.3)]"
                : "text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-white/5"
            }`}
          >
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Métricas</span>
          </button>

          {/* Aba 2: Ingressos */}
          <button
            type="button"
            onClick={() => setActiveTab("ingressos")}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "ingressos"
                ? "bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] text-[#07090d] shadow-[0_0_15px_rgba(201,162,39,0.3)]"
                : "text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-white/5"
            }`}
          >
            <Ticket className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Ingressos ({ticketsTotalCount})</span>
          </button>

          {/* Aba 3: Cortesias */}
          <button
            type="button"
            onClick={() => setActiveTab("cortesias")}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "cortesias"
                ? "bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] text-[#07090d] shadow-[0_0_15px_rgba(201,162,39,0.3)]"
                : "text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-white/5"
            }`}
          >
            <Gift className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Cortesias ({courtesiesTotalCount})</span>
          </button>

          {/* Aba 4: Usuários */}
          <button
            type="button"
            onClick={() => setActiveTab("usuarios")}
            className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "usuarios"
                ? "bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] text-[#07090d] shadow-[0_0_15px_rgba(201,162,39,0.3)]"
                : "text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-white/5"
            }`}
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Usuários ({usersTotalCount})</span>
          </button>

          {/* Aba 5: Configurações */}
          <button
            type="button"
            onClick={() => setActiveTab("configuracoes")}
            className={`col-span-2 sm:col-span-1 lg:ml-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === "configuracoes"
                ? "bg-gradient-to-r from-[#c9a227] via-[#f5e6b8] to-[#c9a227] text-[#07090d] shadow-[0_0_15px_rgba(201,162,39,0.3)]"
                : "text-[#a8b2c3] hover:text-[#f6f8fc] hover:bg-white/5"
            }`}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">Configurações</span>
          </button>
        </div>

        {/* ========================================================
            CONTEÚDO DA ABA SELECIONADA
            ======================================================== */}
        {activeTab === "geral" && (
          <AdminGeneralTab metrics={metrics} loading={metricsLoading} />
        )}

        {activeTab === "ingressos" && (
          <AdminTicketsTab
            tickets={tickets}
            page={ticketsPage}
            totalPages={ticketsTotalPages}
            totalTickets={ticketsTotalCount}
            loading={ticketsLoading}
            onPageChange={(newPage) => {
              setTicketsPage(newPage);
              loadTickets(newPage);
            }}
            onSearchChange={(search) => {
              setTicketSearch(search);
              loadTickets(1, search);
            }}
            onSectorFilterChange={(sector) => {
              setTicketSector(sector);
              loadTickets(1, ticketSearch, sector);
            }}
            onStatusFilterChange={(status) => {
              setTicketStatus(status);
              loadTickets(1, ticketSearch, ticketSector, status);
            }}
            onAction={handleTicketAction}
            onVerifyScanner={handleVerifyScanner}
          />
        )}

        {activeTab === "cortesias" && (
          <AdminCourtesiesTab
            courtesies={courtesies}
            page={courtesiesPage}
            totalPages={courtesiesTotalPages}
            totalCourtesies={courtesiesTotalCount}
            maxCourtesies={config?.cortesias?.totalAvailable || 150}
            loading={courtesiesLoading}
            onPageChange={(newPage) => {
              setCourtesiesPage(newPage);
              loadCourtesies(newPage);
            }}
            onSearchChange={(search) => {
              setCourtesySearch(search);
              loadCourtesies(1, search);
            }}
            onIssueCourtesy={handleIssueCourtesy}
            onAction={handleTicketAction}
          />
        )}

        {activeTab === "usuarios" && (
          <AdminUsersTab
            users={usersList}
            page={usersPage}
            totalPages={usersTotalPages}
            totalUsers={usersTotalCount}
            loading={usersLoading}
            onPageChange={(newPage) => {
              setUsersPage(newPage);
              loadUsers(newPage);
            }}
            onSearchChange={(search) => {
              setUserSearch(search);
              loadUsers(1, search);
            }}
            onRoleFilterChange={(role) => {
              setUserRoleFilter(role);
              loadUsers(1, userSearch, role);
            }}
            onUpdateRole={handleUpdateRole}
          />
        )}

        {activeTab === "configuracoes" && (
          <AdminSettingsTab
            initialConfig={config}
            loading={configLoading}
            onSaveConfig={handleSaveConfig}
          />
        )}
      </main>
    </div>
  );
}
