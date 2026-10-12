import { isPortfolioContent } from "./contentValidation";
import type { PortfolioContent } from "@/config/portfolio";
export const CONTENT_CACHE_KEY = "portfolio-confirmed-content-v1";
export function readConfirmedContent(): PortfolioContent | null {
  try {
    const cached = JSON.parse(localStorage.getItem(CONTENT_CACHE_KEY) || "null");
    if (cached?.version === 1 && Number.isFinite(cached.savedAt) && cached.savedAt <= Date.now() && Date.now() - cached.savedAt < 7 * 86400000 && isPortfolioContent(cached.content)) return cached.content;
  } catch {}
  return null;
}
export function rememberContent(content: PortfolioContent) {
  try { localStorage.setItem(CONTENT_CACHE_KEY, JSON.stringify({version:1,savedAt:Date.now(),content})); } catch {}
}
export function forgetConfirmedContent() {
  try { localStorage.removeItem(CONTENT_CACHE_KEY); } catch {}
}
export async function requestContent(signal: AbortSignal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal.aborted) abort();
  signal.addEventListener("abort", abort, {once:true});
  const timer = setTimeout(abort, 12000);
  try {
    const response = await fetch("/api/content", {cache:"no-store", signal:controller.signal});
    if (!response.ok) throw new Error("Content unavailable");
    const body = await response.json();
    if (!["saved", "default"].includes(body.source) || !isPortfolioContent(body.content)) throw new Error("Invalid content response");
    return { content: body.content as PortfolioContent, source: body.source as "saved" | "default" };
  } finally { clearTimeout(timer); signal.removeEventListener("abort", abort); }
}
