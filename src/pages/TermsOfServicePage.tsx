import { memo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { useTranslation } from "react-i18next";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import { useParams } from "react-router";
import { isLocale } from "@/i18n/locales";
import { buildFullMeta } from "@/seo/pageMeta";
import { JsonLd } from "@/seo/JsonLd";

export const TermsOfServicePage: React.FC = memo(() => {
  const { t } = useTranslation();
  const { locale: localeParam } = useParams();
  const locale = isLocale(localeParam) ? localeParam : "en";
  const meta = buildFullMeta("terms", locale, `/${locale}/terms`, t);
  const sections = t("terms.sections", { returnObjects: true }) as Array<{ title: string; content: string }>;

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
        routeKey="terms"
        t={t}
        pathname={`/${locale}/terms`}
      />
      <Container
        maxWidth={false}
        sx={{ flex: 1, display: "flex", flexDirection: "column", px: 0, mt: 3 }}
      >
        <Box sx={{ position: "relative" }}>
          <Paper
            sx={{
              flex: 1,
              backgroundColor: "black",
              color: "grey.200",
              borderRadius: "0.6rem",
              borderStyle: "solid",
              borderWidth: "0.13rem",
              borderColor: "success.main",
              height: "calc(100vh - 67px)",
              maxHeight: "calc(100vh - 67px)",
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
              <Typography
                variant="h5"
                pt={1}
                pb={2}
              >
                {t("terms.title")}
              </Typography>
              <Chip
                title={t("terms.updateDateIso8601")}
                label={`${t("terms.updateDate")}: ${t("terms.updateDateLongForm")}`}
                sx={{ mb: 2 }}
              />
              {sections.map((section, idx) => (
                <Box
                  key={idx}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h6">{section.title}</Typography>
                  <Typography
                    variant="body1"
                    pt={1}
                    pb={1}
                  >
                    {section.content}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
});
