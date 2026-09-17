"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  defaultPortfolio,
  type Language,
  type MediaItem,
  type PortfolioContent,
} from "@/config/portfolio";
import { text } from "@/lib/i18n";
import type { PortfolioReview, ReviewIdentityType } from "@/lib/reviews";

type RobloxApiGame = {
  id: number;
  name?: string;
  playing?: number;
  visits?: number;
};

type ReviewForm = {
  displayName: string;
  identityType: ReviewIdentityType;
  rating: number;
  title: string;
  description: string;
  imageFile: File | null;
  website: string;
};

const compact = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const ui = {
  en: {
    navBuilder: "Builder",
    navProgramming: "Programming",
    navPricing: "Pricing",
    navMedia: "Media",
    navGames: "Games",
    navReviews: "Reviews",
    navContact: "Contact",
    viewPortfolio: "View portfolio",
    robloxProfile: "Roblox profile ↗",
    mainFocus: "MAIN FOCUS",
    separateArea: "PROGRAMMING",
    programming: "Programming",
    siteVisits: "site visits",
    builderProjects: "builder projects",
    contributedGames: "games contributed to",
    priceRanges: "price ranges",
    ratingLabel: "average rating",
    noRatings: "",
    reviewsCount: "approved reviews",
    builderKicker: "BUILDER SHOWCASE",
    builderTitle: "Builds",
    builderDescription: "",
    programmingKicker: "PROGRAMMING",
    programmingTitle: "Systems",
    programmingDescription: "",
    pricingKicker: "PRICING",
    pricingTitle: "Services & pricing",
    pricingDescription: "",
    mediaKicker: "MEDIA",
    mediaTitle: "Images and videos",
    mediaDescription: "Selected screenshots, renders and motion showcases from projects and environments.",
    image: "Image",
    video: "Video",
    noDescription: "No description.",
    gamesKicker: "CONTRIBUTIONS",
    gamesTitle: "Games I worked on",
    gamesDescription: "Selected Roblox experiences where I contributed to building, environments or development.",
    visits: "visits",
    playingNow: "playing now",
    reviewsKicker: "REVIEWS",
    reviewsTitle: "What people say about my work",
    reviewsDescription: "",
    leaveReview: "Leave a review",
    reviewFormDescription: "",
    identityLabel: "How should your name appear?",
    identityRoblox: "Roblox username",
    identityDiscord: "Discord username",
    identityName: "Custom name",
    displayName: "Username / name",
    stars: "Rating",
    reviewTitle: "Project title",
    reviewTitlePlaceholder: "Project or commission title",
    reviewDescription: "Description",
    reviewDescriptionPlaceholder: "What was your experience and what did I work on?",
    projectImage: "Project image",
    projectImageHint: "Choose a JPG, PNG, WEBP or GIF file up to 3 MB.",
    submitReview: "Send for approval",
    sendingReview: "Sending...",
    reviewSuccess: "Thanks! Your review was sent and is waiting for approval.",
    reviewError: "Could not send the review. Check the required fields and image file.",
    noReviewsTitle: "",
    noReviewsText: "",
    approvedReview: "Approved review",
    stackKicker: "STACK",
    stackTitle: "Builder and developer",
    stackDescription: "",
    builder: "BUILDER",
    contactKicker: "CONTACT",
    contactTitle: "Need a map, environment or system for your game?",
    contactDescription: "",
    email: "Email",
    footer: "Builder • Roblox Studio • Luau",
    developerMode: "Developer mode",
    mediaEmpty: "Media coming soon.",
    openVideo: "Open video ↗",
    loading: "LOADING",
    connectionIssue: "Could not reach the portfolio data.",
    retry: "Retry",
  },
  pt: {
    navBuilder: "Builder",
    navProgramming: "Programação",
    navPricing: "Valores",
    navMedia: "Mídia",
    navGames: "Jogos",
    navReviews: "Avaliações",
    navContact: "Contato",
    viewPortfolio: "Ver portfólio",
    robloxProfile: "Perfil Roblox ↗",
    mainFocus: "FOCO PRINCIPAL",
    separateArea: "PROGRAMAÇÃO",
    programming: "Programação",
    siteVisits: "visitas no site",
    builderProjects: "projetos builder",
    contributedGames: "jogos com contribuição",
    priceRanges: "faixas de valores",
    ratingLabel: "média de avaliações",
    noRatings: "",
    reviewsCount: "avaliações aprovadas",
    builderKicker: "BUILDER SHOWCASE",
    builderTitle: "Construções",
    builderDescription: "",
    programmingKicker: "PROGRAMAÇÃO",
    programmingTitle: "Sistemas",
    programmingDescription: "",
    pricingKicker: "VALORES",
    pricingTitle: "Serviços e valores",
    pricingDescription: "",
    mediaKicker: "MÍDIA",
    mediaTitle: "Imagens e vídeos",
    mediaDescription: "Seleção de prints, renders e showcases em movimento de projetos e ambientes.",
    image: "Imagem",
    video: "Vídeo",
    noDescription: "Sem descrição.",
    gamesKicker: "CONTRIBUIÇÕES",
    gamesTitle: "Jogos em que trabalhei",
    gamesDescription: "Experiências selecionadas do Roblox em que contribuí com construção, ambientação ou desenvolvimento.",
    visits: "visitas",
    playingNow: "jogando agora",
    reviewsKicker: "AVALIAÇÕES",
    reviewsTitle: "O que dizem sobre meu trabalho",
    reviewsDescription: "",
    leaveReview: "Deixar uma avaliação",
    reviewFormDescription: "",
    identityLabel: "Como seu nome deve aparecer?",
    identityRoblox: "Nick do Roblox",
    identityDiscord: "Nick do Discord",
    identityName: "Nome personalizado",
    displayName: "Nick / nome",
    stars: "Estrelas",
    reviewTitle: "Título do projeto",
    reviewTitlePlaceholder: "Título do projeto ou comissão",
    reviewDescription: "Descrição",
    reviewDescriptionPlaceholder: "Como foi sua experiência e em que eu trabalhei?",
    projectImage: "Imagem do projeto",
    projectImageHint: "Escolha um arquivo JPG, PNG, WEBP ou GIF de até 3 MB.",
    submitReview: "Enviar para aprovação",
    sendingReview: "Enviando...",
    reviewSuccess: "Obrigado! Sua avaliação foi enviada e está aguardando aprovação.",
    reviewError: "Não foi possível enviar. Confira os campos obrigatórios e o arquivo de imagem.",
    noReviewsTitle: "",
    noReviewsText: "",
    approvedReview: "Avaliação aprovada",
    stackKicker: "STACK",
    stackTitle: "Builder e developer",
    stackDescription: "",
    builder: "BUILDER",
    contactKicker: "CONTATO",
    contactTitle: "Precisa de um mapa, ambiente ou sistema para o seu jogo?",
    contactDescription: "",
    email: "E-mail",
    footer: "Builder • Roblox Studio • Luau",
    developerMode: "Modo desenvolvedor",
    mediaEmpty: "Mídia em breve.",
    openVideo: "Abrir vídeo ↗",
    loading: "CARREGANDO",
    connectionIssue: "Não foi possível carregar os dados do portfólio.",
    retry: "Tentar novamente",
  },
} satisfies Record<Language, Record<string, string>>;

const CONTENT_CACHE_KEY = "portfolio-content-last-good-v1";
const CONTENT_CACHE_TIME_KEY = "portfolio-content-last-good-time-v1";

function isPortfolioContent(value: unknown): value is PortfolioContent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PortfolioContent>;
  return Boolean(
    candidate.owner &&
    typeof candidate.owner === "object" &&
    Array.isArray(candidate.builderProjects) &&
    Array.isArray(candidate.programmerProjects) &&
    Array.isArray(candidate.prices) &&
    Array.isArray(candidate.media) &&
    Array.isArray(candidate.games)
  );
}

function detectBrowserLanguage(): Language {
  const preferred = (navigator.languages?.[0] || navigator.language || "en").toLowerCase();
  return preferred.startsWith("pt") ? "pt" : "en";
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 7000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return compact.format(value);
}

function normalizeVideoUrl(rawUrl: string) {
  const trimmed = rawUrl.trim();
  if (!trimmed) return { kind: "link" as const, url: "" };

  const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      if (id) return { kind: "embed" as const, url: `https://www.youtube.com/embed/${id}` };
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      let id = parsed.searchParams.get("v") || "";
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (!id && ["shorts", "live", "embed"].includes(parts[0] || "")) id = parts[1] || "";
      if (id) return { kind: "embed" as const, url: `https://www.youtube.com/embed/${id}` };
    }

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const id = parts.find((part) => /^\d+$/.test(part));
      if (id) return { kind: "embed" as const, url: `https://player.vimeo.com/video/${id}` };
    }

    if (host === "drive.google.com") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const fileIndex = parts.indexOf("d");
      const id = fileIndex >= 0 ? parts[fileIndex + 1] : parsed.searchParams.get("id");
      if (id) return { kind: "embed" as const, url: `https://drive.google.com/file/d/${id}/preview` };
    }

    if (host === "streamable.com") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      if (id) return { kind: "embed" as const, url: `https://streamable.com/e/${id}` };
    }

    if (/\.(mp4|webm|ogg)(?:$|\?)/i.test(url)) {
      return { kind: "file" as const, url };
    }
  } catch {
    // Fall through to a normal external link.
  }

  return { kind: "link" as const, url };
}

function MediaPreview({ item, language }: { item: MediaItem; language: Language }) {
  const labels = ui[language];

  if (!item.url) {
    return <div className="mediaEmpty">{labels.mediaEmpty}</div>;
  }

  if (item.type === "image") {
    return <img src={item.url} alt={text(item.title, language)} className="mediaImage" />;
  }

  const video = normalizeVideoUrl(item.url);

  if (video.kind === "embed") {
    return (
      <iframe
        className="mediaFrame"
        src={video.url}
        title={text(item.title, language)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  if (video.kind === "file") {
    return <video className="mediaFrame" src={video.url} controls playsInline preload="metadata" />;
  }

  return (
    <a className="mediaLink" href={video.url} target="_blank" rel="noreferrer">
      {labels.openVideo}
    </a>
  );
}

function ProjectVideo({ url, title }: { url: string; title: string }) {
  const video = normalizeVideoUrl(url);

  if (video.kind === "embed") {
    return (
      <div className="projectVideoWrap">
        <iframe
          className="projectVideoFrame"
          src={video.url}
          title={`${title} video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  if (video.kind === "file") {
    return (
      <div className="projectVideoWrap">
        <video className="projectVideoFrame" src={video.url} controls playsInline preload="metadata" />
      </div>
    );
  }

  return (
    <a className="projectVideoLink" href={video.url} target="_blank" rel="noreferrer">
      ▶ Video
    </a>
  );
}

function StarDisplay({ rating, compact = false }: { rating: number; compact?: boolean }) {
  const rounded = Math.round(rating);
  return (
    <span className={compact ? "stars starsCompact" : "stars"} aria-label={`${rating.toFixed(1)} / 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rounded ? "filled" : ""}>★</span>
      ))}
    </span>
  );
}

export default function PortfolioClient() {
  const [content, setContent] = useState<PortfolioContent>(defaultPortfolio);
  const [language, setLanguage] = useState<Language>("en");
  const [visits, setVisits] = useState<number | null>(null);
  const [games, setGames] = useState<RobloxApiGame[]>([]);
  const [reviews, setReviews] = useState<PortfolioReview[]>([]);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [contentLoadError, setContentLoadError] = useState(false);
  const [contentFromCache, setContentFromCache] = useState(false);
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const [visitsLoaded, setVisitsLoaded] = useState(false);
  const [gamesLoaded, setGamesLoaded] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [loaderLeaving, setLoaderLeaving] = useState(false);
  const [ratingAverage, setRatingAverage] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    displayName: "",
    identityType: "roblox",
    rating: 5,
    title: "",
    description: "",
    imageFile: null,
    website: "",
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<"success" | "error" | null>(null);
  const visitSent = useRef(false);
  const loaderStartedAt = useRef(Date.now());
  const contentLoadGeneration = useRef(0);
  const labels = ui[language];

  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-language");
    const next: Language = saved === "pt" || saved === "en" ? saved : detectBrowserLanguage();

    setLanguage(next);
    document.documentElement.lang = next === "pt" ? "pt-BR" : "en";
    setLanguageLoaded(true);
  }, []);

  function changeLanguage(next: Language) {
    setLanguage(next);
    window.localStorage.setItem("portfolio-language", next);
    document.documentElement.lang = next === "pt" ? "pt-BR" : "en";
  }

  async function loadPortfolioContent() {
    const generation = ++contentLoadGeneration.current;
    setContentLoadError(false);
    setContentLoaded(false);
    setContentFromCache(false);

    const delays = [0, 320, 850, 1700, 3000];

    for (let attempt = 0; attempt < delays.length; attempt += 1) {
      if (delays[attempt]) await wait(delays[attempt]);
      if (generation !== contentLoadGeneration.current) return;

      try {
        const response = await fetchWithTimeout(
          `/api/content?fresh=${Date.now()}-${attempt}`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          },
          7000
        );

        if (!response.ok) throw new Error(`content request failed: ${response.status}`);

        const body = await response.json();
        if (!isPortfolioContent(body?.content)) throw new Error("invalid portfolio content");
        if (generation !== contentLoadGeneration.current) return;

        setContent(body.content);
        setContentLoaded(true);

        try {
          window.localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(body.content));
          window.localStorage.setItem(CONTENT_CACHE_TIME_KEY, String(Date.now()));
        } catch {
          // The portfolio still works if browser storage is unavailable.
        }
        return;
      } catch {
        // Retry below. A transient Supabase/Vercel failure must never reveal the bundled template.
      }
    }

    if (generation !== contentLoadGeneration.current) return;

    try {
      const cached = window.localStorage.getItem(CONTENT_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as unknown;
        if (isPortfolioContent(parsed)) {
          setContent(parsed);
          setContentFromCache(true);
          setContentLoaded(true);
          return;
        }
      }
    } catch {
      // Ignore damaged/unavailable cache and keep the loader in its retry state.
    }

    setContentLoadError(true);
  }

  useEffect(() => {
    void loadPortfolioContent();

    return () => {
      contentLoadGeneration.current += 1;
    };
  }, []);

  useEffect(() => {
    if (!contentFromCache) return;

    // If we had to use the last known-good snapshot, refresh quietly once the
    // connection has had a moment to recover. The visible site never jumps to
    // template data while this happens.
    const timer = window.setTimeout(() => {
      const generation = ++contentLoadGeneration.current;
      fetchWithTimeout(`/api/content?recover=${Date.now()}`, { cache: "no-store" }, 7000)
        .then((response) => {
          if (!response.ok) throw new Error("recovery request failed");
          return response.json();
        })
        .then((body) => {
          if (generation !== contentLoadGeneration.current || !isPortfolioContent(body?.content)) return;
          setContent(body.content);
          setContentFromCache(false);
          try {
            window.localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify(body.content));
            window.localStorage.setItem(CONTENT_CACHE_TIME_KEY, String(Date.now()));
          } catch {}
        })
        .catch(() => undefined);
    }, 4500);

    return () => window.clearTimeout(timer);
  }, [contentFromCache]);

  const configuredIds = useMemo(
    () => content.games.map((game) => game.universeId?.trim()).filter(Boolean) as string[],
    [content.games]
  );

  useEffect(() => {
    if (visitSent.current) return;
    visitSent.current = true;

    fetch("/api/visit", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.visits === "number") setVisits(data.visits);
      })
      .catch(() => undefined)
      .finally(() => setVisitsLoaded(true));
  }, []);

  useEffect(() => {
    if (!contentLoaded) return;

    if (!configuredIds.length) {
      setGamesLoaded(true);
      return;
    }

    setGamesLoaded(false);
    fetch(`/api/games?ids=${configuredIds.join(",")}`)
      .then((res) => res.json())
      .then((body) => setGames(Array.isArray(body.data) ? body.data : []))
      .catch(() => undefined)
      .finally(() => setGamesLoaded(true));
  }, [configuredIds, contentLoaded]);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((body) => {
        setReviews(Array.isArray(body?.reviews) ? body.reviews : []);
        setRatingAverage(typeof body?.average === "number" ? body.average : null);
        setRatingCount(typeof body?.count === "number" ? body.count : 0);
      })
      .catch(() => undefined)
      .finally(() => setReviewsLoaded(true));
  }, []);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  async function submitReview(event: React.FormEvent) {
    event.preventDefault();
    setReviewSubmitting(true);
    setReviewMessage(null);

    try {
      const body = new FormData();
      body.set("displayName", reviewForm.displayName);
      body.set("identityType", reviewForm.identityType);
      body.set("rating", String(reviewForm.rating));
      body.set("title", reviewForm.title);
      body.set("description", reviewForm.description);
      body.set("website", reviewForm.website);
      if (reviewForm.imageFile) body.set("image", reviewForm.imageFile);

      const response = await fetch("/api/reviews", {
        method: "POST",
        body,
      });

      if (!response.ok) throw new Error("submit failed");

      setReviewForm({
        displayName: "",
        identityType: "roblox",
        rating: 5,
        title: "",
        description: "",
        imageFile: null,
        website: "",
      });
      setReviewMessage("success");
    } catch {
      setReviewMessage("error");
    } finally {
      setReviewSubmitting(false);
    }
  }

  const pageReady = contentLoaded && languageLoaded && visitsLoaded && gamesLoaded && reviewsLoaded;

  useEffect(() => {
    if (!pageReady || !loaderVisible) return;

    const elapsed = Date.now() - loaderStartedAt.current;
    const wait = Math.max(0, 650 - elapsed);

    const leaveTimer = window.setTimeout(() => {
      setLoaderLeaving(true);
      const hideTimer = window.setTimeout(() => setLoaderVisible(false), 360);
      return () => window.clearTimeout(hideTimer);
    }, wait);

    return () => window.clearTimeout(leaveTimer);
  }, [pageReady, loaderVisible]);

  useEffect(() => {
    if (!loaderVisible) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [loaderVisible]);

  const apiById = new Map(games.map((game) => [String(game.id), game]));
  const visibleMedia = content.media.filter((item) => Boolean(item.url?.trim()));
  const visibleGames = content.games.filter((game) =>
    Boolean(
      game.universeId?.trim() ||
      (game.url && game.url !== "#") ||
      game.image?.trim() ||
      (typeof game.manualVisits === "number" && game.manualVisits > 0)
    )
  );

  if (loaderVisible) {
    return (
      <main className={`portfolioLoader ${loaderLeaving ? "isLeaving" : ""}`} aria-live="polite" aria-busy="true">
        <div className="loaderAtmosphere" aria-hidden="true" />
        <div className={`loaderCore ${contentLoadError ? "hasError" : ""}`}>
          <div className="loaderMark" aria-hidden="true">
            <span className="loaderRed" />
            <span className="loaderCenter" />
            <span className="loaderBlue" />
          </div>
          {contentLoadError ? (
            <div className="loaderError">
              <span>{labels.connectionIssue}</span>
              <button type="button" onClick={() => void loadPortfolioContent()}>{labels.retry}</button>
            </div>
          ) : (
            <>
              <div className="loaderTrack" aria-hidden="true"><span /></div>
              <span className="loaderText">{labels.loading}</span>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="siteGlow" aria-hidden="true" />
      <div className="gridOverlay" aria-hidden="true" />

      <nav className="nav shell">
        <a className="brand" href="#top">
          <span className="brandAccent">▣</span> {content.owner.username}
        </a>
        <div className="navRight">
          <div className="navLinks">
            <a href="#builder">{labels.navBuilder}</a>
            <a href="#programming">{labels.navProgramming}</a>
            <a href="#pricing">{labels.navPricing}</a>
            {visibleMedia.length > 0 && <a href="#media">{labels.navMedia}</a>}
            {visibleGames.length > 0 && <a href="#games">{labels.navGames}</a>}
            <a href="#reviews">{labels.navReviews}</a>
            <a href="#contact">{labels.navContact}</a>
          </div>
          <div className="languageSwitch" aria-label="Language selector">
            <button type="button" className={language === "en" ? "active" : ""} onClick={() => changeLanguage("en")} aria-pressed={language === "en"}>EN</button>
            <span>/</span>
            <button type="button" className={language === "pt" ? "active" : ""} onClick={() => changeLanguage("pt")} aria-pressed={language === "pt"}>PT</button>
          </div>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="heroGrid">
          <div>
            <h1>
              {text(content.owner.heroTitleTop, language)} <span>{text(content.owner.heroTitleAccent, language)}</span>
              <br />
              {text(content.owner.heroTitleBottom, language)}
            </h1>
            <p className="heroText">{text(content.owner.intro, language)}</p>

            <div className="heroActions">
              <a className="button primary" href="#builder">{labels.viewPortfolio}</a>
              <a className="button ghost" href={content.links.roblox} target="_blank" rel="noreferrer">{labels.robloxProfile}</a>
            </div>
          </div>

          <div className="heroPanel panel">
            <div className="splitBar" />
            <div className="dualPitch">
              <div>
                <small>{labels.mainFocus}</small>
                <h3>Builder</h3>
                <p>{text(content.owner.builderPitch, language)}</p>
              </div>
              <div>
                <small>{labels.separateArea}</small>
                <h3>{labels.programming}</h3>
                <p>{text(content.owner.programmerPitch, language)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="statsGrid statsGridFive">
          <div className="stat panel">
            <strong>{visits === null ? "—" : formatNumber(visits)}</strong>
            <span>{labels.siteVisits}</span>
          </div>
          <a className="stat panel ratingStat" href="#reviews">
            <strong>{ratingAverage === null ? "—" : ratingAverage.toFixed(1)}</strong>
            <span>{labels.navReviews}</span>
          </a>
          <div className="stat panel">
            <strong>{content.builderProjects.length}</strong>
            <span>{labels.builderProjects}</span>
          </div>
          <div className="stat panel">
            <strong>{visibleGames.length}</strong>
            <span>{labels.contributedGames}</span>
          </div>
          <div className="stat panel">
            <strong>{content.prices.length}</strong>
            <span>{labels.priceRanges}</span>
          </div>
        </div>
      </section>

      <section className="section shell builderSection" id="builder">
        <div className="sectionHead">
          <div>
            <h2>{labels.builderTitle}</h2>
          </div>
        </div>

        <div className="projectGrid builderGrid">
          {content.builderProjects.map((project, index) => (
            <article className="projectCard panel" key={`${text(project.title, language)}-${index}`}>
              <div className="projectVisual builderVisual">
                {project.image ? (
                  <img src={project.image} alt={text(project.title, language)} className="projectImage" loading="lazy" />
                ) : (
                  <div className="abstractConstruction" aria-hidden="true" />
                )}
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              {project.video && <ProjectVideo url={project.video} title={text(project.title, language)} />}
              <div className="projectBody">
                <small>{text(project.highlight, language) || "Builder"}</small>
                <h3>{text(project.title, language)}</h3>
                <p>{text(project.description, language)}</p>
                <div className="tags">
                  {project.tags.map((tag, tagIndex) => <span key={`${text(tag, language)}-${tagIndex}`}>{text(tag, language)}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section shell programmingSection" id="programming">
        <div className="sectionHead">
          <div>
            <h2>{labels.programmingTitle}</h2>
          </div>
          {labels.programmingDescription && <p>{labels.programmingDescription}</p>}
        </div>

        <div className="projectGrid programmingGrid">
          {content.programmerProjects.map((project, index) => (
            <article className="projectCard panel" key={`${text(project.title, language)}-${index}`}>
              <div className="projectVisual programmingVisual">
                {project.image ? (
                  <img src={project.image} alt={text(project.title, language)} className="projectImage" loading="lazy" />
                ) : (
                  <div className="abstractCode" aria-hidden="true" />
                )}
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              {project.video && <ProjectVideo url={project.video} title={text(project.title, language)} />}
              <div className="projectBody">
                <small>{text(project.highlight, language) || labels.programming}</small>
                <h3>{text(project.title, language)}</h3>
                <p>{text(project.description, language)}</p>
                <div className="tags">
                  {project.tags.map((tag, tagIndex) => <span key={`${text(tag, language)}-${tagIndex}`}>{text(tag, language)}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section shell pricingSection" id="pricing">
        <div className="sectionHead">
          <div>
            <h2>{labels.pricingTitle}</h2>
          </div>
        </div>

        <div className="pricingGrid">
          {content.prices.map((item, index) => (
            <article className="priceCard panel" key={`${text(item.title, language)}-${index}`}>
              {text(item.highlight, language) && <div className="priceBadge">{text(item.highlight, language)}</div>}
              <small>{text(item.title, language)}</small>
              <h3>{text(item.price, language)}</h3>
              <p>{text(item.description, language)}</p>
              <ul>
                {item.features.map((feature, featureIndex) => <li key={`${text(feature, language)}-${featureIndex}`}>{text(feature, language)}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {visibleMedia.length > 0 && (
      <section className="section shell" id="media">
        <div className="sectionHead">
          <div>
            <span className="kicker">{labels.mediaKicker}</span>
            <h2>{labels.mediaTitle}</h2>
          </div>
          <p>{labels.mediaDescription}</p>
        </div>

        <div className="mediaGrid">
          {visibleMedia.map((item, index) => (
            <article className="mediaCard panel" key={`${text(item.title, language)}-${index}`}>
              <div className="mediaPreview"><MediaPreview item={item} language={language} /></div>
              <div className="projectBody">
                <small>{item.type === "image" ? labels.image : labels.video}</small>
                <h3>{text(item.title, language)}</h3>
                <p>{text(item.description, language) || labels.noDescription}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      )}

      {visibleGames.length > 0 && (
      <section className="section shell" id="games">
        <div className="sectionHead">
          <div>
            <span className="kicker">{labels.gamesKicker}</span>
            <h2>{labels.gamesTitle}</h2>
          </div>
          <p>{labels.gamesDescription}</p>
        </div>

        <div className="gamesGrid">
          {visibleGames.map((game, index) => {
            const live = game.universeId ? apiById.get(game.universeId) : undefined;
            const shownName = live?.name || text(game.label, language);
            const shownVisits = live?.visits ?? game.manualVisits;

            return (
              <a className="gameCard panel" key={`${shownName}-${index}`} href={game.url || "#"} target="_blank" rel="noreferrer">
                <div className="gameMedia">
                  {game.image ? (
                    <img src={game.image} alt={shownName} className="gameImage" loading="lazy" />
                  ) : (
                    <div className="gameMediaFallback" />
                  )}
                </div>
                <div className="gameContent">
                  <span className="role">{text(game.role, language)}</span>
                  <h3>{shownName}</h3>
                  <p>{text(game.contribution, language)}</p>
                </div>
                <div className="gameNumbers">
                  <div><strong>{formatNumber(shownVisits)}</strong><span>{labels.visits}</span></div>
                  <div><strong>{formatNumber(live?.playing)}</strong><span>{labels.playingNow}</span></div>
                </div>
              </a>
            );
          })}
        </div>
      </section>
      )}

      <section className="section shell reviewsSection reviewsThemeSection" id="reviews">
        <div className="sectionHead">
          <div>
            <h2>{labels.reviewsTitle}</h2>
          </div>
        </div>

        <div className="reviewSummaryGrid">
          <div className="reviewScore panel">
            <span className="reviewScoreLabel">{labels.ratingLabel}</span>
            <strong>{ratingAverage === null ? "—" : ratingAverage.toFixed(1)}</strong>
            <StarDisplay rating={ratingAverage ?? 0} />
            {ratingCount > 0 && <span>{`${ratingCount} ${labels.reviewsCount}`}</span>}
          </div>

          <form className="reviewForm panel" onSubmit={submitReview}>
            <div className="reviewFormHead">
              <div>
                <h3>{labels.leaveReview}</h3>
              </div>
            </div>

            <div className="reviewFormGrid">
              <label>
                {labels.identityLabel}
                <select value={reviewForm.identityType} onChange={(e) => setReviewForm((prev) => ({ ...prev, identityType: e.target.value as ReviewIdentityType }))}>
                  <option value="roblox">{labels.identityRoblox}</option>
                  <option value="discord">{labels.identityDiscord}</option>
                  <option value="name">{labels.identityName}</option>
                </select>
              </label>
              <label>
                {labels.displayName}
                <input required maxLength={50} value={reviewForm.displayName} onChange={(e) => setReviewForm((prev) => ({ ...prev, displayName: e.target.value }))} />
              </label>
            </div>

            <fieldset className="starPicker">
              <legend>{labels.stars}</legend>
              <div>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" className={star <= reviewForm.rating ? "active" : ""} onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))} aria-label={`${star}/5`}>★</button>
                ))}
              </div>
            </fieldset>

            <label>
              {labels.reviewTitle} *
              <input required maxLength={90} placeholder={labels.reviewTitlePlaceholder} value={reviewForm.title} onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))} />
            </label>

            <label>
              {labels.reviewDescription}
              <textarea required maxLength={900} placeholder={labels.reviewDescriptionPlaceholder} value={reviewForm.description} onChange={(e) => setReviewForm((prev) => ({ ...prev, description: e.target.value }))} />
            </label>

            <label>
              {labels.projectImage}
              <input
                required
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => setReviewForm((prev) => ({ ...prev, imageFile: e.target.files?.[0] || null }))}
              />
              <small>{reviewForm.imageFile ? reviewForm.imageFile.name : labels.projectImageHint}</small>
            </label>

            <label className="honeypot" aria-hidden="true">
              Website
              <input tabIndex={-1} autoComplete="off" value={reviewForm.website} onChange={(e) => setReviewForm((prev) => ({ ...prev, website: e.target.value }))} />
            </label>

            <button className="button primary reviewSubmit" type="submit" disabled={reviewSubmitting}>
              {reviewSubmitting ? labels.sendingReview : labels.submitReview}
            </button>

            {reviewMessage === "success" && <div className="reviewNotice success">{labels.reviewSuccess}</div>}
            {reviewMessage === "error" && <div className="reviewNotice error">{labels.reviewError}</div>}
          </form>
        </div>

        {reviews.length ? (
          <div className="reviewsGrid">
            {reviews.map((review) => (
              <article className="reviewCard panel" key={review.id}>
                <div className="reviewImageWrap">
                  <img src={review.image_url} alt={review.title} className="reviewImage" loading="lazy" />
                  <div className="reviewImageShade" />
                  <span>{labels.approvedReview}</span>
                </div>
                <div className="reviewBody">
                  <div className="reviewMeta">
                    <div>
                      <strong>{review.display_name}</strong>
                      <span>{review.identity_type === "roblox" ? "Roblox" : review.identity_type === "discord" ? "Discord" : labels.identityName}</span>
                    </div>
                    <StarDisplay rating={review.rating} compact />
                  </div>
                  <h3>{review.title}</h3>
                  <p>{review.description}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="section shell about" id="stack">
        <div>
          <span className="kicker">{labels.stackKicker}</span>
          <h2>{labels.stackTitle}</h2>
          {labels.stackDescription && <p>{labels.stackDescription}</p>}
        </div>
        <div className="stackColumns">
          <div className="panel stackPanel">
            <small>{labels.builder}</small>
            <div className="skillCloud">
              {content.builderSkills.map((skill, index) => <span key={`${text(skill, language)}-${index}`}>{text(skill, language)}</span>)}
            </div>
          </div>
          <div className="panel stackPanel">
            <small>{labels.programmingKicker}</small>
            <div className="skillCloud">
              {content.programmerSkills.map((skill, index) => <span key={`${text(skill, language)}-${index}`}>{text(skill, language)}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="cta shell" id="contact">
        <div className="ctaInner panel">
          <span className="kicker">{labels.contactKicker}</span>
          <h2>{labels.contactTitle}</h2>
          {labels.contactDescription && <p>{labels.contactDescription}</p>}
          <div className="heroActions">
            <a className="button primary" href={content.links.discord}>Discord</a>
          </div>
        </div>
      </section>

      <footer className="footer shell">
        <span>© {new Date().getFullYear()} {content.owner.displayName}</span>
        <div className="footerRight">
          <span>{labels.footer}</span>
        </div>
      </footer>
    </main>
  );
}
