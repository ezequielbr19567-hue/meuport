import type { NextConfig } from "next";

const production = process.env.NODE_ENV === "production";
// Static Next pages use inline hydration scripts. Keep their compatibility while
// restricting external scripts, frames, objects and form destinations. A nonce
// policy would require dynamic rendering and a fresh nonce on every response.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${production ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https: http:",
  "media-src 'self' blob: https: http:",
  "font-src 'self' data:",
  `connect-src 'self'${production ? "" : " ws: wss:"}`,
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com https://drive.google.com https://streamable.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(production ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "Content-Security-Policy", value: csp },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
      ...(production ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
    ] }];
  },
};

export default nextConfig;
