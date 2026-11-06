export type CouponDiscountType = "none" | "percentage" | "fixed";

export interface Coupon {
  id?: string; // Código normalizado em maiúsculas (ex: "LIPE10")
  code: string; // Código em maiúsculas
  displayCode: string; // Código formatado para exibição
  influencerName: string; // Nome ou @ do influencer/parceiro
  influencerPhone?: string; // Telefone/WhatsApp do influencer
  influencerEmail?: string; // E-mail para contato/relatórios
  influencerInstagram?: string; // @handle do Instagram
  discountType: CouponDiscountType; // "none" = apenas rastreamento, "percentage" = % de desconto, "fixed" = R$ fixo
  discountValue: number; // Valor do desconto (ex: 10 para 10% ou 15 para R$ 15,00)
  unlimited: boolean; // true se não tiver limite de usos
  isUnlimited?: boolean; // alias para compatibilidade
  maxUses?: number | null; // Limite numérico de compras aprovadas (ou null se ilimitado)
  active: boolean; // Ativo para novas compras
  soldCount: number; // Quantidade de ingressos pagos/aprovados com este cupom
  appliedUsersCount: number; // Quantidade de usuários únicos que aplicaram o cupom no checkout
  appliedNotBoughtCount?: number; // Quantidade de usuários que aplicaram e não compraram
  conversionRate?: number; // Percentual de conversão (soldCount / appliedUsersCount * 100)
  totalRevenue: number; // Faturamento total bruto/líquido gerado através do cupom (R$)
  totalDiscountGiven: number; // Total acumulado de desconto concedido aos compradores (R$)
  notes?: string; // Observações internas de produção
  createdBy?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface CouponPurchaseRecord {
  id?: string; // ticketId
  ticketId: string;
  ticketNumberFormatted?: string;
  paymentId: string;
  paymentMethod: "pix" | "credit_card" | string;
  couponCode: string;
  influencerName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userCpf: string;
  userPhone?: string;
  sector: string;
  sectorName?: string;
  lot?: number;
  lotName?: string;
  originalPrice: number;
  discountType?: CouponDiscountType;
  discountValue?: number;
  discountAmount: number;
  amountPaid?: number;
  finalPrice: number;
  status: "approved" | "cancelled" | string;
  purchasedAt: string;
}

export interface CouponApplicationRecord {
  id?: string; // `${code}_${userId}`
  couponCode: string;
  influencerName?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  userCpf?: string;
  sector?: string;
  status: "applied" | "pending_payment" | "purchased" | string;
  attemptsCount?: number;
  appliedCount?: number;
  lastPaymentId?: string;
  ticketId?: string;
  firstAppliedAt?: string;
  lastAppliedAt: string;
  purchasedAt?: string;
}

export interface CouponValidationResponse {
  success?: boolean;
  valid: boolean;
  code: string;
  displayCode: string;
  influencerName: string;
  discountType: CouponDiscountType;
  discountValue: number;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  message?: string;
  error?: string;
  coupon?: {
    code: string;
    displayCode: string;
    influencerName: string;
    discountType: CouponDiscountType;
    discountValue: number;
  };
}

export interface CouponRankingEntry {
  position?: number;
  code: string;
  displayCode: string;
  influencerName: string;
  soldCount: number;
  totalRevenue: number;
  totalDiscountGiven?: number;
  appliedUsersCount?: number;
  appliedNotBoughtCount: number;
  conversionRate: number; // percentual 0 a 100
  discountType?: CouponDiscountType;
  discountValue?: number;
  unlimited?: boolean;
  maxUses?: number | null;
  active?: boolean;
  createdAt?: string;
}
