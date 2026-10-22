import type { App } from "firebase-admin/app";
import type { Firestore } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";

let _adminApp: App | null = null;
let _adminDb: Firestore | null = null;
let _adminAuth: Auth | null = null;

/**
 * Obtém a instância do Firebase App de forma assíncrona com import dinâmico.
 * Este padrão previne quebras de carregamento de módulo ESM/CommonJS no Turbopack na Vercel.
 */
export async function getAdminApp(): Promise<App> {
  if (_adminApp) {
    return _adminApp;
  }

  const { getApps, initializeApp, cert } = await import("firebase-admin/app");

  if (getApps().length > 0) {
    _adminApp = getApps()[0];
    return _adminApp;
  }

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

  _adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return _adminApp;
}

/**
 * Obtém a instância do Firestore Admin.
 */
export async function getAdminDb(): Promise<Firestore> {
  if (_adminDb) {
    return _adminDb;
  }
  const app = await getAdminApp();
  const { getFirestore } = await import("firebase-admin/firestore");
  _adminDb = getFirestore(app);
  return _adminDb;
}

/**
 * Obtém a instância do Firebase Auth Admin.
 */
export async function getAdminAuth(): Promise<Auth> {
  if (_adminAuth) {
    return _adminAuth;
  }
  const app = await getAdminApp();
  const { getAuth } = await import("firebase-admin/auth");
  _adminAuth = getAuth(app);
  return _adminAuth;
}

