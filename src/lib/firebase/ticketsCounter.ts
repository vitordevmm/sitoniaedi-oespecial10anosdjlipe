import { Firestore } from "firebase-admin/firestore";

/**
 * Obtém atomicamente o menor número sequencial de ingresso disponível.
 * Regra de negócio: Se o ingresso #0001 for revogado/excluído e estiver no #0010,
 * a próxima compra preenche o primeiro número livre (#0001).
 * Retorna o número e a string formatada no padrão #0001, #0002, etc.
 */
export async function getNextTicketSequence(db: Firestore): Promise<{ number: number; formatted: string }> {
  const counterRef = db.collection("configuracoes").doc("contadores");

  return await db.runTransaction(async (transaction) => {
    // 1. Busca todos os ingressos existentes na base para mapear números ocupados
    const ticketsQuery = db.collection("ingressos").select("ticketNumber", "ticketNumberFormatted", "status");
    const ticketsSnap = await transaction.get(ticketsQuery);

    const occupiedNumbers = new Set<number>();

    ticketsSnap.docs.forEach((doc) => {
      const data = doc.data();
      // Ingressos cancelados/revogados ou excluídos NÃO ocupam numeração
      if (data.status !== "cancelled") {
        let num = data.ticketNumber;
        if (!num && data.ticketNumberFormatted) {
          num = parseInt(String(data.ticketNumberFormatted).replace(/\D/g, ""), 10);
        }
        if (typeof num === "number" && !isNaN(num) && num > 0) {
          occupiedNumbers.add(num);
        }
      }
    });

    // 2. Encontra o primeiro número livre a partir de 1 (#0001, #0002...)
    let nextNumber = 1;
    while (occupiedNumbers.has(nextNumber)) {
      nextNumber++;
    }

    // 3. Atualiza o documento de contadores com o maior número já alcançado e o último atribuído
    const counterDoc = await transaction.get(counterRef);
    let highestSequence = 0;
    if (counterDoc.exists) {
      highestSequence = Number(counterDoc.data()?.ticketSequence || 0);
    }
    const maxSequence = Math.max(highestSequence, nextNumber);

    transaction.set(
      counterRef,
      {
        ticketSequence: maxSequence,
        lastAssignedNumber: nextNumber,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    const formatted = `#${String(nextNumber).padStart(4, "0")}`;
    return { number: nextNumber, formatted };
  });
}

/**
 * Formata um número em padrão sequencial (#0001, #0042)
 */
export function formatTicketNumber(num?: number | string): string {
  if (!num) return "#0001";
  const n = typeof num === "string" ? parseInt(num.replace(/\D/g, ""), 10) : num;
  if (isNaN(n) || n <= 0) return "#0001";
  return `#${String(n).padStart(4, "0")}`;
}
