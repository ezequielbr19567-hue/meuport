import { cookies } from "next/headers";

const SESSION_COOKIE = "portfolio_admin";

export function getConfiguredPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  const session = store.get(SESSION_COOKIE)?.value;
  return Boolean(session && session === getConfiguredPassword() && getConfiguredPassword());
}

export async function setAdminSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, getConfiguredPassword(), {
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
