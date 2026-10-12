import type { PortfolioContent } from "@/config/portfolio";
import { safeEmailHref, safeExternalUrl, safeMediaUrl } from "./urls";

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const text = (value: unknown, max = 10000): value is string => typeof value === "string" && value.length <= max;
const localized = (value: unknown): boolean => text(value) || (record(value) && text(value.en) && text(value.pt));
const optionalText = (value: unknown): boolean => value === undefined || localized(value);
const mediaUrl = (value: unknown): boolean => value === "" || !!safeMediaUrl(value);
const optionalMediaUrl = (value: unknown): boolean => value === undefined || mediaUrl(value);
const link = (value: unknown): boolean => value === "" || value === "#" || !!safeExternalUrl(value);
const optionalLink = (value: unknown): boolean => value === undefined || link(value);
const list = (value: unknown, check: (item: unknown) => boolean, max = 200): boolean => Array.isArray(value) && value.length <= max && value.every(check);

export function isPortfolioContent(value: unknown): value is PortfolioContent {
  if (!record(value) || !record(value.owner) || !record(value.links)) return false;
  const { owner, links } = value;
  if (!["displayName", "username"].every(key => text(owner[key], 256))) return false;
  if (!["status", "intro", "heroTitleTop", "heroTitleAccent", "heroTitleBottom", "builderPitch", "programmerPitch"].every(key => localized(owner[key]))) return false;
  if (!["roblox", "github", "discord"].every(key => link(links[key]))) return false;
  if (links.email !== "" && !safeEmailHref(links.email)) return false;

  const card = (item: unknown): boolean => record(item) && localized(item.title) && localized(item.description)
    && list(item.tags, localized, 50) && [item.highlight, item.role, item.challenge, item.outcome].every(optionalText)
    && [item.image, item.video].every(optionalMediaUrl);

  return list(value.builderSkills, localized) && list(value.programmerSkills, localized)
    && list(value.builderProjects, card) && list(value.programmerProjects, card)
    && list(value.prices, item => record(item) && localized(item.title) && localized(item.price)
      && localized(item.description) && optionalText(item.highlight) && list(item.features, localized, 50))
    && list(value.media, item => record(item) && localized(item.title) && (item.type === "image" || item.type === "video")
      && mediaUrl(item.url) && optionalText(item.description))
    && list(value.games, item => record(item) && localized(item.label) && localized(item.role) && localized(item.contribution)
      && optionalLink(item.url) && optionalMediaUrl(item.image)
      && (item.universeId === undefined || item.universeId === "" || (typeof item.universeId === "string" && /^\d{1,20}$/.test(item.universeId)))
      && (item.manualVisits === undefined || (typeof item.manualVisits === "number" && Number.isSafeInteger(item.manualVisits) && item.manualVisits >= 0)));
}
