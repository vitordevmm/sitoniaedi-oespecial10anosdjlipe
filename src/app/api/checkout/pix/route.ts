import { NextRequest, NextResponse } from "next/server";
import { createPixPayment } from "@/lib/mercadopago/client";
import { getAdminDb } from "@/lib/firebase/admin";
import { sendPendingPaymentEmail } from "@/lib/email/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userEmail, userName, userCpf, sector = "pista" } = body;

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

    // 2. Preço oficial do lote ativo de Pista (sincronizado com eventConfig)
    let amount = 60.0;
    let lotTitle = "1º Lote Oficial";
    const sectorTitle = "Pista Geral & Bar Central";

    try {
      const configDoc = await db.collection("config").doc("eventConfig").get();
      if (configDoc.exists) {
        const cfg = configDoc.data();
        const pistaLot = cfg?.lots?.find((l: any) => l.sector === "pista" && l.active);
        if (pistaLot && pistaLot.price) {
          amount = Number(pistaLot.price);
          lotTitle = pistaLot.name || lotTitle;
        }
      }
    } catch (cfgErr) {
      console.warn("[Checkout PIX] Aviso ao ler eventConfig, usando padrão:", cfgErr);
    }

    // 3. Cria cobrança PIX no Mercado Pago
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
        lot: 1,
      },
    });

    const paymentId = String(pixResponse.id);

    // 4. Salva a intenção de pedido no Firestore para rastreabilidade e reconciliação
    await db.collection("pedidos").doc(paymentId).set({
      paymentId,
      userId,
      userEmail: userEmail.toLowerCase().trim(),
      userName: finalName,
      userCpf: finalCpf || "",
      sector,
      lot: 1,
      amount,
      status: pixResponse.status, // "pending"
      paymentMethod: "pix",
      qrCode: pixResponse.qrCode,
      dateOfExpiration: pixResponse.dateOfExpiration,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 5. Envia o e-mail de reserva de vaga com o PIX Copia e Cola oficial em segundo plano
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
    const message = error?.message || "Não foi possível gerar a cobrança PIX no Mercado Pago.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
