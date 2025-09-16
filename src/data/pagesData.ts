import { type Pages } from "@/types/Pages.types";
import type { TFunction } from "i18next";

export const getPagesData = (t: TFunction): Pages => ({
  about: getPageData('about', t),
  experience: getPageData('experience', t),
  projects: getPageData('projects', t),
  skills: getPageData('skills', t),
  education: getPageData('education', t),
  certifications: getPageData('certifications', t),
  languages: getPageData('languages', t),
  contact: getPageData('contact', t),
});

export const getPageData = (page: keyof Pages, t: TFunction): string => {
  switch (page) {
    case "about": return t('ui.pages.about');
    case "experience": return t('ui.pages.experience');
    case "projects": return t('ui.pages.projects');
    case "skills": return t('ui.pages.skills');
    case "education": return t('ui.pages.education');
    case "certifications": return t('ui.pages.certifications');
    case "languages": return t('ui.pages.languages');
    case "contact": return t('ui.pages.contact');

    default: throw Error("Invalid page");
  }
}