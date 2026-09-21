import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = raw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^\d+$/.test(id))
    .slice(0, 20);

  if (!ids.length) {
    return NextResponse.json({ data: [] });
  }

  const robloxUrl = `https://games.roblox.com/v1/games?universeIds=${ids.join(",")}`;

  try {
    const response = await fetch(robloxUrl, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });

    if (!response.ok) {
      return NextResponse.json({ data: [], error: "Roblox request failed" }, { status: 502 });
    }

    const body = await response.json();
    return NextResponse.json(body);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ data: [], error: "Roblox request failed" }, { status: 502 });
  }
}
