import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdminRequest } from "@/lib/auth/adminAuth";
import { DEFAULT_EVENT_CONFIG, EventConfig } from "@/types/config";

const CONFIG_DOC_PATH = "configuracoes";
const CONFIG_DOC_ID = "evento";

import { getEventConfigFromDb } from "@/lib/firebase/eventConfig";

/**
 * GET /api/admin/config
 * Retorna as configurações oficiais do evento (Lotes, Capacidade, Idade Mínima, Cortesias).
 */
export async function GET() {
  try {
    const config = await getEventConfigFromDb();
    return NextResponse.json({ config });
  } catch (error: any) {
    console.error("[Config GET Error]:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configurações do evento.", details: error?.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/config
 * Salva e atualiza as configurações do evento. Apenas administradores autenticados.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    const body = await req.json();

    const { ingressos, lotes, idade, cortesias } = body;

    if (!ingressos || !lotes || !idade || !cortesias) {
      return NextResponse.json(
        { error: "Payload incompleto para configurações do evento." },
        { status: 400 }
      );
    }

    const updatedConfig: EventConfig = {
      ingressos: {
        totalAvailable: Number(ingressos.totalAvailable) || DEFAULT_EVENT_CONFIG.ingressos.totalAvailable,
      },
      lotes: Array.isArray(lotes) ? lotes : DEFAULT_EVENT_CONFIG.lotes,
      idade: {
        minAgeUnaccompanied: Number(idade.minAgeUnaccompanied) || 17,
      },
      cortesias: {
        totalAvailable: Number(cortesias.totalAvailable) || 150,
      },
      updatedAt: new Date().toISOString(),
      updatedBy: admin.email,
    };

    const db = await getAdminDb();
    await db.collection(CONFIG_DOC_PATH).doc(CONFIG_DOC_ID).set(updatedConfig, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Configurações salvas com sucesso!",
      config: updatedConfig,
    });
  } catch (error: any) {
    console.error("[Config POST Error]:", error);
    const status = error.message?.includes("Acesso negado") ? 403 : 401;
    return NextResponse.json(
      { error: error?.message || "Erro ao salvar configurações." },
      { status: error.message?.includes("Token") ? 401 : status }
    );
  }
}
