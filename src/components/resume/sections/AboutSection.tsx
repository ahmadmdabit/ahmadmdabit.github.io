import { memo } from "react";
import { useTranslation } from "react-i18next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DownloadIcon from "@mui/icons-material/Download";
import { BoldedKeyword } from "@/atoms/BoldedKeyword";
import mcIcon from "@/assets/MC.png"; // Import for bundling (Vite handles hashing)

interface AboutSectionProps {
  summary: { main: string; highlights: string[] };
}

export const AboutSection: React.FC<AboutSectionProps> = memo(({ summary }) => {
  const { t } = useTranslation();

  const handleDownloadCV = (language: "en" | "tr") => {
    const cvFileName = language === "tr" ? `Resume_TR.pdf?v=${import.meta.env.VITE_PUBLIC_ASSETS_HASH}` : `Resume_EN.pdf?v=${import.meta.env.VITE_PUBLIC_ASSETS_HASH}`;

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

      <Box display={"flex"} flexDirection={"row"} gap={2} justifyContent={"center"} flexWrap={"wrap"}>
        <Box
          sx={{
            display: "flex",
            flexFlow: "column",
            alignItems: "center",
            justifySelf: "center",
            mt: 3,
            p: 2,
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

        {/* Microsoft Certification Badge */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mt: 3,
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "primary.main",
            boxShadow: 1,
          }}
        >
          <Avatar
            src={mcIcon}
            alt={t("ui.misc.microsoftCertification")}
            variant="rounded"
            sx={{
              width: 96,
              height: 96,
              mr: 3,
              border: "2px solid",
              borderColor: "primary.main",
              bgcolor: "primary.main",
            }}
            aria-label={`${t("ui.misc.microsoftCertified")} Badge`}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              <BoldedKeyword text={t("ui.misc.microsoftCertified")} />
            </Typography>
            <Typography variant="h6" color="text.secondary">
              {t("ui.misc.microsoftCertification")}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});
