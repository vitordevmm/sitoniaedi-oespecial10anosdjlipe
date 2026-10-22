import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { Ticket } from "@/types/ticket";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const email = searchParams.get("email");

    if (!userId && !email) {
      return NextResponse.json(
        { error: "Identificador (userId ou email) obrigatório." },
        { status: 400 }
      );
    }

    const ticketsRef = getAdminDb().collection("ingressos");
    let ticketDocs: any[] = [];

    if (userId) {
      const snapUid = await ticketsRef.where("userId", "==", userId).get();
      if (!snapUid.empty) {
        ticketDocs = snapUid.docs;
      }
    }

    if (ticketDocs.length === 0 && email) {
      const cleanEmail = email.toLowerCase().trim();
      const snapEmail = await ticketsRef.where("userEmail", "==", cleanEmail).get();
      if (!snapEmail.empty) {
        ticketDocs = snapEmail.docs;
      }
    }

    const tickets: Ticket[] = ticketDocs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId || "",
        userEmail: data.userEmail || "",
        userName: data.userName || "",
        userCpf: data.userCpf || "",
        sector: data.sector || "pista",
        sectorName: data.sectorName || "Pista Geral & Bar Central",
        lot: data.lot || 1,
        lotName: data.lotName || "1º Lote Oficial",
        price: data.price || 60,
        status: data.status || "approved",
        qrPayload: data.qrPayload || doc.id,
        purchaseDate: data.purchaseDate || new Date().toISOString(),
        paymentId: data.paymentId,
        paymentMethod: data.paymentMethod || "pix",
      };
    });

    return NextResponse.json({ tickets });
  } catch (error: unknown) {
    // Permite que o Next.js trate o bailout de prerender de requisições dinâmicas sem logar erro
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof (error as Record<string, unknown>).digest === "string"
    ) {
      throw error;
    }
    console.error("Error fetching user tickets:", error);
    const message = error instanceof Error ? error.message : "Erro ao carregar ingressos.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
