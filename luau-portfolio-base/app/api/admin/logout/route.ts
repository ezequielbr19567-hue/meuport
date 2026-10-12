import { NextRequest, NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/adminAuth";
import { rejectCrossOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const forbidden = rejectCrossOrigin(request);
  if (forbidden) return forbidden;
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
