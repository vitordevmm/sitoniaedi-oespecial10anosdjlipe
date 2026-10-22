import { Resend } from "resend";
import { generateTicketEmailHtml } from "./templates/TicketEmailTemplate";
import { generatePendingPixEmailHtml } from "./templates/PendingPixEmailTemplate";

const resendApiKey = process.env.RESEND_API_KEY || "";
export const resend = new Resend(resendApiKey);

const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || "Sintonia Especial 10 Anos <onboarding@resend.dev>";

export interface SendTicketParams {
  userEmail: string;
  userName: string;
  userCpf?: string;
  ticketId: string;
  sectorName: string;
  lotName: string;
  price: number;
  qrPayload: string;
}

export interface SendPendingPixParams {
  userEmail: string;
  userName: string;
  sectorName?: string;
  lotName?: string;
  price?: number;
  pixCopiaECola?: string;
  paymentUrl?: string;
  expiresInMinutes?: number;
}

/**
 * Envia o e-mail oficial de Ingresso Confirmado com Voucher e QR Code
 */
export async function sendTicketIssuedEmail(params: SendTicketParams) {
  try {
    const html = await generateTicketEmailHtml(params);

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [params.userEmail],
      subject: `🎟️ Seu Ingresso Confirmado! Sintonia Especial 10 Anos DJ Lipe (Voucher #${params.ticketId})`,
      html,
    });

    if (error) {
      console.error("[Resend] Erro ao enviar email de ingresso:", error);
      return { success: false, error };
    }

    console.log(`[Resend] E-mail de ingresso enviado com sucesso para ${params.userEmail}. ID: ${data?.id}`);
    return { success: true, data };
  } catch (err) {
    console.error("[Resend] Exceção ao disparar email de ingresso:", err);
    return { success: false, error: err };
  }
}

/**
 * Envia o e-mail do Funil de Conversão quando o usuário inicia a compra com PIX pendente
 */
export async function sendPendingPaymentEmail(params: SendPendingPixParams) {
  try {
    const html = generatePendingPixEmailHtml(params);

    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: [params.userEmail],
      subject: `⏳ [IMPORTANTE] Sua vaga na Sintonia 10 Anos DJ Lipe está pré-reservada!`,
      html,
    });

    if (error) {
      console.error("[Resend] Erro ao enviar email de PIX pendente:", error);
      return { success: false, error };
    }

    console.log(`[Resend] E-mail de PIX pendente enviado para ${params.userEmail}. ID: ${data?.id}`);
    return { success: true, data };
  } catch (err) {
    console.error("[Resend] Exceção ao disparar email de PIX pendente:", err);
    return { success: false, error: err };
  }
}
