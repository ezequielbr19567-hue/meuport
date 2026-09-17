"use client";
import { useEffect, useRef, useState } from "react";
import type { Language } from "@/config/portfolio";

export function safeMediaUrl(raw: string) {
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch { return ""; }
}
export function videoSource(raw: string) {
  const url = safeMediaUrl(raw);
  if (!url) return { kind: "link", url: "" };
  if (/\.(mp4|webm|ogg)(?:$|[?#])/i.test(url)) return { kind: "file", url };
  try {
    const parsed = new URL(url), host = parsed.hostname.replace(/^www\./, "");
    const parts = parsed.pathname.split("/").filter(Boolean);
    const id = host === "youtu.be" ? parts[0] : parsed.searchParams.get("v") || (["shorts", "live", "embed"].includes(parts[0]) ? parts[1] : "");
    if (["youtu.be", "youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host) && /^[\w-]{11}$/.test(id || "")) return { kind: "embed", url: `https://www.youtube-nocookie.com/embed/${id}` };
    if (["vimeo.com", "player.vimeo.com"].includes(host)) {
      const id = parts.find(part => /^\d+$/.test(part));
      if (id) return { kind: "embed", url: `https://player.vimeo.com/video/${id}` };
    }
    if (host === "drive.google.com") {
      const id = parts.includes("d") ? parts[parts.indexOf("d") + 1] : parsed.searchParams.get("id");
      if (id && /^[\w-]+$/.test(id)) return { kind: "embed", url: `https://drive.google.com/file/d/${id}/preview` };
    }
    if (host === "streamable.com") {
      const id = parts[0] === "e" ? parts[1] : parts[0];
      if (id && /^[\w-]+$/.test(id)) return { kind: "embed", url: `https://streamable.com/e/${id}` };
    }
  } catch {}
  return { kind: "link", url };
}
export function VideoPlayer({url, title, language}: {url: string; title: string; language: Language}) {
  const [active, setActive] = useState(false);
  const source = videoSource(url);
  const pt = language === "pt";
  useEffect(() => setActive(false), [url]);
  if (!source.url) return <p>{pt ? "Vídeo indisponível" : "Video unavailable"}</p>;
  if (source.kind === "link") return <a className="mediaLink" href={source.url} target="_blank" rel="noreferrer">{pt ? "Abrir vídeo ↗" : "Open video ↗"}</a>;
  return <div className="videoPlayer">
    {!active ? <button type="button" className="videoFacade" onClick={() => setActive(true)} aria-label={`${pt ? "Carregar vídeo" : "Load video"}: ${title}`}><span aria-hidden="true">▶</span><strong>{title}</strong><small>{pt ? "Toque para carregar o vídeo" : "Tap to load video"}</small></button>
      : source.kind === "file" ? <video src={source.url} controls playsInline preload="none" aria-label={title} />
      : <iframe src={source.url} title={title} allow="fullscreen; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />}
    {active && <a className="videoFallback" href={safeMediaUrl(url)} target="_blank" rel="noreferrer">{pt ? "Abrir original ↗" : "Open original ↗"}</a>}
  </div>;
}
export function ImageViewer({src, alt, className, language}: {src: string; alt: string; className: string; language: Language}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => setFailed(false), [src]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  const url = safeMediaUrl(src), pt = language === "pt";
  if (!url || failed) return <div className="mediaEmpty">{pt ? "Imagem indisponível" : "Image unavailable"}</div>;
  return <>
    <button type="button" className="imageTrigger" aria-label={`${pt ? "Ampliar" : "Enlarge"}: ${alt}`} onClick={() => { dialog.current?.showModal(); setOpen(true); }}>
      <img src={url} alt={alt} className={className} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      <span className="zoomHint" aria-hidden="true">↗</span>
    </button>
    <dialog ref={dialog} className="imageDialog" aria-label={alt} onClose={() => setOpen(false)} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <button autoFocus type="button" className="dialogClose" onClick={() => dialog.current?.close()}>{pt ? "Fechar" : "Close"} ×</button>
      {open && <img src={url} alt={alt} />}
      <p>{alt}</p>
    </dialog>
  </>;
}
