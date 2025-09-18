import { memo } from "react";
import { useTranslation } from "react-i18next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { ExperienceItem } from "@/components/resume/items/ExperienceItem";

export const ExperienceSection: React.FC = memo(() => {
  const { t } = useTranslation();
  const experience = t('resume.experience', { returnObjects: true });

  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        {t("ui.headings.professionalExperience")}
      </Typography>
      {experience.map((item, index) => (
        <ExperienceItem item={item} key={index} />
      ))}
    </Box>
  );
});
