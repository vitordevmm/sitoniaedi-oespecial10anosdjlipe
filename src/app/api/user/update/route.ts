import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";
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
    const adminAuth = await getAdminAuth();
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json(
        { error: "Sessão expirada ou inválida. Faça login novamente." },
        { status: 401 }
      );
    }

    const uid = decodedToken.uid;
    const authEmail = decodedToken.email?.toLowerCase();

    const body = await req.json();
    const { telefone, nome, cpf, dataNascimento } = body;

    // Regra de Negócio Oficial: Nome, CPF e Data de Nascimento são estritamente inalteráveis
    if (nome !== undefined || cpf !== undefined || dataNascimento !== undefined) {
      return NextResponse.json(
        {
          error:
            "Por diretriz de segurança e emissão nominal de ingressos, o Nome Completo, CPF e Data de Nascimento são inalteráveis após o cadastro.",
        },
        { status: 400 }
      );
    }

    if (telefone === undefined) {
      return NextResponse.json(
        { error: "Informe o novo número de celular/WhatsApp." },
        { status: 400 }
      );
    }

    const cleanPhone = String(telefone).replace(/\D/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return NextResponse.json(
        { error: "Número de celular/WhatsApp inválido. Informe DDD + 8 ou 9 dígitos." },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {
      telefone: cleanPhone,
    };

    updates.updatedAt = FieldValue.serverTimestamp();

    const db = await getAdminDb();
    const usersCol = db.collection("usuarios");

    // Locate the user's primary document
    let existingData: Record<string, unknown> | null = null;
    let foundEmailDocRef = null;

    // A. Check by UID
    const uidDocRef = usersCol.doc(uid);
    const uidDocSnap = await uidDocRef.get();
    if (uidDocSnap.exists) {
      existingData = uidDocSnap.data() || {};
    }

    // B. Check by authEmail
    if (authEmail) {
      const emailDocRef = usersCol.doc(authEmail);
      const emailDocSnap = await emailDocRef.get();
      if (emailDocSnap.exists) {
        foundEmailDocRef = emailDocRef;
        if (!existingData) {
          existingData = emailDocSnap.data() || {};
        }
      }
    }

    // C. Query by uid field if not found by doc id
    if (!existingData) {
      const qSnap = await usersCol.where("uid", "==", uid).limit(1).get();
      if (!qSnap.empty) {
        existingData = qSnap.docs[0].data() || {};
      }
    }

    const mergedData: Record<string, unknown> = {
      ...(existingData || {}),
      ...updates,
      uid, // Preserve verified UID
      email: existingData?.email || authEmail || "",
    };

    // Ensure role and cpf are never overridden from untrusted input
    if (existingData?.cpf) mergedData.cpf = existingData.cpf;
    if (existingData?.role) mergedData.role = existingData.role;

    // Save to /usuarios/{uid}
    await uidDocRef.set(mergedData, { merge: true });

    // Also update /usuarios/{email} if it exists to maintain full compatibility
    const targetEmail = (mergedData.email as string)?.toLowerCase();
    if (targetEmail) {
      const emailDoc = usersCol.doc(targetEmail);
      await emailDoc.set(mergedData, { merge: true });
    }

    return NextResponse.json({
      success: true,
      message: "Dados cadastrais atualizados com sucesso!",
      profile: {
        ...mergedData,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    console.error("Erro na rota /api/user/update:", err);
    return NextResponse.json(
      { error: "Ocorreu um erro ao atualizar os dados. Tente novamente." },
      { status: 500 }
    );
  }
}
