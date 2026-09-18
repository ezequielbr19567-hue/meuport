import type { Language, LocalizedText } from "@/config/portfolio";

export function text(value: LocalizedText | null | undefined, language: Language) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  return value[language] || value.en || value.pt || "";
}

export function setText(
  value: LocalizedText | null | undefined,
  language: Language,
  next: string
): LocalizedText {
  const current = typeof value === "string"
    ? { en: value, pt: value }
    : { en: value?.en || "", pt: value?.pt || "" };

  return { ...current, [language]: next };
}

export function detectLanguage(saved: string | null, languages: readonly string[]): Language {
  if (saved === "pt" || saved === "en") return saved;
  for (const locale of languages) {
    const base = locale.toLowerCase().split(/[-_]/)[0];
    if (base === "pt" || base === "en") return base;
  }
  return "en";
}
