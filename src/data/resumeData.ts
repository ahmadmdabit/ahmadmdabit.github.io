import type { ResumeData } from "@/types/Resume.types";
import type { TFunction } from "i18next";

export const getResumeData = (t: TFunction): ResumeData => ({
  contactInfo: t('resume.contactInfo', { returnObjects: true }),
  summary: {
    main: t('resume.summary.main'),
    highlights: t('resume.summary.highlights', { returnObjects: true }),
  },
  skills: t('resume.skills', { returnObjects: true }),
  experience: t('resume.experience', { returnObjects: true }),
  projects: t('resume.projects', { returnObjects: true }),
  education: t('resume.education', { returnObjects: true }),
  certifications: t('resume.certifications', { returnObjects: true }),
  languages: t('resume.languages', { returnObjects: true }),
  reference: t('resume.reference', { returnObjects: true }),
});
