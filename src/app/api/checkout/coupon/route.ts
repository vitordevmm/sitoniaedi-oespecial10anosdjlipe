import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getActiveLotForSector } from "@/lib/firebase/eventConfig";
import { validateAndCalculateCoupon } from "@/lib/firebase/coupons";
import { normalizeCouponCode } from "@/lib/validations/coupon";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, sector = "pista", userId, userEmail, userName, userCpf } = body;

    const normalizedCode = normalizeCouponCode(code);
    if (!normalizedCode) {
      return NextResponse.json(
        { valid: false, error: "Informe o código do cupom." },
        { status: 400 }
      );
    }

    const db = await getAdminDb();
    const activeLot = await getActiveLotForSector(sector);
    const basePrice = Number(activeLot.price) || 60.0;

    const result = await validateAndCalculateCoupon(db, normalizedCode, basePrice);

    // Registra a intenção/aplicação do cupom para métrica de funil ("Aplicaram e Não Compraram")
    if (userId) {
      try {
        const { FieldValue } = await import("firebase-admin/firestore");
        const appId = `${result.code}_${userId}`;
        const appRef = db.collection("cupom_aplicacoes").doc(appId);
        const appSnap = await appRef.get();

        if (!appSnap.exists) {
          // Incrementa contagem de usuários únicos que aplicaram
          await db
            .collection("cupons")
            .doc(result.code)
            .update({
              appliedUsersCount: FieldValue.increment(1),
              updatedAt: new Date(),
            });

          await appRef.set({
            id: appId,
            couponCode: result.code,
            influencerName: result.influencerName,
            userId,
            userName: userName || "Membro Oficial",
            userEmail: (userEmail || "").toLowerCase().trim(),
            userCpf: userCpf || "",
            sector,
            status: "applied",
            attemptsCount: 1,
            firstAppliedAt: new Date().toISOString(),
            lastAppliedAt: new Date().toISOString(),
          });
        } else {
          const appData = appSnap.data();
          // Só atualiza status se ainda não tiver comprado
          const updates: Record<string, any> = {
            attemptsCount: FieldValue.increment(1),
            lastAppliedAt: new Date().toISOString(),
          };
          if (appData?.status !== "purchased") {
            updates.status = "applied";
          }
          await appRef.update(updates);
        }
      } catch (trackErr) {
        console.warn("[Coupon Track Warning]:", trackErr);
      }
    }

    const savingsText =
      result.discountAmount > 0
        ? ` (Desconto: R$ ${result.discountAmount.toFixed(2).replace(".", ",")})`
        : "";

    return NextResponse.json({
      success: true,
      valid: true,
      code: result.code,
      displayCode: result.displayCode,
      influencerName: result.influencerName,
      discountType: result.discountType,
      discountValue: result.discountValue,
      originalPrice: result.originalPrice,
      discountAmount: result.discountAmount,
      finalPrice: result.finalPrice,
      message: `Cupom ${result.displayCode} de ${result.influencerName} aplicado com sucesso!${savingsText}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        valid: false,
        error: err?.message || "Não foi possível validar este cupom.",
      },
      { status: 400 }
    );
  }
}
