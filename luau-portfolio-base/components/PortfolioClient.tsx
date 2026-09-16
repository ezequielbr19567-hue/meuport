"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { defaultPortfolio, type MediaItem, type PortfolioContent } from "@/config/portfolio";

type RobloxApiGame = {
  id: number;
  name?: string;
  playing?: number;
  visits?: number;
};

const compact = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

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

function MediaPreview({ item }: { item: MediaItem }) {
  if (!item.url) {
    return <div className="mediaEmpty">Adicione uma URL no modo desenvolvedor.</div>;
  }

  if (item.type === "image") {
    return <img src={item.url} alt={item.title} className="mediaImage" />;
  }

  const kind = getVideoKind(item.url);

  if (kind === "embed") {
    return (
      <iframe
        className="mediaFrame"
        src={getEmbedUrl(item.url)}
        title={item.title}
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
      Abrir vídeo ↗
    </a>
  );
}

export default function PortfolioClient() {
  const [content, setContent] = useState<PortfolioContent>(defaultPortfolio);
  const [visits, setVisits] = useState<number | null>(null);
  const [games, setGames] = useState<RobloxApiGame[]>([]);
  const visitSent = useRef(false);

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
        <div className="navLinks">
          <a href="#builder">Builder</a>
          <a href="#programming">Programação</a>
          <a href="#pricing">Valores</a>
          <a href="#media">Mídia</a>
          <a href="#games">Jogos</a>
          <a href="#contact">Contato</a>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="eyebrow">{content.owner.status}</div>
        <div className="heroGrid">
          <div>
            <h1>
              {content.owner.heroTitleTop} <span>{content.owner.heroTitleAccent}</span>
              <br />
              {content.owner.heroTitleBottom}
            </h1>
            <p className="heroText">{content.owner.intro}</p>

            <div className="heroActions">
              <a className="button primary" href="#builder">Ver portfólio</a>
              <a className="button ghost" href={content.links.roblox} target="_blank" rel="noreferrer">Perfil Roblox ↗</a>
            </div>
          </div>

          <div className="heroPanel panel">
            <div className="splitBar" />
            <div className="dualPitch">
              <div>
                <small>FOCO PRINCIPAL</small>
                <h3>Builder</h3>
                <p>{content.owner.builderPitch}</p>
              </div>
              <div>
                <small>ÁREA SEPARADA</small>
                <h3>Programação</h3>
                <p>{content.owner.programmerPitch}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="statsGrid">
          <div className="stat panel">
            <strong>{visits === null ? "—" : formatNumber(visits)}</strong>
            <span>visitas no site</span>
          </div>
          <div className="stat panel">
            <strong>{content.builderProjects.length}</strong>
            <span>projetos builder</span>
          </div>
          <div className="stat panel">
            <strong>{content.games.length}</strong>
            <span>jogos com contribuição</span>
          </div>
          <div className="stat panel">
            <strong>{content.prices.length}</strong>
            <span>faixas de valores</span>
          </div>
        </div>
      </section>

      <section className="section shell" id="builder">
        <div className="sectionHead">
          <div>
            <span className="kicker">BUILDER SHOWCASE</span>
            <h2>Construção em primeiro plano</h2>
          </div>
          <p>Seção principal para lobbies, mapas, interiores, ambientações e composição visual.</p>
        </div>

        <div className="projectGrid builderGrid">
          {content.builderProjects.map((project, index) => (
            <article className="projectCard panel" key={`${project.title}-${index}`}>
              <div
                className="projectVisual builderVisual"
                style={project.image ? { backgroundImage: `linear-gradient(rgba(3,6,15,.12), rgba(3,6,15,.65)), url(${project.image})` } : undefined}
              >
                {!project.image && <div className="abstractConstruction" aria-hidden="true" />}
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="projectBody">
                <small>{project.highlight || "Builder"}</small>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="tags">
                  {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section shell" id="programming">
        <div className="sectionHead">
          <div>
            <span className="kicker">PROGRAMAÇÃO</span>
            <h2>Sistemas e suporte técnico</h2>
          </div>
          <p>Área separada para Luau, automações, UI e sistemas que complementam seu trabalho builder.</p>
        </div>

        <div className="projectGrid programmingGrid">
          {content.programmerProjects.map((project, index) => (
            <article className="projectCard panel" key={`${project.title}-${index}`}>
              <div
                className="projectVisual programmingVisual"
                style={project.image ? { backgroundImage: `linear-gradient(rgba(6,10,20,.2), rgba(6,10,20,.7)), url(${project.image})` } : undefined}
              >
                {!project.image && <div className="abstractCode" aria-hidden="true" />}
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="projectBody">
                <small>{project.highlight || "Programação"}</small>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="tags">
                  {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section shell" id="pricing">
        <div className="sectionHead">
          <div>
            <span className="kicker">VALORES</span>
            <h2>Faixas e pacotes configuráveis</h2>
          </div>
          <p>Você poderá editar preço, descrição e benefícios pelo modo desenvolvedor sem mexer no código.</p>
        </div>

        <div className="pricingGrid">
          {content.prices.map((item, index) => (
            <article className="priceCard panel" key={`${item.title}-${index}`}>
              {item.highlight && <div className="priceBadge">{item.highlight}</div>}
              <small>{item.title}</small>
              <h3>{item.price}</h3>
              <p>{item.description}</p>
              <ul>
                {item.features.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section shell" id="media">
        <div className="sectionHead">
          <div>
            <span className="kicker">MÍDIA</span>
            <h2>Imagens e vídeos do seu trabalho</h2>
          </div>
          <p>Adicione prints, renders, showcases do YouTube, Vimeo ou links diretos de vídeo.</p>
        </div>

        <div className="mediaGrid">
          {content.media.map((item, index) => (
            <article className="mediaCard panel" key={`${item.title}-${index}`}>
              <div className="mediaPreview">
                <MediaPreview item={item} />
              </div>
              <div className="projectBody">
                <small>{item.type === "image" ? "Imagem" : "Vídeo"}</small>
                <h3>{item.title}</h3>
                <p>{item.description || "Sem descrição."}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section shell" id="games">
        <div className="sectionHead">
          <div>
            <span className="kicker">CONTRIBUIÇÕES</span>
            <h2>Jogos em que trabalhei</h2>
          </div>
          <p>Os cards podem puxar visitas do Roblox pelo Universe ID e ainda manter descrição manual do seu papel.</p>
        </div>

        <div className="gamesGrid">
          {content.games.map((game, index) => {
            const live = game.universeId ? apiById.get(game.universeId) : undefined;
            const shownName = live?.name || game.label;
            const shownVisits = live?.visits ?? game.manualVisits;

            return (
              <a className="gameCard panel" key={`${game.label}-${index}`} href={game.url || "#"} target="_blank" rel="noreferrer">
                <div className="gameMedia" style={game.image ? { backgroundImage: `linear-gradient(rgba(2,6,15,.2), rgba(2,6,15,.7)), url(${game.image})` } : undefined}>
                  {!game.image && <div className="gameMediaFallback" />}
                </div>
                <div className="gameContent">
                  <span className="role">{game.role}</span>
                  <h3>{shownName}</h3>
                  <p>{game.contribution}</p>
                </div>
                <div className="gameNumbers">
                  <div><strong>{formatNumber(shownVisits)}</strong><span>visitas</span></div>
                  <div><strong>{formatNumber(live?.playing)}</strong><span>jogando agora</span></div>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <section className="section shell about" id="contact">
        <div>
          <span className="kicker">STACK</span>
          <h2>Builder e developer</h2>
          <p>Deixei as habilidades separadas para reforçar que seu foco principal é construção, mas sem esconder sua parte de programação.</p>
        </div>
        <div className="stackColumns">
          <div className="panel stackPanel">
            <small>BUILDER</small>
            <div className="skillCloud">
              {content.builderSkills.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
          </div>
          <div className="panel stackPanel">
            <small>PROGRAMAÇÃO</small>
            <div className="skillCloud">
              {content.programmerSkills.map((skill) => <span key={skill}>{skill}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="cta shell">
        <div className="ctaInner panel">
          <span className="kicker">CONTATO</span>
          <h2>Quer um mapa, ambiente ou suporte técnico para o seu jogo?</h2>
          <p>Você pode trocar esta chamada quando quiser no modo desenvolvedor.</p>
          <div className="heroActions">
            <a className="button primary" href={content.links.discord}>Discord</a>
            <a className="button ghost" href={content.links.github} target="_blank" rel="noreferrer">GitHub ↗</a>
            <a className="button ghost" href={content.links.email}>E-mail</a>
          </div>
        </div>
      </section>

      <footer className="footer shell">
        <span>© {new Date().getFullYear()} {content.owner.displayName}</span>
        <div className="footerRight">
          <span>Builder • Roblox Studio • Luau</span>
          <a href="/dev">Modo desenvolvedor</a>
        </div>
      </footer>
    </main>
  );
}
