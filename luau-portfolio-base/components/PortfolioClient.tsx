"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  defaultPortfolio,
  type Language,
  type MediaItem,
  type PortfolioContent,
} from "@/config/portfolio";
import { text } from "@/lib/i18n";

type RobloxApiGame = {
  id: number;
  name?: string;
  playing?: number;
  visits?: number;
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
    navContact: "Contact",
    viewPortfolio: "View portfolio",
    robloxProfile: "Roblox profile ↗",
    mainFocus: "MAIN FOCUS",
    separateArea: "SEPARATE AREA",
    programming: "Programming",
    siteVisits: "site visits",
    builderProjects: "builder projects",
    contributedGames: "games contributed to",
    priceRanges: "price ranges",
    builderKicker: "BUILDER SHOWCASE",
    builderTitle: "Building comes first",
    builderDescription: "The main section for lobbies, maps, interiors, environments and visual composition.",
    programmingKicker: "PROGRAMMING",
    programmingTitle: "Systems and technical support",
    programmingDescription: "A separate area for Luau, automation, UI and systems that support your building work.",
    pricingKicker: "PRICING",
    pricingTitle: "Flexible price ranges",
    pricingDescription: "Edit prices, descriptions and included work from developer mode without touching the code.",
    mediaKicker: "MEDIA",
    mediaTitle: "Images and videos",
    mediaDescription: "Show screenshots, renders, YouTube/Vimeo showcases or direct video files.",
    image: "Image",
    video: "Video",
    noDescription: "No description.",
    gamesKicker: "CONTRIBUTIONS",
    gamesTitle: "Games I worked on",
    gamesDescription: "Cards can fetch Roblox visits by Universe ID while keeping your role and contribution editable.",
    visits: "visits",
    playingNow: "playing now",
    stackKicker: "STACK",
    stackTitle: "Builder and developer",
    stackDescription: "Skills stay separated so building remains the main focus without hiding your programming experience.",
    builder: "BUILDER",
    contactKicker: "CONTACT",
    contactTitle: "Need a map, environment or technical support for your game?",
    contactDescription: "You can edit this portfolio anytime from developer mode.",
    email: "Email",
    footer: "Builder • Roblox Studio • Luau",
    developerMode: "Developer mode",
    mediaEmpty: "Add a URL in developer mode.",
    openVideo: "Open video ↗",
  },
  pt: {
    navBuilder: "Builder",
    navProgramming: "Programação",
    navPricing: "Valores",
    navMedia: "Mídia",
    navGames: "Jogos",
    navContact: "Contato",
    viewPortfolio: "Ver portfólio",
    robloxProfile: "Perfil Roblox ↗",
    mainFocus: "FOCO PRINCIPAL",
    separateArea: "ÁREA SEPARADA",
    programming: "Programação",
    siteVisits: "visitas no site",
    builderProjects: "projetos builder",
    contributedGames: "jogos com contribuição",
    priceRanges: "faixas de valores",
    builderKicker: "BUILDER SHOWCASE",
    builderTitle: "Construção em primeiro plano",
    builderDescription: "Seção principal para lobbies, mapas, interiores, ambientações e composição visual.",
    programmingKicker: "PROGRAMAÇÃO",
    programmingTitle: "Sistemas e suporte técnico",
    programmingDescription: "Área separada para Luau, automações, UI e sistemas que complementam seu trabalho builder.",
    pricingKicker: "VALORES",
    pricingTitle: "Faixas e pacotes configuráveis",
    pricingDescription: "Edite preço, descrição e o que está incluso pelo modo desenvolvedor sem mexer no código.",
    mediaKicker: "MÍDIA",
    mediaTitle: "Imagens e vídeos",
    mediaDescription: "Mostre prints, renders, showcases do YouTube/Vimeo ou arquivos diretos de vídeo.",
    image: "Imagem",
    video: "Vídeo",
    noDescription: "Sem descrição.",
    gamesKicker: "CONTRIBUIÇÕES",
    gamesTitle: "Jogos em que trabalhei",
    gamesDescription: "Os cards podem puxar visitas do Roblox pelo Universe ID e manter seu papel e contribuição editáveis.",
    visits: "visitas",
    playingNow: "jogando agora",
    stackKicker: "STACK",
    stackTitle: "Builder e developer",
    stackDescription: "As habilidades ficam separadas para reforçar builder como foco principal sem esconder sua experiência em programação.",
    builder: "BUILDER",
    contactKicker: "CONTATO",
    contactTitle: "Precisa de um mapa, ambiente ou suporte técnico para o seu jogo?",
    contactDescription: "Você pode editar este portfólio a qualquer momento pelo modo desenvolvedor.",
    email: "E-mail",
    footer: "Builder • Roblox Studio • Luau",
    developerMode: "Modo desenvolvedor",
    mediaEmpty: "Adicione uma URL no modo desenvolvedor.",
    openVideo: "Abrir vídeo ↗",
  },
} satisfies Record<Language, Record<string, string>>;

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return compact.format(value);
}

function getVideoKind(url: string) {
  if (/youtube\.com|youtu\.be|vimeo\.com/.test(url)) return "embed";
  if (/\.mp4($|\?)/.test(url)) return "file";
  return "link";
}

function getEmbedUrl(url: string) {
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }

  if (url.includes("youtube.com/watch")) {
    const match = url.match(/[?&]v=([^&]+)/);
    return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : url;
  }

  if (url.includes("vimeo.com/")) {
    const id = url.split("vimeo.com/")[1]?.split(/[?&]/)[0];
    return id ? `https://player.vimeo.com/video/${id}` : url;
  }

  return url;
}

function MediaPreview({ item, language }: { item: MediaItem; language: Language }) {
  const labels = ui[language];

  if (!item.url) {
    return <div className="mediaEmpty">{labels.mediaEmpty}</div>;
  }

  if (item.type === "image") {
    return <img src={item.url} alt={text(item.title, language)} className="mediaImage" />;
  }

  const kind = getVideoKind(item.url);

  if (kind === "embed") {
    return (
      <iframe
        className="mediaFrame"
        src={getEmbedUrl(item.url)}
        title={text(item.title, language)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  if (kind === "file") {
    return <video className="mediaFrame" src={item.url} controls playsInline />;
  }

  return (
    <a className="mediaLink" href={item.url} target="_blank" rel="noreferrer">
      {labels.openVideo}
    </a>
  );
}

export default function PortfolioClient() {
  const [content, setContent] = useState<PortfolioContent>(defaultPortfolio);
  const [language, setLanguage] = useState<Language>("en");
  const [visits, setVisits] = useState<number | null>(null);
  const [games, setGames] = useState<RobloxApiGame[]>([]);
  const visitSent = useRef(false);
  const labels = ui[language];

  useEffect(() => {
    const saved = window.localStorage.getItem("portfolio-language");
    if (saved === "pt" || saved === "en") {
      setLanguage(saved);
      document.documentElement.lang = saved === "pt" ? "pt-BR" : "en";
    }
  }, []);

  function changeLanguage(next: Language) {
    setLanguage(next);
    window.localStorage.setItem("portfolio-language", next);
    document.documentElement.lang = next === "pt" ? "pt-BR" : "en";
  }

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        if (data?.content) setContent(data.content as PortfolioContent);
      })
      .catch(() => undefined);
  }, []);

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
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!configuredIds.length) return;

    fetch(`/api/games?ids=${configuredIds.join(",")}`)
      .then((res) => res.json())
      .then((body) => setGames(Array.isArray(body.data) ? body.data : []))
      .catch(() => undefined);
  }, [configuredIds]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${event.clientY}px`);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const apiById = new Map(games.map((game) => [String(game.id), game]));

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
            <a href="#media">{labels.navMedia}</a>
            <a href="#games">{labels.navGames}</a>
            <a href="#contact">{labels.navContact}</a>
          </div>
          <div className="languageSwitch" aria-label="Language selector">
            <button
              type="button"
              className={language === "en" ? "active" : ""}
              onClick={() => changeLanguage("en")}
              aria-pressed={language === "en"}
            >
              EN
            </button>
            <span>/</span>
            <button
              type="button"
              className={language === "pt" ? "active" : ""}
              onClick={() => changeLanguage("pt")}
              aria-pressed={language === "pt"}
            >
              PT
            </button>
          </div>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="eyebrow">{text(content.owner.status, language)}</div>
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

        <div className="statsGrid">
          <div className="stat panel">
            <strong>{visits === null ? "—" : formatNumber(visits)}</strong>
            <span>{labels.siteVisits}</span>
          </div>
          <div className="stat panel">
            <strong>{content.builderProjects.length}</strong>
            <span>{labels.builderProjects}</span>
          </div>
          <div className="stat panel">
            <strong>{content.games.length}</strong>
            <span>{labels.contributedGames}</span>
          </div>
          <div className="stat panel">
            <strong>{content.prices.length}</strong>
            <span>{labels.priceRanges}</span>
          </div>
        </div>
      </section>

      <section className="section shell" id="builder">
        <div className="sectionHead">
          <div>
            <span className="kicker">{labels.builderKicker}</span>
            <h2>{labels.builderTitle}</h2>
          </div>
          <p>{labels.builderDescription}</p>
        </div>

        <div className="projectGrid builderGrid">
          {content.builderProjects.map((project, index) => (
            <article className="projectCard panel" key={`${text(project.title, language)}-${index}`}>
              <div
                className="projectVisual builderVisual"
                style={project.image ? { backgroundImage: `linear-gradient(rgba(3,6,15,.12), rgba(3,6,15,.65)), url(${project.image})` } : undefined}
              >
                {!project.image && <div className="abstractConstruction" aria-hidden="true" />}
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
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

      <section className="section shell" id="programming">
        <div className="sectionHead">
          <div>
            <span className="kicker">{labels.programmingKicker}</span>
            <h2>{labels.programmingTitle}</h2>
          </div>
          <p>{labels.programmingDescription}</p>
        </div>

        <div className="projectGrid programmingGrid">
          {content.programmerProjects.map((project, index) => (
            <article className="projectCard panel" key={`${text(project.title, language)}-${index}`}>
              <div
                className="projectVisual programmingVisual"
                style={project.image ? { backgroundImage: `linear-gradient(rgba(6,10,20,.2), rgba(6,10,20,.7)), url(${project.image})` } : undefined}
              >
                {!project.image && <div className="abstractCode" aria-hidden="true" />}
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
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

      <section className="section shell" id="pricing">
        <div className="sectionHead">
          <div>
            <span className="kicker">{labels.pricingKicker}</span>
            <h2>{labels.pricingTitle}</h2>
          </div>
          <p>{labels.pricingDescription}</p>
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

      <section className="section shell" id="media">
        <div className="sectionHead">
          <div>
            <span className="kicker">{labels.mediaKicker}</span>
            <h2>{labels.mediaTitle}</h2>
          </div>
          <p>{labels.mediaDescription}</p>
        </div>

        <div className="mediaGrid">
          {content.media.map((item, index) => (
            <article className="mediaCard panel" key={`${text(item.title, language)}-${index}`}>
              <div className="mediaPreview">
                <MediaPreview item={item} language={language} />
              </div>
              <div className="projectBody">
                <small>{item.type === "image" ? labels.image : labels.video}</small>
                <h3>{text(item.title, language)}</h3>
                <p>{text(item.description, language) || labels.noDescription}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section shell" id="games">
        <div className="sectionHead">
          <div>
            <span className="kicker">{labels.gamesKicker}</span>
            <h2>{labels.gamesTitle}</h2>
          </div>
          <p>{labels.gamesDescription}</p>
        </div>

        <div className="gamesGrid">
          {content.games.map((game, index) => {
            const live = game.universeId ? apiById.get(game.universeId) : undefined;
            const shownName = live?.name || text(game.label, language);
            const shownVisits = live?.visits ?? game.manualVisits;

            return (
              <a className="gameCard panel" key={`${shownName}-${index}`} href={game.url || "#"} target="_blank" rel="noreferrer">
                <div className="gameMedia" style={game.image ? { backgroundImage: `linear-gradient(rgba(2,6,15,.2), rgba(2,6,15,.7)), url(${game.image})` } : undefined}>
                  {!game.image && <div className="gameMediaFallback" />}
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

      <section className="section shell about" id="contact">
        <div>
          <span className="kicker">{labels.stackKicker}</span>
          <h2>{labels.stackTitle}</h2>
          <p>{labels.stackDescription}</p>
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

      <section className="cta shell">
        <div className="ctaInner panel">
          <span className="kicker">{labels.contactKicker}</span>
          <h2>{labels.contactTitle}</h2>
          <p>{labels.contactDescription}</p>
          <div className="heroActions">
            <a className="button primary" href={content.links.discord}>Discord</a>
            <a className="button ghost" href={content.links.github} target="_blank" rel="noreferrer">GitHub ↗</a>
            <a className="button ghost" href={content.links.email}>{labels.email}</a>
          </div>
        </div>
      </section>

      <footer className="footer shell">
        <span>© {new Date().getFullYear()} {content.owner.displayName}</span>
        <div className="footerRight">
          <span>{labels.footer}</span>
          <a href="/dev">{labels.developerMode}</a>
        </div>
      </footer>
    </main>
  );
}
