import type { PortfolioContent } from "@/config/portfolio";
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const localized = (v: unknown) => typeof v === "string" || (record(v) && typeof v.en === "string" && typeof v.pt === "string");
const optionalText = (v: unknown) => v === undefined || localized(v);
const optionalUrl = (v: unknown) => v === undefined || typeof v === "string";
export function isPortfolioContent(v: unknown): v is PortfolioContent {
  if (!record(v) || !record(v.owner) || !record(v.links)) return false;
  const owner = v.owner, links = v.links;
  if (!["displayName", "username"].every(k => typeof owner[k] === "string")) return false;
  if (!["status", "intro", "heroTitleTop", "heroTitleAccent", "heroTitleBottom", "builderPitch", "programmerPitch"].every(k => localized(owner[k]))) return false;
  if (!["roblox", "github", "discord", "email"].every(k => typeof links[k] === "string")) return false;
  const list = (key: string, check: (item: any) => boolean) => Array.isArray(v[key]) && v[key].every(check);
  const card = (c: unknown) => record(c) && localized(c.title) && localized(c.description) && Array.isArray(c.tags) && c.tags.every(localized) && [c.highlight,c.role,c.challenge,c.outcome].every(optionalText) && [c.image,c.video].every(optionalUrl);
  return list("builderSkills",localized) && list("programmerSkills",localized) && list("builderProjects",card) && list("programmerProjects",card)
    && list("prices", c => record(c) && localized(c.title) && localized(c.price) && localized(c.description) && optionalText(c.highlight) && Array.isArray(c.features) && c.features.every(localized))
    && list("media", c => record(c) && localized(c.title) && ["image","video"].includes(String(c.type)) && typeof c.url === "string" && optionalText(c.description))
    && list("games", c => record(c) && localized(c.label) && localized(c.role) && localized(c.contribution) && [c.url,c.image,c.universeId].every(optionalUrl) && (c.manualVisits === undefined || typeof c.manualVisits === "number"));
}
