import {
  defaultPortfolio,
  type LocalizedText,
  type MediaItem,
  type PortfolioCard,
  type PortfolioContent,
  type PriceItem,
  type RobloxGame,
} from "@/config/portfolio";
import { text } from "@/lib/i18n";
import { getAdminClient } from "@/lib/supabaseAdmin";

const CONTENT_KEY = "portfolio_content";

function upgradeText(value: LocalizedText | undefined, fallback: LocalizedText): LocalizedText {
  if (value && typeof value === "object" && "en" in value && "pt" in value) return value;
  if (typeof value === "string") {
    return {
      en: text(fallback, "en") || value,
      pt: value,
    };
  }
  return fallback;
}

function upgradeList(values: LocalizedText[] | undefined, fallback: LocalizedText[]) {
  if (!Array.isArray(values)) return fallback;
  return values.map((value, index) => upgradeText(value, fallback[index] || value || ""));
}

function upgradeProject(item: PortfolioCard, fallback: PortfolioCard): PortfolioCard {
  return {
    ...fallback,
    ...item,
    title: upgradeText(item.title, fallback.title),
    description: upgradeText(item.description, fallback.description),
    highlight: upgradeText(item.highlight, fallback.highlight || ""),
    tags: upgradeList(item.tags, fallback.tags),
  };
}

function upgradePrice(item: PriceItem, fallback: PriceItem): PriceItem {
  return {
    ...fallback,
    ...item,
    title: upgradeText(item.title, fallback.title),
    price: upgradeText(item.price, fallback.price),
    description: upgradeText(item.description, fallback.description),
    highlight: upgradeText(item.highlight, fallback.highlight || ""),
    features: upgradeList(item.features, fallback.features),
  };
}

function upgradeMedia(item: MediaItem, fallback: MediaItem): MediaItem {
  return {
    ...fallback,
    ...item,
    title: upgradeText(item.title, fallback.title),
    description: upgradeText(item.description, fallback.description || ""),
  };
}

function upgradeGame(item: RobloxGame, fallback: RobloxGame): RobloxGame {
  return {
    ...fallback,
    ...item,
    label: upgradeText(item.label, fallback.label),
    role: upgradeText(item.role, fallback.role),
    contribution: upgradeText(item.contribution, fallback.contribution),
  };
}

function upgradeContent(saved: Partial<PortfolioContent>): PortfolioContent {
  const owner = saved.owner || defaultPortfolio.owner;
  const links = saved.links || defaultPortfolio.links;

  return {
    owner: {
      ...defaultPortfolio.owner,
      ...owner,
      displayName: owner.displayName || defaultPortfolio.owner.displayName,
      username: owner.username || defaultPortfolio.owner.username,
      status: upgradeText(owner.status, defaultPortfolio.owner.status),
      intro: upgradeText(owner.intro, defaultPortfolio.owner.intro),
      heroTitleTop: upgradeText(owner.heroTitleTop, defaultPortfolio.owner.heroTitleTop),
      heroTitleAccent: upgradeText(owner.heroTitleAccent, defaultPortfolio.owner.heroTitleAccent),
      heroTitleBottom: upgradeText(owner.heroTitleBottom, defaultPortfolio.owner.heroTitleBottom),
      builderPitch: upgradeText(owner.builderPitch, defaultPortfolio.owner.builderPitch),
      programmerPitch: upgradeText(owner.programmerPitch, defaultPortfolio.owner.programmerPitch),
    },
    links: { ...defaultPortfolio.links, ...links },
    builderSkills: upgradeList(saved.builderSkills, defaultPortfolio.builderSkills),
    programmerSkills: upgradeList(saved.programmerSkills, defaultPortfolio.programmerSkills),
    builderProjects: (saved.builderProjects || defaultPortfolio.builderProjects).map((item, index) =>
      upgradeProject(item, defaultPortfolio.builderProjects[index] || defaultPortfolio.builderProjects[0])
    ),
    programmerProjects: (saved.programmerProjects || defaultPortfolio.programmerProjects).map((item, index) =>
      upgradeProject(item, defaultPortfolio.programmerProjects[index] || defaultPortfolio.programmerProjects[0])
    ),
    prices: (saved.prices || defaultPortfolio.prices).map((item, index) =>
      upgradePrice(item, defaultPortfolio.prices[index] || defaultPortfolio.prices[0])
    ),
    media: (saved.media || defaultPortfolio.media).map((item, index) =>
      upgradeMedia(item, defaultPortfolio.media[index] || defaultPortfolio.media[0])
    ),
    games: (saved.games || defaultPortfolio.games).map((item, index) =>
      upgradeGame(item, defaultPortfolio.games[index] || defaultPortfolio.games[0])
    ),
  };
}

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

  if (!data?.content) return defaultPortfolio;
  return upgradeContent(data.content as Partial<PortfolioContent>);
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
