import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdminRequest } from "@/lib/auth/adminAuth";

export async function GET(req: NextRequest) {
  try {
    await verifyAdminRequest(req);
    const db = await getAdminDb();

    // 1. Busca todos os ingressos
    const ticketsSnap = await db.collection("ingressos").get();

    let totalSoldTickets = 0;
    let totalRevenue = 0;
    let totalCourtesies = 0;
    let totalCancelled = 0;
    let totalUsed = 0;

    const sectorBreakdown: Record<string, { count: number; revenue: number; name: string }> = {
      pista: { count: 0, revenue: 0, name: "Pista Geral" },
      lounge_rosa: { count: 0, revenue: 0, name: "Lounge Rosa" },
      lounge_azul: { count: 0, revenue: 0, name: "Lounge Azul" },
      camarote: { count: 0, revenue: 0, name: "Camarote no Palco" },
    };

    // Agrupamento por dia (YYYY-MM-DD)
    const dailySalesMap: Record<string, { date: string; count: number; revenue: number }> = {};

    ticketsSnap.forEach((doc) => {
      const data = doc.data();
      const status = data.status || "approved";
      const price = Number(data.price) || 0;
      const sector = data.sector || "pista";
      const isCourtesy = price === 0 || (data.lotName && String(data.lotName).toLowerCase().includes("cortesia"));

      if (status === "cancelled") {
        totalCancelled++;
        return;
      }

      if (status === "used") {
        totalUsed++;
      }

      if (isCourtesy) {
        totalCourtesies++;
      } else {
        totalSoldTickets++;
        totalRevenue += price;

        if (sectorBreakdown[sector]) {
          sectorBreakdown[sector].count++;
          sectorBreakdown[sector].revenue += price;
        }
      }

      // Processa data de compra para gráfico diário
      let dateKey = "";
      if (data.purchaseDate) {
        try {
          const d = new Date(data.purchaseDate);
          if (!isNaN(d.getTime())) {
            dateKey = d.toISOString().split("T")[0];
          }
        } catch {
          // ignore
        }
      }

      if (!dateKey && data.createdAt) {
        try {
          const d = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          if (!isNaN(d.getTime())) {
            dateKey = d.toISOString().split("T")[0];
          }
        } catch {
          // ignore
        }
      }

      if (!dateKey) {
        dateKey = new Date().toISOString().split("T")[0];
      }

      if (!dailySalesMap[dateKey]) {
        dailySalesMap[dateKey] = { date: dateKey, count: 0, revenue: 0 };
      }

      dailySalesMap[dateKey].count++;
      if (!isCourtesy) {
        dailySalesMap[dateKey].revenue += price;
      }
    });

    // Ordena vendas diárias cronologicamente
    const dailySales = Object.values(dailySalesMap).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 2. Total de usuários cadastrados
    const usersSnap = await db.collection("usuarios").get();
    const totalUsers = usersSnap.size;

    return NextResponse.json({
      success: true,
      metrics: {
        totalSoldTickets,
        totalRevenue,
        totalCourtesies,
        totalCancelled,
        totalUsed,
        totalUsers,
        sectorBreakdown,
        dailySales,
      },
    });
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[Metrics GET Error]:", error);
    const status = error.message?.includes("Acesso negado") ? 403 : 401;
    return NextResponse.json(
      { error: error?.message || "Erro ao carregar métricas analíticas." },
      { status: error.message?.includes("Token") ? 401 : status }
    );
  }
}
