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

import { isPortfolioContent } from "./contentValidation";

const CONTENT_KEY = "portfolio_content";

const POLISHED_TEXT_MIGRATIONS: Record<string, string> = {
  "Available for commissions, collaborations and long-term projects.": "",
  "Disponível para comissões, colaborações e projetos de longo prazo.": "",
  "A practical set of skills for creating polished Roblox experiences, from world building to the systems behind them.": "",
  "Um conjunto prático de habilidades para criar experiências polidas no Roblox, da construção do mundo aos sistemas por trás dele.": "",
  "Starting points for different scopes. Final pricing may vary based on scale, complexity and delivery time.": "",
  "Pontos de partida para diferentes escopos. O valor final pode variar conforme escala, complexidade e prazo de entrega.": "",
  "Use this card to showcase a lobby, hub or spawn built around strong visual identity and readable space design.":
    "A lobby, hub or spawn built around strong visual identity, readable spaces and polished presentation.",
  "Use este card para apresentar um lobby, hub ou spawn construído com foco em identidade visual e leitura do espaço.":
    "Lobby, hub ou spawn construído com foco em identidade visual, leitura do espaço e apresentação polida.",
  "Show biomes, paths, landmarks, environmental storytelling and the overall organization of your map.":
    "Biomes, paths, landmarks and environmental storytelling shaped into a cohesive explorable world.",
  "Mostre biomas, trilhas, landmarks, storytelling visual e a organização geral do seu mapa.":
    "Biomas, trilhas, landmarks e storytelling ambiental organizados em um mundo coeso e explorável.",
  "Use this space for a system you programmed without letting code compete with the builder-focused portfolio.":
    "A modular quest and progression system built in Luau with clear state management and UI integration.",
  "Use este espaço para um sistema que você programou sem deixar o código competir com o portfólio focado em builder.":
    "Sistema modular de missões e progressão em Luau, com gerenciamento claro de estado e integração com UI.",
  "Add screenshots, renders or before-and-after comparisons of your work.":
    "Screenshots, renders and before-and-after comparisons from selected builds.",
  "Adicione prints, renders ou comparações de antes e depois do seu trabalho.":
    "Prints, renders e comparações de antes e depois de builds selecionadas.",
  "Paste an embeddable YouTube/Vimeo link or a public video URL.":
    "A closer look at movement, lighting and atmosphere inside the experience.",
  "Cole um link incorporável do YouTube/Vimeo ou uma URL pública de vídeo.":
    "Um olhar mais próximo sobre movimento, iluminação e atmosfera dentro da experiência.",
  "Describe exactly what you built or contributed to in this experience.":
    "Environment building, map composition and production support for the experience.",
  "Descreva exatamente o que você construiu ou contribuiu nesta experiência.":
    "Construção de ambientes, composição de mapa e suporte de produção para a experiência.",
  "Example: maps, environments, layout, optimization and technical support.":
    "Maps, environments, layout, optimization and scripting across production.",
  "Ex.: mapas, ambientação, layout, otimização e suporte técnico.":
    "Mapas, ambientação, layout, otimização e scripting durante a produção.",
  "Maps, environments, layout, optimization and technical support across production.":
    "Maps, environments, layout, optimization and scripting across production.",
  "Mapas, ambientação, layout, otimização e suporte técnico durante a produção.":
    "Mapas, ambientação, layout, otimização e scripting durante a produção.",
  "Programming stays in its own section: Luau systems, modular organization, interfaces and technical support when the project needs it.":
    "Luau systems, modular architecture and interfaces for projects that need more than building alone.",
  "A programação fica em uma seção própria: sistemas em Luau, organização modular, interfaces e suporte técnico quando o projeto exige.":
    "Sistemas em Luau, arquitetura modular e interfaces para projetos que precisam ir além da construção.",
  "Luau systems, modular architecture, interfaces and technical support for projects that need more than building alone.":
    "Luau systems, modular architecture and interfaces for projects that need more than building alone.",
  "Sistemas em Luau, arquitetura modular, interfaces e suporte técnico para projetos que precisam ir além da construção.":
    "Sistemas em Luau, arquitetura modular e interfaces para projetos que precisam ir além da construção.",
  "Roblox Studio builder and developer focused on maps, environments, visual composition and technical support to turn ideas into polished experiences.":
    "Roblox Studio builder and developer focused on maps, environments, visual composition and Luau systems that turn ideas into polished experiences.",
  "Builder e developer de Roblox Studio com foco em mapas, ambientação, composição visual e suporte técnico para transformar ideias em experiências profissionais.":
    "Builder e developer de Roblox Studio com foco em mapas, ambientação, composição visual e sistemas em Luau para transformar ideias em experiências profissionais.",
};

function polishSavedText(value: LocalizedText): LocalizedText {
  if (typeof value === "string") return POLISHED_TEXT_MIGRATIONS[value] || value;
  return {
    en: POLISHED_TEXT_MIGRATIONS[value.en] || value.en,
    pt: POLISHED_TEXT_MIGRATIONS[value.pt] || value.pt,
  };
}

function upgradeText(value: LocalizedText | undefined, fallback: LocalizedText): LocalizedText {
  if (value && typeof value === "object" && "en" in value && "pt" in value) return polishSavedText(value);
  if (typeof value === "string") {
    return polishSavedText({
      en: value,
      pt: value,
    });
  }
  return polishSavedText(fallback);
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

export async function getPortfolioContent(allowEmpty = false): Promise<PortfolioContent> {
  const supabase = getAdminClient();
  if (!supabase) throw new Error("Content storage is not configured");

  const { data, error } = await supabase
    .from("site_content")
    .select("content")
    .eq("id", CONTENT_KEY)
    .abortSignal(AbortSignal.timeout(10000))
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error("Content storage temporarily unavailable");
  }

  if (!data) {
    if (allowEmpty) return defaultPortfolio;
    throw new Error("No published content");
  }
  if (!data.content || typeof data.content !== "object" || Array.isArray(data.content)) throw new Error("Invalid stored content");
  const content = upgradeContent(data.content as Partial<PortfolioContent>);
  if (!isPortfolioContent(content)) throw new Error("Invalid stored content");
  return content;
}

export async function savePortfolioContent(content: PortfolioContent) {
  if (!isPortfolioContent(content)) throw new Error("Invalid content");
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
