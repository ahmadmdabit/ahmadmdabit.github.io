import { useMemo } from "react";
import type { TFunction } from "i18next";
import type { Locale } from "@/i18n/locales";
import type { RouteKey } from "@/seo/pageMeta";
import type { LooseT } from "@/seo/types";
import { SITE_URL, getOgImage } from "@/seo/constants";

interface JsonLdProps {
  locale: Locale;
  routeKey: RouteKey;
  t: TFunction;
  pathname: string;
}

export function JsonLd({ locale, routeKey, t, pathname }: JsonLdProps) {
  const looseT = t as unknown as LooseT;
  const structuredData = useMemo(() => {
    const siteName = looseT("ui.meta.title");
    const authorName = looseT("ui.meta.author");
    const description = looseT("ui.meta.description");
    const canonical = `${SITE_URL}${pathname}`;
    const ogImage = getOgImage();

    const website = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: `${SITE_URL}/${locale}/`,
      description,
      inLanguage: locale,
    };

    const person = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: authorName,
      url: `${SITE_URL}/${locale}/`,
      image: ogImage,
      jobTitle: looseT("portfolio.role"),
      description,
    };

    const breadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: siteName,
          item: `${SITE_URL}/${locale}/`,
        },
        ...(routeKey !== "index"
          ? [
              {
                "@type": "ListItem",
                position: 2,
                name: looseT(`ui.pages.${routeKey}`),
                item: canonical,
              },
            ]
          : []),
      ],
    };

    return [website, person, breadcrumbList];
  }, [locale, routeKey, looseT, pathname]);

  return (
    <>
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data).replace(/<\/script>/g, "<\\/script>"),
          }}
        />
      ))}
    </>
  );
}
