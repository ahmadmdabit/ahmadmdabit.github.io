import { memo } from "react";
import { useTranslation } from "react-i18next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

export const SkillsSection: React.FC = memo(() => {
  const { t } = useTranslation();
  const skills = t('resume.skills', { returnObjects: true });
  
  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        {t('ui.headings.technicalSkills')}
      </Typography>
      {skills.map((skillCategory, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {skillCategory.category}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {skillCategory.items.map((skill, skillIndex) => (
              <Chip label={skill} key={skillIndex} />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
});
