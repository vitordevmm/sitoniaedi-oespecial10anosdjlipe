import { Resend } from "resend";
import { generateTicketEmailHtml } from "./templates/TicketEmailTemplate";
import { generatePendingPixEmailHtml } from "./templates/PendingPixEmailTemplate";

// Lazy initialization do cliente Resend para prevenir quebra no build quando a env var não estiver injetada
let _resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!_resendClient) {
    _resendClient = new Resend(apiKey);
  }
  return _resendClient;
}

// Proxy para manter compatibilidade e não quebrar em tempo de módulo/build
export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    const client = getResendClient();
    if (!client) {
      console.warn("[Resend] Cliente acessado sem RESEND_API_KEY configurada.");
      return () => Promise.resolve({ data: null, error: new Error("RESEND_API_KEY_NOT_CONFIGURED") });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (client as any)[prop];
  },
});

const DEFAULT_FROM =
  process.env.RESEND_FROM_EMAIL || "Sintonia Especial 10 Anos <ingressos@sintoniaedicaoespecial.online>";

export interface SendTicketParams {
  userEmail: string;
  userName: string;
  userCpf?: string;
  ticketId: string;
  ticketNumberFormatted?: string;
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

function generateTicketEmailText(params: SendTicketParams): string {
  const lot = params.lotName || "1º Lote Oficial";
  const sector = params.sectorName || "Pista Geral & Bar Central";
  const num = params.ticketNumberFormatted || `#${params.ticketId}`;
  const price = `R$ ${params.price.toFixed(2).replace(".", ",")}`;
  const appUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://sintoniaedicaoespecial.online"}/perfil?tab=ingressos`;

  return `Seu ingresso para a Sintonia Edição Especial 10 Anos DJ Lipe está confirmado!

Olá, ${params.userName}!

Seu pagamento foi aprovado com sucesso e seu ingresso oficial está emitido.

DETALHES DO INGRESSO:
- Número Oficial: ${num}
- Código: ${params.ticketId}
- Titular: ${params.userName}
- Setor: ${sector}
- Lote: ${lot}
- Valor: ${price}
- Data do Evento: 10 de Abril de 2027
- Local: Capitu, Tupaciguara - MG

Acesse e baixe seu QR Code no site oficial:
${appUrl}

ORIENTAÇÕES DE PORTARIA:
- Apresente documento oficial original com foto juntamente com o QR Code.
- O QR Code é de uso único na catraca. Não compartilhe com terceiros.
- Abertura dos portões prevista para as 22h.

Dúvidas ou atendimento oficial no WhatsApp: +55 (34) 9153-5921
Realização: GHVE Eventos & RL Produções
`;
}

function generatePendingPixEmailText(params: SendPendingPixParams): string {
  const lot = params.lotName || "1º Lote Oficial";
  const sector = params.sectorName || "Pista Geral & Bar Central";
  const price = params.price ? `R$ ${params.price.toFixed(2).replace(".", ",")}` : "R$ 60,00";
  const pix = params.pixCopiaECola || "";
  const paymentUrl = params.paymentUrl || `${process.env.NEXT_PUBLIC_APP_URL || "https://sintoniaedicaoespecial.online"}/#ingressos`;

  return `Sua vaga na Sintonia Edição Especial 10 Anos DJ Lipe está pré-reservada!

Olá, ${params.userName}!

Você iniciou seu pedido de ingresso para a Sintonia Edição Especial 10 Anos DJ Lipe (10 de Abril de 2027 • Capitu, Tupaciguara - MG).

DETALHES DO PEDIDO:
- Setor: ${sector}
- Lote: ${lot}
- Total: ${price} (PIX Instantâneo)

CÓDIGO PIX COPIA E COLA:
${pix}

Como pagar:
1. Abra o aplicativo do seu banco
2. Escolha a opção PIX Copia e Cola
3. Cole o código acima e confirme o pagamento

Ou conclua seu pagamento no site oficial:
${paymentUrl}

Atenção: Os lotes possuem alta procura e viradas de preço. Conclua seu pagamento em até ${params.expiresInMinutes || 15} minutos para garantir sua vaga.

Dúvidas? Atendimento oficial via WhatsApp: +55 (34) 9153-5921
Realização: GHVE Eventos & RL Produções • Capitu, Tupaciguara - MG
`;
}

/**
 * Envia o e-mail oficial de Ingresso Confirmado com Voucher e QR Code
 */
export async function sendTicketIssuedEmail(params: SendTicketParams) {
  try {
    const client = getResendClient();
    if (!client) {
      console.warn("[Resend] E-mail de ingresso não enviado: RESEND_API_KEY não configurada no ambiente.");
      return { success: false, error: "RESEND_API_KEY_MISSING" };
    }

    const html = await generateTicketEmailHtml(params);
    const numDisplay = params.ticketNumberFormatted || `#${params.ticketId}`;

    const { data, error } = await client.emails.send({
      from: DEFAULT_FROM,
      to: [params.userEmail],
      replyTo: "contato@sintoniaedicaoespecial.online",
      subject: `Ingresso Confirmado (${numDisplay}) • Sintonia Especial 10 Anos DJ Lipe`,
      html,
      text: generateTicketEmailText(params),
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
    const client = getResendClient();
    if (!client) {
      console.warn("[Resend] E-mail de PIX pendente não enviado: RESEND_API_KEY não configurada no ambiente.");
      return { success: false, error: "RESEND_API_KEY_MISSING" };
    }

    const html = generatePendingPixEmailHtml(params);

    const { data, error } = await client.emails.send({
      from: DEFAULT_FROM,
      to: [params.userEmail],
      replyTo: "contato@sintoniaedicaoespecial.online",
      subject: "Reserva do seu ingresso • Sintonia Especial 10 Anos DJ Lipe",
      html,
      text: generatePendingPixEmailText(params),
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
