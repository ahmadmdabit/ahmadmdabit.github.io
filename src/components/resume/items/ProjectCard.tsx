import { memo } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Link from "@mui/material/Link";
import type { Project } from "@/types/Resume.types";

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = memo(({ project }) => {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Link href={project.url} target="_blank" rel="noopener noreferrer" underline="none">
          <Typography variant="h6" component="h4" gutterBottom>
            {project.name}
          </Typography>
        </Link>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
          {project.technologies.map((tech) => (
            <Chip label={tech} key={tech} size="small" />
          ))}
        </Box>
        <Box component="ul" sx={{ pl: 2, mt: 1 }}>
          {project.description.map((desc) => (
            <Typography component="li" variant="body2" key={desc} sx={{ pl: 1 }}>
              {desc}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
});
