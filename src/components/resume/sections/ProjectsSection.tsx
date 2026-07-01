import { memo, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import { ProjectCard } from "@/components/resume/items/ProjectCard";

export const ProjectsSection: React.FC = memo(() => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const projects = t("resume.projects", { returnObjects: true }) as Array<{ name: string; url: string; technologies: string[]; description: string[] }>;

  const [activeIndex, setActiveIndex] = useState(0);
  const detailRef = useRef<HTMLDivElement>(null);

  const handleSelect = useCallback(
    (index: number) => {
      setActiveIndex(index);
      // On mobile/tablet: scroll down to the detail card after selection
      if (isMobile && detailRef.current) {
        setTimeout(() => {
          detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    },
    [isMobile],
  );

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <Typography
          variant="h4"
          component="h2"
          sx={{ mb: 0 }}
        >
          {t("ui.headings.projects")}
        </Typography>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            px: 1,
            borderRadius: "999px",
            bgcolor: "primary.main",
            color: "background.default",
            fontSize: "1rem",
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {projects.length}
        </Box>
      </Box>

      {/* Master-Detail Layout */}
      <Box
        sx={{
          display: "flex",
          gap: { xs: 2, md: 3 },
          flexDirection: { xs: "column", md: "row" },
          alignItems: "flex-start",
        }}
      >
        {/* ── LEFT: Project List (scrollable) ── */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            width: { xs: "100%", md: 320 },
            flexShrink: 0,
            maxHeight: { xs: "40vh", md: "65vh" },
            overflowY: "auto",
            pr: { xs: 0, md: 0.5 },
          }}
        >
          {projects.map((project, index) => {
            const isActive = index === activeIndex;
            return (
              <Box
                key={`list-${project.name}-${index}`}
                onClick={() => handleSelect(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(index);
                  }
                }}
                aria-current={isActive ? "true" : undefined}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1, md: 1.5 },
                  p: { xs: 1.25, md: 1.5 },
                  borderRadius: 1,
                  cursor: "pointer",
                  bgcolor: isActive ? "action.selected" : "transparent",
                  border: (theme) => (isActive ? `1px solid ${theme.palette.primary.main}` : `1px solid transparent`),
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "action.hover",
                    borderColor: (theme) => (!isActive ? theme.palette.divider : theme.palette.primary.main),
                  },
                }}
              >
                {/* Index badge */}
                <Box
                  sx={{
                    width: { xs: 24, md: 28 },
                    height: { xs: 24, md: 28 },
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    flexShrink: 0,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.65rem", md: "0.75rem" } }}
                  >
                    {index + 1}
                  </Typography>
                </Box>

                {/* Project name + url link */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isActive ? 600 : 400,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontSize: { xs: "0.8rem", md: "0.875rem" },
                      }}
                    >
                      {project.name}
                    </Typography>
                    {project.url && (
                      <Link
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          fontSize: "0.65rem",
                          color: "primary.main",
                          textDecoration: "none",
                          "&:hover": { textDecoration: "none", opacity: "0.6" },
                          flexShrink: 0,
                        }}
                      >
                        🔗
                      </Link>
                    )}
                  </Box>
                  {/* Mini tech chips — fewer on mobile */}
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.3 }}>
                    {project.technologies.slice(0, 3).map((tech) => (
                      <Chip
                        key={tech}
                        label={tech}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: { xs: 16, md: 18 },
                          fontSize: { xs: "0.5rem", md: "0.6rem" },
                          borderColor: isActive ? "primary.main" : "grey.700",
                          color: isActive ? "primary.main" : "grey.400",
                          "& .MuiChip-label": { px: 0.5 },
                        }}
                      />
                    ))}
                    {project.technologies.length > 3 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ lineHeight: { xs: "16px", md: "18px" }, fontSize: { xs: "0.5rem", md: "0.65rem" } }}
                      >
                        +{project.technologies.length - 3}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* ── RIGHT: Selected Project Detail ── */}
        <Box
          ref={detailRef}
          key={activeIndex}
          sx={{
            flexGrow: 1,
            width: { xs: "100%", md: "auto" },
            minWidth: 0,
            animation: "fadeSlideIn 0.35s ease",
            "@keyframes fadeSlideIn": {
              from: { opacity: 0, transform: "translateY(8px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          <ProjectCard
            project={projects[activeIndex]}
            variant="hero"
          />
        </Box>
      </Box>
    </Box>
  );
});
