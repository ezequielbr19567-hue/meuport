import { NextResponse } from "next/server";

export const MAX_UPLOAD_BODY_BYTES = 3 * 1024 * 1024 + 64 * 1024;
const MAX_LIMITER_ENTRIES = 5000;
type RateEntry = { count: number; resetAt: number };

// Best-effort per-instance throttling: serverless cold starts reset this Map and
// replicas do not share it. Add the host's WAF/distributed limits for sustained
// automated traffic. This deliberately requires no new service to run the site.
export function createRateLimiter() {
  const entries = new Map<string, RateEntry>();
  return (key: string, limit: number, windowMs: number, now = Date.now()) => {
    let entry = entries.get(key);
    if (!entry || entry.resetAt <= now) {
      for (const [storedKey, stored] of entries) {
        if (stored.resetAt <= now) entries.delete(storedKey);
      }
      if (entries.size >= MAX_LIMITER_ENTRIES && !entries.has(key)) {
        return { allowed: false, retryAfter: Math.ceil(windowMs / 1000) };
      }
      entry = { count: 0, resetAt: now + windowMs };
      entries.set(key, entry);
    }
    entry.count += 1;
    return { allowed: entry.count <= limit, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  };
}

export function hasSameOrigin(request: Request) {
  if (["cross-site", "same-site"].includes(request.headers.get("sec-fetch-site") || "")) return false;
  const source = request.headers.get("origin") || request.headers.get("referer");
  if (!source) return false;
  try {
    const origin = new URL(source);
    const target = new URL(process.env.APP_ORIGIN || request.url);
    // A self-hosted reverse proxy must preserve Host, or set APP_ORIGIN to the
    // canonical public URL. Do not trust arbitrary X-Forwarded-Host from callers.
    const targetHost = process.env.APP_ORIGIN ? target.host : request.headers.get("host") || target.host;
    return ["http:", "https:"].includes(origin.protocol)
      && origin.host.toLowerCase() === targetHost.toLowerCase()
      && !origin.username && !origin.password
      && (target.protocol !== "https:" || origin.protocol === "https:");
  } catch { return false; }
}

export function getRateLimitIdentity(request: Request) {
  // Only trust forwarding headers when a known proxy supplies/overwrites them.
  // Self-hosts must do so before opting into TRUST_PROXY=true.
  if (process.env.VERCEL === "1" || process.env.TRUST_PROXY === "true") {
    return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 64) || "shared";
  }
  return "shared";
}

export function rejectCrossOrigin(request: Request) {
  return hasSameOrigin(request) ? null : NextResponse.json(
    { error: "Origem do envio não permitida." }, { status: 403, headers: { "Cache-Control": "no-store" } },
  );
}

function bodyError(message: string, status: number) {
  return { error: NextResponse.json({ error: message }, { status }) };
}

async function readBytes(request: Request, limit: number) {
  const length = Number(request.headers.get("content-length"));
  if (Number.isFinite(length) && length > limit) return bodyError("O envio excede o tamanho permitido.", 413);
  if (!request.body) return { bytes: new Uint8Array() };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        return bodyError("O envio excede o tamanho permitido.", 413);
      }
      chunks.push(value);
    }
  } catch { return bodyError("Não foi possível ler o envio.", 400); }
  finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return { bytes };
}

export async function readJsonBody(request: Request, limit = 16 * 1024) {
  const forbidden = rejectCrossOrigin(request);
  if (forbidden) return { error: forbidden };
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return bodyError("Envie os dados no formato JSON.", 415);
  }
  const result = await readBytes(request, limit);
  if ("error" in result) return result;
  try { return { data: JSON.parse(new TextDecoder().decode(result.bytes)) }; }
  catch { return bodyError("JSON inválido.", 400); }
}

export async function readFormBody(request: Request) {
  const forbidden = rejectCrossOrigin(request);
  if (forbidden) return { error: forbidden };
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data;")) return bodyError("Formulário inválido.", 415);
  const result = await readBytes(request, MAX_UPLOAD_BODY_BYTES);
  if ("error" in result) return result;
  try {
    const body = new Blob([result.bytes]);
    return { data: await new Response(body, { headers: { "Content-Type": contentType } }).formData() };
  } catch { return bodyError("Formulário inválido.", 400); }
}
