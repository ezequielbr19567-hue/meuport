import { NextResponse } from "next/server";
import { getPortfolioContent, PortfolioContentLoadError } from "@/lib/contentStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const content = await getPortfolioContent();
    return NextResponse.json(
      { content },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    if (error instanceof PortfolioContentLoadError) {
      return NextResponse.json(
        { error: "Portfolio content is temporarily unavailable" },
        {
          status: 503,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
            "Retry-After": "2",
          },
        }
      );
    }

    console.error(error);
    return NextResponse.json({ error: "Unexpected content error" }, { status: 500 });
  }
}
