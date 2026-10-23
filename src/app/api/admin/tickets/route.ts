import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdminRequest } from "@/lib/auth/adminAuth";

export async function GET(req: NextRequest) {
  try {
    await verifyAdminRequest(req);
    const db = await getAdminDb();

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "50", 10)));
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const sectorFilter = searchParams.get("sector") || "all";
    const statusFilter = searchParams.get("status") || "all";
    const typeFilter = searchParams.get("type") || "all"; // 'courtesy' | 'paid' | 'all'

    const snap = await db.collection("ingressos").get();
    let allTickets: any[] = [];

    snap.forEach((doc) => {
      const data = doc.data();
      const ticketId = doc.id;
      const userName = (data.userName || "").toLowerCase();
      const userEmail = (data.userEmail || "").toLowerCase();
      const userCpf = (data.userCpf || "").replace(/\D/g, "");
      const isCourtesy = (data.price === 0) || (data.lotName && String(data.lotName).toLowerCase().includes("cortesia"));

      // Filtro de Busca textual
      if (search) {
        const cleanSearchDigits = search.replace(/\D/g, "");
        const matchId = ticketId.toLowerCase().includes(search);
        const matchName = userName.includes(search);
        const matchEmail = userEmail.includes(search);
        const matchCpf = cleanSearchDigits && userCpf.includes(cleanSearchDigits);

        if (!matchId && !matchName && !matchEmail && !matchCpf) {
          return;
        }
      }

      // Filtro por setor
      if (sectorFilter !== "all" && data.sector !== sectorFilter) {
        return;
      }

      // Filtro por status
      if (statusFilter !== "all" && data.status !== statusFilter) {
        return;
      }

      // Filtro por tipo (cortesia vs pago)
      if (typeFilter === "courtesy" && !isCourtesy) {
        return;
      }
      if (typeFilter === "paid" && isCourtesy) {
        return;
      }

      const num = data.ticketNumber || 1;
      const ticketNumberFormatted = data.ticketNumberFormatted || `#${String(num).padStart(4, "0")}`;

      allTickets.push({
        id: ticketId,
        ticketNumber: num,
        ticketNumberFormatted,
        userId: data.userId || "",
        userName: data.userName || "Não informado",
        userEmail: data.userEmail || "",
        userCpf: data.userCpf || "",
        userAge: data.userAge,
        sector: data.sector || "pista",
        sectorName: data.sectorName || "Pista Geral & Bar Central",
        lot: data.lot || 1,
        lotName: data.lotName || "1º Lote",
        price: data.price ?? 60,
        status: data.status || "approved",
        isCourtesy,
        purchaseDate: data.purchaseDate || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
        paymentMethod: data.paymentMethod || "pix",
        checkedInAt: data.checkedInAt || null,
        checkedInBy: data.checkedInBy || null,
      });
    });

    // Ordenação decrescente por data de compra / emissão
    allTickets.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());

    const totalTickets = allTickets.length;
    const totalPages = Math.ceil(totalTickets / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedTickets = allTickets.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      page,
      limit,
      totalTickets,
      totalPages,
      tickets: paginatedTickets,
    });
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[Tickets GET Error]:", error);
    const status = error.message?.includes("Acesso negado") ? 403 : 401;
    return NextResponse.json(
      { error: error?.message || "Erro ao listar ingressos." },
      { status: error.message?.includes("Token") ? 401 : status }
    );
  }
}
