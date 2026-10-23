import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { safeVerifyFirebaseToken } from "@/lib/auth/adminAuth";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Acesso não autorizado. Token ausente." },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = await safeVerifyFirebaseToken(token);
    } catch {
      return NextResponse.json(
        { error: "Sessão expirada ou inválida. Faça login novamente." },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;
    const body = await req.json();
    const { newEmail, oldEmail } = body;

    if (!newEmail || typeof newEmail !== "string" || !newEmail.includes("@")) {
      return NextResponse.json(
        { error: "Novo endereço de e-mail inválido." },
        { status: 400 }
      );
    }

    const cleanNewEmail = newEmail.trim().toLowerCase();
    const cleanOldEmail = (oldEmail || decodedToken.email || "").trim().toLowerCase();

    const db = await getAdminDb();
    const usersCol = db.collection("usuarios");

    // Fetch existing user data
    let existingData: Record<string, unknown> | null = null;
    const uidDocRef = usersCol.doc(uid);
    const uidDocSnap = await uidDocRef.get();
    if (uidDocSnap.exists) {
      existingData = uidDocSnap.data() || {};
    }

    if (!existingData && cleanOldEmail) {
      const oldDocSnap = await usersCol.doc(cleanOldEmail).get();
      if (oldDocSnap.exists) {
        existingData = oldDocSnap.data() || {};
      }
    }

    const updatedData = {
      ...(existingData || {}),
      uid,
      email: cleanNewEmail,
      updatedAt: FieldValue.serverTimestamp(),
    };

    // 1. Write to UID document
    await uidDocRef.set(updatedData, { merge: true });

    // 2. Write to new email document
    await usersCol.doc(cleanNewEmail).set(updatedData, { merge: true });

    // 3. Remove old email document if different to avoid duplicate lookups
    if (cleanOldEmail && cleanOldEmail !== cleanNewEmail) {
      try {
        await usersCol.doc(cleanOldEmail).delete();
      } catch (e) {
        console.warn("Aviso ao remover documento antigo por e-mail:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: "E-mail atualizado com sucesso no cadastro!",
    });
  } catch (err: unknown) {
    console.error("Erro na rota /api/user/update-email:", err);
    return NextResponse.json(
      { error: "Ocorreu um erro ao atualizar o e-mail no cadastro." },
      { status: 500 }
    );
  }
}
