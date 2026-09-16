import { NextRequest, NextResponse } from "next/server";
import { getConfiguredPassword, setAdminSession } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password = String(body?.password || "");
  const configured = getConfiguredPassword();

  if (!configured) {
    return NextResponse.json({ error: "ADMIN_PASSWORD not configured" }, { status: 500 });
  }

  if (password !== configured) {
    return NextResponse.json({ error: "Senha inválida" }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true });
}
