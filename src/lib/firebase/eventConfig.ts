import { getAdminDb } from "@/lib/firebase/admin";
import { DEFAULT_EVENT_CONFIG, EventConfig, LotConfig } from "@/types/config";

export const CONFIG_DOC_PATH = "configuracoes";
export const CONFIG_DOC_ID = "evento";

/**
 * Retorna as configurações oficiais do evento salvas no Firestore,
 * mescladas com os padrões caso algum campo esteja ausente.
 */
export async function getEventConfigFromDb(): Promise<EventConfig> {
  try {
    const db = await getAdminDb();
    const docRef = db.collection(CONFIG_DOC_PATH).doc(CONFIG_DOC_ID);
    const snap = await docRef.get();

    if (!snap.exists) {
      return DEFAULT_EVENT_CONFIG;
    }

    const data = snap.data() as Partial<EventConfig>;
    return {
      ingressos: {
        totalAvailable: Number(data.ingressos?.totalAvailable) || DEFAULT_EVENT_CONFIG.ingressos.totalAvailable,
      },
      lotes: Array.isArray(data.lotes) && data.lotes.length > 0 ? data.lotes : DEFAULT_EVENT_CONFIG.lotes,
      idade: {
        minAgeUnaccompanied: Number(data.idade?.minAgeUnaccompanied) || DEFAULT_EVENT_CONFIG.idade.minAgeUnaccompanied,
      },
      cortesias: {
        totalAvailable: Number(data.cortesias?.totalAvailable) || DEFAULT_EVENT_CONFIG.cortesias.totalAvailable,
      },
      updatedAt: data.updatedAt,
      updatedBy: data.updatedBy,
    };
  } catch (err) {
    console.error("[getEventConfigFromDb] Erro ao ler configuracoes/evento:", err);
    return DEFAULT_EVENT_CONFIG;
  }
}

/**
 * Retorna o lote ativo para o setor solicitado (pista, lounge_rosa, lounge_azul, camarote).
 * Caso não encontre um lote explicitamente ativo, retorna o primeiro do setor ou fallback seguro.
 */
export async function getActiveLotForSector(sector: string = "pista"): Promise<LotConfig> {
  const config = await getEventConfigFromDb();

  // 1. Busca lote explicitamente ativo para o setor
  const activeLot = config.lotes.find((l) => l.sector === sector && l.active);
  if (activeLot) return activeLot;

  // 2. Busca qualquer lote cadastrado para o setor
  const anySectorLot = config.lotes.find((l) => l.sector === sector);
  if (anySectorLot) return anySectorLot;

  // 3. Fallback no DEFAULT_EVENT_CONFIG
  const defaultLot = DEFAULT_EVENT_CONFIG.lotes.find((l) => l.sector === sector && l.active) ||
                     DEFAULT_EVENT_CONFIG.lotes.find((l) => l.sector === sector) ||
                     DEFAULT_EVENT_CONFIG.lotes[0];

  return defaultLot;
}
