import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/mercadopago/client";
import { issueTicketForPayment } from "@/lib/firebase/ticketIssuer";

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
  try {
    await issueTicketForPayment({ paymentId });
  } catch (err) {
    console.error("[MercadoPago Webhook] Erro ao emitir ingresso no webhook:", err);
  }
}

