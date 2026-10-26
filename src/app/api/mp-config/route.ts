import { NextResponse } from "next/server";

export async function GET() {
  const publicKey = (process.env.NEXT_PUBLIC_MP_PUBLIC_KEY || "").trim();

  if (!publicKey) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_MP_PUBLIC_KEY não está configurada no servidor." },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  return NextResponse.json(
    { publicKey },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
