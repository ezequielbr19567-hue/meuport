import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "portfolio_admin";
const SESSION_SECONDS = 60 * 60 * 12;

export function getConfiguredPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function sign(payload: string, password: string) {
  return createHmac("sha256", password).update(`portfolio-admin:v2:${payload}`).digest("base64url");
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
  return verifySessionToken(session, password);
}

export async function setAdminSession() {
  const password = getConfiguredPassword();
  if (!password) return;

  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(password), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function passwordMatches(candidate: string, configured: string) {
  // Hash both values first so comparison time does not reveal password length.
  return !!configured && timingSafeEqual(
    createHash("sha256").update(candidate).digest(),
    createHash("sha256").update(configured).digest(),
  );
}

export function createSessionToken(password: string, now = Date.now()) {
  const issued = Math.floor(now / 1000);
  const payload = `${issued}.${issued + SESSION_SECONDS}.${randomBytes(24).toString("base64url")}`;
  return `${payload}.${sign(payload, password)}`;
}

export function verifySessionToken(token: string, password: string, now = Date.now()) {
  if (!password || token.length > 256) return false;
  const parts = token.split(".");
  if (parts.length !== 4 || !/^\d+$/.test(parts[0]) || !/^\d+$/.test(parts[1]) || !/^[\w-]{32}$/.test(parts[2])) return false;
  const issued = Number(parts[0]);
  const expires = Number(parts[1]);
  const current = Math.floor(now / 1000);
  if (!Number.isSafeInteger(issued) || !Number.isSafeInteger(expires)
    || issued > current + 30 || expires <= current || expires - issued !== SESSION_SECONDS) return false;
  return safeEqual(parts[3], sign(parts.slice(0, 3).join("."), password));
}
