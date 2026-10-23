import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdminRequest, MASTER_ADMIN_EMAIL } from "@/lib/auth/adminAuth";
import { calculateAge } from "@/lib/validations/user";

export interface AutocompleteUserItem {
  id: string;
  uid: string;
  email: string;
  nome: string;
  cpf: string;
  cpfFormatted: string;
  telefone: string;
  telefoneFormatted: string;
  dataNascimento: string;
  idade: number | null;
  role: "user" | "admin" | "staff";
}

// Cache simples em memória para respostas rápidas (TTL: 30 segundos)
let cachedUsers: AutocompleteUserItem[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 30 * 1000;

function formatCpf(raw: string): string {
  const clean = (raw || "").replace(/\D/g, "");
  if (clean.length === 11) {
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9)}`;
  }
  return raw || "";
}

function formatPhone(raw: string): string {
  const clean = (raw || "").replace(/\D/g, "");
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  } else if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return raw || "";
}

function normalizeStr(str: string): string {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

async function getAllUsersList(): Promise<AutocompleteUserItem[]> {
  const now = Date.now();
  if (cachedUsers && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedUsers;
  }

  const db = await getAdminDb();
  const snap = await db.collection("usuarios").get();
  const usersMap = new Map<string, AutocompleteUserItem>();

  snap.forEach((doc) => {
    const data = doc.data();
    const email = (data.email || doc.id).toLowerCase().trim();
    const uid = data.uid || doc.id;
    const key = email || uid;

    if (!usersMap.has(key)) {
      const rawBirth = data.dataNascimento || "";
      let idade: number | null = typeof data.idade === "number" && data.idade > 0 ? data.idade : null;
      if (!idade && rawBirth) {
        try {
          const parsed = calculateAge(rawBirth);
          if (parsed >= 0 && parsed < 120) {
            idade = parsed;
          }
        } catch {}
      }

      const rawCpf = data.cpf || "";
      const rawPhone = data.telefone || "";

      usersMap.set(key, {
        id: doc.id,
        uid,
        email,
        nome: data.nome || "Não informado",
        cpf: rawCpf,
        cpfFormatted: formatCpf(rawCpf),
        telefone: rawPhone,
        telefoneFormatted: formatPhone(rawPhone),
        dataNascimento: rawBirth,
        idade,
        role: email === MASTER_ADMIN_EMAIL.toLowerCase() ? "admin" : data.role || "user",
      });
    }
  });

  cachedUsers = Array.from(usersMap.values());
  lastCacheTime = now;
  return cachedUsers;
}

export async function GET(req: NextRequest) {
  try {
    await verifyAdminRequest(req);

    const searchParams = req.nextUrl.searchParams;
    const query = (searchParams.get("q") || "").trim();
    const limit = Math.max(1, Math.min(20, parseInt(searchParams.get("limit") || "8", 10)));

    const allUsers = await getAllUsersList();

    if (!query) {
      // Retorna os primeiros usuários ordenados por nome
      const sorted = [...allUsers].sort((a, b) => a.nome.localeCompare(b.nome));
      return NextResponse.json({
        success: true,
        users: sorted.slice(0, limit),
      });
    }

    const cleanQuery = normalizeStr(query);
    const digitsOnly = query.replace(/\D/g, "");

    // Pontuação e relevância para rankear os melhores resultados
    const scoredUsers = allUsers
      .map((u) => {
        let score = 0;
        const normName = normalizeStr(u.nome);
        const normEmail = normalizeStr(u.email);
        const cleanCpf = u.cpf.replace(/\D/g, "");
        const cleanPhone = u.telefone.replace(/\D/g, "");

        // 1. Coincidência com CPF
        if (digitsOnly.length >= 2) {
          if (cleanCpf === digitsOnly) {
            score += 100; // CPF Exato
          } else if (cleanCpf.startsWith(digitsOnly)) {
            score += 80; // Início do CPF
          } else if (cleanCpf.includes(digitsOnly)) {
            score += 50; // Contém no CPF
          }
        }

        // 2. Coincidência com Nome
        if (normName === cleanQuery) {
          score += 90; // Nome exato
        } else if (normName.startsWith(cleanQuery)) {
          score += 70; // Começa com o nome
        } else if (normName.includes(cleanQuery)) {
          score += 40; // Contém no nome
        }

        // 3. Coincidência com E-mail
        if (normEmail === cleanQuery) {
          score += 85;
        } else if (normEmail.startsWith(cleanQuery)) {
          score += 65;
        } else if (normEmail.includes(cleanQuery)) {
          score += 35;
        }

        // 4. Coincidência com Telefone
        if (digitsOnly.length >= 4) {
          if (cleanPhone.includes(digitsOnly)) {
            score += 30;
          }
        }

        return { user: u, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.user.nome.localeCompare(b.user.nome));

    const results = scoredUsers.slice(0, limit).map((item) => item.user);

    return NextResponse.json({
      success: true,
      query,
      totalMatches: scoredUsers.length,
      users: results,
    });
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[Users Search Autocomplete Error]:", error);
    const status = error.message?.includes("Acesso negado") ? 403 : 401;
    return NextResponse.json(
      { error: error?.message || "Erro ao buscar usuários para autocomplete." },
      { status: error.message?.includes("Token") ? 401 : status }
    );
  }
}
