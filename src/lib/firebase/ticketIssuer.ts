import { getAdminDb } from "@/lib/firebase/admin";
import { getNextTicketSequence } from "@/lib/firebase/ticketsCounter";
import { sendTicketIssuedEmail } from "@/lib/email/resend";
import { getPaymentClient } from "@/lib/mercadopago/client";
import { Ticket } from "@/types/ticket";

export interface IssueTicketParams {
  paymentId: string;
  paymentData?: any;
}

/**
 * Serviço atômico e idempotente de emissão de ingresso oficial.
 * Usado tanto no checkout síncrono (Cartão de Crédito) quanto no Webhook assíncrono (PIX/Cartão).
 * 
 * Garante:
 * 1. Idempotência: nunca emite ingressos duplicados para o mesmo paymentId.
 * 2. Numeração atômica sequencial (#0001, #0002...).
 * 3. Transação atômica no Firestore (salva ingresso + atualiza pedido).
 * 4. Envio de e-mail oficial com o voucher e QR Code via Resend.
 */
export async function issueTicketForPayment({
  paymentId,
  paymentData,
}: IssueTicketParams): Promise<Ticket | null> {
  const db = await getAdminDb();

  // 1. Idempotência preventiva: checa se já existe ingresso emitido para este paymentId
  const existingTicketSnap = await db
    .collection("ingressos")
    .where("paymentId", "==", String(paymentId))
    .limit(1)
    .get();

  if (!existingTicketSnap.empty) {
    const existingDoc = existingTicketSnap.docs[0];
    console.log(`[Ticket Issuer] Ingresso já emitido para o pagamento ${paymentId}: ${existingDoc.id}`);
    return existingDoc.data() as Ticket;
  }

  // 2. Se paymentData não foi fornecido, consulta diretamente no Mercado Pago
  let data = paymentData;
  if (!data) {
    try {
      const paymentClient = getPaymentClient();
      data = await paymentClient.get({ id: String(paymentId) });
    } catch (fetchErr) {
      console.error(`[Ticket Issuer] Erro ao consultar pagamento ${paymentId} no Mercado Pago:`, fetchErr);
      return null;
    }
  }

  if (!data || data.status !== "approved") {
    console.log(`[Ticket Issuer] Pagamento ${paymentId} possui status '${data?.status}', ignorando emissão.`);
    return null;
  }

  const metadata = data.metadata || {};
  const userId = metadata.user_id;
  const userEmail = (metadata.user_email || data.payer?.email || "").toLowerCase().trim();
  const userName =
    metadata.user_name ||
    `${data.payer?.first_name || ""} ${data.payer?.last_name || ""}`.trim() ||
    "Portador do Ingresso";
  const userCpf = metadata.user_cpf || data.payer?.identification?.number || "";
  const sector = metadata.sector || "pista";

  if (!userEmail) {
    console.error("[Ticket Issuer] Pagamento sem e-mail do comprador:", paymentId);
    return null;
  }

  // 3. Numeração sequencial atômica
  const seq = await getNextTicketSequence(db);

  // 4. Busca dados adicionais do usuário cadastrado (idade, nascimento)
  let userAge: number | undefined;
  let userBirthDate: string | undefined;

  if (userId) {
    try {
      const userDoc = await db.collection("usuarios").doc(userId).get();
      if (userDoc.exists) {
        const u = userDoc.data();
        userAge = u?.idade;
        userBirthDate = u?.dataNascimento;
      }
    } catch (uErr) {
      console.warn("[Ticket Issuer] Erro ao buscar dados do usuário:", uErr);
    }
  }

  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  const timestampSec = Math.floor(Date.now() / 1000).toString().slice(-4);
  const ticketId = `SINTONIA-10A-${timestampSec}${randomHex}`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sintoniaedicaoespecial.online";
  const qrPayload = `${baseUrl}/validar/${ticketId}`;

  const isCreditCard =
    data.payment_type_id === "credit_card" ||
    (data.payment_method_id && data.payment_method_id !== "pix");

  const finalTicket: Ticket & { paymentId: string } = {
    id: ticketId,
    paymentId: String(paymentId),
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
    price: data.transaction_amount || 60.0,
    status: "approved",
    qrPayload,
    purchaseDate: new Date().toISOString(),
    paymentMethod: isCreditCard ? "credit_card" : "pix",
  };

  // 5. Transação Atômica no Firestore
  await db.runTransaction(async (transaction) => {
    // Revalida idempotência dentro da transação caso tenha ocorrido corrida
    const doubleCheck = await transaction.get(
      db.collection("ingressos").where("paymentId", "==", String(paymentId)).limit(1)
    );
    if (!doubleCheck.empty) {
      console.log(`[Ticket Issuer Transaction] Ingresso concorrente já registrado para ${paymentId}`);
      return;
    }

    const ticketRef = db.collection("ingressos").doc(ticketId);
    transaction.set(ticketRef, {
      ...finalTicket,
      createdAt: new Date(),
    });

    const pedidoRef = db.collection("pedidos").doc(String(paymentId));
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

  console.log(`[Ticket Issuer] Ingresso ${ticketId} emitido com sucesso para ${userEmail}!`);

  // 6. Envio do voucher por e-mail com QR Code em segundo plano
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
    console.error("[Ticket Issuer] Erro ao enviar e-mail de ingresso:", emailErr);
  }

  return finalTicket;
}
