import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

function calculateAge(birthDateIso: string): number | null {
  if (!birthDateIso || !/^\d{4}-\d{2}-\d{2}$/.test(birthDateIso)) return null;
  const [year, month, day] = birthDateIso.split("-").map(Number);
  const birth = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

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
    const { nome, telefone, dataNascimento } = body;

    const updates: Record<string, unknown> = {};

    // 1. Validate Nome if provided
    if (nome !== undefined) {
      const cleanNome = String(nome).trim();
      if (cleanNome.length < 2 || cleanNome.length > 120) {
        return NextResponse.json(
          { error: "O nome completo deve conter entre 2 e 120 caracteres." },
          { status: 400 }
        );
      }
      updates.nome = cleanNome;
    }

    // 2. Validate Telefone if provided
    if (telefone !== undefined) {
      const cleanPhone = String(telefone).replace(/\D/g, "");
      if (cleanPhone.length < 10 || cleanPhone.length > 11) {
        return NextResponse.json(
          { error: "Número de celular/WhatsApp inválido. Informe DDD + 8 ou 9 dígitos." },
          { status: 400 }
        );
      }
      updates.telefone = cleanPhone;
    }

    // 3. Validate Data de Nascimento if provided
    if (dataNascimento !== undefined) {
      const cleanBirth = String(dataNascimento).trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanBirth)) {
        return NextResponse.json(
          { error: "Data de nascimento inválida. Use o formato AAAA-MM-DD." },
          { status: 400 }
        );
      }
      const age = calculateAge(cleanBirth);
      if (age === null || age < 0 || age > 120) {
        return NextResponse.json(
          { error: "Data de nascimento inconsistente." },
          { status: 400 }
        );
      }
      updates.dataNascimento = cleanBirth;
      updates.idade = age;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Nenhum dado informado para alteração." },
        { status: 400 }
      );
    }

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
