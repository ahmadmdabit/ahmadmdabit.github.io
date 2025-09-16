import { memo } from "react";
import { useTranslation } from "react-i18next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { Education } from "@/types/Resume.types";

interface EducationSectionProps {
  education: Education[];
}

export const EducationSection: React.FC<EducationSectionProps> = memo(({ education }) => {
  const { t } = useTranslation();
  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        {t('ui.headings.education')}
      </Typography>
      {education.map((edu, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Typography variant="h6">{edu.degree}</Typography>
          <Typography variant="subtitle1">{edu.institution}</Typography>
          <Typography variant="subtitle2" color="text.secondary">{edu.duration}</Typography>
        </Box>
      ))}
    </Box>
  );
});
