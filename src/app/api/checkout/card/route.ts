import { NextRequest, NextResponse } from "next/server";
import { createCardPayment } from "@/lib/mercadopago/client";
import { getAdminDb } from "@/lib/firebase/admin";
import { issueTicketForPayment } from "@/lib/firebase/ticketIssuer";

function getCardRejectedMessage(statusDetail?: string): string {
  switch (statusDetail) {
    case "cc_rejected_bad_filled_card_number":
      return "Número de cartão de crédito inválido.";
    case "cc_rejected_bad_filled_date":
      return "Data de validade incorreta.";
    case "cc_rejected_bad_filled_security_code":
      return "Código de segurança (CVV) incorreto.";
    case "cc_rejected_bad_filled_other":
      return "Verifique os dados do cartão informados.";
    case "cc_rejected_insufficient_amount":
      return "Limite insuficiente no cartão para concluir a transação.";
    case "cc_rejected_call_for_authorize":
      return "Pagamento não autorizado pelo banco emissor. Ligue para a operadora do seu cartão para autorizar a compra.";
    case "cc_rejected_card_disabled":
      return "Cartão desabilitado. Contate o banco emissor para desbloqueá-lo.";
    case "cc_rejected_duplicated_payment":
      return "Pagamento duplicado identificado recentemente.";
    case "cc_rejected_high_risk":
      return "Transação recusada por políticas de prevenção a fraudes. Tente outro cartão ou pague via PIX.";
    case "cc_rejected_max_attempts":
      return "Número máximo de tentativas atingido. Tente outro cartão ou utilize a opção PIX.";
    default:
      return "Pagamento não aprovado pela operadora do cartão. Verifique os dados ou utilize outro cartão.";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      token,
      issuer_id,
      payment_method_id,
      installments = 1,
      userId,
      userEmail,
      userName,
      userCpf,
      sector = "pista",
    } = body;

    if (!userEmail || !userId) {
      return NextResponse.json(
        { error: "É necessário estar autenticado para realizar o pagamento." },
        { status: 401 }
      );
    }

    if (!token || !payment_method_id) {
      return NextResponse.json(
        { error: "Dados do cartão incompletos ou tokenização expirada. Tente novamente." },
        { status: 400 }
      );
    }

    const db = await getAdminDb();

    // 1. Busca dados cadastrais atualizados do usuário se CPF ou nome não foram enviados
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

    // 2. Preço oficial do lote ativo de Pista (segurança server-side)
    let amount = 60.0;
    let lotTitle = "1º Lote Oficial";

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
      console.warn("[Checkout Cartão] Aviso ao ler eventConfig, usando padrão:", cfgErr);
    }

    const safeInstallments = Math.max(1, Math.min(12, Number(installments) || 1));

    // 3. Processa cobrança de cartão no Mercado Pago
    // O Mercado Pago calcula e repassa as taxas de parcelamento ao comprador conforme a configuração da conta
    const cardResponse = await createCardPayment({
      transactionAmount: amount,
      token,
      description: `Ingresso ${lotTitle} - Sintonia Edição Especial 10 Anos DJ Lipe`,
      installments: safeInstallments,
      paymentMethodId: payment_method_id,
      issuerId: issuer_id,
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
        installments: safeInstallments,
      },
    });

    const paymentId = String(cardResponse.id);

    // 4. Salva registro do pedido no Firestore
    await db.collection("pedidos").doc(paymentId).set({
      paymentId,
      userId,
      userEmail: userEmail.toLowerCase().trim(),
      userName: finalName,
      userCpf: finalCpf || "",
      sector,
      lot: 1,
      amount,
      status: cardResponse.status,
      statusDetail: cardResponse.statusDetail,
      paymentMethod: "credit_card",
      paymentMethodId: cardResponse.paymentMethodId,
      installments: cardResponse.installments,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 5. Se aprovado imediatamente, emite o voucher com QR Code e envia e-mail
    if (cardResponse.status === "approved") {
      const ticket = await issueTicketForPayment({
        paymentId,
        paymentData: {
          id: cardResponse.id,
          status: "approved",
          transaction_amount: amount,
          payment_type_id: "credit_card",
          payment_method_id: cardResponse.paymentMethodId,
          metadata: {
            user_id: userId,
            user_email: userEmail,
            user_name: finalName,
            user_cpf: finalCpf,
            sector,
          },
        },
      });

      return NextResponse.json({
        success: true,
        status: "approved",
        paymentId: cardResponse.id,
        ticketId: ticket?.id || null,
      });
    }

    // 6. Se em análise (in_process ou pending)
    if (cardResponse.status === "in_process" || cardResponse.status === "pending") {
      return NextResponse.json({
        success: true,
        status: cardResponse.status,
        statusDetail: cardResponse.statusDetail,
        paymentId: cardResponse.id,
        message: "Pagamento em análise pela operadora do cartão. Assim que aprovado, o ingresso será emitido.",
      });
    }

    // 7. Se rejeitado (rejected)
    const errorMsg = getCardRejectedMessage(cardResponse.statusDetail);
    return NextResponse.json(
      {
        success: false,
        status: "rejected",
        statusDetail: cardResponse.statusDetail,
        error: errorMsg,
      },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("[Checkout Cartão] Erro ao processar pagamento com cartão:", error);
    const message = error?.message || "Não foi possível concluir o pagamento com cartão.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
