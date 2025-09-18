import { memo } from "react";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import DownloadIcon from "@mui/icons-material/Download";

interface CVDownloadSectionProps {
  onDownload: (language: "en" | "tr") => void;
}

export const CVDownloadSection: React.FC<CVDownloadSectionProps> = memo(({ onDownload }) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
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

      <Box sx={{ display: "flex", gap: 2, mt: 3, flexDirection: "row", justifyContent: "center" }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={() => onDownload("tr")}
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
          onClick={() => onDownload("en")}
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
  );
});