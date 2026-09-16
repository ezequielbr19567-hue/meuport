"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultPortfolio, type PortfolioContent } from "@/config/portfolio";

type Notice = { type: "success" | "error"; text: string } | null;

function pretty(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default function AdminClient() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<PortfolioContent>(defaultPortfolio);
  const [visits, setVisits] = useState("0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  const [builderProjectsJson, setBuilderProjectsJson] = useState(pretty(defaultPortfolio.builderProjects));
  const [programmerProjectsJson, setProgrammerProjectsJson] = useState(pretty(defaultPortfolio.programmerProjects));
  const [pricesJson, setPricesJson] = useState(pretty(defaultPortfolio.prices));
  const [mediaJson, setMediaJson] = useState(pretty(defaultPortfolio.media));
  const [gamesJson, setGamesJson] = useState(pretty(defaultPortfolio.games));

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/session").then((res) => res.json()),
    ])
      .then(([session]) => {
        const ok = Boolean(session?.authenticated);
        setAuthenticated(ok);
        if (ok) {
          return Promise.all([
            fetch("/api/admin/content").then((res) => res.json()),
            fetch("/api/admin/stats").then((res) => res.json()),
          ]).then(([contentRes, statsRes]) => {
            const next = (contentRes?.content as PortfolioContent | undefined) || defaultPortfolio;
            setContent(next);
            setBuilderProjectsJson(pretty(next.builderProjects));
            setProgrammerProjectsJson(pretty(next.programmerProjects));
            setPricesJson(pretty(next.prices));
            setMediaJson(pretty(next.media));
            setGamesJson(pretty(next.games));
            setVisits(String(statsRes?.visits ?? 0));
          });
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const canShowEditor = useMemo(() => authenticated && !loading, [authenticated, loading]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setNotice(null);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      setNotice({ type: "error", text: body?.error || "Não foi possível entrar." });
      return;
    }

    setAuthenticated(true);
    setLoading(true);

    const [contentRes, statsRes] = await Promise.all([
      fetch("/api/admin/content").then((res) => res.json()),
      fetch("/api/admin/stats").then((res) => res.json()),
    ]);

    const next = (contentRes?.content as PortfolioContent | undefined) || defaultPortfolio;
    setContent(next);
    setBuilderProjectsJson(pretty(next.builderProjects));
    setProgrammerProjectsJson(pretty(next.programmerProjects));
    setPricesJson(pretty(next.prices));
    setMediaJson(pretty(next.media));
    setGamesJson(pretty(next.games));
    setVisits(String(statsRes?.visits ?? 0));
    setLoading(false);
    setNotice({ type: "success", text: "Modo desenvolvedor liberado." });
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setPassword("");
    setNotice({ type: "success", text: "Sessão encerrada." });
  }

  function updateOwner<K extends keyof PortfolioContent["owner"]>(key: K, value: PortfolioContent["owner"][K]) {
    setContent((prev) => ({ ...prev, owner: { ...prev.owner, [key]: value } }));
  }

  function updateLinks<K extends keyof PortfolioContent["links"]>(key: K, value: PortfolioContent["links"][K]) {
    setContent((prev) => ({ ...prev, links: { ...prev.links, [key]: value } }));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      const nextContent: PortfolioContent = {
        ...content,
        builderSkills: content.builderSkills,
        programmerSkills: content.programmerSkills,
        builderProjects: JSON.parse(builderProjectsJson),
        programmerProjects: JSON.parse(programmerProjectsJson),
        prices: JSON.parse(pricesJson),
        media: JSON.parse(mediaJson),
        games: JSON.parse(gamesJson),
      };

      const saveContent = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: nextContent }),
      });

      const saveStats = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visits: Number(visits || 0) }),
      });

      if (!saveContent.ok || !saveStats.ok) {
        throw new Error("Falha ao salvar.");
      }

      setContent(nextContent);
      setNotice({ type: "success", text: "Alterações salvas com sucesso." });
    } catch (error) {
      setNotice({ type: "error", text: "Erro ao salvar. Verifique se os blocos JSON estão válidos." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="adminPage shell">
        <div className="adminCard panel">
          <h1>Carregando modo desenvolvedor...</h1>
        </div>
      </main>
    );
  }

  if (!canShowEditor) {
    return (
      <main className="adminPage shell">
        <form className="adminCard panel" onSubmit={handleLogin}>
          <small className="adminKicker">MODO DESENVOLVEDOR</small>
          <h1>Entrar para configurar o site</h1>
          <p>Use a senha definida no servidor para editar visitas, preços, imagens, vídeos, textos e listas.</p>

          <label>
            Senha
            <input
              className="adminInput"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
            />
          </label>

          <button className="button primary" type="submit">Entrar</button>
          {notice && <div className={`adminNotice ${notice.type}`}>{notice.text}</div>}
        </form>
      </main>
    );
  }

  return (
    <main className="adminPage shell">
      <form className="adminLayout" onSubmit={handleSave}>
        <div className="adminTop panel">
          <div>
            <small className="adminKicker">PAINEL PRIVADO</small>
            <h1>Modo desenvolvedor</h1>
            <p>Edite o conteúdo do portfólio e salve tudo no banco. O site público lê essas informações automaticamente.</p>
          </div>
          <div className="adminActions">
            <button className="button ghost" type="button" onClick={handleLogout}>Sair</button>
            <button className="button primary" type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar tudo"}</button>
          </div>
        </div>

        {notice && <div className={`adminNotice ${notice.type}`}>{notice.text}</div>}

        <section className="adminSection panel">
          <h2>Contador de visitas</h2>
          <label>
            Visitas atuais
            <input className="adminInput" value={visits} onChange={(e) => setVisits(e.target.value)} />
          </label>
        </section>

        <section className="adminSection panel">
          <h2>Hero e identidade</h2>
          <div className="adminGrid2">
            <label>Nome público<input className="adminInput" value={content.owner.displayName} onChange={(e) => updateOwner("displayName", e.target.value)} /></label>
            <label>Username<input className="adminInput" value={content.owner.username} onChange={(e) => updateOwner("username", e.target.value)} /></label>
            <label>Status<input className="adminInput" value={content.owner.status} onChange={(e) => updateOwner("status", e.target.value)} /></label>
            <label>Título 1<input className="adminInput" value={content.owner.heroTitleTop} onChange={(e) => updateOwner("heroTitleTop", e.target.value)} /></label>
            <label>Título destaque<input className="adminInput" value={content.owner.heroTitleAccent} onChange={(e) => updateOwner("heroTitleAccent", e.target.value)} /></label>
            <label>Título 3<input className="adminInput" value={content.owner.heroTitleBottom} onChange={(e) => updateOwner("heroTitleBottom", e.target.value)} /></label>
          </div>
          <label>Introdução<textarea className="adminTextarea" value={content.owner.intro} onChange={(e) => updateOwner("intro", e.target.value)} /></label>
          <label>Texto builder<textarea className="adminTextarea" value={content.owner.builderPitch} onChange={(e) => updateOwner("builderPitch", e.target.value)} /></label>
          <label>Texto programação<textarea className="adminTextarea" value={content.owner.programmerPitch} onChange={(e) => updateOwner("programmerPitch", e.target.value)} /></label>
        </section>

        <section className="adminSection panel">
          <h2>Links e contato</h2>
          <div className="adminGrid2">
            <label>Roblox<input className="adminInput" value={content.links.roblox} onChange={(e) => updateLinks("roblox", e.target.value)} /></label>
            <label>GitHub<input className="adminInput" value={content.links.github} onChange={(e) => updateLinks("github", e.target.value)} /></label>
            <label>Discord<input className="adminInput" value={content.links.discord} onChange={(e) => updateLinks("discord", e.target.value)} /></label>
            <label>E-mail<input className="adminInput" value={content.links.email} onChange={(e) => updateLinks("email", e.target.value)} /></label>
          </div>
        </section>

        <section className="adminSection panel">
          <h2>Skills</h2>
          <label>
            Skills de builder (separadas por vírgula)
            <textarea className="adminTextarea" value={content.builderSkills.join(", ")} onChange={(e) => setContent((prev) => ({ ...prev, builderSkills: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))} />
          </label>
          <label>
            Skills de programação (separadas por vírgula)
            <textarea className="adminTextarea" value={content.programmerSkills.join(", ")} onChange={(e) => setContent((prev) => ({ ...prev, programmerSkills: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))} />
          </label>
        </section>

        <section className="adminSection panel">
          <h2>Listas avançadas</h2>
          <p className="adminHint">Edite os blocos abaixo em JSON. Mantenha colchetes, chaves e vírgulas corretos.</p>
          <label>Projetos builder<textarea className="adminCode" value={builderProjectsJson} onChange={(e) => setBuilderProjectsJson(e.target.value)} /></label>
          <label>Projetos de programação<textarea className="adminCode" value={programmerProjectsJson} onChange={(e) => setProgrammerProjectsJson(e.target.value)} /></label>
          <label>Valores<textarea className="adminCode" value={pricesJson} onChange={(e) => setPricesJson(e.target.value)} /></label>
          <label>Mídia (imagens e vídeos)<textarea className="adminCode" value={mediaJson} onChange={(e) => setMediaJson(e.target.value)} /></label>
          <label>Jogos / contribuições<textarea className="adminCode" value={gamesJson} onChange={(e) => setGamesJson(e.target.value)} /></label>
        </section>
      </form>
    </main>
  );
}
