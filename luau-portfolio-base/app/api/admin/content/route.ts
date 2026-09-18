import { NextRequest, NextResponse } from "next/server";
import { getPortfolioContent, savePortfolioContent } from "@/lib/contentStore";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { type PortfolioContent } from "@/config/portfolio";

import { isPortfolioContent } from "@/lib/contentValidation";

export const dynamic = "force-dynamic";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const content = await getPortfolioContent(true);
    return NextResponse.json({ content }, {headers:{"Cache-Control":"no-store"}});
  } catch {
    return NextResponse.json({error:"Não foi possível carregar suas configurações. Tente novamente."}, {status:503,headers:{"Cache-Control":"no-store"}});
  }
}

export async function POST(request: NextRequest) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const content = body?.content as PortfolioContent | undefined;

  if (!isPortfolioContent(content)) {
    return NextResponse.json({ error: "Conteúdo inválido" }, { status: 400 });
  }

  try {
    await savePortfolioContent(content);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({error:"Não foi possível salvar. Suas edições continuam no painel."}, {status:503});
  }
}
