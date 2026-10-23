import { Firestore, FieldValue } from "firebase-admin/firestore";

/**
 * Obtém atomicamente o próximo número sequencial de ingresso.
 * Utiliza o documento /configuracoes/contadores com increment do Firestore.
 * Retorna o número e a string formatada no padrão #0001, #0002, etc.
 */
export async function getNextTicketSequence(db: Firestore): Promise<{ number: number; formatted: string }> {
  const counterRef = db.collection("configuracoes").doc("contadores");

  return await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(counterRef);
    let currentNumber = 0;

    if (doc.exists) {
      currentNumber = Number(doc.data()?.ticketSequence || 0);
    }

    const nextNumber = currentNumber + 1;

    transaction.set(
      counterRef,
      {
        ticketSequence: nextNumber,
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
