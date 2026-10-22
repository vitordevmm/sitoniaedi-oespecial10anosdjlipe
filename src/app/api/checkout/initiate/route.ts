import { NextRequest, NextResponse } from "next/server";
import { sendPendingPaymentEmail } from "@/lib/email/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userEmail,
      userName,
      sectorName = "Pista Geral & Bar Central",
      lotName = "1º Lote Oficial",
      price = 60.0,
      pixCopiaECola,
    } = body;

    if (!userEmail) {
      return NextResponse.json(
        { error: "E-mail obrigatório para reserva de ingresso e envio de PIX." },
        { status: 400 }
      );
    }

    // Exemplo de código PIX Copia e Cola caso não venha no payload
    const finalPix =
      pixCopiaECola ||
      "00020126580014br.gov.bcb.pix0136sintonia10anos-pagamentos@mercadopago.com520400005303986540560.005802BR5925SINTONIA 10 ANOS DJ LIPE6011TUPACIGUARA62070503***6304ABCD";

    // Envia o e-mail de recuperação do funil
    const emailResult = await sendPendingPaymentEmail({
      userEmail,
      userName: userName || "Membro Oficial",
      sectorName,
      lotName,
      price,
      pixCopiaECola: finalPix,
      expiresInMinutes: 15,
    });

    return NextResponse.json({
      success: true,
      message: "Reserva iniciada e e-mail de PIX pendente enviado.",
      emailResult,
    });
  } catch (error: unknown) {
    console.error("Erro em checkout/initiate:", error);
    const message = error instanceof Error ? error.message : "Erro ao iniciar checkout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
