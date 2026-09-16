import { NextRequest, NextResponse } from "next/server";
import { getPortfolioContent, savePortfolioContent } from "@/lib/contentStore";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { type PortfolioContent } from "@/config/portfolio";

export const dynamic = "force-dynamic";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const content = await getPortfolioContent();
  return NextResponse.json({ content });
}

export async function POST(request: NextRequest) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const content = body?.content as PortfolioContent | undefined;

  if (!content) {
    return NextResponse.json({ error: "Conteúdo inválido" }, { status: 400 });
  }

  await savePortfolioContent(content);
  return NextResponse.json({ ok: true });
}
