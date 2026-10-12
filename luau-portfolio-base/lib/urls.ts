// These helpers are for browser links/media, never for authorizing server-side fetches.
const LOCAL_ORIGIN = "https://portfolio.invalid";
const MAX_URL_LENGTH = 4096;
const unsafeCharacters = /[\s\u0000-\u001f\u007f-\u009f\\]/u;
const encodedControls = /%(?:0[0-9a-f]|1[0-9a-f]|7f|5c)/i;

function cleanUrlInput(raw: unknown): raw is string {
  return typeof raw === "string" && raw.length > 0 && raw.length <= MAX_URL_LENGTH
    && !unsafeCharacters.test(raw) && !encodedControls.test(raw);
}

/** Explicit HTTP(S) links only. Invalid input must not reach an href attribute. */
export function safeExternalUrl(raw: unknown): string {
  if (!cleanUrlInput(raw) || !/^https?:\/\/[^/]/i.test(raw)) return "";
  try {
    const parsed = new URL(raw);
    if (!["https:", "http:"].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) return "";
    return parsed.href;
  } catch {
    return "";
  }
}

/** Media may also reference files under the current site, such as /projects/map.webp. */
export function safeMediaUrl(raw: unknown): string {
  if (!cleanUrlInput(raw)) return "";
  if (raw.startsWith("/") && !raw.startsWith("//")) {
    try {
      const parsed = new URL(raw, LOCAL_ORIGIN);
      return parsed.origin === LOCAL_ORIGIN && !parsed.pathname.startsWith("//")
        ? `${parsed.pathname}${parsed.search}${parsed.hash}` : "";
    } catch {
      return "";
    }
  }
  return safeExternalUrl(raw);
}

/** Accept a single address, with or without mailto:, without injected mail headers. */
export function safeEmailHref(raw: unknown): string {
  if (!cleanUrlInput(raw)) return "";
  const address = raw.replace(/^mailto:/i, "");
  if (address.length > 254) return "";
  const match = /^([a-z0-9._+-]+)@([a-z0-9.-]+\.[a-z0-9-]+)$/i.exec(address);
  if (!match || match[1].length > 64 || match[1].startsWith(".") || match[1].endsWith(".") || match[1].includes("..")) return "";
  if (match[2].split(".").some(label => !label || label.length > 63 || label.startsWith("-") || label.endsWith("-"))) return "";
  return `mailto:${address}`;
}

export type VideoSource = { kind: "file" | "embed" | "link"; url: string };

export function videoSource(raw: unknown): VideoSource {
  const url = safeMediaUrl(raw);
  if (!url) return { kind: "link", url: "" };
  const parsed = new URL(url, LOCAL_ORIGIN);
  if (/\.(mp4|webm|ogg|ogv)$/i.test(parsed.pathname)) return { kind: "file", url };
  const host = parsed.hostname.replace(/^www\./, "");
  const parts = parsed.pathname.split("/").filter(Boolean);
  const youtubeId = host === "youtu.be" ? parts[0]
    : parsed.searchParams.get("v") || (["shorts", "live", "embed"].includes(parts[0]) ? parts[1] : "");
  if (["youtu.be", "youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host) && /^[\w-]{11}$/.test(youtubeId || "")) {
    return { kind: "embed", url: `https://www.youtube-nocookie.com/embed/${youtubeId}` };
  }
  if (["vimeo.com", "player.vimeo.com"].includes(host)) {
    const id = parts[0] === "video" ? parts[1] : parts[0];
    if (/^\d{1,20}$/.test(id || "")) {
      const hash = parsed.searchParams.get("h") || (host === "vimeo.com" ? parts[1] : "");
      const query = hash && /^[a-z0-9]+$/i.test(hash) ? `?h=${hash}` : "";
      return { kind: "embed", url: `https://player.vimeo.com/video/${id}${query}` };
    }
  }
  if (host === "drive.google.com") {
    const id = parts.includes("d") ? parts[parts.indexOf("d") + 1] : parsed.searchParams.get("id");
    if (id && /^[\w-]+$/.test(id)) return { kind: "embed", url: `https://drive.google.com/file/d/${id}/preview` };
  }
  if (host === "streamable.com") {
    const id = parts[0] === "e" ? parts[1] : parts[0];
    if (id && /^[\w-]+$/.test(id)) return { kind: "embed", url: `https://streamable.com/e/${id}` };
  }
  return { kind: "link", url };
}
