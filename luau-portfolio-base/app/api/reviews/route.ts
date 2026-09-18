import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabaseAdmin";
import { type ReviewIdentityType } from "@/lib/reviews";
import { deletePublicMedia, REVIEW_IMAGE_TYPES, uploadPublicMedia } from "@/lib/storage";

export const dynamic = "force-dynamic";

const MAX_REVIEW_IMAGE_BYTES = 3 * 1024 * 1024;

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
      .select("id,display_name,identity_type,rating,title,description,image_url,image_path,status,created_at,reviewed_at")
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

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  // Honeypot for simple bots. Real visitors never fill this hidden field.
  if (clean(form.get("website"), 120)) {
    return NextResponse.json({ ok: true, pending: true });
  }

  const displayName = clean(form.get("displayName"), 50);
  const identityType = clean(form.get("identityType"), 20) as ReviewIdentityType;
  const title = clean(form.get("title"), 90);
  const description = clean(form.get("description"), 900);
  const rating = Number(form.get("rating"));
  const image = form.get("image");

  if (!displayName || !title || !description) {
    return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });
  }

  if (!["roblox", "discord", "name"].includes(identityType)) {
    return NextResponse.json({ error: "Invalid identity type." }, { status: 400 });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5." }, { status: 400 });
  }

  if (image instanceof File && image.size > 0 && !REVIEW_IMAGE_TYPES.has(image.type)) {
    return NextResponse.json({ error: "Use JPG, PNG, WEBP or GIF." }, { status: 400 });
  }

  if (image instanceof File && image.size > MAX_REVIEW_IMAGE_BYTES) {
    return NextResponse.json({ error: "Project image must be 3 MB or smaller." }, { status: 400 });
  }

  let uploaded: { path: string; url: string } | null = null;

  try {
    if (image instanceof File && image.size > 0) uploaded = await uploadPublicMedia(image, "reviews");

    const { error } = await supabase.from("portfolio_reviews").insert({
      display_name: displayName,
      identity_type: identityType,
      rating,
      title,
      description,
      image_url: uploaded?.url || "",
      image_path: uploaded?.path || null,
      status: "pending",
    });

    if (error) throw error;

    return NextResponse.json({ ok: true, pending: true });
  } catch (error) {
    console.error(error);
    if (uploaded?.path) await deletePublicMedia(uploaded.path);
    return NextResponse.json({ error: "Could not submit review." }, { status: 500 });
  }
}
