"use client";
import { useEffect, useRef, useState } from "react";
import type { Language } from "@/config/portfolio";
import { safeMediaUrl, videoSource } from "@/lib/urls";

export { safeMediaUrl, videoSource } from "@/lib/urls";

export function VideoPlayer({url, title, language}: {url: string; title: string; language: Language}) {
  const [active, setActive] = useState(false);
  const [failed, setFailed] = useState(false);
  const source = videoSource(url);
  const pt = language === "pt";
  useEffect(() => { setActive(false); setFailed(false); }, [url]);
  if (!source.url) return <p>{pt ? "Vídeo indisponível" : "Video unavailable"}</p>;
  if (source.kind === "link") return <a className="mediaLink" href={source.url} target="_blank" rel="noopener noreferrer">{pt ? "Abrir vídeo ↗" : "Open video ↗"}</a>;
  return <div className="videoPlayer">
    {!active ? <button type="button" className="videoFacade" onClick={() => setActive(true)} aria-label={`${pt ? "Carregar vídeo" : "Load video"}: ${title}`}><span aria-hidden="true">▶</span><strong>{title}</strong><small>{pt ? "Toque para carregar o vídeo" : "Tap to load video"}</small></button>
      : failed ? <p role="status">{pt ? "Não foi possível carregar este vídeo. Abra o original abaixo." : "This video could not load. Open the original below."}</p>
      : source.kind === "file" ? <video src={source.url} controls playsInline preload="metadata" aria-label={title} onError={() => setFailed(true)} />
      : <iframe src={source.url} title={title} allow="fullscreen; encrypted-media; picture-in-picture" sandbox="allow-scripts allow-same-origin allow-presentation" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />}
    {active && <a className="videoFallback" href={safeMediaUrl(url)} target="_blank" rel="noopener noreferrer">{pt ? "Abrir original ↗" : "Open original ↗"}</a>}
  </div>;
}
export function ImageViewer({src, alt, className, language, eager = false}: {src: string; alt: string; className: string; language: Language; eager?: boolean}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    dialog.current?.close();
    setOpen(false);
    setFailed(false);
  }, [src]);
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
      <img src={url} alt={alt} className={className} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} decoding="async" onError={() => { dialog.current?.close(); setOpen(false); setFailed(true); }} />
      <span className="zoomHint" aria-hidden="true">↗</span>
    </button>
    <dialog ref={dialog} className="imageDialog" aria-label={alt} onClose={() => setOpen(false)} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }}>
      <button autoFocus type="button" className="dialogClose" onClick={() => dialog.current?.close()}>{pt ? "Fechar" : "Close"} ×</button>
      {open && <img src={url} alt={alt} />}
      <p>{alt}</p>
    </dialog>
  </>;
}
