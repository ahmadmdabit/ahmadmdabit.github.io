export const SUPPORTED_LOCALES = ["en", "tr"] as const;
export const DEFAULT_LOCALE = "en" as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale);
}

export function extractLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean);
  return isLocale(segments[0]) ? segments[0] : DEFAULT_LOCALE;
}
