import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyStaffOrAdminRequest } from "@/lib/auth/adminAuth";
import { sendTicketIssuedEmail } from "@/lib/email/resend";

export async function POST(req: NextRequest) {
  try {
    const userAuth = await verifyStaffOrAdminRequest(req);
    const body = await req.json();

    const { ticketId, action, targetUserEmail } = body;

    if (!ticketId || !action) {
      return NextResponse.json(
        { error: "ticketId e action ('revoke' | 'validate' | 'transfer' | 'delete') são obrigatórios." },
        { status: 400 }
      );
    }

    if ((action === "revoke" || action === "transfer" || action === "delete") && userAuth.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas administradores podem revogar, transferir ou excluir ingressos." },
        { status: 403 }
      );
    }

    const db = await getAdminDb();
    const ticketRef = db.collection("ingressos").doc(ticketId);
    const ticketSnap = await ticketRef.get();

    if (!ticketSnap.exists) {
      return NextResponse.json(
        { error: `Ingresso com código ${ticketId} não foi encontrado.` },
        { status: 404 }
      );
    }

    const ticketData = ticketSnap.data()!;

    // ==========================================
    // 0. AÇÃO: EXCLUIR DEFINITIVAMENTE INGRESSO
    // ==========================================
    if (action === "delete") {
      const ticketFormatted =
        ticketData.ticketNumberFormatted ||
        `#${String(ticketData.ticketNumber || "").padStart(4, "0")}`;

      await ticketRef.delete();

      return NextResponse.json({
        success: true,
        message: `Ingresso ${ticketFormatted} (${ticketId}) excluído com sucesso. A numeração ${ticketFormatted} foi liberada para a próxima compra!`,
      });
    }

    // ==========================================
    // 1. AÇÃO: REVOGAR INGRESSO
    // ==========================================
    if (action === "revoke") {
      await ticketRef.update({
        status: "cancelled",
        cancelledAt: new Date().toISOString(),
        cancelledBy: userAuth.email,
        updatedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: `Ingresso ${ticketId} revogado com sucesso. Entrada bloqueada.`,
      });
    }

    // ==========================================
    // 2. AÇÃO: VALIDAR ENTRADA NA CATRACA
    // ==========================================
    if (action === "validate") {
      if (ticketData.status === "cancelled") {
        return NextResponse.json(
          { error: "Atenção: Este ingresso foi REVOGADO e não pode entrar no evento." },
          { status: 400 }
        );
      }

      if (ticketData.status === "used") {
        return NextResponse.json(
          {
            error: `Ingresso JÁ UTILIZADO em ${ticketData.checkedInAt || "horário anterior"} por ${ticketData.checkedInBy || "fiscal"}.`,
            alreadyUsed: true,
            checkedInAt: ticketData.checkedInAt,
          },
          { status: 409 }
        );
      }

      const checkedInAt = new Date().toISOString();
      await ticketRef.update({
        status: "used",
        checkedInAt,
        checkedInBy: userAuth.email,
        updatedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: `Entrada autorizada! Ingresso ${ticketId} de ${ticketData.userName} validado com sucesso.`,
        checkedInAt,
      });
    }

    // ==========================================
    // 3. AÇÃO: TRANSFERIR / DAR INGRESSO
    // ==========================================
    if (action === "transfer") {
      if (!targetUserEmail) {
        return NextResponse.json(
          { error: "Informe o e-mail do usuário cadastrado para receber o ingresso." },
          { status: 400 }
        );
      }

      const cleanTargetEmail = targetUserEmail.toLowerCase().trim();

      // Busca na coleção usuarios (por email ou documento)
      let targetUserDoc: any = null;
      const emailSnap = await db.collection("usuarios").where("email", "==", cleanTargetEmail).get();

      if (!emailSnap.empty) {
        targetUserDoc = emailSnap.docs[0].data();
      } else {
        // Tenta docId direto
        const directDoc = await db.collection("usuarios").doc(cleanTargetEmail).get();
        if (directDoc.exists) {
          targetUserDoc = directDoc.data();
        }
      }

      if (!targetUserDoc) {
        return NextResponse.json(
          {
            error: `Nenhum usuário cadastrado encontrado com o e-mail "${targetUserEmail}". A pessoa deve se cadastrar no site primeiro.`,
          },
          { status: 404 }
        );
      }

      // Novo payload de QR code nominal para o destinatário
      const newQrPayload = JSON.stringify({
        code: ticketId,
        event: "Sintonia 10 Anos DJ Lipe",
        date: "2027-04-10",
        uid: targetUserDoc.uid || "",
        cpf: targetUserDoc.cpf || "",
        sector: ticketData.sectorName || "Pista",
        issuedAt: new Date().toISOString(),
      });

      await ticketRef.update({
        userId: targetUserDoc.uid || targetUserDoc.email,
        userEmail: targetUserDoc.email,
        userName: targetUserDoc.nome,
        userCpf: targetUserDoc.cpf,
        qrPayload: newQrPayload,
        transferredFrom: {
          previousUserEmail: ticketData.userEmail,
          previousUserName: ticketData.userName,
          transferredAt: new Date().toISOString(),
          transferredBy: userAuth.email,
        },
        updatedAt: new Date(),
      });

      // Dispara o e-mail oficial para o novo portador com o voucher
      sendTicketIssuedEmail({
        userEmail: targetUserDoc.email,
        userName: targetUserDoc.nome,
        userCpf: targetUserDoc.cpf,
        ticketId: ticketId,
        sectorName: ticketData.sectorName || "Pista Geral & Bar Central",
        lotName: ticketData.lotName || "Transferência Oficial",
        price: ticketData.price || 0,
        qrPayload: newQrPayload,
      }).catch((err) => {
        console.error("[Email Transfer Error]:", err);
      });

      return NextResponse.json({
        success: true,
        message: `Ingresso transferido com sucesso para ${targetUserDoc.nome} (${targetUserDoc.email}). Voucher reenviado por e-mail!`,
      });
    }

    return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
  } catch (error: any) {
    console.error("[Ticket Action Error]:", error);
    const status = error.message?.includes("Acesso negado") ? 403 : 401;
    return NextResponse.json(
      { error: error?.message || "Erro ao processar ação no ingresso." },
      { status: error.message?.includes("Token") ? 401 : status }
    );
  }
}
