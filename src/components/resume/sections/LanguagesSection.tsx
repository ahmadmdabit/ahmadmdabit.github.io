import { memo } from "react";
import { useTranslation } from "react-i18next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export const LanguagesSection: React.FC = memo(() => {
  const { t } = useTranslation();
  const languages = t('resume.languages', { returnObjects: true });

  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        {t("ui.headings.languages")}
      </Typography>
      {languages.map((lang, index) => (
        <Typography variant="body1" key={index}>
          {lang.name} ({lang.proficiency})
        </Typography>
      ))}
    </Box>
  );
});
