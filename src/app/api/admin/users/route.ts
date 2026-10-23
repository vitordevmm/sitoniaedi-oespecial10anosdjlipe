import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { verifyAdminRequest, MASTER_ADMIN_EMAIL } from "@/lib/auth/adminAuth";

export async function GET(req: NextRequest) {
  try {
    await verifyAdminRequest(req);
    const db = await getAdminDb();

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "50", 10)));
    const search = (searchParams.get("search") || "").toLowerCase().trim();
    const roleFilter = searchParams.get("role") || "all";

    const snap = await db.collection("usuarios").get();

    // Map para deduplicar documentos que possuem tanto UID quanto Email na base legada
    const usersMap = new Map<string, any>();

    snap.forEach((doc) => {
      const data = doc.data();
      const email = (data.email || doc.id).toLowerCase().trim();
      const uid = data.uid || doc.id;
      const key = email || uid;

      if (!usersMap.has(key)) {
        usersMap.set(key, {
          id: doc.id,
          uid,
          email,
          nome: data.nome || "Não informado",
          cpf: data.cpf || "",
          telefone: data.telefone || "",
          dataNascimento: data.dataNascimento || "",
          idade: data.idade || 0,
          role: email === MASTER_ADMIN_EMAIL.toLowerCase() ? "admin" : data.role || "user",
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || "",
        });
      }
    });

    let allUsers = Array.from(usersMap.values());

    // Filtros de busca
    if (search) {
      const cleanDigits = search.replace(/\D/g, "");
      allUsers = allUsers.filter((u) => {
        const matchName = u.nome.toLowerCase().includes(search);
        const matchEmail = u.email.includes(search);
        const matchCpf = cleanDigits && u.cpf.replace(/\D/g, "").includes(cleanDigits);
        const matchPhone = cleanDigits && u.telefone.replace(/\D/g, "").includes(cleanDigits);
        return matchName || matchEmail || matchCpf || matchPhone;
      });
    }

    if (roleFilter !== "all") {
      allUsers = allUsers.filter((u) => u.role === roleFilter);
    }

    // Ordenação decrescente por data de criação / nome
    allUsers.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.nome.localeCompare(b.nome);
    });

    const totalUsers = allUsers.length;
    const totalPages = Math.ceil(totalUsers / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedUsers = allUsers.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      page,
      limit,
      totalUsers,
      totalPages,
      users: paginatedUsers,
    });
  } catch (error: any) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    console.error("[Users GET Error]:", error);
    const status = error.message?.includes("Acesso negado") ? 403 : 401;
    return NextResponse.json(
      { error: error?.message || "Erro ao listar usuários." },
      { status: error.message?.includes("Token") ? 401 : status }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    const body = await req.json();

    const { targetUserId, targetEmail, newRole } = body;

    if (!newRole || !["user", "admin", "staff"].includes(newRole)) {
      return NextResponse.json(
        { error: "newRole deve ser 'user', 'admin' ou 'staff'." },
        { status: 400 }
      );
    }

    if (!targetUserId && !targetEmail) {
      return NextResponse.json(
        { error: "targetUserId ou targetEmail obrigatório." },
        { status: 400 }
      );
    }

    const cleanEmail = (targetEmail || "").toLowerCase().trim();

    // Impede alterar ou rebaixar o Master Admin
    if (cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase() && newRole !== "admin") {
      return NextResponse.json(
        { error: "O Administrador Master Oficial não pode ser rebaixado." },
        { status: 400 }
      );
    }

    const db = await getAdminDb();

    // Atualiza por UID
    if (targetUserId) {
      const docRefUid = db.collection("usuarios").doc(targetUserId);
      const snapUid = await docRefUid.get();
      if (snapUid.exists) {
        await docRefUid.update({
          role: newRole,
          updatedAt: new Date(),
          roleUpdatedBy: admin.email,
        });
      }
    }

    // Atualiza por Email se houver documento
    if (cleanEmail) {
      const docRefEmail = db.collection("usuarios").doc(cleanEmail);
      const snapEmail = await docRefEmail.get();
      if (snapEmail.exists) {
        await docRefEmail.update({
          role: newRole,
          updatedAt: new Date(),
          roleUpdatedBy: admin.email,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Função do usuário alterada para '${newRole}' com sucesso.`,
    });
  } catch (error: any) {
    console.error("[Users POST Error]:", error);
    const status = error.message?.includes("Acesso negado") ? 403 : 401;
    return NextResponse.json(
      { error: error?.message || "Erro ao atualizar permissão do usuário." },
      { status: error.message?.includes("Token") ? 401 : status }
    );
  }
}
