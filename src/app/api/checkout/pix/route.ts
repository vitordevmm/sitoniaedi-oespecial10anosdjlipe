import { NextRequest, NextResponse } from "next/server";
import { createPixPayment } from "@/lib/mercadopago/client";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendPendingPaymentEmail } from "@/lib/email/resend";
import { getActiveLotForSector } from "@/lib/firebase/eventConfig";
import { validateAndCalculateCoupon } from "@/lib/firebase/coupons";
import { normalizeCouponCode } from "@/lib/validations/coupon";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userEmail, userName, userCpf, sector = "pista", couponCode } = body;

    if (!userEmail || !userId) {
      return NextResponse.json(
        { error: "É necessário estar autenticado para gerar o pagamento do ingresso." },
        { status: 401 }
      );
    }

    const db = await getAdminDb();

    // 1. Busca dados atualizados do usuário se CPF ou nome não foram enviados
    let finalName = userName;
    let finalCpf = userCpf;

    if (!finalName || !finalCpf) {
      const userDoc = await db.collection("usuarios").doc(userId).get();
      if (userDoc.exists) {
        const u = userDoc.data();
        finalName = finalName || u?.nome || "Membro Oficial";
        finalCpf = finalCpf || u?.cpf || "";
      }
    }

    // 2. Preço oficial do lote ativo (sincronizado com as configurações oficiais de evento)
    const activeLot = await getActiveLotForSector(sector);
    const baseLotPrice = Number(activeLot.price) || 60.0;
    const lotTitle = activeLot.name || "1º Lote Oficial";
    const sectorTitle = activeLot.sectorName || "Pista Geral & Bar Central";
    const lotOrder = activeLot.order || 1;

    // 3. Validação segura do cupom de desconto/rastreamento no servidor
    let amount = baseLotPrice;
    let appliedCouponInfo: any = null;

    if (couponCode && typeof couponCode === "string" && couponCode.trim()) {
      try {
        const couponResult = await validateAndCalculateCoupon(db, couponCode, baseLotPrice);
        amount = couponResult.finalPrice;
        appliedCouponInfo = {
          couponCode: couponResult.code,
          influencerName: couponResult.influencerName,
          originalPrice: couponResult.originalPrice,
          discountAmount: couponResult.discountAmount,
          discountType: couponResult.discountType,
          discountValue: couponResult.discountValue,
        };
      } catch (couponErr: any) {
        return NextResponse.json(
          { error: couponErr?.message || "Cupom inválido ou expirado." },
          { status: 400 }
        );
      }
    }

    // 4. Cria cobrança PIX no Mercado Pago
    const pixResponse = await createPixPayment({
      transactionAmount: amount,
      description: `Ingresso ${lotTitle} - Sintonia Edição Especial 10 Anos DJ Lipe`,
      payerEmail: userEmail,
      payerName: finalName || "Cliente Sintonia",
      payerCpf: finalCpf,
      metadata: {
        user_id: userId,
        user_email: userEmail.toLowerCase().trim(),
        user_name: finalName,
        user_cpf: finalCpf,
        sector,
        sector_name: sectorTitle,
        lot: lotOrder,
        lot_name: lotTitle,
        ...(appliedCouponInfo
          ? {
              coupon_code: appliedCouponInfo.couponCode,
              influencer_name: appliedCouponInfo.influencerName,
              original_price: appliedCouponInfo.originalPrice,
              discount_amount: appliedCouponInfo.discountAmount,
            }
          : {}),
      },
    });

    const paymentId = String(pixResponse.id);

    // 5. Salva a intenção de pedido no Firestore para rastreabilidade e reconciliação
    await db.collection("pedidos").doc(paymentId).set({
      paymentId,
      userId,
      userEmail: userEmail.toLowerCase().trim(),
      userName: finalName,
      userCpf: finalCpf || "",
      sector,
      sectorName: sectorTitle,
      lot: lotOrder,
      lotName: lotTitle,
      amount,
      status: pixResponse.status, // "pending"
      paymentMethod: "pix",
      qrCode: pixResponse.qrCode,
      dateOfExpiration: pixResponse.dateOfExpiration,
      ...(appliedCouponInfo || {}),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Atualiza status na aplicação de cupom do usuário
    if (appliedCouponInfo?.couponCode && userId) {
      try {
        const appId = `${appliedCouponInfo.couponCode}_${userId}`;
        await db
          .collection("cupom_aplicacoes")
          .doc(appId)
          .set(
            {
              lastPaymentId: paymentId,
              status: "pending_payment",
              lastAppliedAt: new Date().toISOString(),
            },
            { merge: true }
          );
      } catch (trackErr) {
        console.warn("[PIX Coupon Track Error]:", trackErr);
      }
    }

    // 6. Envia o e-mail de reserva de vaga com o PIX Copia e Cola oficial em segundo plano
    if (pixResponse.qrCode) {
      try {
        await sendPendingPaymentEmail({
          userEmail: userEmail.toLowerCase().trim(),
          userName: finalName,
          sectorName: sectorTitle,
          lotName: lotTitle,
          price: amount,
          pixCopiaECola: pixResponse.qrCode,
          expiresInMinutes: 15,
        });
      } catch (emailErr) {
        console.error("[Checkout PIX] Erro ao enviar e-mail de PIX pendente:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      paymentId: pixResponse.id,
      status: pixResponse.status,
      qrCode: pixResponse.qrCode,
      qrCodeBase64: pixResponse.qrCodeBase64,
      ticketUrl: pixResponse.ticketUrl,
      dateOfExpiration: pixResponse.dateOfExpiration,
    });
  } catch (error: any) {
    console.error("[Checkout PIX] Erro ao criar cobrança PIX:", error);
    let message = error?.message || "Não foi possível gerar a cobrança PIX no Mercado Pago.";
    const errStr = (String(error?.message || "") + " " + JSON.stringify(error?.cause || "")).toLowerCase();
    
    if (errStr.includes("without key enabled") || errStr.includes("key enabled for qr")) {
      message =
        "A conta do Mercado Pago ainda não possui uma Chave PIX cadastrada para receber pagamentos. Acesse o aplicativo ou site do Mercado Pago na conta do vendedor e cadastre qualquer chave PIX (CPF, Celular, E-mail ou Chave Aleatória) para ativar o recebimento de PIX instantâneo.";
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
