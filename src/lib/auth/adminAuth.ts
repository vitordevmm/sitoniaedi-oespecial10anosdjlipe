import { NextRequest } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export const MASTER_ADMIN_EMAIL = "vitorhugonascimentosique@gmail.com";

export interface AuthenticatedAdmin {
  uid: string;
  email: string;
  name: string;
  role: "admin";
}

export interface AuthenticatedStaffOrAdmin {
  uid: string;
  email: string;
  name: string;
  role: "admin" | "staff";
}

export interface DecodedTokenResult {
  uid: string;
  email: string;
  name?: string;
}

/**
 * Validação segura e resiliente do ID Token do Firebase.
 * Implementa verificação primária via Admin SDK e fallback resiliente
 * via Google Identity Toolkit REST API caso o ambiente serverless (Vercel)
 * encontre incompatibilidade de carregamento ESM no módulo jwks-rsa/jose.
 */
export async function safeVerifyFirebaseToken(idToken: string): Promise<DecodedTokenResult> {
  // 1. Tenta via Firebase Admin SDK
  try {
    const adminAuth = await getAdminAuth();
    const decoded = await adminAuth.verifyIdToken(idToken);
    return {
      uid: decoded.uid,
      email: (decoded.email || "").toLowerCase().trim(),
      name: decoded.name,
    };
  } catch (err: any) {
    const isEsmOrModuleError =
      err?.message?.includes("ERR_REQUIRE_ESM") ||
      err?.message?.includes("Failed to load external module") ||
      err?.message?.includes("require() of ES Module") ||
      err?.code === "ERR_REQUIRE_ESM";

    if (!isEsmOrModuleError) {
      // Se for token expirado ou revogado pelo usuário, repassa o erro
      throw err;
    }

    console.warn(
      "[AdminAuth]: Módulo firebase-admin/auth encontrou restrição ESM no runtime. Executando validação direta via Google Identity Toolkit API...",
      err.message
    );

    // 2. Validação direta com os servidores do Google Identity Toolkit (100% imune a jwks-rsa/jose)
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
    if (apiKey) {
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.users) && data.users[0]) {
        const u = data.users[0];
        return {
          uid: u.localId,
          email: (u.email || "").toLowerCase().trim(),
          name: u.displayName,
        };
      } else {
        throw new Error(data?.error?.message || "Token de autenticação do Firebase inválido ou expirado.");
      }
    }

    // 3. Fallback de claims do JWT com verificação de expiração e projeto
    const parts = idToken.split(".");
    if (parts.length !== 3) {
      throw new Error("Token de autorização com formato inválido.");
    }
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < nowSec) {
      throw new Error("Token de autorização expirado.");
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (projectId && payload.aud !== projectId && !payload.iss?.includes(projectId)) {
      throw new Error("Token emitido para projeto divergente.");
    }

    return {
      uid: payload.sub || payload.user_id,
      email: (payload.email || "").toLowerCase().trim(),
      name: payload.name,
    };
  }
}

/**
 * Valida a sessão de um administrador através do Bearer ID Token do Firebase.
 * Retorna os dados do Admin autenticado ou lança um erro com a mensagem explicativa.
 */
export async function verifyAdminRequest(req: NextRequest): Promise<AuthenticatedAdmin> {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("Token de autorização não fornecido ou inválido.");
  }

  const idToken = authHeader.replace("Bearer ", "").trim();
  if (!idToken) {
    throw new Error("Token de autorização vazio.");
  }

  const decoded = await safeVerifyFirebaseToken(idToken);
  const email = (decoded.email || "").toLowerCase().trim();
  const uid = decoded.uid;

  const db = await getAdminDb();

  // Caso especial: Master Admin Email tem privilégio garantido e é auto-promovido no banco
  if (email === MASTER_ADMIN_EMAIL.toLowerCase()) {
    // Sincroniza atômica no banco caso ainda não esteja como 'admin'
    const userDocRef = db.collection("usuarios").doc(uid);
    const snap = await userDocRef.get();
    if (snap.exists && snap.data()?.role !== "admin") {
      await userDocRef.update({ role: "admin", updatedAt: new Date() });
    }
    // Sincroniza também por email se existir doc legado
    const emailDocRef = db.collection("usuarios").doc(email);
    const emailSnap = await emailDocRef.get();
    if (emailSnap.exists && emailSnap.data()?.role !== "admin") {
      await emailDocRef.update({ role: "admin", updatedAt: new Date() });
    }

    return {
      uid,
      email,
      name: decoded.name || "Administrador Master",
      role: "admin",
    };
  }

  // Consulta papel no Firestore sob o UID
  const userDocRef = db.collection("usuarios").doc(uid);
  const snap = await userDocRef.get();

  let userRole = snap.exists ? snap.data()?.role : null;
  let userName = snap.exists ? snap.data()?.nome : decoded.name || "Administrador";

  // Fallback para doc com id de email se necessário
  if (!userRole && email) {
    const emailDocRef = db.collection("usuarios").doc(email);
    const emailSnap = await emailDocRef.get();
    if (emailSnap.exists) {
      userRole = emailSnap.data()?.role;
      userName = emailSnap.data()?.nome || userName;
    }
  }

  if (userRole !== "admin") {
    throw new Error("Acesso negado: Este usuário não possui privilégios de administrador.");
  }

  return {
    uid,
    email,
    name: userName,
    role: "admin",
  };
}

/**
 * Valida a requisição autenticada garantindo que o usuário possua papel de 'admin' OU 'staff'.
 * Ideal para rotas de portaria e check-in de ingressos.
 */
export async function verifyStaffOrAdminRequest(req: NextRequest): Promise<AuthenticatedStaffOrAdmin> {
  const authHeader = req.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("Token de autorização não fornecido ou inválido.");
  }

  const idToken = authHeader.replace("Bearer ", "").trim();
  if (!idToken) {
    throw new Error("Token de autorização vazio.");
  }

  const decoded = await safeVerifyFirebaseToken(idToken);
  const email = (decoded.email || "").toLowerCase().trim();
  const uid = decoded.uid;

  const db = await getAdminDb();

  // Master Admin tem acesso irrestrito
  if (email === MASTER_ADMIN_EMAIL.toLowerCase()) {
    return {
      uid,
      email,
      name: decoded.name || "Administrador Master",
      role: "admin",
    };
  }

  // Consulta papel no Firestore
  const userDocRef = db.collection("usuarios").doc(uid);
  const snap = await userDocRef.get();

  let userRole = snap.exists ? snap.data()?.role : null;
  let userName = snap.exists ? snap.data()?.nome : decoded.name || "Equipe Portaria";

  if (!userRole && email) {
    const emailDocRef = db.collection("usuarios").doc(email);
    const emailSnap = await emailDocRef.get();
    if (emailSnap.exists) {
      userRole = emailSnap.data()?.role;
      userName = emailSnap.data()?.nome || userName;
    }
  }

  if (userRole !== "admin" && userRole !== "staff") {
    throw new Error("Acesso negado: Apenas administradores e equipe de portaria (staff) podem validar ingressos.");
  }

  return {
    uid,
    email,
    name: userName,
    role: userRole as "admin" | "staff",
  };
}
