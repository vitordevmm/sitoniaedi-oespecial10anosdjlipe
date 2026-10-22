import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { Ticket } from "@/types/ticket";
import { sendTicketIssuedEmail } from "@/lib/email/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userEmail, userName, userCpf, sector = "pista" } = body;

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "Dados do usuário insuficientes para emissão do ingresso." },
        { status: 400 }
      );
    }

    // Generate unique Ticket ID
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestampSec = Math.floor(Date.now() / 1000).toString().slice(-4);
    const ticketId = `SINTONIA-10A-${timestampSec}${randomHex}`;

    // Sector metadata
    const sectorMap: Record<string, { name: string; price: number; lotName: string }> = {
      pista: {
        name: "Pista Geral & Bar Central",
        price: 60.0,
        lotName: "1º Lote Oficial",
      },
      lounge_rosa: {
        name: "Lounge Rosa (Ala Esquerda)",
        price: 1200.0,
        lotName: "Vaga Automotiva",
      },
      lounge_azul: {
        name: "Lounge Azul (Ala Direita)",
        price: 1200.0,
        lotName: "Vaga Automotiva",
      },
      camarote: {
        name: "Camarote no Palco Oficial",
        price: 2500.0,
        lotName: "Área Exclusiva Palco",
      },
    };

    const sectorInfo = sectorMap[sector] || sectorMap.pista;

    // Secure payload for QR verification at gate
    const qrPayload = JSON.stringify({
      code: ticketId,
      event: "Sintonia 10 Anos DJ Lipe",
      date: "2027-04-10",
      uid: userId,
      cpf: userCpf || "",
      sector: sectorInfo.name,
      issuedAt: new Date().toISOString(),
    });

    const newTicket: Ticket = {
      id: ticketId,
      userId,
      userEmail: userEmail.toLowerCase().trim(),
      userName: userName || "Portador do Ingresso",
      userCpf: userCpf || "",
      sector: sector as any,
      sectorName: sectorInfo.name,
      lot: 1,
      lotName: sectorInfo.lotName,
      price: sectorInfo.price,
      status: "approved",
      qrPayload,
      purchaseDate: new Date().toISOString(),
      paymentMethod: "pix",
    };

    // Save in Firestore collection /ingressos/{ticketId}
    await adminDb.collection("ingressos").doc(ticketId).set({
      ...newTicket,
      createdAt: new Date(),
    });

    // Disparar o e-mail oficial com QR Code e Voucher via Resend
    sendTicketIssuedEmail({
      userEmail: newTicket.userEmail,
      userName: newTicket.userName,
      userCpf: newTicket.userCpf,
      ticketId: newTicket.id,
      sectorName: newTicket.sectorName,
      lotName: newTicket.lotName,
      price: newTicket.price,
      qrPayload: newTicket.qrPayload,
    }).catch((err) => {
      console.error("[Resend] Falha assíncrona ao enviar e-mail de ingresso:", err);
    });

    return NextResponse.json({ success: true, ticket: newTicket });
  } catch (error: unknown) {
    console.error("Error issuing ticket:", error);
    const message = error instanceof Error ? error.message : "Erro ao emitir ingresso.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
