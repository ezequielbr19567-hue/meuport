import { defaultPortfolio, type PortfolioContent } from "@/config/portfolio";
import { getAdminClient } from "@/lib/supabaseAdmin";

const CONTENT_KEY = "portfolio_content";

export async function getPortfolioContent(): Promise<PortfolioContent> {
  const supabase = getAdminClient();
  if (!supabase) return defaultPortfolio;

  const { data, error } = await supabase
    .from("site_content")
    .select("content")
    .eq("id", CONTENT_KEY)
    .maybeSingle();

  if (error) {
    console.error(error);
    return defaultPortfolio;
  }

  return (data?.content as PortfolioContent | null) || defaultPortfolio;
}

export async function savePortfolioContent(content: PortfolioContent) {
  const supabase = getAdminClient();
  if (!supabase) throw new Error("Supabase not configured");

  const { error } = await supabase.from("site_content").upsert(
    {
      id: CONTENT_KEY,
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) throw error;
}
