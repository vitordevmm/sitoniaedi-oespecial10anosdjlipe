import type { Firestore } from "firebase-admin/firestore";

let _adminDb: Firestore | null = null;

/**
 * Obtém a instância do Firestore Admin de forma assíncrona com import dinâmico.
 * Este padrão previne quebras de carregamento de módulo ESM/CommonJS no Turbopack na Vercel.
 */
export async function getAdminDb(): Promise<Firestore> {
  if (_adminDb) {
    return _adminDb;
  }

  const { getApps, initializeApp, cert } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");

  let app;
  if (getApps().length > 0) {
    app = getApps()[0];
  } else {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY || "";

    privateKey = privateKey.trim();
    if (
      (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
      (privateKey.startsWith("'") && privateKey.endsWith("'"))
    ) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, "\n");

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        "Credenciais do Firebase Admin ausentes no ambiente da Vercel (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)."
      );
    }

    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  _adminDb = getFirestore(app);
  return _adminDb;
}
