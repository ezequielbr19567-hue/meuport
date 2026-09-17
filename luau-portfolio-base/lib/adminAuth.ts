import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "portfolio_admin";

export function getConfiguredPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function sessionToken(password: string) {
  return createHash("sha256").update(`portfolio-admin:${password}`).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function isAdminAuthenticated() {
  const password = getConfiguredPassword();
  if (!password) return false;

  const store = await cookies();
  const session = store.get(SESSION_COOKIE)?.value || "";
  return safeEqual(session, sessionToken(password));
}

export async function setAdminSession() {
  const password = getConfiguredPassword();
  if (!password) return;

  const store = await cookies();
  store.set(SESSION_COOKIE, sessionToken(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
