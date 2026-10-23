import { NextRequest } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export const MASTER_ADMIN_EMAIL = "vitorhugonascimentosique@gmail.com";

export interface AuthenticatedAdmin {
  uid: string;
  email: string;
  name: string;
  role: "admin";
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

  const adminAuth = await getAdminAuth();
  const decoded = await adminAuth.verifyIdToken(idToken);
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
