import { memo } from "react";
import { useTranslation } from "react-i18next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

export const SkillsSection: React.FC = memo(() => {
  const { t } = useTranslation();
  const skills = t("resume.skills", { returnObjects: true });

  return (
    <Box>
      <Typography
        variant="h4"
        component="h2"
        gutterBottom
      >
        {t("ui.headings.technicalSkills")}
      </Typography>
      {skills.map((skillCategory, index) => (
        <Box
          key={index}
          sx={{ mb: 2 }}
        >
          <Card
            sx={{
              mb: 3,
              border: (theme) => `1px solid ${theme.palette.primary.main}30`,
              bgcolor: "background.paper",
              transition: "box-shadow 0.3s ease",
              "&:hover": {
                boxShadow: (theme) => `0 0 24px ${theme.palette.primary.main}25`,
              },
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                color="primary"
              >
                {skillCategory.category}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {skillCategory.items.map((skill, skillIndex) => (
                  <Chip
                    label={skill}
                    key={skillIndex}
                    variant="outlined"
                    sx={{
                      borderColor: "secondary.main",
                      backgroundColor: "background.paper",
                      color: "grey.50",
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
});
