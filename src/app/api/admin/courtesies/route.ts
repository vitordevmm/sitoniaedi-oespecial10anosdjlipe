import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdminRequest } from "@/lib/auth/adminAuth";
import { sendTicketIssuedEmail } from "@/lib/email/resend";
import { DEFAULT_EVENT_CONFIG, EventConfig } from "@/types/config";

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    const body = await req.json();

    const { userEmail, sector = "pista", note = "" } = body;

    if (!userEmail) {
      return NextResponse.json(
        { error: "E-mail do usuário cadastrado é obrigatório para emitir cortesia." },
        { status: 400 }
      );
    }

    const cleanEmail = userEmail.toLowerCase().trim();
    const db = await getAdminDb();

    // 1. Verifica se usuário existe na base
    let targetUser: any = null;
    const snapUser = await db.collection("usuarios").where("email", "==", cleanEmail).get();
    if (!snapUser.empty) {
      targetUser = snapUser.docs[0].data();
    } else {
      const docDirect = await db.collection("usuarios").doc(cleanEmail).get();
      if (docDirect.exists) {
        targetUser = docDirect.data();
      }
    }

    if (!targetUser) {
      return NextResponse.json(
        {
          error: `Usuário com e-mail "${userEmail}" não foi encontrado. A pessoa precisa ter cadastro no site primeiro.`,
        },
        { status: 404 }
      );
    }

    // 2. Checa limite de cortesias configurado
    const configSnap = await db.collection("configuracoes").doc("evento").get();
    const configData = configSnap.exists ? (configSnap.data() as EventConfig) : DEFAULT_EVENT_CONFIG;
    const maxCourtesies = configData.cortesias?.totalAvailable || 150;

    const allTicketsSnap = await db.collection("ingressos").get();
    let currentCourtesies = 0;
    allTicketsSnap.forEach((doc) => {
      const d = doc.data();
      if ((d.price === 0 || String(d.lotName).toLowerCase().includes("cortesia")) && d.status !== "cancelled") {
        currentCourtesies++;
      }
    });

    if (currentCourtesies >= maxCourtesies) {
      return NextResponse.json(
        {
          error: `Limite máximo de cortesias atingido (${currentCourtesies}/${maxCourtesies}). Aumente o limite na aba Configurações se desejar emitir mais.`,
        },
        { status: 400 }
      );
    }

    // 3. Setor metadata
    const sectorMap: Record<string, string> = {
      pista: "Pista Geral & Bar Central",
      lounge_rosa: "Lounge Rosa (Ala Esquerda)",
      lounge_azul: "Lounge Azul (Ala Direita)",
      camarote: "Camarote no Palco Oficial",
    };
    const sectorName = sectorMap[sector] || "Pista Geral & Bar Central";

    // 4. Gera código de voucher cortesia único
    const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
    const timestampSec = Math.floor(Date.now() / 1000).toString().slice(-4);
    const ticketId = `SINTONIA-VIP-${timestampSec}${randomHex}`;

    const qrPayload = JSON.stringify({
      code: ticketId,
      event: "Sintonia 10 Anos DJ Lipe - Cortesia Oficial",
      date: "2027-04-10",
      uid: targetUser.uid || targetUser.email,
      cpf: targetUser.cpf || "",
      sector: sectorName,
      issuedAt: new Date().toISOString(),
      type: "CORTESIA_VIP",
    });

    const courtesyTicket = {
      id: ticketId,
      userId: targetUser.uid || targetUser.email,
      userEmail: targetUser.email,
      userName: targetUser.nome,
      userCpf: targetUser.cpf,
      sector,
      sectorName,
      lot: 0,
      lotName: "Cortesia Oficial VIP",
      price: 0,
      status: "approved",
      qrPayload,
      purchaseDate: new Date().toISOString(),
      paymentMethod: "pix",
      isCourtesy: true,
      issuedBy: admin.email,
      note: note || "Cortesia emitida pelo Administrador",
      createdAt: new Date(),
    };

    await db.collection("ingressos").doc(ticketId).set(courtesyTicket);

    // 5. Dispara e-mail com voucher
    sendTicketIssuedEmail({
      userEmail: targetUser.email,
      userName: targetUser.nome,
      userCpf: targetUser.cpf,
      ticketId,
      sectorName,
      lotName: "Cortesia Oficial VIP",
      price: 0,
      qrPayload,
    }).catch((err) => {
      console.error("[Email Courtesy Error]:", err);
    });

    return NextResponse.json({
      success: true,
      message: `Cortesia emitida com sucesso para ${targetUser.nome}! Voucher enviado para ${targetUser.email}.`,
      ticket: courtesyTicket,
      currentCourtesies: currentCourtesies + 1,
      maxCourtesies,
    });
  } catch (error: any) {
    console.error("[Courtesies POST Error]:", error);
    const status = error.message?.includes("Acesso negado") ? 403 : 401;
    return NextResponse.json(
      { error: error?.message || "Erro ao emitir cortesia." },
      { status: error.message?.includes("Token") ? 401 : status }
    );
  }
}
