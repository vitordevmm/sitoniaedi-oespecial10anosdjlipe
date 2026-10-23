import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyStaffOrAdminRequest } from "@/lib/auth/adminAuth";
import { DEFAULT_EVENT_CONFIG, EventConfig } from "@/types/config";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userAuth = await verifyStaffOrAdminRequest(req);
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID do ingresso não fornecido." }, { status: 400 });
    }

    const db = await getAdminDb();
    const ticketDoc = await db.collection("ingressos").doc(id).get();

    if (!ticketDoc.exists) {
      return NextResponse.json(
        { error: `Ingresso "${id}" não foi encontrado no sistema.` },
        { status: 404 }
      );
    }

    const data = ticketDoc.data()!;

    // Busca idade do usuário se não estiver salva no ticket
    let userAge = data.userAge;
    let userBirthDate = data.userBirthDate;

    if (!userAge && (data.userId || data.userEmail)) {
      const uSnap = data.userId ? await db.collection("usuarios").doc(data.userId).get() : null;
      if (uSnap && uSnap.exists) {
        userAge = uSnap.data()?.idade;
        userBirthDate = uSnap.data()?.dataNascimento;
      } else if (data.userEmail) {
        const eSnap = await db.collection("usuarios").doc(data.userEmail.toLowerCase().trim()).get();
        if (eSnap.exists) {
          userAge = eSnap.data()?.idade;
          userBirthDate = eSnap.data()?.dataNascimento;
        }
      }
    }

    // Busca idade mínima configurada no evento
    let minAgeRequired = DEFAULT_EVENT_CONFIG.idade.minAgeUnaccompanied;
    try {
      const cfgSnap = await db.collection("configuracoes").doc("evento").get();
      if (cfgSnap.exists) {
        const cfgData = cfgSnap.data() as EventConfig;
        if (cfgData.idade?.minAgeUnaccompanied) {
          minAgeRequired = cfgData.idade.minAgeUnaccompanied;
        }
      }
    } catch {
      // usa fallback
    }

    const isMinor = typeof userAge === "number" && userAge < minAgeRequired;
    const num = data.ticketNumber || 1;
    const ticketNumberFormatted = data.ticketNumberFormatted || `#${String(num).padStart(4, "0")}`;

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticketDoc.id,
        ticketNumber: num,
        ticketNumberFormatted,
        userName: data.userName || "Portador Oficial",
        userEmail: data.userEmail || "",
        userCpf: data.userCpf || "",
        userAge: userAge ?? null,
        userBirthDate: userBirthDate ?? null,
        sector: data.sector || "pista",
        sectorName: data.sectorName || "Pista Geral & Bar Central",
        lotName: data.lotName || "1º Lote",
        price: data.price !== undefined ? data.price : 60,
        status: data.status || "approved",
        isCourtesy: data.isCourtesy || data.price === 0,
        purchaseDate: data.purchaseDate || null,
        checkedInAt: data.checkedInAt || null,
        checkedInBy: data.checkedInBy || null,
        isMinor,
        minAgeRequired,
      },
      viewer: {
        email: userAuth.email,
        role: userAuth.role,
      },
    });
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    const status = error.message?.includes("Acesso negado") ? 403 : 401;
    return NextResponse.json(
      { error: error?.message || "Erro ao consultar dados do ingresso." },
      { status: error.message?.includes("Token") ? 401 : status }
    );
  }
}
