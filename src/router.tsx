import { createBrowserRouter, redirect, type LoaderFunctionArgs } from "react-router";
import App from "@/App";
import { HomePage } from "@/pages/HomePage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { TermsOfServicePage } from "@/pages/TermsOfServicePage";
import { ErrorPage } from "@/pages/ErrorPage";
import { AboutSection } from "@/components/resume/sections/AboutSection";
import { SkillsSection } from "@/components/resume/sections/SkillsSection";
import { ExperienceSection } from "@/components/resume/sections/ExperienceSection";
import { ProjectsSection } from "@/components/resume/sections/ProjectsSection";
import { EducationSection } from "@/components/resume/sections/EducationSection";
import { CertificationsSection } from "@/components/resume/sections/CertificationsSection";
import { LanguagesSection } from "@/components/resume/sections/LanguagesSection";
import { ContactSection } from "@/components/resume/sections/ContactSection";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locales";

function validateLocale({ params }: LoaderFunctionArgs) {
  if (!isLocale(params.locale)) {
    return redirect(`/${DEFAULT_LOCALE}`);
  }
  return null;
}

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    children: [
      // Redirect root to default locale
      {
        index: true,
        loader: () => redirect(`/${DEFAULT_LOCALE}`),
      },
      // Locale-prefixed routes
      {
        path: "/:locale",
        element: <App />,
        loader: validateLocale,
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
              },
            ],
          },
          {
            path: "privacy",
            element: <PrivacyPage />,
          },
          {
            path: "terms",
            element: <TermsOfServicePage />,
          },
        ],
      },
    ],
  },
]);

export default router;
