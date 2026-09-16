"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { portfolio } from "@/config/portfolio";

type RobloxApiGame = {
  id: number;
  rootPlaceId?: number;
  name?: string;
  description?: string;
  playing?: number;
  visits?: number;
  maxPlayers?: number;
  favoritedCount?: number;
};

const compact = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return "—";
  return compact.format(value);
}

export default function PortfolioClient() {
  const [visits, setVisits] = useState<number | null>(null);
  const [games, setGames] = useState<RobloxApiGame[]>([]);
  const visitSent = useRef(false);

  const configuredIds = useMemo(
    () => portfolio.games.map((game) => game.universeId?.trim()).filter(Boolean) as string[],
    []
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
      <div className="cursorGlow" aria-hidden="true" />

      <nav className="nav shell">
        <a className="brand" href="#top">{portfolio.owner.username}</a>
        <div className="navLinks">
          <a href="#projects">Projetos</a>
          <a href="#games">Jogos</a>
          <a href="#about">Sobre</a>
        </div>
      </nav>

      <section className="hero shell" id="top">
        <div className="eyebrow"><span className="statusDot" /> {portfolio.owner.status}</div>
        <h1>
          Eu construo <span>experiências</span><br />em Luau.
        </h1>
        <p className="heroText">{portfolio.owner.intro}</p>

        <div className="heroActions">
          <a className="button primary" href="#projects">Ver projetos</a>
          <a className="button ghost" href={portfolio.links.roblox} target="_blank" rel="noreferrer">Perfil Roblox ↗</a>
        </div>

        <div className="statsGrid">
          <div className="stat glass">
            <strong>{visits === null ? "—" : formatNumber(visits)}</strong>
            <span>visitas neste portfólio</span>
          </div>
          <div className="stat glass">
            <strong>{portfolio.games.length}</strong>
            <span>jogos configurados</span>
          </div>
          <div className="stat glass">
            <strong>{portfolio.projects.length}</strong>
            <span>projetos em destaque</span>
          </div>
        </div>
      </section>

      <section className="section shell" id="projects">
        <div className="sectionHead">
          <div>
            <span className="kicker">PORTFÓLIO</span>
            <h2>Projetos em destaque</h2>
          </div>
          <p>Troque textos, imagens e tags em <code>config/portfolio.ts</code>.</p>
        </div>

        <div className="projectGrid">
          {portfolio.projects.map((project, index) => (
            <article className="projectCard glass" key={project.title}>
              <div className={`projectVisual visual${(index % 3) + 1}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div className="codeMini">
                  <i /> <i /> <i /> <i />
                </div>
              </div>
              <div className="projectBody">
                <small>{project.highlight}</small>
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

      <section className="section shell" id="games">
        <div className="sectionHead">
          <div>
            <span className="kicker">CONTRIBUIÇÕES</span>
            <h2>Jogos em que trabalhei</h2>
          </div>
          <p>Preencha o <strong>Universe ID</strong> e os dados públicos podem ser carregados automaticamente.</p>
        </div>

        <div className="gamesGrid">
          {portfolio.games.map((game) => {
            const live = game.universeId ? apiById.get(game.universeId) : undefined;
            const shownName = live?.name || game.label;
            const shownVisits = live?.visits ?? game.manualVisits;

            return (
              <a className="gameCard glass" key={`${game.label}-${game.universeId}`} href={game.url || "#"} target="_blank" rel="noreferrer">
                <div>
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

      <section className="section shell about" id="about">
        <div>
          <span className="kicker">STACK</span>
          <h2>O que eu uso</h2>
          <p>Esta área serve para você resumir suas habilidades e o tipo de trabalho que gosta de fazer.</p>
        </div>
        <div className="skillCloud">
          {portfolio.skills.map((skill) => <span key={skill}>{skill}</span>)}
        </div>
      </section>

      <section className="cta shell">
        <div className="ctaInner glass">
          <span className="kicker">CONTATO</span>
          <h2>Tem uma ideia para Roblox?</h2>
          <p>Troque esta frase pela sua chamada para freelas, commissions ou colaborações.</p>
          <div className="heroActions">
            <a className="button primary" href={portfolio.links.discord}>Discord</a>
            <a className="button ghost" href={portfolio.links.github} target="_blank" rel="noreferrer">GitHub ↗</a>
          </div>
        </div>
      </section>

      <footer className="footer shell">
        <span>© {new Date().getFullYear()} {portfolio.owner.displayName}</span>
        <span>Luau • Roblox Studio</span>
      </footer>
    </main>
  );
}
