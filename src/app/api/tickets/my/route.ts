import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { Ticket } from "@/types/ticket";
import { getActiveLotForSector } from "@/lib/firebase/eventConfig";

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

    const db = await getAdminDb();
    const ticketsRef = db.collection("ingressos");
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://sintoniaedicaoespecial.online";

    // Ingressos cancelados/revogados NÃO devem constar como ingressos disponíveis do usuário
    const activeTicketDocs = ticketDocs.filter((doc) => doc.data()?.status !== "cancelled");

    // Busca configurações ativas de lote para manter ingressos de teste sempre alinhados com o Admin
    const activePistaLot = await getActiveLotForSector("pista");

    const tickets: Ticket[] = await Promise.all(
      activeTicketDocs.map(async (doc, idx) => {
        const data = doc.data();
        const num = data.ticketNumber || idx + 1;
        const numFormatted = data.ticketNumberFormatted || `#${String(num).padStart(4, "0")}`;
        const validationUrl = `${baseUrl}/validar/${doc.id}`;
        const isCourtesy =
          data.isCourtesy ||
          data.price === 0 ||
          String(data.lotName || "").toLowerCase().includes("cortesia");

        // Se for um ingresso demonstrativo de teste emitido sem pagamento real, sincroniza com o lote ativo configurado no Admin
        let currentLotName = data.lotName;
        let currentPrice = data.price;
        let currentSectorName = data.sectorName;
        let currentLot = data.lot;

        if (!data.paymentId && !isCourtesy) {
          const activeLot =
            data.sector && data.sector !== "pista"
              ? await getActiveLotForSector(data.sector)
              : activePistaLot;

          if (activeLot) {
            currentLotName = activeLot.name;
            currentPrice = activeLot.price;
            currentSectorName = activeLot.sectorName;
            currentLot = activeLot.order;

            // Se o documento no Firestore estiver com valores antigos, atualiza em background
            if (data.lotName !== currentLotName || data.price !== currentPrice) {
              doc.ref
                .update({
                  lotName: currentLotName,
                  price: currentPrice,
                  sectorName: currentSectorName,
                  lot: currentLot,
                  updatedAt: new Date(),
                })
                .catch((e: any) =>
                  console.warn("[api/tickets/my] Erro ao sincronizar ticket demo:", e)
                );
            }
          }
        }

        return {
          id: doc.id,
          ticketNumber: num,
          ticketNumberFormatted: numFormatted,
          userId: data.userId || "",
          userEmail: data.userEmail || "",
          userName: data.userName || "",
          userCpf: data.userCpf || "",
          userAge: data.userAge,
          userBirthDate: data.userBirthDate,
          sector: data.sector || "pista",
          sectorName: currentSectorName || "Pista Geral & Bar Central",
          lot: currentLot || 1,
          lotName: currentLotName || "1º Lote Oficial",
          price: currentPrice !== undefined ? currentPrice : 60,
          status: data.status || "approved",
          qrPayload: data.qrPayload?.startsWith("http") ? data.qrPayload : validationUrl,
          purchaseDate: data.purchaseDate || new Date().toISOString(),
          paymentId: data.paymentId,
          paymentMethod: data.paymentMethod || "pix",
          isCourtesy,
          checkedInAt: data.checkedInAt,
          checkedInBy: data.checkedInBy,
        };
      })
    );

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
