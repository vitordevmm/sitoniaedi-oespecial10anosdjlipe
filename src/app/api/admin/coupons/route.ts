import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdminRequest } from "@/lib/auth/adminAuth";
import { normalizeCouponCode, createCouponSchema, updateCouponSchema } from "@/lib/validations/coupon";
import { Coupon, CouponRankingEntry } from "@/types/coupon";

/**
 * GET /api/admin/coupons
 * Lista todos os cupons cadastrados, calcula métricas de funil, ranking de influenciadores e KPIs gerais.
 */
export async function GET(req: NextRequest) {
  try {
    await verifyAdminRequest(req);
    const db = await getAdminDb();

    const snapshot = await db.collection("cupons").get();
    const coupons: Coupon[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const soldCount = Number(data.soldCount) || 0;
      const appliedUsersCount = Number(data.appliedUsersCount) || 0;
      const appliedNotBoughtCount = Math.max(0, appliedUsersCount - soldCount);
      const conversionRate = appliedUsersCount > 0
        ? Number(((soldCount / appliedUsersCount) * 100).toFixed(1))
        : 0;

      coupons.push({
        code: doc.id,
        displayCode: data.displayCode || doc.id,
        influencerName: data.influencerName || "",
        influencerPhone: data.influencerPhone,
        influencerEmail: data.influencerEmail,
        influencerInstagram: data.influencerInstagram,
        discountType: data.discountType || "none",
        discountValue: Number(data.discountValue) || 0,
        maxUses: data.maxUses !== undefined ? Number(data.maxUses) : undefined,
        unlimited: Boolean(data.unlimited ?? data.isUnlimited),
        isUnlimited: Boolean(data.isUnlimited ?? data.unlimited),
        active: data.active !== false,
        soldCount,
        appliedUsersCount,
        appliedNotBoughtCount,
        conversionRate,
        totalRevenue: Number(data.totalRevenue) || 0,
        totalDiscountGiven: Number(data.totalDiscountGiven) || 0,
        notes: data.notes,
        createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : undefined,
        updatedAt: data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt) : undefined,
      });
    });

    // Ordenação padrão: mais recentes ou mais vendidos
    coupons.sort((a, b) => (b.soldCount - a.soldCount) || (b.totalRevenue - a.totalRevenue));

    // Ranking de influenciadores
    const ranking: CouponRankingEntry[] = coupons.map((c, index) => ({
      position: index + 1,
      code: c.code,
      displayCode: c.displayCode,
      influencerName: c.influencerName,
      soldCount: c.soldCount,
      totalRevenue: c.totalRevenue,
      conversionRate: c.conversionRate || 0,
      appliedNotBoughtCount: c.appliedNotBoughtCount || 0,
    }));

    // Métricas Globais (KPIs)
    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter((c) => c.active).length;
    const totalSoldWithCoupon = coupons.reduce((acc, c) => acc + c.soldCount, 0);
    const totalRevenueWithCoupon = coupons.reduce((acc, c) => acc + c.totalRevenue, 0);
    const totalDiscountGiven = coupons.reduce((acc, c) => acc + c.totalDiscountGiven, 0);
    const totalApplications = coupons.reduce((acc, c) => acc + (c.appliedUsersCount || 0), 0);
    const averageConversionRate = totalApplications > 0
      ? Number(((totalSoldWithCoupon / totalApplications) * 100).toFixed(1))
      : 0;

    return NextResponse.json({
      success: true,
      coupons,
      ranking,
      kpis: {
        totalCoupons,
        activeCoupons,
        totalSoldWithCoupon,
        totalRevenueWithCoupon,
        totalDiscountGiven,
        totalApplications,
        averageConversionRate,
      },
    });
  } catch (error: any) {
    console.error("[Admin Coupons GET Error]:", error);
    const status = error.message?.includes("Token") || error.message?.includes("autorização") ? 401 : 403;
    return NextResponse.json(
      { error: error?.message || "Erro ao consultar cupons." },
      { status }
    );
  }
}

/**
 * POST /api/admin/coupons
 * Cria um novo cupom de influenciador.
 */
export async function POST(req: NextRequest) {
  try {
    await verifyAdminRequest(req);
    const body = await req.json();

    const validation = createCouponSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Dados do cupom inválidos." },
        { status: 400 }
      );
    }

    const {
      code: rawCode,
      displayCode: rawDisplayCode,
      influencerName,
      influencerPhone,
      influencerEmail,
      influencerInstagram,
      discountType,
      discountValue,
      maxUses,
      isUnlimited,
      active,
      notes,
    } = validation.data;

    const code = normalizeCouponCode(rawCode);
    const displayCode = rawDisplayCode ? rawDisplayCode.trim() : rawCode.trim().toUpperCase();

    const db = await getAdminDb();
    const docRef = db.collection("cupons").doc(code);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return NextResponse.json(
        { error: `Já existe um cupom com o código "${code}". Utilize outro código.` },
        { status: 400 }
      );
    }

    const isUnlimitedVal = isUnlimited !== undefined ? isUnlimited : (validation.data.unlimited ?? true);

    const now = new Date();
    const newCoupon: Coupon = {
      code,
      displayCode,
      influencerName: influencerName.trim(),
      influencerPhone: influencerPhone?.trim() || null,
      influencerEmail: influencerEmail?.trim()?.toLowerCase() || null,
      influencerInstagram: influencerInstagram?.trim() || null,
      discountType,
      discountValue: discountType === "none" ? 0 : Number(discountValue || 0),
      maxUses: isUnlimitedVal ? null : Number(maxUses || 0),
      unlimited: Boolean(isUnlimitedVal),
      isUnlimited: Boolean(isUnlimitedVal),
      active: active !== false,
      soldCount: 0,
      appliedUsersCount: 0,
      appliedNotBoughtCount: 0,
      conversionRate: 0,
      totalRevenue: 0,
      totalDiscountGiven: 0,
      notes: notes?.trim() || null,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await docRef.set(newCoupon);

    return NextResponse.json({
      success: true,
      message: `Cupom ${displayCode} criado com sucesso!`,
      coupon: newCoupon,
    });
  } catch (error: any) {
    console.error("[Admin Coupons POST Error]:", error);
    const status = error.message?.includes("Token") || error.message?.includes("autorização") ? 401 : 403;
    return NextResponse.json(
      { error: error?.message || "Erro ao cadastrar cupom." },
      { status }
    );
  }
}

/**
 * PATCH /api/admin/coupons
 * Atualiza um cupom existente.
 */
export async function PATCH(req: NextRequest) {
  try {
    await verifyAdminRequest(req);
    const body = await req.json();

    const validation = updateCouponSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0]?.message || "Dados de atualização inválidos." },
        { status: 400 }
      );
    }

    const { code: rawCode, ...updates } = validation.data;
    const code = normalizeCouponCode(rawCode);

    const db = await getAdminDb();
    const docRef = db.collection("cupons").doc(code);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: `Cupom "${code}" não encontrado.` },
        { status: 404 }
      );
    }

    const cleanUpdates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (updates.displayCode !== undefined) cleanUpdates.displayCode = updates.displayCode.trim();
    if (updates.influencerName !== undefined) cleanUpdates.influencerName = updates.influencerName.trim();
    if (updates.influencerPhone !== undefined) cleanUpdates.influencerPhone = updates.influencerPhone.trim() || null;
    if (updates.influencerEmail !== undefined) cleanUpdates.influencerEmail = updates.influencerEmail.trim().toLowerCase() || null;
    if (updates.influencerInstagram !== undefined) cleanUpdates.influencerInstagram = updates.influencerInstagram.trim() || null;
    if (updates.discountType !== undefined) cleanUpdates.discountType = updates.discountType;
    const isUnlimitedVal = updates.isUnlimited !== undefined ? updates.isUnlimited : updates.unlimited;
    if (isUnlimitedVal !== undefined) {
      cleanUpdates.unlimited = Boolean(isUnlimitedVal);
      cleanUpdates.isUnlimited = Boolean(isUnlimitedVal);
    }
    if (updates.maxUses !== undefined) cleanUpdates.maxUses = (isUnlimitedVal ? null : Number(updates.maxUses));
    if (updates.active !== undefined) cleanUpdates.active = Boolean(updates.active);
    if (updates.notes !== undefined) cleanUpdates.notes = updates.notes?.trim() || null;

    await docRef.update(cleanUpdates);

    return NextResponse.json({
      success: true,
      message: `Cupom ${code} atualizado com sucesso!`,
    });
  } catch (error: any) {
    console.error("[Admin Coupons PATCH Error]:", error);
    const status = error.message?.includes("Token") || error.message?.includes("autorização") ? 401 : 403;
    return NextResponse.json(
      { error: error?.message || "Erro ao atualizar cupom." },
      { status }
    );
  }
}

/**
 * DELETE /api/admin/coupons
 * Exclui um cupom do banco de dados.
 */
export async function DELETE(req: NextRequest) {
  try {
    await verifyAdminRequest(req);
    const { searchParams } = new URL(req.url);
    const rawCode = searchParams.get("code");

    if (!rawCode) {
      return NextResponse.json(
        { error: "O parâmetro 'code' é obrigatório para exclusão." },
        { status: 400 }
      );
    }

    const code = normalizeCouponCode(rawCode);
    const db = await getAdminDb();
    const docRef = db.collection("cupons").doc(code);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: `Cupom "${code}" não foi encontrado.` },
        { status: 404 }
      );
    }

    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: `Cupom ${code} excluído com sucesso.`,
    });
  } catch (error: any) {
    console.error("[Admin Coupons DELETE Error]:", error);
    const status = error.message?.includes("Token") || error.message?.includes("autorização") ? 401 : 403;
    return NextResponse.json(
      { error: error?.message || "Erro ao excluir cupom." },
      { status }
    );
  }
}
