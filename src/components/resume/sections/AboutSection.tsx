import { memo } from "react";
import { useTranslation } from "react-i18next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DownloadIcon from "@mui/icons-material/Download";
import { BoldedKeyword } from "@/atoms/BoldedKeyword";

interface AboutSectionProps {
  summary: { main: string; highlights: string[] };
}

export const AboutSection: React.FC<AboutSectionProps> = memo(({ summary }) => {
  const { t } = useTranslation();

  const handleDownloadCV = (language: "en" | "tr") => {
    const cvFileName = language === "tr" ? "Resume_TR.pdf" : "Resume_EN.pdf";

    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = `/data/${cvFileName}`;
    link.download = cvFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        {t("ui.headings.professionalSummary")}
      </Typography>
      <Typography variant="body1" paragraph>
        {summary.main}
      </Typography>
      <List>
        {summary.highlights.map((highlight, index) => (
          <ListItem key={index} disableGutters>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CheckCircleOutlineIcon color="primary" fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={<BoldedKeyword text={highlight} />} />
          </ListItem>
        ))}
      </List>

      <Box
        sx={{
          display: "flex",
          justifySelf: "center",
          mt: 3,
          p: 2,
          flexFlow: "column",
          alignItems: "center",
          border: 1,
          borderColor: "success.main",
          borderRadius: 2,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h5">{t("ui.buttons.downloadCV")}</Typography>
          <Typography variant="h5" color="secondary">
            {t("ui.buttons.downloadCVDescription")}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mt: 3, flexFlow: "row", justifyContent: "center" }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={() => handleDownloadCV("tr")}
            sx={{
              flex: 1,
              fontSize: "1.1rem",
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              py: 1.5,
              boxShadow: 3,
              "&:hover": {
                boxShadow: 6,
                transform: "translateY(-2px)",
                transition: "all 0.2s ease-in-out",
              },
            }}
          >
            {t("ui.languages.turkish")}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={() => handleDownloadCV("en")}
            sx={{
              flex: 1,
              fontSize: "1.1rem",
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              py: 1.5,
              boxShadow: 3,
              "&:hover": {
                boxShadow: 6,
                transform: "translateY(-2px)",
                transition: "all 0.2s ease-in-out",
              },
            }}
          >
            {t("ui.languages.english")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
});
