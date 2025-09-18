import { memo } from "react";
import { useTranslation } from "react-i18next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { ProjectCard } from "@/components/resume/items/ProjectCard";

export const ProjectsSection: React.FC = memo(() => {
  const { t } = useTranslation();
  const projects = t('resume.projects', { returnObjects: true });

  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        {t("ui.headings.projects")}
      </Typography>
      <Grid container spacing={2}>
        {projects.map((project) => (
          <Grid size={{ xs: 12, md: 6 }} key={project.name}>
            <ProjectCard project={project} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
});
