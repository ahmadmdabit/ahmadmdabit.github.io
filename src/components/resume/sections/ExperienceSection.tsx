import { memo } from "react";
import { useTranslation } from "react-i18next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { Experience } from "@/types/Resume.types";
import { ExperienceItem } from "@/components/resume/items/ExperienceItem";

interface ExperienceSectionProps {
  experience: Experience[];
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = memo(({ experience }) => {
  const { t } = useTranslation();
  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        {t('ui.headings.professionalExperience')}
      </Typography>
      {experience.map((item, index) => (
        <ExperienceItem item={item} key={index} />
      ))}
    </Box>
  );
});
