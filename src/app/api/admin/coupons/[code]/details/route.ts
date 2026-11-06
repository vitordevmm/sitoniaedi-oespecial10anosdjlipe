import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdminRequest } from "@/lib/auth/adminAuth";
import { normalizeCouponCode } from "@/lib/validations/coupon";
import { Coupon, CouponPurchaseRecord, CouponApplicationRecord } from "@/types/coupon";

/**
 * GET /api/admin/coupons/[code]/details
 * Retorna os detalhes de um cupom específico:
 * 1. Dados cadastrais do cupom
 * 2. Lista nominal de todos os compradores que usaram o cupom (cupom_compras)
 * 3. Lista nominal de quem aplicou o cupom mas ainda não concluiu a compra (cupom_aplicacoes com status != "purchased")
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    await verifyAdminRequest(req);
    const { code: rawCode } = await context.params;

    if (!rawCode) {
      return NextResponse.json(
        { error: "Código do cupom não informado." },
        { status: 400 }
      );
    }

    const code = normalizeCouponCode(rawCode);
    const db = await getAdminDb();

    // 1. Busca dados do cupom
    const couponDoc = await db.collection("cupons").doc(code).get();
    if (!couponDoc.exists) {
      return NextResponse.json(
        { error: `Cupom "${code}" não encontrado.` },
        { status: 404 }
      );
    }

    const couponData = couponDoc.data() as Coupon;
    const soldCount = Number(couponData.soldCount) || 0;
    const appliedUsersCount = Number(couponData.appliedUsersCount) || 0;
    const appliedNotBoughtCount = Math.max(0, appliedUsersCount - soldCount);
    const conversionRate = appliedUsersCount > 0
      ? Number(((soldCount / appliedUsersCount) * 100).toFixed(1))
      : 0;

    const coupon: Coupon = {
      ...couponData,
      code,
      displayCode: couponData.displayCode || code,
      soldCount,
      appliedUsersCount,
      appliedNotBoughtCount,
      conversionRate,
    };

    // 2. Busca lista de compradores em cupom_compras
    const purchasesSnap = await db
      .collection("cupom_compras")
      .where("couponCode", "==", code)
      .get();

    const purchases: CouponPurchaseRecord[] = [];
    purchasesSnap.forEach((doc) => {
      const data = doc.data();
      purchases.push({
        ticketId: doc.id,
        couponCode: data.couponCode || code,
        influencerName: data.influencerName || couponData.influencerName || "",
        userId: data.userId || "",
        userName: data.userName || "Portador do Ingresso",
        userEmail: data.userEmail || "",
        userCpf: data.userCpf || "",
        sector: data.sector || "pista",
        lot: Number(data.lot) || 1,
        originalPrice: Number(data.originalPrice) || Number(data.finalPrice) || 0,
        finalPrice: Number(data.finalPrice) || 0,
        discountAmount: Number(data.discountAmount) || 0,
        paymentMethod: data.paymentMethod || "pix",
        paymentId: String(data.paymentId || ""),
        purchasedAt: data.purchasedAt || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
        status: data.status || "approved",
      });
    });

    // Ordena compras da mais recente para a mais antiga
    purchases.sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());

    // 3. Busca lista de quem aplicou e ainda não comprou em cupom_aplicacoes
    const applicationsSnap = await db
      .collection("cupom_aplicacoes")
      .where("couponCode", "==", code)
      .get();

    const abandonedApplications: CouponApplicationRecord[] = [];
    applicationsSnap.forEach((doc) => {
      const data = doc.data();
      // Filtra apenas quem não converteu em compra aprovada
      if (data.status !== "purchased") {
        abandonedApplications.push({
          userId: data.userId || "",
          userEmail: data.userEmail || "",
          userName: data.userName || "Usuário",
          couponCode: data.couponCode || code,
          appliedCount: Number(data.appliedCount) || 1,
          firstAppliedAt: data.firstAppliedAt || "",
          lastAppliedAt: data.lastAppliedAt || "",
          status: data.status || "applied",
          lastPaymentId: data.lastPaymentId,
        });
      }
    });

    // Ordena aplicações da mais recente para a mais antiga
    abandonedApplications.sort((a, b) => new Date(b.lastAppliedAt).getTime() - new Date(a.lastAppliedAt).getTime());

    return NextResponse.json({
      success: true,
      coupon,
      purchases,
      abandonedApplications,
    });
  } catch (error: any) {
    console.error("[Admin Coupon Details Error]:", error);
    const status = error.message?.includes("Token") || error.message?.includes("autorização") ? 401 : 403;
    return NextResponse.json(
      { error: error?.message || "Erro ao consultar detalhes do cupom." },
      { status }
    );
  }
}
