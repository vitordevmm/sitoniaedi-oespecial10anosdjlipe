import { NextRequest, NextResponse } from "next/server";
import { getPaymentClient, verifyWebhookSignature } from "@/lib/mercadopago/client";
import { getAdminDb } from "@/lib/firebase/admin";
import { getNextTicketSequence } from "@/lib/firebase/ticketsCounter";
import { sendTicketIssuedEmail } from "@/lib/email/resend";
import { Ticket } from "@/types/ticket";

export async function POST(req: NextRequest) {
  try {
    const signatureHeader = req.headers.get("x-signature");
    const requestIdHeader = req.headers.get("x-request-id");

    const queryId = req.nextUrl.searchParams.get("data.id") || req.nextUrl.searchParams.get("id");

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Alguns webhooks antigos podem vir vazios no body
    }

    const dataId = String(body?.data?.id || queryId || "");

    // 1. Validação de assinatura HMAC-SHA256
    const isSignatureValid = verifyWebhookSignature(signatureHeader, requestIdHeader, dataId);
    if (!isSignatureValid) {
      console.warn("[MercadoPago Webhook] Assinatura HMAC rejeitada para dataId:", dataId);
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Mercado Pago exige resposta 200 imediata para não enfileirar retentativas
    const topic = body?.type || body?.topic || req.nextUrl.searchParams.get("topic");

    if (dataId && (topic === "payment" || !topic)) {
      // Processa o pagamento de forma assíncrona
      queueMicrotask(async () => {
        try {
          await processApprovedPayment(dataId);
        } catch (procErr) {
          console.error("[MercadoPago Webhook] Erro ao processar pagamento aprovado:", procErr);
        }
      });
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[MercadoPago Webhook] Erro na rota:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

/**
 * Consulta a API oficial do Mercado Pago para confirmar o status 'approved',
 * executa transação atômica no Firestore e emite o ingresso com QR Code.
 */
async function processApprovedPayment(paymentId: string) {
  const paymentClient = getPaymentClient();
  const paymentData = await paymentClient.get({ id: paymentId });

  if (!paymentData || paymentData.status !== "approved") {
    console.log(`[MercadoPago Webhook] Pagamento ${paymentId} com status '${paymentData?.status}', ignorando.`);
    return;
  }

  const db = await getAdminDb();
  const metadata = paymentData.metadata || {};

  const userId = metadata.user_id;
  const userEmail = (metadata.user_email || paymentData.payer?.email || "").toLowerCase().trim();
  const userName = metadata.user_name || `${paymentData.payer?.first_name || ""} ${paymentData.payer?.last_name || ""}`.trim() || "Portador do Ingresso";
  const userCpf = metadata.user_cpf || paymentData.payer?.identification?.number || "";
  const sector = metadata.sector || "pista";

  if (!userEmail) {
    console.error("[MercadoPago Webhook] Pagamento sem e-mail do comprador:", paymentId);
    return;
  }

  // Idempotência: verifica se o ingresso já foi emitido para este payment_id
  const existingTicketSnap = await db.collection("ingressos").where("paymentId", "==", paymentId).limit(1).get();
  if (!existingTicketSnap.empty) {
    console.log(`[MercadoPago Webhook] Ingresso já emitido para o pagamento ${paymentId}, pulando.`);
    return;
  }

  // Gera numeração sequencial atômica (#0001, #0002...)
  const seq = await getNextTicketSequence(db);

  // Busca dados adicionais do usuário (idade, nascimento)
  let userAge: number | undefined;
  let userBirthDate: string | undefined;

  if (userId) {
    const userDoc = await db.collection("usuarios").doc(userId).get();
    if (userDoc.exists) {
      const u = userDoc.data();
      userAge = u?.idade;
      userBirthDate = u?.dataNascimento;
    }
  }

  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestampSec = Math.floor(Date.now() / 1000).toString().slice(-4);
  const ticketId = `SINTONIA-10A-${timestampSec}${randomHex}`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sintoniaedicaoespecial.online";
  const qrPayload = `${baseUrl}/validar/${ticketId}`;

  const finalTicket: Ticket & { paymentId: string } = {
    id: ticketId,
    paymentId,
    ticketNumber: seq.number,
    ticketNumberFormatted: seq.formatted,
    userId: userId || "",
    userEmail,
    userName,
    userCpf,
    userAge,
    userBirthDate,
    sector: sector as any,
    sectorName: "Pista Geral & Bar Central",
    lot: 1,
    lotName: "1º Lote Oficial",
    price: paymentData.transaction_amount || 60.0,
    status: "approved",
    qrPayload,
    purchaseDate: new Date().toISOString(),
    paymentMethod: paymentData.payment_method_id === "credit_card" ? "credit_card" : "pix",
  };

  // Transação Atômica no Firestore para salvar ingresso e atualizar pedido
  await db.runTransaction(async (transaction) => {
    const ticketRef = db.collection("ingressos").doc(ticketId);
    transaction.set(ticketRef, {
      ...finalTicket,
      createdAt: new Date(),
    });

    const pedidoRef = db.collection("pedidos").doc(paymentId);
    transaction.set(
      pedidoRef,
      {
        status: "approved",
        ticketId,
        approvedAt: new Date(),
        updatedAt: new Date(),
      },
      { merge: true }
    );
  });

  console.log(`[MercadoPago Webhook] Ingresso ${ticketId} emitido com sucesso para ${userEmail}!`);

  // Envia o e-mail de confirmação com QR Code e detalhes do ingresso
  try {
    await sendTicketIssuedEmail({
      userEmail,
      userName,
      userCpf,
      ticketId,
      sectorName: "Pista Geral & Bar Central",
      lotName: "1º Lote Oficial",
      price: finalTicket.price,
      qrPayload,
    });
  } catch (emailErr) {
    console.error("[MercadoPago Webhook] Erro ao enviar e-mail de ingresso:", emailErr);
  }
}
