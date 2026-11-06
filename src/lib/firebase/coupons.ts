import { normalizeCouponCode } from "@/lib/validations/coupon";
import { Coupon, CouponDiscountType } from "@/types/coupon";

export interface CouponCalculationResult {
  coupon: Coupon;
  code: string;
  displayCode: string;
  influencerName: string;
  discountType: CouponDiscountType;
  discountValue: number;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
}

/**
 * Valida o cupom no Firestore e calcula o desconto sobre o preço oficial do lote.
 * Regras:
 * 1. Case-insensitive: normaliza para maiúsculas antes da consulta.
 * 2. Verifica se o cupom existe e está ativo.
 * 3. Verifica limite de usos aprovados (soldCount < maxUses se não for unlimited).
 * 4. Trava de segurança: garante piso mínimo de R$ 1,00 para aprovação no Mercado Pago e separação com cortesias.
 */
export async function validateAndCalculateCoupon(
  db: any,
  rawCode: string,
  basePrice: number
): Promise<CouponCalculationResult> {
  const code = normalizeCouponCode(rawCode);

  if (!code) {
    throw new Error("Código de cupom inválido ou vazio.");
  }

  const couponDoc = await db.collection("cupons").doc(code).get();

  if (!couponDoc.exists) {
    throw new Error(`Cupom "${rawCode.trim().toUpperCase()}" não encontrado.`);
  }

  const coupon = couponDoc.data() as Coupon;

  if (!coupon.active) {
    throw new Error(`O cupom "${coupon.displayCode || code}" está inativo no momento.`);
  }

  const isUnlimited = coupon.unlimited ?? true;
  const maxUses = coupon.maxUses;
  const soldCount = coupon.soldCount || 0;

  if (!isUnlimited && maxUses && soldCount >= maxUses) {
    throw new Error(`O cupom "${coupon.displayCode || code}" já atingiu o limite de usos.`);
  }

  const discountType: CouponDiscountType = coupon.discountType || "none";
  const discountValue = Number(coupon.discountValue) || 0;
  const originalPrice = Number(basePrice) || 60.0;

  let rawDiscount = 0;

  if (discountType === "percentage") {
    rawDiscount = Math.round(((originalPrice * discountValue) / 100) * 100) / 100;
  } else if (discountType === "fixed") {
    rawDiscount = Math.min(originalPrice, discountValue);
  } else {
    rawDiscount = 0;
  }

  // Trava de segurança: compras com cupom têm piso de R$ 1,00
  // (R$ 0,00 é reservado exclusivamente para Cortesias VIPs no sistema)
  let finalPrice = originalPrice - rawDiscount;
  if (finalPrice < 1.0) {
    finalPrice = 1.0;
    rawDiscount = Math.max(0, originalPrice - 1.0);
  }

  finalPrice = Math.round(finalPrice * 100) / 100;
  const discountAmount = Math.round(rawDiscount * 100) / 100;

  return {
    coupon,
    code,
    displayCode: coupon.displayCode || code,
    influencerName: coupon.influencerName || "Influencer Parceiro",
    discountType,
    discountValue,
    originalPrice,
    discountAmount,
    finalPrice,
  };
}
