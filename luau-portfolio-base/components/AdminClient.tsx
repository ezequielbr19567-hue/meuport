"use client";

import { useEffect, useState } from "react";
import {
  defaultPortfolio,
  type Language,
  type LocalizedText,
  type MediaItem,
  type PortfolioCard,
  type PortfolioContent,
  type PriceItem,
  type RobloxGame,
} from "@/config/portfolio";
import { setText, text } from "@/lib/i18n";
import type { PortfolioReview, ReviewStatus } from "@/lib/reviews";

type Notice = { type: "success" | "error"; text: string } | null;

type LocalFieldProps = {
  label: string;
  value: LocalizedText | undefined;
  language: Language;
  onChange: (next: LocalizedText) => void;
  placeholder?: string;
};

function LocalInput({ label, value, language, onChange, placeholder }: LocalFieldProps) {
  return (
    <label>
      {label}
      <input
        className="adminInput"
        value={text(value, language)}
        onChange={(event) => onChange(setText(value, language, event.target.value))}
        placeholder={placeholder}
      />
    </label>
  );
}

function LocalTextarea({ label, value, language, onChange, placeholder }: LocalFieldProps) {
  return (
    <label>
      {label}
      <textarea
        className="adminTextarea"
        value={text(value, language)}
        onChange={(event) => onChange(setText(value, language, event.target.value))}
        placeholder={placeholder}
      />
    </label>
  );
}

function listToText(values: LocalizedText[], language: Language) {
  return values.map((value) => text(value, language)).join("\n");
}

function updateLocalizedList(values: LocalizedText[], language: Language, raw: string) {
  const rows = raw.split("\n").map((item) => item.trim()).filter(Boolean);
  return rows.map((row, index) => setText(values[index] || "", language, row));
}

const localized = (en: string, pt: string): LocalizedText => ({ en, pt });

export default function AdminClient() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<PortfolioContent>(defaultPortfolio);
  const [visits, setVisits] = useState("0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [editLanguage, setEditLanguage] = useState<Language>("en");
  const [reviews, setReviews] = useState<PortfolioReview[]>([]);
  const [reviewAverage, setReviewAverage] = useState<number | null>(null);
  const [reviewApprovedCount, setReviewApprovedCount] = useState(0);
  const [reviewBusyId, setReviewBusyId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then(async (session) => {
        const ok = Boolean(session?.authenticated);
        setAuthenticated(ok);
        if (!ok) return;

        const [contentRes, statsRes, reviewsRes] = await Promise.all([
          fetch("/api/admin/content").then((res) => res.json()),
          fetch("/api/admin/stats").then((res) => res.json()),
          fetch("/api/admin/reviews").then((res) => res.json()),
        ]);

        setContent((contentRes?.content as PortfolioContent | undefined) || defaultPortfolio);
        setVisits(String(statsRes?.visits ?? 0));
        setReviews(Array.isArray(reviewsRes?.reviews) ? reviewsRes.reviews : []);
        setReviewAverage(typeof reviewsRes?.average === "number" ? reviewsRes.average : null);
        setReviewApprovedCount(Number(reviewsRes?.approvedCount ?? 0));
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  async function loadAdminData() {
    const [contentRes, statsRes, reviewsRes] = await Promise.all([
      fetch("/api/admin/content").then((res) => res.json()),
      fetch("/api/admin/stats").then((res) => res.json()),
      fetch("/api/admin/reviews").then((res) => res.json()),
    ]);
    setContent((contentRes?.content as PortfolioContent | undefined) || defaultPortfolio);
    setVisits(String(statsRes?.visits ?? 0));
    setReviews(Array.isArray(reviewsRes?.reviews) ? reviewsRes.reviews : []);
    setReviewAverage(typeof reviewsRes?.average === "number" ? reviewsRes.average : null);
    setReviewApprovedCount(Number(reviewsRes?.approvedCount ?? 0));
  }

  async function reloadReviews() {
    const reviewsRes = await fetch("/api/admin/reviews").then((res) => res.json());
    setReviews(Array.isArray(reviewsRes?.reviews) ? reviewsRes.reviews : []);
    setReviewAverage(typeof reviewsRes?.average === "number" ? reviewsRes.average : null);
    setReviewApprovedCount(Number(reviewsRes?.approvedCount ?? 0));
  }

  async function moderateReview(id: string, status: ReviewStatus) {
    setReviewBusyId(id);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) throw new Error("moderation failed");
      await reloadReviews();
      setNotice({ type: "success", text: status === "approved" ? "Avaliação aprovada e publicada." : status === "rejected" ? "Avaliação recusada. Ela não aparece no site nem entra na média." : "Avaliação voltou para pendente." });
    } catch {
      setNotice({ type: "error", text: "Não foi possível atualizar a avaliação." });
    } finally {
      setReviewBusyId(null);
    }
  }

  async function deleteReview(id: string) {
    if (!window.confirm("Excluir esta avaliação permanentemente?")) return;
    setReviewBusyId(id);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("delete failed");
      await reloadReviews();
      setNotice({ type: "success", text: "Avaliação excluída." });
    } catch {
      setNotice({ type: "error", text: "Não foi possível excluir a avaliação." });
    } finally {
      setReviewBusyId(null);
    }
  }

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
    await loadAdminData();
    setLoading(false);
    setNotice({ type: "success", text: "Modo desenvolvedor liberado." });
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setPassword("");
    setNotice({ type: "success", text: "Sessão encerrada." });
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      const [saveContent, saveStats] = await Promise.all([
        fetch("/api/admin/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }),
        fetch("/api/admin/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visits: Number(visits || 0) }),
        }),
      ]);

      if (!saveContent.ok || !saveStats.ok) throw new Error("save failed");
      setNotice({ type: "success", text: "Alterações salvas. O site público já pode usar os novos dados." });
    } catch {
      setNotice({ type: "error", text: "Erro ao salvar. Confira a conexão com o Supabase." });
    } finally {
      setSaving(false);
    }
  }

  function setOwner(key: keyof PortfolioContent["owner"], value: PortfolioContent["owner"][keyof PortfolioContent["owner"]]) {
    setContent((prev) => ({ ...prev, owner: { ...prev.owner, [key]: value } }));
  }

  function setLink(key: keyof PortfolioContent["links"], value: string) {
    setContent((prev) => ({ ...prev, links: { ...prev.links, [key]: value } }));
  }

  function updateProject(kind: "builderProjects" | "programmerProjects", index: number, next: PortfolioCard) {
    setContent((prev) => ({ ...prev, [kind]: prev[kind].map((item, i) => i === index ? next : item) }));
  }

  function removeProject(kind: "builderProjects" | "programmerProjects", index: number) {
    setContent((prev) => ({ ...prev, [kind]: prev[kind].filter((_, i) => i !== index) }));
  }

  function addProject(kind: "builderProjects" | "programmerProjects") {
    const next: PortfolioCard = {
      title: localized("New project", "Novo projeto"),
      description: localized("Describe this project.", "Descreva este projeto."),
      image: "",
      video: "",
      tags: [localized("Tag", "Tag")],
      highlight: kind === "builderProjects" ? "Builder" : localized("Programming", "Programação"),
    };
    setContent((prev) => ({ ...prev, [kind]: [...prev[kind], next] }));
  }

  function updatePrice(index: number, next: PriceItem) {
    setContent((prev) => ({ ...prev, prices: prev.prices.map((item, i) => i === index ? next : item) }));
  }

  function updateMedia(index: number, next: MediaItem) {
    setContent((prev) => ({ ...prev, media: prev.media.map((item, i) => i === index ? next : item) }));
  }

  function updateGame(index: number, next: RobloxGame) {
    setContent((prev) => ({ ...prev, games: prev.games.map((item, i) => i === index ? next : item) }));
  }

  if (loading) {
    return (
      <main className="adminPage shell">
        <div className="adminCard panel"><h1>Carregando modo desenvolvedor...</h1></div>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="adminPage shell">
        <form className="adminCard panel" onSubmit={handleLogin}>
          <small className="adminKicker">MODO DESENVOLVEDOR</small>
          <h1>Entrar para configurar o site</h1>
          <p>A senha é validada no servidor. O painel permite editar as versões em inglês e português do portfólio.</p>
          <label>
            Senha
            <input className="adminInput" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" />
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
            <p>O site público começa em inglês. Use o seletor abaixo para editar cada tradução separadamente.</p>
          </div>
          <div className="adminActions">
            <button className="button ghost" type="button" onClick={handleLogout}>Sair</button>
            <button className="button primary" type="submit" disabled={saving}>{saving ? "Salvando..." : "Salvar tudo"}</button>
          </div>
        </div>

        <div className="adminLanguageBar panel">
          <span>Editando conteúdo:</span>
          <button type="button" className={editLanguage === "en" ? "active" : ""} onClick={() => setEditLanguage("en")}>English</button>
          <button type="button" className={editLanguage === "pt" ? "active" : ""} onClick={() => setEditLanguage("pt")}>Português</button>
          <small>URLs, imagens, Universe IDs e visitas são compartilhados entre os idiomas.</small>
        </div>

        {notice && <div className={`adminNotice ${notice.type}`}>{notice.text}</div>}

        <section className="adminSection panel">
          <div className="adminSectionHeader">
            <div>
              <h2>Avaliações e comentários</h2>
              <p className="adminHint">Só avaliações com status <strong>aprovada</strong> aparecem no site e entram na média.</p>
            </div>
            <div className="reviewAdminSummary">
              <strong>{reviewAverage === null ? "—" : `${reviewAverage.toFixed(1)}/5`}</strong>
              <span>{reviewApprovedCount} aprovadas</span>
            </div>
          </div>

          <div className="reviewAdminStats">
            <span><strong>{reviews.filter((review) => review.status === "pending").length}</strong> pendentes</span>
            <span><strong>{reviews.filter((review) => review.status === "approved").length}</strong> aprovadas</span>
            <span><strong>{reviews.filter((review) => review.status === "rejected").length}</strong> recusadas</span>
          </div>

          <div className="adminItemList">
            {reviews.length === 0 && <div className="adminEmptyReviews">Ainda não há avaliações enviadas.</div>}
            {reviews.map((review) => (
              <article className={`adminReview adminReview-${review.status}`} key={review.id}>
                <div className="adminReviewImage">
                  <img src={review.image_url} alt={review.title} loading="lazy" />
                </div>
                <div className="adminReviewContent">
                  <div className="adminReviewTop">
                    <div>
                      <span className={`reviewStatus reviewStatus-${review.status}`}>{review.status === "pending" ? "Pendente" : review.status === "approved" ? "Aprovada" : "Recusada"}</span>
                      <strong>{review.title}</strong>
                    </div>
                    <span className="adminReviewStars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                  </div>
                  <p>{review.description}</p>
                  <div className="adminReviewMeta">
                    <span>{review.display_name}</span>
                    <span>{review.identity_type === "roblox" ? "Roblox" : review.identity_type === "discord" ? "Discord" : "Nome"}</span>
                    <span>{new Date(review.created_at).toLocaleString("pt-BR")}</span>
                  </div>
                  <div className="adminReviewActions">
                    {review.status !== "approved" && <button type="button" className="reviewApprove" disabled={reviewBusyId === review.id} onClick={() => moderateReview(review.id, "approved")}>Aprovar</button>}
                    {review.status !== "rejected" && <button type="button" className="reviewReject" disabled={reviewBusyId === review.id} onClick={() => moderateReview(review.id, "rejected")}>Recusar</button>}
                    {review.status !== "pending" && <button type="button" className="reviewPending" disabled={reviewBusyId === review.id} onClick={() => moderateReview(review.id, "pending")}>Voltar para pendente</button>}
                    <button type="button" className="reviewDelete" disabled={reviewBusyId === review.id} onClick={() => deleteReview(review.id)}>Excluir</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="adminSection panel">
          <h2>Contador de visitas</h2>
          <label>Visitas atuais<input className="adminInput" value={visits} onChange={(e) => setVisits(e.target.value)} /></label>
        </section>

        <section className="adminSection panel">
          <h2>Hero e identidade</h2>
          <div className="adminGrid2">
            <label>Nome público <span className="sharedField">compartilhado</span><input className="adminInput" value={content.owner.displayName} onChange={(e) => setOwner("displayName", e.target.value)} /></label>
            <label>Username <span className="sharedField">compartilhado</span><input className="adminInput" value={content.owner.username} onChange={(e) => setOwner("username", e.target.value)} /></label>
            <LocalInput label="Status" value={content.owner.status} language={editLanguage} onChange={(next) => setOwner("status", next)} />
            <LocalInput label="Título — linha 1" value={content.owner.heroTitleTop} language={editLanguage} onChange={(next) => setOwner("heroTitleTop", next)} />
            <LocalInput label="Título — destaque" value={content.owner.heroTitleAccent} language={editLanguage} onChange={(next) => setOwner("heroTitleAccent", next)} />
            <LocalInput label="Título — linha 3" value={content.owner.heroTitleBottom} language={editLanguage} onChange={(next) => setOwner("heroTitleBottom", next)} />
          </div>
          <LocalTextarea label="Introdução" value={content.owner.intro} language={editLanguage} onChange={(next) => setOwner("intro", next)} />
          <LocalTextarea label="Texto Builder" value={content.owner.builderPitch} language={editLanguage} onChange={(next) => setOwner("builderPitch", next)} />
          <LocalTextarea label="Texto Programação" value={content.owner.programmerPitch} language={editLanguage} onChange={(next) => setOwner("programmerPitch", next)} />
        </section>

        <section className="adminSection panel">
          <h2>Links e contato</h2>
          <div className="adminGrid2">
            <label>Roblox<input className="adminInput" value={content.links.roblox} onChange={(e) => setLink("roblox", e.target.value)} /></label>
            <label>GitHub<input className="adminInput" value={content.links.github} onChange={(e) => setLink("github", e.target.value)} /></label>
            <label>Discord<input className="adminInput" value={content.links.discord} onChange={(e) => setLink("discord", e.target.value)} /></label>
            <label>E-mail<input className="adminInput" value={content.links.email} onChange={(e) => setLink("email", e.target.value)} /></label>
          </div>
        </section>

        <section className="adminSection panel">
          <h2>Skills</h2>
          <label>
            Builder — uma skill por linha
            <textarea
              className="adminTextarea"
              value={listToText(content.builderSkills, editLanguage)}
              onChange={(e) => setContent((prev) => ({ ...prev, builderSkills: updateLocalizedList(prev.builderSkills, editLanguage, e.target.value) }))}
            />
          </label>
          <label>
            Programação — uma skill por linha
            <textarea
              className="adminTextarea"
              value={listToText(content.programmerSkills, editLanguage)}
              onChange={(e) => setContent((prev) => ({ ...prev, programmerSkills: updateLocalizedList(prev.programmerSkills, editLanguage, e.target.value) }))}
            />
          </label>
        </section>

        <ProjectEditor
          title="Projetos Builder"
          projects={content.builderProjects}
          language={editLanguage}
          onUpdate={(index, next) => updateProject("builderProjects", index, next)}
          onRemove={(index) => removeProject("builderProjects", index)}
          onAdd={() => addProject("builderProjects")}
        />

        <ProjectEditor
          title="Projetos de Programação"
          projects={content.programmerProjects}
          language={editLanguage}
          onUpdate={(index, next) => updateProject("programmerProjects", index, next)}
          onRemove={(index) => removeProject("programmerProjects", index)}
          onAdd={() => addProject("programmerProjects")}
        />

        <section className="adminSection panel">
          <div className="adminSectionHeader"><h2>Valores</h2><button type="button" className="button ghost" onClick={() => setContent((prev) => ({ ...prev, prices: [...prev.prices, { title: localized("New package", "Novo pacote"), price: localized("From R$ 0", "R$ 0+"), description: localized("Describe this package.", "Descreva este pacote."), features: [localized("Included item", "Item incluso")] }] }))}>+ Adicionar</button></div>
          <div className="adminItemList">
            {content.prices.map((item, index) => (
              <div className="adminItem" key={index}>
                <div className="adminItemHeader"><strong>Pacote {index + 1}</strong><button type="button" onClick={() => setContent((prev) => ({ ...prev, prices: prev.prices.filter((_, i) => i !== index) }))}>Remover</button></div>
                <div className="adminGrid2">
                  <LocalInput label="Nome" value={item.title} language={editLanguage} onChange={(next) => updatePrice(index, { ...item, title: next })} />
                  <LocalInput label="Preço" value={item.price} language={editLanguage} onChange={(next) => updatePrice(index, { ...item, price: next })} />
                  <LocalInput label="Destaque opcional" value={item.highlight} language={editLanguage} onChange={(next) => updatePrice(index, { ...item, highlight: next })} />
                </div>
                <LocalTextarea label="Descrição" value={item.description} language={editLanguage} onChange={(next) => updatePrice(index, { ...item, description: next })} />
                <label>Itens inclusos — um por linha<textarea className="adminTextarea" value={listToText(item.features, editLanguage)} onChange={(e) => updatePrice(index, { ...item, features: updateLocalizedList(item.features, editLanguage, e.target.value) })} /></label>
              </div>
            ))}
          </div>
        </section>

        <section className="adminSection panel">
          <div className="adminSectionHeader"><h2>Mídia</h2><button type="button" className="button ghost" onClick={() => setContent((prev) => ({ ...prev, media: [...prev.media, { title: localized("New media", "Nova mídia"), type: "image", url: "", description: localized("Description", "Descrição") }] }))}>+ Adicionar</button></div>
          <div className="adminItemList">
            {content.media.map((item, index) => (
              <div className="adminItem" key={index}>
                <div className="adminItemHeader"><strong>Mídia {index + 1}</strong><button type="button" onClick={() => setContent((prev) => ({ ...prev, media: prev.media.filter((_, i) => i !== index) }))}>Remover</button></div>
                <div className="adminGrid2">
                  <LocalInput label="Título" value={item.title} language={editLanguage} onChange={(next) => updateMedia(index, { ...item, title: next })} />
                  <label>Tipo<select className="adminInput" value={item.type} onChange={(e) => updateMedia(index, { ...item, type: e.target.value as MediaItem["type"] })}><option value="image">Imagem</option><option value="video">Vídeo</option></select></label>
                </div>
                <label>URL da imagem/vídeo <span className="sharedField">compartilhada</span><input className="adminInput" value={item.url} onChange={(e) => updateMedia(index, { ...item, url: e.target.value })} placeholder="https://..." /></label>
                <LocalTextarea label="Descrição" value={item.description} language={editLanguage} onChange={(next) => updateMedia(index, { ...item, description: next })} />
              </div>
            ))}
          </div>
        </section>

        <section className="adminSection panel">
          <div className="adminSectionHeader"><h2>Jogos / contribuições</h2><button type="button" className="button ghost" onClick={() => setContent((prev) => ({ ...prev, games: [...prev.games, { label: localized("New game", "Novo jogo"), universeId: "", role: "Builder", contribution: localized("Describe your contribution.", "Descreva sua contribuição."), url: "#", image: "", manualVisits: 0 }] }))}>+ Adicionar</button></div>
          <div className="adminItemList">
            {content.games.map((game, index) => (
              <div className="adminItem" key={index}>
                <div className="adminItemHeader"><strong>Jogo {index + 1}</strong><button type="button" onClick={() => setContent((prev) => ({ ...prev, games: prev.games.filter((_, i) => i !== index) }))}>Remover</button></div>
                <div className="adminGrid2">
                  <LocalInput label="Nome reserva" value={game.label} language={editLanguage} onChange={(next) => updateGame(index, { ...game, label: next })} />
                  <LocalInput label="Seu papel" value={game.role} language={editLanguage} onChange={(next) => updateGame(index, { ...game, role: next })} />
                  <label>Universe ID <span className="sharedField">compartilhado</span><input className="adminInput" value={game.universeId || ""} onChange={(e) => updateGame(index, { ...game, universeId: e.target.value })} /></label>
                  <label>Visitas manuais <span className="sharedField">fallback</span><input className="adminInput" type="number" min="0" value={game.manualVisits ?? 0} onChange={(e) => updateGame(index, { ...game, manualVisits: Number(e.target.value) })} /></label>
                  <label>Link do jogo<input className="adminInput" value={game.url || ""} onChange={(e) => updateGame(index, { ...game, url: e.target.value })} /></label>
                  <label>Imagem<input className="adminInput" value={game.image || ""} onChange={(e) => updateGame(index, { ...game, image: e.target.value })} /></label>
                </div>
                <LocalTextarea label="Contribuição" value={game.contribution} language={editLanguage} onChange={(next) => updateGame(index, { ...game, contribution: next })} />
              </div>
            ))}
          </div>
        </section>
      </form>
    </main>
  );
}

function ProjectEditor({
  title,
  projects,
  language,
  onUpdate,
  onRemove,
  onAdd,
}: {
  title: string;
  projects: PortfolioCard[];
  language: Language;
  onUpdate: (index: number, next: PortfolioCard) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
}) {
  return (
    <section className="adminSection panel">
      <div className="adminSectionHeader"><h2>{title}</h2><button type="button" className="button ghost" onClick={onAdd}>+ Adicionar</button></div>
      <div className="adminItemList">
        {projects.map((project, index) => (
          <div className="adminItem" key={index}>
            <div className="adminItemHeader"><strong>Projeto {index + 1}</strong><button type="button" onClick={() => onRemove(index)}>Remover</button></div>
            <div className="adminGrid2">
              <LocalInput label="Título" value={project.title} language={language} onChange={(next) => onUpdate(index, { ...project, title: next })} />
              <LocalInput label="Destaque" value={project.highlight} language={language} onChange={(next) => onUpdate(index, { ...project, highlight: next })} />
              <label>Imagem <span className="sharedField">compartilhada</span><input className="adminInput" value={project.image || ""} onChange={(e) => onUpdate(index, { ...project, image: e.target.value })} placeholder="https://..." /></label>
              <label>Vídeo opcional <span className="sharedField">compartilhado</span><input className="adminInput" value={project.video || ""} onChange={(e) => onUpdate(index, { ...project, video: e.target.value })} placeholder="https://..." /></label>
            </div>
            <LocalTextarea label="Descrição" value={project.description} language={language} onChange={(next) => onUpdate(index, { ...project, description: next })} />
            <label>Tags — uma por linha<textarea className="adminTextarea" value={listToText(project.tags, language)} onChange={(e) => onUpdate(index, { ...project, tags: updateLocalizedList(project.tags, language, e.target.value) })} /></label>
          </div>
        ))}
      </div>
    </section>
  );
}
