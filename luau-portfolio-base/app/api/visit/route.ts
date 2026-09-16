import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function POST() {
  const supabase = getAdminClient();

  if (!supabase) {
    return NextResponse.json({ visits: null, configured: false });
  }

  const { data, error } = await supabase.rpc("increment_stat", {
    stat_id: "portfolio_visits",
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not update visit count" }, { status: 500 });
  }

  return NextResponse.json({ visits: Number(data), configured: true });
}

export async function GET() {
  const supabase = getAdminClient();

  if (!supabase) {
    return NextResponse.json({ visits: null, configured: false });
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
