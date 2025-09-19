import { createBrowserRouter } from "react-router";
import App from "@/App";
import { HomePage } from "@/pages/HomePage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { ErrorPage } from "@/pages/ErrorPage";
import { AboutSection } from "@/components/resume/sections/AboutSection";
import { SkillsSection } from "@/components/resume/sections/SkillsSection";
import { ExperienceSection } from "@/components/resume/sections/ExperienceSection";
import { ProjectsSection } from "@/components/resume/sections/ProjectsSection";
import { EducationSection } from "@/components/resume/sections/EducationSection";
import { CertificationsSection } from "@/components/resume/sections/CertificationsSection";
import { LanguagesSection } from "@/components/resume/sections/LanguagesSection";
import { ContactSection } from "@/components/resume/sections/ContactSection";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "",
        element: <HomePage />,
        children: [
          {
            index: true,
            element: <AboutSection />,
          },
          {
            path: "skills",
            element: <SkillsSection />,
          },
          {
            path: "experience",
            element: <ExperienceSection />,
          },
          {
            path: "projects",
            element: <ProjectsSection />,
          },
          {
            path: "education",
            element: <EducationSection />,
          },
          {
            path: "certifications",
            element: <CertificationsSection />,
          },
          {
            path: "languages",
            element: <LanguagesSection />,
          },
          {
            path: "contact",
            element: <ContactSection />,
            children: [
              {
                path: "",
                element: <PrivacyPage isPlainText={true}  />,
              },
            ],
          },
        ],
      },
      {
        path: "privacy",
        element: <PrivacyPage isPlainText={false} />,
      },
    ],
  },
]);

export default router;
