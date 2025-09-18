import { memo } from "react";
import { useTranslation } from "react-i18next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { BoldedKeyword } from "@/atoms/BoldedKeyword";
import { AnimatedBadgeComponent } from "@/atoms/AnimatedBadge";
import { CVDownloadSection } from "@/components/resume/items/CVDownloadSection";

export const AboutSection: React.FC = memo(() => {
  const { t } = useTranslation();

  const handleDownloadCV = (language: "en" | "tr") => {
    const cvFileName = language === "tr" ? `Resume_TR.pdf?v=${import.meta.env.VITE_ASSET_HASH}` : `Resume_EN.pdf?v=${import.meta.env.VITE_ASSET_HASH}`;

    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = `/data/${cvFileName}`;
    link.download = cvFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SummaryContent = memo(() => {
    const summary = { main: t("resume.summary.main"), highlights: t("resume.summary.highlights", { returnObjects: true }) };

    return (
      <Box sx={{ flexGrow: 1, maxWidth: { xs: "100%", sm: "70%" } }}>
        <Typography variant="body1">{summary.main}</Typography>
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
      </Box>
    );
  });

  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        {t("ui.headings.professionalSummary")}
      </Typography>

      <Box display={"flex"} flexDirection={"row"} gap={2} justifyContent={"center"} flexWrap={"wrap"} alignItems={"flex-start"}>
        <SummaryContent />

        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <AnimatedBadgeComponent alt={t("ui.misc.microsoftCertification")} aria-label={`${t("ui.misc.microsoftCertified")} Badge`} />
          </Box>

          <CVDownloadSection onDownload={handleDownloadCV} />
        </Box>
      </Box>
    </Box>
  );
});
