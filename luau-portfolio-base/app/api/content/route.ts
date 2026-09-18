import { NextResponse } from "next/server";
import { getPortfolioContent } from "@/lib/contentStore";
export const dynamic = "force-dynamic";
export const revalidate = 0;
const headers = { "Cache-Control": "no-store, max-age=0", "CDN-Cache-Control": "no-store" };
export async function GET() {
  try {
    return NextResponse.json({ content: await getPortfolioContent(), source: "saved" }, {headers});
  } catch {
    return NextResponse.json({ error: "Content temporarily unavailable" }, {status:503, headers:{...headers,"Retry-After":"2"}});
  }
}
