import { NextRequest, NextResponse } from "next/server";
import { sendTicketIssuedEmail, sendPendingPaymentEmail } from "@/lib/email/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, type = "ticket" } = body;

    if (!to) {
      return NextResponse.json(
        { error: "Informe o campo 'to' com o e-mail de destino." },
        { status: 400 }
      );
    }

    if (type === "ticket") {
      const result = await sendTicketIssuedEmail({
        userEmail: to,
        userName: "Vitor Hugo de Freitas",
        userCpf: "12345678900",
        ticketId: "SINTONIA-10A-DEMO77",
        sectorName: "Pista Geral & Bar Central",
        lotName: "1º Lote Oficial",
        price: 60.0,
        qrPayload: JSON.stringify({
          code: "SINTONIA-10A-DEMO77",
          event: "Sintonia 10 Anos DJ Lipe",
          date: "2027-04-10",
          sector: "Pista Geral & Bar Central",
          cpf: "123.456.789-00",
        }),
      });

      return NextResponse.json({ success: true, type: "ticket", result });
    } else {
      const result = await sendPendingPaymentEmail({
        userEmail: to,
        userName: "Vitor Hugo",
        sectorName: "Pista Geral & Bar Central",
        lotName: "1º Lote Oficial",
        price: 60.0,
        pixCopiaECola:
          "00020126580014br.gov.bcb.pix0136sintonia10anos-pagamentos@mercadopago.com520400005303986540560.005802BR5925SINTONIA 10 ANOS DJ LIPE6011TUPACIGUARA62070503***6304ABCD",
        expiresInMinutes: 15,
      });

      return NextResponse.json({ success: true, type: "pending_pix", result });
    }
  } catch (error: unknown) {
    console.error("Erro no teste de email:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
