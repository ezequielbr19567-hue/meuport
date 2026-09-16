import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { isSafeHttpUrl, type ReviewIdentityType } from "@/lib/reviews";

export const dynamic = "force-dynamic";

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export async function GET() {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ reviews: [], average: null, count: 0, configured: false });
  }

  const [listResult, ratingResult] = await Promise.all([
    supabase
      .from("portfolio_reviews")
      .select("id,display_name,identity_type,rating,title,description,image_url,status,created_at,reviewed_at")
      .eq("status", "approved")
      .order("reviewed_at", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(40),
    supabase
      .from("portfolio_reviews")
      .select("rating")
      .eq("status", "approved"),
  ]);

  if (listResult.error || ratingResult.error) {
    console.error(listResult.error || ratingResult.error);
    return NextResponse.json({ reviews: [], average: null, count: 0, error: "Could not read reviews" }, { status: 500 });
  }

  const reviews = listResult.data ?? [];
  const ratings = ratingResult.data ?? [];
  const count = ratings.length;
  const average = count
    ? ratings.reduce((sum, review) => sum + Number(review.rating || 0), 0) / count
    : null;

  return NextResponse.json({ reviews, average, count, configured: true });
}

export async function POST(request: NextRequest) {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Reviews are not configured yet." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);

  // Basic bot honeypot: real visitors never fill this hidden field.
  if (clean(body?.website, 120)) {
    return NextResponse.json({ ok: true, pending: true });
  }

  const displayName = clean(body?.displayName, 50);
  const identityType = clean(body?.identityType, 20) as ReviewIdentityType;
  const title = clean(body?.title, 90);
  const description = clean(body?.description, 900);
  const imageUrl = clean(body?.imageUrl, 1200);
  const rating = Number(body?.rating);

  if (!displayName || !title || !description || !imageUrl) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }

  if (!["roblox", "discord", "name"].includes(identityType)) {
    return NextResponse.json({ error: "Invalid identity type." }, { status: 400 });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  if (!isSafeHttpUrl(imageUrl)) {
    return NextResponse.json({ error: "Project image must be a valid http/https URL." }, { status: 400 });
  }

  const { error } = await supabase.from("portfolio_reviews").insert({
    display_name: displayName,
    identity_type: identityType,
    rating,
    title,
    description,
    image_url: imageUrl,
    status: "pending",
  });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not submit review." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pending: true });
}
