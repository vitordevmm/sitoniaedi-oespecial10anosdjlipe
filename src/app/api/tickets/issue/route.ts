import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdminRequest } from "@/lib/auth/adminAuth";
import { Ticket } from "@/types/ticket";
import { sendTicketIssuedEmail } from "@/lib/email/resend";
import { getNextTicketSequence } from "@/lib/firebase/ticketsCounter";
import { getActiveLotForSector } from "@/lib/firebase/eventConfig";

export async function POST(req: NextRequest) {
  try {
    // Trava de segurança essencial: Apenas contas de administrador podem emitir ingressos diretos de teste/demonstração
    await verifyAdminRequest(req);

    const body = await req.json();
    const { userId, userEmail, userName, userCpf, sector = "pista" } = body;

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: "Dados do usuário insuficientes para emissão do ingresso." },
        { status: 400 }
      );
    }

    const db = await getAdminDb();

    // 1. Gera numeração sequencial atômica (#0001, #0002...)
    const seq = await getNextTicketSequence(db);

    // 2. Busca dados cadastrais do titular (idade, nascimento)
    let userAge: number | undefined;
    let userBirthDate: string | undefined;

    const userSnap = await db.collection("usuarios").doc(userId).get();
    if (userSnap.exists) {
      const uData = userSnap.data();
      userAge = uData?.idade;
      userBirthDate = uData?.dataNascimento;
    } else {
      const emailSnap = await db.collection("usuarios").doc(userEmail.toLowerCase().trim()).get();
      if (emailSnap.exists) {
        const uData = emailSnap.data();
        userAge = uData?.idade;
        userBirthDate = uData?.dataNascimento;
      }
    }

    // 3. Gera ID de voucher único
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestampSec = Math.floor(Date.now() / 1000).toString().slice(-4);
    const ticketId = `SINTONIA-10A-${timestampSec}${randomHex}`;

    // 4. Busca lote ativo e valores configurados no painel administrativo
    const activeLot = await getActiveLotForSector(sector);

    // URL oficial de validação que o porteiro abre na câmera
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sintoniaedicaoespecial.online";
    const qrPayload = `${baseUrl}/validar/${ticketId}`;

    const newTicket: Ticket = {
      id: ticketId,
      ticketNumber: seq.number,
      ticketNumberFormatted: seq.formatted,
      userId,
      userEmail: userEmail.toLowerCase().trim(),
      userName: userName || "Portador do Ingresso",
      userCpf: userCpf || "",
      userAge,
      userBirthDate,
      sector: sector as any,
      sectorName: activeLot.sectorName || "Pista Geral & Bar Central",
      lot: activeLot.order || 1,
      lotName: activeLot.name || "1º Lote Oficial",
      price: Number(activeLot.price) || 60.0,
      status: "approved",
      qrPayload,
      purchaseDate: new Date().toISOString(),
      paymentMethod: "pix",
    };

    // Save in Firestore collection /ingressos/{ticketId}
    await db.collection("ingressos").doc(ticketId).set({
      ...newTicket,
      createdAt: new Date(),
    });

    // Disparar o e-mail oficial com QR Code e Voucher via Resend
    sendTicketIssuedEmail({
      userEmail: newTicket.userEmail,
      userName: newTicket.userName,
      userCpf: newTicket.userCpf,
      ticketId: newTicket.id,
      ticketNumberFormatted: newTicket.ticketNumberFormatted,
      sectorName: newTicket.sectorName,
      lotName: newTicket.lotName,
      price: newTicket.price,
      qrPayload: newTicket.qrPayload,
    }).catch((err) => {
      console.error("[Resend] Falha assíncrona ao enviar e-mail de ingresso:", err);
    });

    return NextResponse.json({ success: true, ticket: newTicket });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("Error issuing ticket:", error);
    const message = error instanceof Error ? error.message : "Erro ao emitir ingresso.";
    const status = message.includes("Token") || message.includes("não fornecido")
      ? 401
      : message.includes("Acesso negado")
      ? 403
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
