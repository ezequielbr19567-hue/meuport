"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  defaultPortfolio,
  CONTACT_EMAIL,
  contactEmail,
  type Language,
  type MediaItem,
  type PortfolioContent,
} from "@/config/portfolio";
import { readConfirmedContent, rememberContent, forgetConfirmedContent, requestContent } from "@/lib/contentClient";
import Image from "next/image";
import { ImageViewer, VideoPlayer } from "./PortfolioMedia";
import { text, detectLanguage } from "@/lib/i18n";
import type { PortfolioReview, ReviewIdentityType } from "@/lib/reviews";
import { safeExternalUrl, safeMediaUrl, safeEmailHref } from "@/lib/urls";
import WorldScene from "./WorldScene";

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
    reviewError: "Could not send the review. Choose a rating and check the required fields and image file.",
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
    reviewError: "Não foi possível enviar. Escolha uma nota e confira os campos obrigatórios e a imagem.",
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
  },
} satisfies Record<Language, Record<string, string>>;

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return compact.format(value);
}

function MediaPreview({ item, language }: { item: MediaItem; language: Language }) {
  if (!item.url) return <div className="mediaEmpty">{ui[language].mediaEmpty}</div>;
  return item.type === "image"
    ? <ImageViewer src={item.url} alt={text(item.title, language)} className="mediaImage" language={language} />
    : <VideoPlayer url={item.url} title={text(item.title, language)} language={language} />;
}
function ProjectVideo({ url, title, language }: { url: string; title: string; language: Language }) {
  return <div className="projectVideoWrap"><VideoPlayer url={url} title={title} language={language} /></div>;
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [reviewsAvailable, setReviewsAvailable] = useState(false);
  const [reviewsFailed, setReviewsFailed] = useState(false);
  const [visits, setVisits] = useState<number | null>(null);
  const [games, setGames] = useState<RobloxApiGame[]>([]);
  const [reviews, setReviews] = useState<PortfolioReview[]>([]);
  const [contentError, setContentError] = useState(false);
  const [contentRefreshing, setContentRefreshing] = useState(false);
  const [contentAttempt, setContentAttempt] = useState(0);
  const [usingCachedContent, setUsingCachedContent] = useState(false);
  const [usingDefaultFallback, setUsingDefaultFallback] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false);
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [loaderVisible, setLoaderVisible] = useState(true);
  const [loaderLeaving, setLoaderLeaving] = useState(false);
  const [ratingAverage, setRatingAverage] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    displayName: "",
    identityType: "roblox",
    rating: 0,
    title: "",
    description: "",
    imageFile: null,
    website: "",
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<"success" | "error" | null>(null);
  const visitSent = useRef(false);
  const labels = ui[language];

  useEffect(() => {
    let saved: string | null = null;
    try { saved = window.localStorage.getItem("portfolio-language"); } catch {}
    const next = detectLanguage(saved, navigator.languages || [navigator.language]);
    setLanguage(next);
    document.documentElement.lang = next === "pt" ? "pt-BR" : "en";
    setLanguageLoaded(true);
  }, []);

  function changeLanguage(next: Language) {
    setLanguage(next);
    try { window.localStorage.setItem("portfolio-language", next); } catch {}
    document.documentElement.lang = next === "pt" ? "pt-BR" : "en";
  }

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen) { setMenuOpen(false); menuButton.current?.focus(); }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  useEffect(() => {
    const controller = new AbortController();
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryAfterFailure: ReturnType<typeof setTimeout> | undefined;
    let running = false;
    // A stalled provider cannot leave the visitor trapped in the animation.
    let recoveryTimer: ReturnType<typeof setTimeout> | undefined;
    const cached = readConfirmedContent();
    if (cached) { setContent(cached); setContentLoaded(true); setUsingCachedContent(true); }
    function showDefaultFallback() {
      if (cached) return;
      setContent(defaultPortfolio);
      setContentLoaded(true);
      setUsingCachedContent(false);
      setUsingDefaultFallback(true);
    }
    async function load() {
      if (running || controller.signal.aborted) return;
      running = true;
      clearTimeout(recoveryTimer);
      clearTimeout(retryAfterFailure);
      recoveryTimer = setTimeout(() => { showDefaultFallback(); setContentError(true); }, 14000);
      setContentError(false);
      setContentRefreshing(true);
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const confirmed = await requestContent(controller.signal);
          if (controller.signal.aborted) return;
          setContent(confirmed.content);
          setContentError(false);
          clearTimeout(recoveryTimer);
          setContentLoaded(true);
          setUsingCachedContent(false);
          setUsingDefaultFallback(false);
          if (confirmed.source === "saved") rememberContent(confirmed.content);
          else forgetConfirmedContent();
          setContentRefreshing(false);
          running = false;
          return;
        } catch {
          if (controller.signal.aborted) return;
          if (attempt < 2) await new Promise<void>(resolve => {
            const done = () => { clearTimeout(retryTimer); controller.signal.removeEventListener("abort", done); resolve(); };
            retryTimer = setTimeout(done, 750 * (attempt + 1));
            controller.signal.addEventListener("abort", done, {once:true});
          });
        }
      }
      clearTimeout(recoveryTimer);
      if (!controller.signal.aborted) {
        showDefaultFallback();
        setContentError(true);
        setContentRefreshing(false);
        retryAfterFailure = setTimeout(() => setContentAttempt(n => n + 1), 30000);
      }
      running = false;
    }
    void load();
    window.addEventListener("online", load);
    return () => { controller.abort(); clearTimeout(retryTimer); clearTimeout(retryAfterFailure); clearTimeout(recoveryTimer); window.removeEventListener("online", load); };
  }, [contentAttempt]);

  const configuredIds = useMemo(
    () => content.games.map((game) => game.universeId?.trim()).filter(Boolean) as string[],
    [content.games]
  );

  useEffect(() => {
    if (visitSent.current) return;
    visitSent.current = true;

    fetch("/api/visit", { method: "POST", signal: AbortSignal.timeout(8000) })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.visits === "number") setVisits(data.visits);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!contentLoaded) return;

    setGames([]);
    if (!configuredIds.length) return;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    fetch(`/api/games?ids=${encodeURIComponent(configuredIds.join(","))}`, { signal: controller.signal })
      .then((res) => { if (!res.ok) throw new Error("games"); return res.json(); })
      .then((body) => { if (!controller.signal.aborted) setGames(Array.isArray(body.data) ? body.data : []); })
      .catch(() => undefined)
      .finally(() => clearTimeout(timer));
    return () => { controller.abort(); clearTimeout(timer); };
  }, [configuredIds, contentLoaded]);

  useEffect(() => {
    fetch("/api/reviews", { signal: AbortSignal.timeout(8000) })
      .then((res) => { if (!res.ok) throw new Error("reviews"); return res.json(); })
      .then((body) => {
        setReviewsAvailable(body?.configured === true);
        setReviews(Array.isArray(body?.reviews) ? body.reviews : []);
        setRatingAverage(typeof body?.average === "number" ? body.average : null);
        setRatingCount(typeof body?.count === "number" ? body.count : 0);
      })
      .catch(() => setReviewsFailed(true))
      .finally(() => setReviewsLoaded(true));
  }, []);

  useEffect(() => () => { if (copyTimer.current) clearTimeout(copyTimer.current); }, []);

  async function submitReview(event: React.FormEvent) {
    event.preventDefault();
    if (reviewSubmitting) return;
    if (reviewForm.rating < 1) { setReviewMessage("error"); return; }
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
        signal: AbortSignal.timeout(20000),
      });

      if (!response.ok) throw new Error("submit failed");

      setReviewForm({
        displayName: "",
        identityType: "roblox",
        rating: 0,
        title: "",
        description: "",
        imageFile: null,
        website: "",
      });
      if (fileInput.current) fileInput.current.value = "";
      setReviewMessage("success");
    } catch {
      setReviewMessage("error");
    } finally {
      setReviewSubmitting(false);
    }
  }

  const pageReady = contentLoaded && languageLoaded;

  useEffect(() => {
    if (!pageReady || !loaderVisible) return;

    setLoaderLeaving(true);
    const hideTimer = window.setTimeout(() => setLoaderVisible(false), 180);
    return () => window.clearTimeout(hideTimer);
  }, [pageReady, loaderVisible]);

  useEffect(() => {
    if (!loaderVisible || contentError) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [loaderVisible, contentError]);

  const apiById = new Map(games.map((game) => [String(game.id), game]));
  const visibleMedia = content.media.filter((item) => Boolean(item.url?.trim()));
  const featuredProject = content.builderProjects.find(project => project.image?.trim());
  const discordHref = safeExternalUrl(content.links.discord);
  const robloxHref = content.links.roblox.includes("SEU_ID") ? "" : safeExternalUrl(content.links.roblox);
  const emailHref = safeEmailHref(contactEmail(content.links.email)) || `mailto:${CONTACT_EMAIL}`;
  const emailAddress = emailHref.slice(7);
  const projectAnchor = content.builderProjects.length ? "#builder" : content.programmerProjects.length ? "#programming" : "#contact";
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setEmailCopied(true); setCopyFailed(false);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setEmailCopied(false), 3500);
    } catch { setCopyFailed(true); }
  }
  const visibleGames = content.games.filter((game) =>
    Boolean(
      game.universeId?.trim() ||
      (game.url && game.url !== "#") ||
      game.image?.trim() ||
      (typeof game.manualVisits === "number" && game.manualVisits > 0)
    )
  );

  if (!contentLoaded && contentError) {
    return <main className="contentRecovery"><div className="panel">
      <h1>{language === "pt" ? "Não foi possível carregar o portfólio" : "The portfolio could not be loaded"}</h1>
      <p>{language === "pt" ? "A conexão pode estar instável. Tente novamente em instantes." : "The connection may be unstable. Please try again shortly."}</p>
      <button className="button primary" onClick={() => { setContentError(false); setContentAttempt(n => n + 1); }}>{language === "pt" ? "Tentar novamente" : "Try again"}</button>
      <p><a href={`mailto:${CONTACT_EMAIL}`}>{language === "pt" ? "Você também pode falar comigo por e-mail:" : "You can also reach me by email:"}<br />{CONTACT_EMAIL}</a></p>
    </div></main>;
  }

  if (loaderVisible) {
    return (
      <main className={`portfolioLoader ${loaderLeaving ? "isLeaving" : ""}`} aria-live="polite" aria-busy="true">
        <div className="loaderAtmosphere" aria-hidden="true" />
        <div className="loaderCore">
          <div className="loaderMark" aria-hidden="true">
            <span className="loaderRed" />
            <span className="loaderCenter" />
            <span className="loaderBlue" />
          </div>
          <div className="loaderTrack" aria-hidden="true"><span /></div>
          <span className="loaderText">{language === "pt" ? "CARREGANDO" : "LOADING"}</span>
        </div>
      </main>
    );
  }

  return (
    <main className="portfolioSite">
      {(usingCachedContent || usingDefaultFallback) && <aside className="contentStatus" role="status">
        <span>{usingDefaultFallback
          ? (language === "pt" ? (contentRefreshing ? "Atualizando o portfólio…" : "Versão padrão temporária. As alterações salvas estão indisponíveis.") : (contentRefreshing ? "Updating portfolio…" : "Temporary default version. Saved changes are unavailable."))
          : (language === "pt" ? (contentRefreshing ? "Atualizando o portfólio…" : "Mostrando a última versão disponível. Não foi possível verificar atualizações.") : (contentRefreshing ? "Updating portfolio…" : "Showing the last available version. Updates could not be checked."))}</span>
        {!contentRefreshing && <button onClick={() => setContentAttempt(n => n + 1)}>{language === "pt" ? "Tentar novamente" : "Try again"}</button>}
      </aside>}
      <a className="skipLink" href={projectAnchor}>{language === "pt" ? "Ir para os projetos" : "Skip to projects"}</a>

      <nav className="nav shell" aria-label={language === "pt" ? "Navegação principal" : "Main navigation"}>
        <a className="brand" href="#top">
          <Image src="/brand.png" alt="" width={44} height={44} className="brandLogo" priority /> {content.owner.username}
        </a>
        <div className="navRight">
          <button ref={menuButton} type="button" className="menuToggle" aria-expanded={menuOpen} aria-controls="main-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? (language === "pt" ? "Fechar" : "Close") : "Menu"} <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span></button>
          <div id="main-nav" className={`navLinks ${menuOpen ? "isOpen" : ""}`} onClick={() => setMenuOpen(false)}>
            {content.builderProjects.length > 0 && <a href="#builder">{labels.navBuilder}</a>}
            {content.programmerProjects.length > 0 && <a href="#programming">{labels.navProgramming}</a>}
            {content.prices.length > 0 && <a href="#pricing">{labels.navPricing}</a>}
            {visibleMedia.length > 0 && <a href="#media">{labels.navMedia}</a>}
            {visibleGames.length > 0 && <a href="#games">{labels.navGames}</a>}
            <a href="#reviews">{labels.navReviews}</a>
            <a className="navContact" href="#contact">{labels.navContact} <span aria-hidden="true">↗</span></a>
          </div>
          <div className="languageSwitch" aria-label={language === "pt" ? "Selecionar idioma" : "Select language"}>
            <button type="button" className={language === "en" ? "active" : ""} onClick={() => changeLanguage("en")} aria-pressed={language === "en"}>EN</button>
            <span>/</span>
            <button type="button" className={language === "pt" ? "active" : ""} onClick={() => changeLanguage("pt")} aria-pressed={language === "pt"}>PT</button>
          </div>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="heroGrid">
          <div>
            <div className="heroEyebrow"><span aria-hidden="true" /> ROBLOX STUDIO <span className="eyebrowDivider">/</span> BUILDER & LUAU</div>
            {text(content.owner.status, language) && <p className="availability">{text(content.owner.status, language)}</p>}
            <h1>
              {text(content.owner.heroTitleTop, language)} <span>{text(content.owner.heroTitleAccent, language)}</span>
              <br />
              {text(content.owner.heroTitleBottom, language)}
            </h1>
            <p className="heroText">{text(content.owner.intro, language)}</p>

            <div className="heroActions">
              <a className="button primary" href={projectAnchor}>{labels.viewPortfolio} <span aria-hidden="true">↘</span></a>
              <a className="button ghost" href="#contact">{language === "pt" ? "Vamos conversar ↗" : "Let's talk ↗"}</a>
            </div>
            {robloxHref && <a className="profileLink" href={robloxHref} target="_blank" rel="noreferrer">{labels.robloxProfile}</a>}
          </div>

          <div className="heroPanel panel">
            <div className="showcaseTopline"><span>{featuredProject ? (language === "pt" ? "PROJETO EM DESTAQUE" : "FEATURED PROJECT") : "WORLD / DESIGN"}</span><span aria-hidden="true">↗</span></div>
            <div className="heroShowcase">
              {featuredProject ? <><ImageViewer src={featuredProject.image!} alt={text(featuredProject.title, language)} className="heroProjectImage" language={language} eager /><div className="showcaseCaption"><span>{language === "pt" ? "EM DESTAQUE" : "SELECTED WORK"}</span><strong>{text(featuredProject.title, language)}</strong></div></> : <WorldScene />}
            </div>
            <div className="dualPitch">
              <div>
                <small>{labels.mainFocus}</small>
                <strong>Builder</strong>
              </div>
              <div>
                <small>{labels.separateArea}</small>
                <strong>Luau developer</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="expertiseRail" aria-label={language === "pt" ? "Especialidades" : "Specialties"}>
          <span>ROBLOX STUDIO</span><span>{language === "pt" ? "Ambientes & iluminação" : "Environments & lighting"}</span><span>{language === "pt" ? "Sistemas em Luau" : "Luau systems"}</span><a href="#contact">{language === "pt" ? "Da ideia ao jogo" : "From idea to game"} ↗</a>
        </div>
      </section>

      {content.builderProjects.length > 0 && <section className="section shell builderSection" id="builder">
        <div className="sectionHead">
          <div>
            <span className="kicker">01 / {labels.builderKicker}</span>
            <h2>{labels.builderTitle}</h2>
          </div>
          <p>{language === "pt" ? "Cenários com identidade. Espaços feitos para explorar." : "Environments with identity. Spaces made to explore."}</p>
        </div>

        <div className="projectGrid builderGrid">
          {content.builderProjects.map((project, index) => (
            <article className="projectCard panel" key={`${text(project.title, language)}-${index}`}>
              <div className="projectVisual builderVisual">
                {project.image ? (
                  <ImageViewer src={project.image} alt={text(project.title, language)} className="projectImage" language={language} />
                ) : (
                  <WorldScene compact />
                )}
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              {project.video && <ProjectVideo url={project.video} title={text(project.title, language)} language={language} />}
              <div className="projectBody">
                <small>{text(project.highlight, language) || "Builder"}</small>
                <h3>{text(project.title, language)}</h3>
                {text(project.role, language) && <p className="projectRole">{text(project.role, language)}</p>}
                <p>{text(project.description, language)}</p>
                {(text(project.role, language) || text(project.challenge, language) || text(project.outcome, language)) && <details className="caseStudy">
                  <summary>{language === "pt" ? "Sobre o projeto" : "About the project"}</summary>
                  <dl>
                    {text(project.role, language) && <><dt>{language === "pt" ? "Minha contribuição" : "My contribution"}</dt><dd>{text(project.role, language)}</dd></>}
                    {text(project.challenge, language) && <><dt>{language === "pt" ? "Desafio e solução" : "Challenge and solution"}</dt><dd>{text(project.challenge, language)}</dd></>}
                    {text(project.outcome, language) && <><dt>{language === "pt" ? "Resultado" : "Outcome"}</dt><dd>{text(project.outcome, language)}</dd></>}
                  </dl>
                </details>}
                <div className="tags">
                  {project.tags.map((tag, tagIndex) => <span key={`${text(tag, language)}-${tagIndex}`}>{text(tag, language)}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>}

      {content.programmerProjects.length > 0 && <section className="section shell programmingSection" id="programming">
        <div className="sectionHead">
          <div>
            <span className="kicker">02 / LUAU DEVELOPMENT</span>
            <h2>{labels.programmingTitle}</h2>
          </div>
          <p>{text(content.owner.programmerPitch, language)}</p>
        </div>

        <div className="projectGrid programmingGrid">
          {content.programmerProjects.map((project, index) => (
            <article className="projectCard panel" key={`${text(project.title, language)}-${index}`}>
              <div className="projectVisual programmingVisual">
                {project.image ? (
                  <ImageViewer src={project.image} alt={text(project.title, language)} className="projectImage" language={language} />
                ) : (
                  <div className="codeArtwork" aria-hidden="true"><span>ModuleScript <i>Luau</i></span><code><em>local</em> experience = &#123;<br />&nbsp; world = <b>workspace</b>,<br />&nbsp; systems = <b>&#123;&#125;</b><br />&#125;<br /><br /><em>return</em> experience</code></div>
                )}
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              {project.video && <ProjectVideo url={project.video} title={text(project.title, language)} language={language} />}
              <div className="projectBody">
                <small>{text(project.highlight, language) || labels.programming}</small>
                <h3>{text(project.title, language)}</h3>
                <p>{text(project.description, language)}</p>
                {(text(project.role, language) || text(project.challenge, language) || text(project.outcome, language)) && <details className="caseStudy">
                  <summary>{language === "pt" ? "Sobre o projeto" : "About the project"}</summary>
                  <dl>
                    {text(project.role, language) && <><dt>{language === "pt" ? "Minha contribuição" : "My contribution"}</dt><dd>{text(project.role, language)}</dd></>}
                    {text(project.challenge, language) && <><dt>{language === "pt" ? "Desafio e solução" : "Challenge and solution"}</dt><dd>{text(project.challenge, language)}</dd></>}
                    {text(project.outcome, language) && <><dt>{language === "pt" ? "Resultado" : "Outcome"}</dt><dd>{text(project.outcome, language)}</dd></>}
                  </dl>
                </details>}
                <div className="tags">
                  {project.tags.map((tag, tagIndex) => <span key={`${text(tag, language)}-${tagIndex}`}>{text(tag, language)}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>}

      {content.prices.length > 0 && <section className="section shell pricingSection" id="pricing">
        <div className="sectionHead">
          <div>
            <span className="kicker">03 / {labels.pricingKicker}</span>
            <h2>{labels.pricingTitle}</h2>
          </div>
          <p>{language === "pt" ? "Escolha o ponto de partida. Vamos alinhar referências, escopo e prazo para o seu projeto." : "Choose a starting point. Let's align the references, scope and timeline for your project."}</p>
        </div>

        <div className="pricingGrid">
          {content.prices.map((item, index) => (
            <article className="priceCard panel" key={`${text(item.title, language)}-${index}`}>
              {text(item.highlight, language) && <div className="priceBadge">{text(item.highlight, language)}</div>}
              <h3 className="serviceTitle">{text(item.title, language)}</h3>
              <p className="servicePrice">{text(item.price, language)}</p>
              <p>{text(item.description, language)}</p>
              <ul>
                {item.features.map((feature, featureIndex) => <li key={`${text(feature, language)}-${featureIndex}`}>{text(feature, language)}</li>)}
              </ul>
              <a className="button ghost priceAction" href="#contact">{language === "pt" ? "Conversar sobre este serviço ↗" : "Discuss this service ↗"}</a>
            </article>
          ))}
        </div>
      </section>}

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
            const gameHref = safeExternalUrl(game.url);
            const GameCard = gameHref ? "a" : "article";

            return (
              <GameCard className="gameCard panel" key={`${shownName}-${index}`} {...(gameHref ? { href: gameHref, target: "_blank", rel: "noreferrer" } : {})}>
                <div className="gameMedia">
                  {game.image ? (
                    <img src={safeMediaUrl(game.image) || undefined} alt={shownName} className="gameImage" loading="lazy" decoding="async" />
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
              </GameCard>
            );
          })}
        </div>
      </section>
      )}

      <section className="section shell reviewsSection reviewsThemeSection" id="reviews">
        <div className="sectionHead">
          <div>
            <span className="kicker">FEEDBACK / {labels.reviewsKicker}</span>
            <h2>{labels.reviewsTitle}</h2>
          </div>
        </div>

        <div className="reviewSummaryGrid">
          <div className="reviewScore panel">
            <span className="reviewScoreLabel">{labels.ratingLabel}</span>
            <strong>{ratingAverage === null ? "—" : ratingAverage.toFixed(1)}</strong>
            {ratingCount > 0 ? <StarDisplay rating={ratingAverage ?? 0} /> : <span>{language === "pt" ? (reviewsFailed ? "Não foi possível carregar" : "Sem avaliações publicadas") : (reviewsFailed ? "Could not load reviews" : "No published reviews yet")}</span>}
            <p className="reviewPolicy">{language === "pt" ? "Média das avaliações publicadas após moderação. Nomes informados pelos autores, sem verificação de identidade." : "Average of reviews published after moderation. Names are self-reported, without identity verification."}</p>
            {ratingCount > 0 && <span>{`${ratingCount} ${labels.reviewsCount}`}</span>}
          </div>

          <details className="reviewDisclosure panel">
          <summary><span>{labels.leaveReview}<small>{language === "pt" ? "Já trabalhamos juntos? Conte sua experiência." : "Have we worked together? Share your experience."}</small></span><span aria-hidden="true">+</span></summary>
          <form className="reviewForm" aria-busy={reviewSubmitting} onSubmit={submitReview}>
            <div className="reviewFormHead">
              <div>
                <h3>{labels.leaveReview}</h3>
                <p>{language === "pt" ? "Conte o que foi entregue, como foi a comunicação e o que poderia melhorar. Nome e texto ficam públicos após moderação; não inclua dados privados." : "Describe the delivery, communication and what could improve. Your name and text become public after moderation; do not include private details."}</p>
              </div>
            </div>

            <fieldset className="reviewFields" disabled={!reviewsAvailable || reviewSubmitting}>
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
                  <button key={star} type="button" className={star <= reviewForm.rating ? "active" : ""} onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))} aria-label={`${star}/5`} aria-pressed={star === reviewForm.rating}>★</button>
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
              {labels.projectImage} ({language === "pt" ? "opcional" : "optional"})
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && (file.size > 3 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type))) {
                    e.target.value = ""; setReviewMessage("error");
                    setReviewForm(prev => ({ ...prev, imageFile: null })); return;
                  }
                  setReviewMessage(null); setReviewForm(prev => ({ ...prev, imageFile: file }));
                }}
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

            </fieldset>
            {!reviewsAvailable && <p role="status">{language === "pt" ? (reviewsLoaded ? "Avaliações indisponíveis no momento. Tente novamente mais tarde." : "Carregando avaliações…") : (reviewsLoaded ? "Reviews are currently unavailable. Please try again later." : "Loading reviews…")}</p>}
            {reviewMessage === "success" && <div role="status" className="reviewNotice success">{labels.reviewSuccess}</div>}
            {reviewMessage === "error" && <div role="alert" className="reviewNotice error">{labels.reviewError}</div>}
          </form>
          </details>
        </div>

        {reviews.length ? (
          <div className="reviewsGrid">
            {reviews.map((review) => (
              <article className="reviewCard panel" key={review.id}>
                {review.image_url && <div className="reviewImageWrap">
                  <img src={safeMediaUrl(review.image_url) || undefined} alt={review.title} className="reviewImage" loading="lazy" decoding="async" />
                  <div className="reviewImageShade" />
                  <span>{labels.approvedReview}</span>
                </div>}
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
                  <time dateTime={review.created_at}>{new Date(review.created_at).toLocaleDateString(language === "pt" ? "pt-BR" : "en-US", { month: "short", year: "numeric" })}</time>
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
            <p>{text(content.owner.builderPitch, language)}</p>
            <div className="skillCloud">
              {content.builderSkills.map((skill, index) => <span key={`${text(skill, language)}-${index}`}>{text(skill, language)}</span>)}
            </div>
          </div>
          <div className="panel stackPanel">
            <small>{labels.programmingKicker}</small>
            <p>{text(content.owner.programmerPitch, language)}</p>
            <div className="skillCloud">
              {content.programmerSkills.map((skill, index) => <span key={`${text(skill, language)}-${index}`}>{text(skill, language)}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="cta shell" id="contact">
        <div className="ctaInner panel">
          <div className="contactHeading">
            <span className="kicker">{labels.contactKicker} / NEXT PROJECT</span>
            <h2>{language === "pt" ? <>Seu próximo mundo<br /><em>começa aqui.</em></> : <>Your next world<br /><em>starts here.</em></>}</h2>
            <p className="contactBrief">{language === "pt" ? "Um mapa, uma atmosfera ou um sistema. Conte o que você tem em mente e vamos conversar sobre o seu jogo." : "A map, an atmosphere or a system. Tell me what you have in mind and let's talk about your game."}</p>
            <div className="contactChecklist"><span>01 <b>{language === "pt" ? "Sua ideia" : "Your idea"}</b></span><span>02 <b>{language === "pt" ? "Referências" : "References"}</b></span><span>03 <b>{language === "pt" ? "Escopo e prazo" : "Scope & timeline"}</b></span></div>
          </div>
          <div className="contactMethods">
            <a className="emailCard" href={emailHref}><span>{labels.email} <b aria-hidden="true">↗</b></span><strong>{emailAddress}</strong><small>{language === "pt" ? "Enviar uma mensagem" : "Send a message"}</small></a>
            <button className="copyEmail" type="button" onClick={copyEmail}>{emailCopied ? (language === "pt" ? "E-mail copiado ✓" : "Email copied ✓") : (language === "pt" ? "Copiar endereço de e-mail" : "Copy email address")}</button>
            <span className="copyStatus" role="status">{emailCopied ? (language === "pt" ? "Endereço copiado." : "Address copied.") : copyFailed ? (language === "pt" ? "Selecione o endereço acima para copiar ou enviar uma mensagem." : "Select the address above to copy or send a message.") : ""}</span>
            {discordHref && <a className="button ghost discordContact" href={discordHref} target="_blank" rel="noreferrer">{language === "pt" ? "Prefere o Discord?" : "Prefer Discord?"}<span>Discord ↗</span></a>}
          </div>
        </div>
      </section>

      <footer className="footer shell">
        <span>© {new Date().getFullYear()} {content.owner.displayName}</span>
        <div className="footerRight">
          <span>{labels.footer}</span>
          {visits !== null && visits > 0 && <span>{formatNumber(visits)} {labels.siteVisits}</span>}
          <a href="#top">{language === "pt" ? "Voltar ao topo ↑" : "Back to top ↑"}</a>
        </div>
      </footer>
    </main>
  );
}
