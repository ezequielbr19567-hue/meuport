import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ visits: 0, configured: false });
  }

  const { data, error } = await supabase
    .from("site_stats")
    .select("value")
    .eq("id", "portfolio_visits")
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not read visit count" }, { status: 500 });
  }

  return NextResponse.json({ visits: Number(data?.value ?? 0), configured: true });
}

export async function POST(request: NextRequest) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const visits = Number(body?.visits ?? 0);
  if (!Number.isFinite(visits) || visits < 0) {
    return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
  }

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const { error } = await supabase.from("site_stats").upsert(
    {
      id: "portfolio_visits",
      value: Math.floor(visits),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not save visit count" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
