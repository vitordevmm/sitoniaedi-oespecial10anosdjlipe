import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdminRequest } from "@/lib/auth/adminAuth";

export async function POST(req: NextRequest) {
  try {
    await verifyAdminRequest(req);
    const body = await req.json();

    const { rawCode } = body;

    if (!rawCode) {
      return NextResponse.json(
        { error: "Código ou payload do QR Code é obrigatório." },
        { status: 400 }
      );
    }

    let ticketId = String(rawCode).trim();

    // Se o leitor ler um JSON completo do QR Code
    if (ticketId.startsWith("{") && ticketId.endsWith("}")) {
      try {
        const parsed = JSON.parse(ticketId);
        if (parsed.code) {
          ticketId = String(parsed.code).trim();
        }
      } catch {
        // mantém o texto original
      }
    }

    const db = await getAdminDb();
    const docRef = db.collection("ingressos").doc(ticketId);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({
        found: false,
        valid: false,
        message: `Ingresso "${ticketId}" NÃO ENCONTRADO no sistema. Verifique a autenticidade do código.`,
      });
    }

    const data = snap.data()!;
    const status = data.status || "approved";

    return NextResponse.json({
      found: true,
      valid: status === "approved",
      ticket: {
        id: ticketId,
        userName: data.userName,
        userEmail: data.userEmail,
        userCpf: data.userCpf,
        sectorName: data.sectorName,
        lotName: data.lotName,
        price: data.price,
        status,
        isCourtesy: data.price === 0,
        purchaseDate: data.purchaseDate,
        checkedInAt: data.checkedInAt || null,
        checkedInBy: data.checkedInBy || null,
      },
    });
  } catch (error: any) {
    console.error("[Scanner Verify Error]:", error);
    const status = error.message?.includes("Acesso negado") ? 403 : 401;
    return NextResponse.json(
      { error: error?.message || "Erro na validação do código." },
      { status: error.message?.includes("Token") ? 401 : status }
    );
  }
}
