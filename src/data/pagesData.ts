import { type Pages } from "@/types/Pages.types";
import type { TFunction } from "i18next";

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