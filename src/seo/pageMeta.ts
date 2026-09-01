import type { TFunction } from "i18next";
import { SUPPORTED_LOCALES, type Locale } from "@/i18n/locales";
import type { LooseT } from "@/seo/types";
import { SITE_URL, getOgImage } from "@/seo/constants";

export type RouteKey =
  | "index"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "certifications"
  | "languages"
  | "contact"
  | "privacy";

interface RouteMetaConfig {
  titleKey: string;
  descriptionKey: string;
  ogType: "website";
}

export const PAGE_META: Record<RouteKey, RouteMetaConfig> = {
  index: {
    titleKey: "ui.meta.title",
    descriptionKey: "ui.meta.description",
    ogType: "website",
  },
  skills: {
    titleKey: "ui.pages.skills",
    descriptionKey: "ui.meta.description",
    ogType: "website",
  },
  experience: {
    titleKey: "ui.pages.experience",
    descriptionKey: "ui.meta.description",
    ogType: "website",
  },
  projects: {
    titleKey: "ui.pages.projects",
    descriptionKey: "ui.meta.description",
    ogType: "website",
  },
  education: {
    titleKey: "ui.pages.education",
    descriptionKey: "ui.meta.description",
    ogType: "website",
  },
  certifications: {
    titleKey: "ui.pages.certifications",
    descriptionKey: "ui.meta.description",
    ogType: "website",
  },
  languages: {
    titleKey: "ui.pages.languages",
    descriptionKey: "ui.meta.description",
    ogType: "website",
  },
  contact: {
    titleKey: "ui.pages.contact",
    descriptionKey: "ui.meta.description",
    ogType: "website",
  },
  privacy: {
    titleKey: "ui.pages.privacy",
    descriptionKey: "ui.meta.description",
    ogType: "website",
  },
};

export function titleSuffix(t: TFunction): string {
  const looseT = t as unknown as LooseT;
  const authorName = looseT("ui.meta.author");
  return authorName ? ` — ${authorName}` : "";
}

export function buildTitle(routeKey: RouteKey, t: TFunction): string {
  const looseT = t as unknown as LooseT;
  const sectionTitle = looseT(PAGE_META[routeKey].titleKey);
  return `${sectionTitle}${titleSuffix(t)}`;
}

export function buildFullMeta(
  routeKey: RouteKey,
  locale: string,
  pathname: string,
  t: TFunction
): {
  title: string;
  description: string;
  canonical: string;
  og: { title: string; description: string; type: string; url: string; image: string };
  twitter: { card: string; title: string; description: string; image: string };
  hreflang: Array<{ lang: string; href: string }>;
  breadcrumb: Array<{ name: string; href: string }>;
} {
  const looseT = t as unknown as LooseT;
  const title = buildTitle(routeKey, t);
  const description = looseT(PAGE_META[routeKey].descriptionKey);
  const canonical = `${SITE_URL}${pathname}`;
  const ogImage = getOgImage();

  const hreflang: Array<{ lang: string; href: string }> = SUPPORTED_LOCALES.map((lng) => ({
    lang: lng,
    href: `${SITE_URL}/${lng}${pathname.replace(`/${locale}`, "") || "/"}`,
  }));
  hreflang.push({
    lang: "x-default",
    href: `${SITE_URL}${pathname.replace(`/${locale}`, "") || "/"}`,
  });

  const breadcrumb: Array<{ name: string; href: string }> = [
    { name: looseT("ui.meta.title"), href: `${SITE_URL}/${locale}/` },
  ];
  if (routeKey !== "index") {
    breadcrumb.push({ name: looseT(`ui.pages.${routeKey}`), href: canonical });
  }

  return {
    title,
    description,
    canonical,
    og: {
      title,
      description,
      type: PAGE_META[routeKey].ogType,
      url: canonical,
      image: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      image: ogImage,
    },
    hreflang,
    breadcrumb,
  };
}

export function routeKeyFromPath(pathname: string, locale: Locale): RouteKey {
  const segments: string[] = pathname.split("/").filter(Boolean);
  // Remove locale prefix
  if (segments[0] === locale) {
    segments.shift();
  }
  const key = segments[0] || "index";
  return PAGE_META[key as RouteKey] ? (key as RouteKey) : "index";
}
