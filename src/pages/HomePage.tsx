import { memo, useCallback, useState } from "react";
import { useLocation, Outlet, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { keyframes } from "@emotion/react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import { type Pages } from "@/types/Pages.types";
import { ActivityBar } from "@/molecules/ActivityBar";
import { ChatPopup } from "@/molecules/ChatPopup";
import { StatusBar } from "@/molecules/StatusBar";
import { getPageData } from "@/data/pagesData";
import { buildFullMeta, routeKeyFromPath } from "@/seo/pageMeta";
import { JsonLd } from "@/seo/JsonLd";
import { isLocale } from "@/i18n/locales";

const draw = keyframes`
  100% {
    transform: rotate(360deg);
  }
`;

const AnimatedBorderBoxWrapper = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  margin: "auto",
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  boxShadow: "0 20px 35px rgba(0,0,0,0.6)",
  borderRadius: 9,
  overflow: "hidden",
  backgroundColor: `${theme.palette.secondary}`,
  zIndex: -1,
  "&::before": {
    position: "absolute",
    content: '""',
    backgroundImage: `conic-gradient(transparent 190deg, ${theme.palette.success.main} 360deg)`,
    width: "150%",
    height: "3%",
    left: "-25%",
    top: "50%",
    transformOrigin: "center center",
    animation: `${draw} 8000ms linear infinite`,
  },
  "&::after": {
    position: "absolute",
    display: "grid",
    content: '""',
    placeItems: "center",
    backgroundColor: `${theme.palette.secondary}`,
    color: theme.palette.success.main,
    borderRadius: "5px",
    width: "94%",
    height: "94%",
    left: "3%",
    top: "3%",
    animation: `${draw} 8000ms linear infinite`,
  },
}));

interface HomePageMetaDemoProps {
  pathname: string;
}
const HomePageMetaDemo: React.FC<HomePageMetaDemoProps> = memo(({ pathname }) => {
  const { t } = useTranslation();
  const { locale: localeParam } = useParams();
  const locale = isLocale(localeParam) ? localeParam : "en";
  const routeKey = routeKeyFromPath(pathname, locale);
  const meta = buildFullMeta(routeKey, locale, pathname, t);

  return (
    <>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={t("ui.meta.keywords")} />
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
      <JsonLd locale={locale} routeKey={routeKey} t={t} pathname={pathname} />
    </>
  );
});

export const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const contactInfo = t("resume.contactInfo", { returnObjects: true });

  const [chatOpen, setChatOpen] = useState(false);
  const pathname = location.pathname;
  const active = (pathname.split("/").filter(Boolean)[1] as keyof Pages) || "about";

  // The section (without locale prefix) drives the fade-slide animation.
  // Only the section triggers animation, NOT locale changes — so switching
  // languages doesn't replay the fade effect.
  const section = pathname.replace(/^\/(en|tr)\b/, "") || "/";

  const handleToggleChat = useCallback(() => {
    setChatOpen((prev) => !prev);
  }, []);

  return (
    <>
      <HomePageMetaDemo pathname={pathname} />
      <Container
        maxWidth={false}
        sx={{ flex: 1, display: "flex", flexDirection: "column", px: 0 }}
      >
        <ActivityBar
          onToggleChat={handleToggleChat}
          isChatOpen={chatOpen}
          language={i18n.language}
        />

        <Box sx={{ position: "relative", overflow: "hidden" }}>
          <StatusBar
            page={getPageData(active, t)}
            name={contactInfo.name}
            title={contactInfo.title}
          />

          <Paper
            sx={{
              flex: 1,
              backgroundColor: "black",
              color: "grey.200",
              borderRadius: "0 0 0.6rem 0.6rem",
              borderStyle: "solid",
              borderWidth: "0 0.13rem 0.13rem 0.13rem",
              borderColor: "success.main",
              overflowY: "auto",
              fontFamily: "SF Mono, Consolas, monospace",
              fontSize: 14,
              mb: 0.2,
              mx: 0.2,
              minHeight: "calc(100vh - 220px)",
              height: "calc(100vh - 220px)",
              maxHeight: "calc(100vh - 220px)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              key={section}
              sx={{
                p: 2,
                flex: 1,
                animation: "pageFadeSlideIn 0.35s ease",
                "@keyframes pageFadeSlideIn": {
                  from: { opacity: 0, transform: "translateY(6px)" },
                  to: { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              <Outlet />
            </Box>
          </Paper>

          <AnimatedBorderBoxWrapper />
        </Box>
      </Container>
      <ChatPopup
        open={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </>
  );
};
