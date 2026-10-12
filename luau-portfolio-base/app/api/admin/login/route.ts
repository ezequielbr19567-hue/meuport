import { NextRequest, NextResponse } from "next/server";
import { getConfiguredPassword, passwordMatches, setAdminSession } from "@/lib/adminAuth";
import { readJsonBody } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const parsed = await readJsonBody(request, 4096);
  if ("error" in parsed) return parsed.error;
  const password = typeof parsed.data?.password === "string" ? parsed.data.password : "";
  const configured = getConfiguredPassword();

  if (!configured) {
    return NextResponse.json({ error: "Acesso administrativo indisponível." }, { status: 503 });
  }

  if (!passwordMatches(password, configured)) {
    return NextResponse.json({ error: "Senha inválida" }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true });
}
