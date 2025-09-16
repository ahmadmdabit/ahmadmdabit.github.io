import { useState, memo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { keyframes } from "@emotion/react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ActivityBar } from "@/molecules/ActivityBar";
import { ChatPopup } from "@/molecules/ChatPopup";
import { StatusBar } from "@/molecules/StatusBar";
import { getResumeData } from "@/data/resumeData";
import { getPageData, getPagesData } from "@/data/pagesData";
import { type Pages } from "@/types/Pages.types";
import { AboutSection } from "@/components/resume/sections/AboutSection";
import { SkillsSection } from "@/components/resume/sections/SkillsSection";
import { ExperienceSection } from "@/components/resume/sections/ExperienceSection";
import { ProjectsSection } from "@/components/resume/sections/ProjectsSection";
import { EducationSection } from "@/components/resume/sections/EducationSection";
import { CertificationsSection } from "@/components/resume/sections/CertificationsSection";
import { LanguagesSection } from "@/components/resume/sections/LanguagesSection";
import { ContactSection } from "@/components/resume/sections/ContactSection";

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
    backgroundImage: `conic-gradient(${theme.palette.success.main} 100deg, transparent 0deg)`,
    width: "150%",
    height: "10%",
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
  active: string;
}
const HomePageMetaDemo: React.FC<HomePageMetaDemoProps> = memo(({ active }) => {
  const { t } = useTranslation();
  let pageTitle = t("ui.meta.title");
  try {
    pageTitle += " - " + getPageData(active as keyof Pages, t);
  } catch (error) {
    console.warn(error);
  }

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={t("ui.meta.description")} />
      <meta name="keywords" content={t("ui.meta.keywords")} />
      <meta name="author" content={t("ui.meta.author")} />
      <meta property="og:title" content={t("ui.meta.title")} />
      <meta property="og:description" content={t("ui.meta.description")} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://ahmadmdabit.github.io" />
      <meta property="og:image" content="https://ahmadmdabit.github.io/PersonalPhoto.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t("ui.meta.title")} />
      <meta name="twitter:description" content={t("ui.meta.description")} />
      <meta name="twitter:image" content="https://ahmadmdabit.github.io/PersonalPhoto.png" />
    </>
  );
});

export const HomePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const resumeData = getResumeData(t);
  const pagesData = getPagesData(t);
  const [active, setActive] = useState<keyof Pages>("about");
  const [chatOpen, setChatOpen] = useState(false);

  const handleToggleChat = useCallback(() => {
    setChatOpen((prev) => !prev);
  }, []);

  const renderActiveSection = useCallback(() => {
    switch (active) {
      case "about":
        return <AboutSection summary={resumeData.summary} />;
      case "skills":
        return <SkillsSection skills={resumeData.skills} />;
      case "experience":
        return <ExperienceSection experience={resumeData.experience} />;
      case "projects":
        return <ProjectsSection projects={resumeData.projects} />;
      case "education":
        return <EducationSection education={resumeData.education} />;
      case "certifications":
        return <CertificationsSection certifications={resumeData.certifications} />;
      case "languages":
        return <LanguagesSection languages={resumeData.languages} />;
      case "contact":
        return <ContactSection contact={resumeData.contactInfo} />;
        // case "reference":
        //   return <ReferenceSection reference={resumeData.reference} />;
        // _
      default:
        return null;
    }
  }, [active, resumeData]);

  return (
    <>
      <HomePageMetaDemo active={active} />
      <Container maxWidth={false} sx={{ flex: 1, display: "flex", flexDirection: "column", px: 0 }}>
        <ActivityBar active={active} onNav={setActive} onToggleChat={handleToggleChat} isChatOpen={chatOpen} language={i18n.language} />

        <Box sx={{ position: "relative", overflow: "hidden" }}>
          <StatusBar page={pagesData[active]} name={resumeData.contactInfo.name} title={resumeData.contactInfo.title} />

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
              minHeight: "77.5vh",
              height: "77.5vh",
              maxHeight: "77.5vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box sx={{ p: 2, flex: 1 }}>{renderActiveSection()}</Box>
          </Paper>

          <AnimatedBorderBoxWrapper />
        </Box>

        <Typography variant="caption" color="grey.400" align="center" paddingTop={1}>
          All Rights Reserved &copy; 2025
        </Typography>
      </Container>
      <ChatPopup open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};
