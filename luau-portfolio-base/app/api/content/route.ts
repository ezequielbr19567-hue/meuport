import { NextResponse } from "next/server";
import { getPortfolioContent } from "@/lib/contentStore";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = await getPortfolioContent();
  return NextResponse.json({ content });
}
