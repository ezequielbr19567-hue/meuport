import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter, getRateLimitIdentity, hasSameOrigin, MAX_UPLOAD_BODY_BYTES } from "@/lib/security";

const consume = createRateLimiter();
const mutationPaths = new Set([
  "/api/admin/login", "/api/admin/logout", "/api/admin/content",
  "/api/admin/stats", "/api/admin/upload", "/api/admin/reviews",
  "/api/reviews", "/api/visit",
]);

export function middleware(request: NextRequest) {
  let path = request.nextUrl.pathname;
  try { path = decodeURIComponent(path).replace(/\/+$/, ""); } catch { /* Invalid URLs stay unmatched. */ }
  const mutation = !["GET", "HEAD", "OPTIONS"].includes(request.method);
  let response = NextResponse.next();

  if (mutation && path.startsWith("/api/")) {
    if (!hasSameOrigin(request)) {
      response = NextResponse.json({ error: "Origem do envio não permitida." }, { status: 403 });
    } else {
      const upload = path === "/api/reviews" || path === "/api/admin/upload";
      const maxBytes = upload ? MAX_UPLOAD_BODY_BYTES : path === "/api/admin/content" ? 1024 * 1024 : 16 * 1024;
      const bytes = Number(request.headers.get("content-length"));
      if (Number.isFinite(bytes) && bytes > maxBytes) {
        response = NextResponse.json({ error: "O envio excede o tamanho permitido." }, { status: 413 });
      } else if (mutationPaths.has(path)) {
        const rule = path === "/api/admin/login" ? { limit: 8, window: 10 * 60_000 }
          : path === "/api/reviews" ? { limit: 5, window: 10 * 60_000 }
          : path === "/api/visit" ? { limit: 30, window: 60_000 }
          : { limit: 60, window: 60_000 };
        const attempt = consume(`${path}:${getRateLimitIdentity(request)}`, rule.limit, rule.window);
        if (!attempt.allowed) response = NextResponse.json(
          { error: "Muitas tentativas. Aguarde um pouco e tente novamente." },
          { status: 429, headers: { "Retry-After": String(attempt.retryAfter) } },
        );
      }
    }
  }

  if (path.startsWith("/api/admin/")) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("CDN-Cache-Control", "no-store");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  if (response.status >= 400) response.headers.set("Cache-Control", "no-store");
  return response;
}

export const config = { matcher: ["/api/:path*"] };
