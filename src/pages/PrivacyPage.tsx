import { memo } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useLocation } from "react-router";
import { isLocale } from "@/i18n/locales";
import { buildFullMeta } from "@/seo/pageMeta";
import { JsonLd } from "@/seo/JsonLd";
import { PrivacyContent } from "@/pages/PrivacyContent";

export const PrivacyPage: React.FC = memo(() => {
  const { t } = useTranslation();
  const { locale: localeParam } = useParams();
  const { pathname: currentPath } = useLocation();
  const locale = isLocale(localeParam) ? localeParam : "en";
  const pathname = currentPath || `/${locale}/privacy`;
  const meta = buildFullMeta("privacy", locale, pathname, t);

  return (
    <>
      <title>{meta.title}</title>
      <meta
        name="description"
        content={meta.description}
      />
      <meta
        name="author"
        content={t("ui.meta.author")}
      />
      <link
        rel="canonical"
        href={meta.canonical}
      />
      {meta.hreflang.map((h) => (
        <link
          key={h.lang}
          rel="alternate"
          hrefLang={h.lang}
          href={h.href}
        />
      ))}
      <meta
        property="og:title"
        content={meta.og.title}
      />
      <meta
        property="og:description"
        content={meta.og.description}
      />
      <meta
        property="og:type"
        content={meta.og.type}
      />
      <meta
        property="og:url"
        content={meta.og.url}
      />
      <meta
        property="og:image"
        content={meta.og.image}
      />
      <meta
        name="twitter:card"
        content={meta.twitter.card}
      />
      <meta
        name="twitter:title"
        content={meta.twitter.title}
      />
      <meta
        name="twitter:description"
        content={meta.twitter.description}
      />
      <meta
        name="twitter:image"
        content={meta.twitter.image}
      />
      <JsonLd
        locale={locale}
        routeKey="privacy"
        t={t}
        pathname={pathname}
      />
      <PrivacyContent />
    </>
  );
});
