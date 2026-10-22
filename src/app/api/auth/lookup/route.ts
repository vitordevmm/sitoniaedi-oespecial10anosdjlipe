import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawIdentifier: string = body.identifier || "";
    const type: "email" | "cpf" | "phone" | "auto" = body.type || "auto";

    if (!rawIdentifier || typeof rawIdentifier !== "string") {
      return NextResponse.json(
        { error: "Identificador não fornecido." },
        { status: 400 }
      );
    }

    const trimmed = rawIdentifier.trim();

    // 1. If it's already an email (contains '@')
    if (trimmed.includes("@") || type === "email") {
      return NextResponse.json({ email: trimmed.toLowerCase() });
    }

    // Extract digits only
    const digits = trimmed.replace(/\D/g, "");

    if (digits.length === 0) {
      return NextResponse.json(
        { error: "Informe um e-mail, CPF ou telefone válido." },
        { status: 400 }
      );
    }

    const db = await getAdminDb();

    // 2. CHECK AS CPF (11 digits)
    if (digits.length === 11 && (type === "auto" || type === "cpf")) {
      const cleanCpf = digits;
      const formattedCpf = `${cleanCpf.slice(0, 3)}.${cleanCpf.slice(3, 6)}.${cleanCpf.slice(6, 9)}-${cleanCpf.slice(9, 11)}`;

      // Search by clean or formatted CPF
      const cpfSnap = await db
        .collection("usuarios")
        .where("cpf", "in", [cleanCpf, formattedCpf])
        .limit(1)
        .get();

      if (!cpfSnap.empty) {
        const userData = cpfSnap.docs[0].data();
        if (userData?.email) {
          return NextResponse.json({ email: String(userData.email).toLowerCase().trim() });
        }
      }
    }

    // 3. CHECK AS PHONE / WHATSAPP (10 or 11 digits, with or without 55 country code)
    if (type === "auto" || type === "phone" || digits.length >= 10) {
      let phoneDigits = digits;
      if (phoneDigits.startsWith("55") && phoneDigits.length >= 12) {
        phoneDigits = phoneDigits.slice(2);
      }

      const phoneCandidates: string[] = [
        phoneDigits,
        `+55${phoneDigits}`,
        `55${phoneDigits}`,
      ];

      if (phoneDigits.length === 11) {
        // (DD) 90000-0000 and (DD) 900000000
        phoneCandidates.push(
          `(${phoneDigits.slice(0, 2)}) ${phoneDigits.slice(2, 7)}-${phoneDigits.slice(7, 11)}`
        );
        phoneCandidates.push(
          `(${phoneDigits.slice(0, 2)}) ${phoneDigits.slice(2, 7)}${phoneDigits.slice(7, 11)}`
        );
      } else if (phoneDigits.length === 10) {
        // (DD) 0000-0000
        phoneCandidates.push(
          `(${phoneDigits.slice(0, 2)}) ${phoneDigits.slice(2, 6)}-${phoneDigits.slice(6, 10)}`
        );
      }

      // Filter unique candidates up to 10 for Firestore 'in' query limit
      const uniqueCandidates = Array.from(new Set(phoneCandidates)).slice(0, 10);

      const phoneSnap = await db
        .collection("usuarios")
        .where("telefone", "in", uniqueCandidates)
        .limit(1)
        .get();

      if (!phoneSnap.empty) {
        const userData = phoneSnap.docs[0].data();
        if (userData?.email) {
          return NextResponse.json({ email: String(userData.email).toLowerCase().trim() });
        }
      }
    }

    // 4. Not found in either
    return NextResponse.json(
      { error: "Nenhum cadastro encontrado com este CPF ou telefone. Verifique os dados ou crie sua conta." },
      { status: 404 }
    );
  } catch (error: unknown) {
    console.error("Error looking up user identifier:", error);
    const message = error instanceof Error ? error.message : "Erro interno ao localizar usuário.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
