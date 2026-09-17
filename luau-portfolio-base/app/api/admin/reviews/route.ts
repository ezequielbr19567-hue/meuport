import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getAdminClient } from "@/lib/supabaseAdmin";
import type { ReviewStatus } from "@/lib/reviews";
import { deletePublicMedia } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ reviews: [], configured: false });

  const [listResult, ratingResult] = await Promise.all([
    supabase
      .from("portfolio_reviews")
      .select("id,display_name,identity_type,rating,title,description,image_url,image_path,status,created_at,reviewed_at")
      .order("created_at", { ascending: false })
      .limit(300),
    supabase
      .from("portfolio_reviews")
      .select("rating")
      .eq("status", "approved"),
  ]);

  if (listResult.error || ratingResult.error) {
    console.error(listResult.error || ratingResult.error);
    return NextResponse.json({ error: "Could not read reviews" }, { status: 500 });
  }

  const priority: Record<string, number> = { pending: 0, approved: 1, rejected: 2 };
  const reviews = [...(listResult.data ?? [])].sort((a, b) => {
    const statusDelta = (priority[a.status] ?? 9) - (priority[b.status] ?? 9);
    if (statusDelta !== 0) return statusDelta;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const ratings = ratingResult.data ?? [];
  const average = ratings.length
    ? ratings.reduce((sum, review) => sum + Number(review.rating || 0), 0) / ratings.length
    : null;

  return NextResponse.json({ reviews, average, approvedCount: ratings.length, configured: true });
}

export async function PATCH(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const body = await request.json().catch(() => null);
  const id = String(body?.id || "");
  const status = String(body?.status || "") as ReviewStatus;

  if (!id || !["pending", "approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { error } = await supabase
    .from("portfolio_reviews")
    .update({
      status,
      reviewed_at: status === "pending" ? null : new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not update review" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const body = await request.json().catch(() => null);
  const id = String(body?.id || "");
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const { data: review, error: readError } = await supabase
    .from("portfolio_reviews")
    .select("image_path")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    console.error(readError);
    return NextResponse.json({ error: "Could not read review" }, { status: 500 });
  }

  const { error } = await supabase.from("portfolio_reviews").delete().eq("id", id);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not delete review" }, { status: 500 });
  }

  if (review?.image_path) await deletePublicMedia(review.image_path);

  return NextResponse.json({ ok: true });
}
