import React, { memo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import Chip from "@mui/material/Chip";
import { BoldedText } from "@/atoms/BoldedText";
import Link from "@mui/material/Link";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import { useParams, useLocation } from "react-router";
import { isLocale } from "@/i18n/locales";
import { buildFullMeta } from "@/seo/pageMeta";
import { JsonLd } from "@/seo/JsonLd";

interface ContentRendererProps {
  content: string;
  replacements: Record<string, string>;
}

const replacePlaceholders = (text: string, replacements: Record<string, string>) => {
  const placeholders = Object.keys(replacements);
  if (placeholders.length === 0) return text;
  const regex = new RegExp(`(${placeholders.map((ph) => ph.replace(/[[\\]]/g, "\\$&")).join("|")})`, "g");
  return text.replace(regex, (match) => replacements[match] ?? match);
};

const ContentRenderer: React.FC<ContentRendererProps> = memo(({ content, replacements }) => {
  const replacedContent = replacePlaceholders(content, replacements);
  const lines = replacedContent.split("\n");

  return (
    <>
      {lines.map((line, lineIndex) => {
        const parts = line.split(/(\[.*?\]\(.*?\))/g);

        return (
          <React.Fragment key={lineIndex}>
            {parts.map((part, i) => {
              const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
              if (match) {
                const [, text, url] = match;
                return (
                  <Link key={i} href={url} target="_blank" underline="none" rel="noopener noreferrer">
                    {text}
                  </Link>
                );
              } else {
                const boldParts = part.split(/\*\*/);
                return boldParts.map((boldPart, j) => (j % 2 === 1 ? <BoldedText key={j} text={boldPart} /> : <React.Fragment key={j}>{boldPart}</React.Fragment>));
              }
            })}
            {lineIndex < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </>
  );
});

interface PrivacyPageProps {
  isPlainText: boolean;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = memo(({ isPlainText }) => {
  const { t } = useTranslation();
  const { locale: localeParam } = useParams();
  const { pathname: currentPath } = useLocation();
  const locale = isLocale(localeParam) ? localeParam : "en";
  const pathname = currentPath || `/${locale}/privacy`;
  const meta = buildFullMeta("privacy", locale, pathname, t);
  const sections = t("privacy.sections", { returnObjects: true });
  const address = t("resume.contactInfo.address").split(" ");
  const replacements = {
    "[Your Name / Company Name]": t("resume.contactInfo.name"),
    "[Adınız / Şirket Adınız]": t("resume.contactInfo.name"),
    "[Your Country]": address[address.length - 1],
    "[Ülkeniz]": address[address.length - 1],
    "[Your Contact Email]": t("resume.contactInfo.email"),
    "[İletişim E-postanız]": t("resume.contactInfo.email"),
    "[Your Address]": t("resume.contactInfo.address"),
    "[Adresiniz]": t("resume.contactInfo.address"),
  };

  return (
    <>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="author" content={t("ui.meta.author")} />
      <link rel="canonical" href={meta.canonical} />
      {meta.hreflang.map((h) => (
        <link key={h.lang} rel="alternate" hrefLang={h.lang} href={h.href} />
      ))}
      <meta property="og:title" content={meta.og.title} />
      <meta property="og:description" content={meta.og.description} />
      <meta property="og:type" content={meta.og.type} />
      <meta property="og:url" content={meta.og.url} />
      <meta property="og:image" content={meta.og.image} />
      <meta name="twitter:card" content={meta.twitter.card} />
      <meta name="twitter:title" content={meta.twitter.title} />
      <meta name="twitter:description" content={meta.twitter.description} />
      <meta name="twitter:image" content={meta.twitter.image} />
      <JsonLd locale={locale} routeKey="privacy" t={t} pathname={pathname} />
      <Container maxWidth={false} sx={{ flex: 1, display: "flex", flexDirection: "column", px: 0, my: 3 }}>
        <Box sx={{ position: "relative", overflow: "hidden" }}>
          <Paper
            sx={{
              flex: 1,
              backgroundColor: "black",
              color: "grey.200",
              borderRadius: "0.6rem",
              borderStyle: "solid",
              borderWidth: "0.13rem",
              borderColor: "success.main",
              overflowY: "auto",
              fontFamily: "SF Mono, Consolas, monospace",
              fontSize: 14,
              mb: 0.2,
              mx: 0.2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ p: 2, flex: 1 }}>
              <Typography variant="h5" pt={1} pb={2}>
                {t("privacy.title")}
              </Typography>
              <Chip label={`${t("privacy.updateDate")}: 17-09-2025`} sx={{ mb: 2 }} />
              {sections.map((section, k1) => (
                <Box key={k1}>
                  <Typography variant="h6">{section.title}</Typography>
                  <Typography variant="body1" pt={1} pb={2}>
                    {<ContentRenderer content={section.content} replacements={replacements} />}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>

        {!isPlainText && (
          <Typography variant="caption" color="grey.400" align="center" paddingTop={1}>
            {t("ui.meta.allRightsReserved")} {new Date().getFullYear()}
          </Typography>
        )}
      </Container>
    </>
  );
});
