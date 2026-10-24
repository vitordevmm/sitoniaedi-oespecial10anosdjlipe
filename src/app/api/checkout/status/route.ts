import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getPaymentClient } from "@/lib/mercadopago/client";

export async function GET(req: NextRequest) {
  try {
    const paymentId = req.nextUrl.searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json({ error: "paymentId é obrigatório" }, { status: 400 });
    }

    const db = await getAdminDb();
    const pedidoDoc = await db.collection("pedidos").doc(paymentId).get();

    if (pedidoDoc.exists) {
      const data = pedidoDoc.data();
      if (data?.status === "approved") {
        return NextResponse.json({
          status: "approved",
          ticketId: data?.ticketId || null,
        });
      }
    }

    // Fallback: se ainda estiver pendente no banco, checa diretamente no Mercado Pago
    // caso o webhook tenha atrasado alguns segundos
    try {
      const paymentClient = getPaymentClient();
      const mpPayment = await paymentClient.get({ id: paymentId });

      if (mpPayment.status === "approved") {
        return NextResponse.json({
          status: "approved",
          ticketId: pedidoDoc.data()?.ticketId || null,
        });
      }

      return NextResponse.json({
        status: mpPayment.status || "pending",
      });
    } catch {
      return NextResponse.json({
        status: pedidoDoc.data()?.status || "pending",
      });
    }
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error && error.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("[Checkout Status] Erro ao consultar status:", error);
    return NextResponse.json({ error: "Erro ao consultar status" }, { status: 500 });
  }
}
