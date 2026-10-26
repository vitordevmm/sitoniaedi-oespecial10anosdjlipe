import { MercadoPagoConfig, Payment } from "mercadopago";
import crypto from "node:crypto";

let mpClientInstance: MercadoPagoConfig | null = null;
let mpPaymentInstance: Payment | null = null;

/**
 * Retorna a instância do cliente Mercado Pago com inicialização tardia (lazy).
 * Isso garante que o build do Next.js nunca quebre por ausência de credenciais em tempo de compilação.
 */
export function getMercadoPagoClient(): MercadoPagoConfig {
  if (!mpClientInstance) {
    const accessToken = process.env.MP_ACCESS_TOKEN || "";
    if (!accessToken) {
      console.warn("[MercadoPago] ATENÇÃO: MP_ACCESS_TOKEN não está definido no ambiente.");
    }
    mpClientInstance = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 10000,
      },
    });
  }
  return mpClientInstance;
}

/**
 * Retorna a instância do cliente de Pagamentos do Mercado Pago.
 */
export function getPaymentClient(): Payment {
  if (!mpPaymentInstance) {
    const client = getMercadoPagoClient();
    mpPaymentInstance = new Payment(client);
  }
  return mpPaymentInstance;
}

export interface CreatePixPaymentParams {
  transactionAmount: number;
  description: string;
  payerEmail: string;
  payerName: string;
  payerCpf?: string;
  metadata?: Record<string, any>;
  notificationUrl?: string;
}

export interface PixPaymentResponse {
  id: number;
  status: string;
  statusDetail: string;
  qrCode: string;
  qrCodeBase64: string;
  ticketUrl: string;
  dateOfExpiration: string;
}

/**
 * Cria uma cobrança instantânea de PIX via Mercado Pago Payments API.
 */
export async function createPixPayment(params: CreatePixPaymentParams): Promise<PixPaymentResponse> {
  const payment = getPaymentClient();

  const nameParts = params.payerName.trim().split(" ");
  const firstName = nameParts[0] || "Cliente";
  const lastName = nameParts.slice(1).join(" ") || "Sintonia";

  const cleanCpf = params.payerCpf ? params.payerCpf.replace(/\D/g, "") : "";

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sintoniaedicaoespecial.online";
  const notificationUrl = params.notificationUrl || `${baseUrl}/api/webhooks/mercadopago`;

  const body: any = {
    transaction_amount: Number(params.transactionAmount.toFixed(2)),
    description: params.description,
    payment_method_id: "pix",
    payer: {
      email: params.payerEmail.toLowerCase().trim(),
      first_name: firstName,
      last_name: lastName,
    },
    notification_url: notificationUrl,
    metadata: params.metadata || {},
  };

  if (cleanCpf && cleanCpf.length === 11) {
    body.payer.identification = {
      type: "CPF",
      number: cleanCpf,
    };
  }

  const response = await payment.create({ body });

  const pointOfInteraction = response.point_of_interaction;
  const transactionData = pointOfInteraction?.transaction_data;

  return {
    id: response.id as number,
    status: response.status || "pending",
    statusDetail: response.status_detail || "",
    qrCode: transactionData?.qr_code || "",
    qrCodeBase64: transactionData?.qr_code_base64 || "",
    ticketUrl: transactionData?.ticket_url || "",
    dateOfExpiration: response.date_of_expiration || "",
  };
}

export interface CreateCardPaymentParams {
  transactionAmount: number;
  token: string;
  description: string;
  installments: number;
  paymentMethodId: string;
  issuerId?: string | number;
  payerEmail: string;
  payerName: string;
  payerCpf?: string;
  metadata?: Record<string, any>;
  notificationUrl?: string;
}

export interface CardPaymentResult {
  id: number;
  status: string;
  statusDetail: string;
  paymentMethodId: string;
  installments: number;
  transactionAmount: number;
  dateApproved?: string;
}

/**
 * Cria uma cobrança de Cartão de Crédito via Mercado Pago Payments API.
 * As taxas de parcelamento são calculadas automaticamente e repassadas ao comprador
 * conforme a configuração oficial da conta do vendedor no Mercado Pago.
 */
export async function createCardPayment(params: CreateCardPaymentParams): Promise<CardPaymentResult> {
  const payment = getPaymentClient();

  const nameParts = params.payerName.trim().split(" ");
  const firstName = nameParts[0] || "Cliente";
  const lastName = nameParts.slice(1).join(" ") || "Sintonia";

  const cleanCpf = params.payerCpf ? params.payerCpf.replace(/\D/g, "") : "";

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sintoniaedicaoespecial.online";
  const notificationUrl = params.notificationUrl || `${baseUrl}/api/webhooks/mercadopago`;

  const body: any = {
    transaction_amount: Number(params.transactionAmount.toFixed(2)),
    token: params.token,
    description: params.description,
    installments: Number(params.installments || 1),
    payment_method_id: params.paymentMethodId,
    payer: {
      email: params.payerEmail.toLowerCase().trim(),
      first_name: firstName,
      last_name: lastName,
    },
    notification_url: notificationUrl,
    metadata: params.metadata || {},
  };

  if (params.issuerId && !isNaN(Number(params.issuerId))) {
    body.issuer_id = Number(params.issuerId);
  }

  if (cleanCpf && cleanCpf.length === 11) {
    body.payer.identification = {
      type: "CPF",
      number: cleanCpf,
    };
  }

  const response = await payment.create({ body });

  return {
    id: response.id as number,
    status: response.status || "pending",
    statusDetail: response.status_detail || "",
    paymentMethodId: response.payment_method_id || params.paymentMethodId,
    installments: response.installments || params.installments,
    transactionAmount: response.transaction_amount || params.transactionAmount,
    dateApproved: response.date_approved || undefined,
  };
}

/**
 * Validação criptográfica de assinatura do Webhook HMAC-SHA256 conforme padrão oficial do Mercado Pago.
 * Canonical: id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 */
export function verifyWebhookSignature(
  signatureHeader: string | null,
  requestIdHeader: string | null,
  dataId: string
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;

  // Se não houver segredo configurado no ambiente, não valida por assinatura mas exige checagem de API
  if (!secret) {
    console.warn("[MercadoPago Webhook] MP_WEBHOOK_SECRET não configurado. Verificação de HMAC desativada.");
    return true;
  }

  if (!signatureHeader || !requestIdHeader || !dataId) {
    console.error("[MercadoPago Webhook] Cabeçalhos de assinatura ou dataId ausentes.", {
      hasSig: !!signatureHeader,
      hasReqId: !!requestIdHeader,
      dataId,
    });
    return false;
  }

  try {
    const parts = Object.fromEntries(
      signatureHeader.split(",").map((p) => {
        const [k, ...v] = p.split("=");
        return [k.trim(), v.join("=").trim()];
      })
    );

    const ts = parts.ts;
    const v1 = parts.v1;

    if (!ts || !v1) {
      console.error("[MercadoPago Webhook] Formato de x-signature inválido (ts ou v1 ausentes):", signatureHeader);
      return false;
    }

    const canonical = `id:${dataId};request-id:${requestIdHeader};ts:${ts};`;
    const expected = crypto.createHmac("sha256", secret).update(canonical).digest("hex");

    if (expected.length !== v1.length) {
      return false;
    }

    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch (err) {
    console.error("[MercadoPago Webhook] Erro ao validar HMAC:", err);
    return false;
  }
}
