import { NextResponse } from "next/server";

export async function GET() {
  const diagnostics: Record<string, any> = {};

  try {
    diagnostics.nodeVersion = process.version;
    diagnostics.hasProjectId = !!process.env.FIREBASE_PROJECT_ID;
    diagnostics.projectId = process.env.FIREBASE_PROJECT_ID || null;
    diagnostics.hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
    diagnostics.clientEmail = process.env.FIREBASE_CLIENT_EMAIL || null;
    diagnostics.hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;

    const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
    diagnostics.keyLength = rawKey.length;
    diagnostics.keyStartsWithQuote = rawKey.startsWith('"') || rawKey.startsWith("'");
    diagnostics.keyEndsWithQuote = rawKey.endsWith('"') || rawKey.endsWith("'");
    diagnostics.keyHasLiteralSlashN = rawKey.includes("\\n");
    diagnostics.keyHasRealNewline = rawKey.includes("\n");

    let cleanKey = rawKey;
    if (
      (cleanKey.startsWith('"') && cleanKey.endsWith('"')) ||
      (cleanKey.startsWith("'") && cleanKey.endsWith("'"))
    ) {
      cleanKey = cleanKey.slice(1, -1);
    }
    cleanKey = cleanKey.replace(/\\n/g, "\n");
    diagnostics.cleanKeyBeginsWith = cleanKey.slice(0, 30);
    diagnostics.cleanKeyEndsWith = cleanKey.slice(-30);

    // Try importing firebase-admin
    try {
      const { getApps, initializeApp, cert } = await import("firebase-admin/app");
      diagnostics.importAppSuccess = true;

      const { getFirestore } = await import("firebase-admin/firestore");
      diagnostics.importFirestoreSuccess = true;

      // Try initializing
      try {
        const app =
          getApps().length > 0
            ? getApps()[0]
            : initializeApp({
                credential: cert({
                  projectId: process.env.FIREBASE_PROJECT_ID,
                  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                  privateKey: cleanKey,
                }),
              });
        diagnostics.appInitSuccess = true;

        const db = getFirestore(app);
        diagnostics.firestoreInitSuccess = true;

        const snap = await db.collection("usuarios").limit(1).get();
        diagnostics.firestoreQuerySuccess = true;
        diagnostics.docsCount = snap.size;
      } catch (initErr: any) {
        diagnostics.appInitError = {
          name: initErr?.name,
          message: initErr?.message,
          stack: initErr?.stack,
        };
      }
    } catch (importErr: any) {
      diagnostics.importError = {
        name: importErr?.name,
        message: importErr?.message,
        stack: importErr?.stack,
      };
    }

    return NextResponse.json(diagnostics);
  } catch (outerErr: any) {
    return NextResponse.json(
      {
        outerError: outerErr?.message,
        stack: outerErr?.stack,
        diagnostics,
      },
      { status: 500 }
    );
  }
}
