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
  /** When false, renders a lightweight placeholder for virtualized scrolling */
  visible?: boolean;
  /** 'hero' for the featured project card, 'default' for standard card */
  variant?: "default" | "hero";
}

export const ProjectCard: React.FC<ProjectCardProps> = memo(({ project, visible = true, variant = "default" }) => {
  if (!visible) {
    // Lightweight placeholder — just name, no heavy DOM
    return (
      <Card
        sx={{
          height: 260,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
          border: (theme) => `1px solid ${theme.palette.divider}`,
          opacity: 0.3,
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", px: 1 }}
        >
          {project.name}
        </Typography>
      </Card>
    );
  }

  if (variant === "hero") {
    return (
      <Card
        sx={{
          border: (theme) => `1px solid ${theme.palette.primary.main}30`,
          bgcolor: "background.paper",
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: (theme) => `0 0 24px ${theme.palette.primary.main}25`,
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          {/* Title row */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Link
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
            >
              <Typography
                variant="h5"
                component="h3"
                sx={{
                  fontWeight: 600,
                  transition: "color 0.2s ease",
                  "&:hover": { color: "primary.main", opacity: "0.6" },
                }}
              >
                {project.name}
              </Typography>
            </Link>
            {project.url && (
              <Link
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: { xs: "none", md: "inline-flex" },
                  alignItems: "center",
                  gap: 0.5,
                  color: "primary.main",
                  textDecoration: "none",
                  fontSize: "0.8rem",
                  "&:hover": { textDecoration: "none", opacity: "0.6" },
                  flexShrink: 0,
                  ml: 2,
                }}
              >
                <span>🔗</span>
              </Link>
            )}
          </Box>

          {/* Technologies */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
            {project.technologies.map((tech) => (
              <Chip
                label={tech}
                key={tech}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: "primary.main",
                  color: "primary.main",
                  fontWeight: 500,
                }}
              />
            ))}
          </Box>

          {/* Description */}
          <Box
            component="ul"
            sx={{ pl: 2, m: 0 }}
          >
            {project.description.map((desc) => (
              <Typography
                component="li"
                variant="body2"
                key={desc}
                sx={{
                  pl: 1,
                  mb: 0.5,
                  lineHeight: 1.6,
                  "&::marker": { color: "primary.main" },
                }}
              >
                {desc}
              </Typography>
            ))}
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Default card (compact, for grid/list usage)
  return (
    <Card
      sx={{
        height: 260,
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.3s ease, transform 0.3s ease",
        "&:hover": {
          boxShadow: (theme) => `0 0 20px ${theme.palette.primary.main}40`,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Link
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          underline="none"
        >
          <Typography
            variant="h6"
            component="h4"
            gutterBottom
            sx={{
              transition: "color 0.2s ease",
              "&:hover": { color: "primary.main" },
            }}
          >
            {project.name}
          </Typography>
        </Link>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
          {project.technologies.map((tech) => (
            <Chip
              label={tech}
              key={tech}
              size="small"
              variant="outlined"
              sx={{ borderColor: "primary.main", color: "primary.main" }}
            />
          ))}
        </Box>
        <Box
          component="ul"
          sx={{ pl: 2, mt: "auto" }}
        >
          {project.description.map((desc) => (
            <Typography
              component="li"
              variant="body2"
              key={desc}
              sx={{ pl: 1 }}
            >
              {desc}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
});
