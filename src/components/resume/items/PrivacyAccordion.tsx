import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ErrorIcon from "@mui/icons-material/Error";

interface PrivacyAccordionProps {
  privacyNoticeConfirm: boolean;
  onPrivacyConfirmChange: (checked: boolean) => void;
  privacyNoticeConfirmError: boolean;
  onErrorChange: (hasError: boolean) => void;
  onExpandChange: () => void;
}

export const PrivacyAccordion: React.FC<PrivacyAccordionProps> = memo(({
  privacyNoticeConfirm,
  onPrivacyConfirmChange,
  privacyNoticeConfirmError,
  onErrorChange,
  onExpandChange,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [expand, setExpand] = useState(false);

  const handleExpandChange = () => {
    setExpand((p) => !p);
    onExpandChange();
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    onPrivacyConfirmChange(checked);
    onErrorChange(!checked);
    if (checked) {
      setExpand(false);
    }
  };

  return (
    <>
      <Accordion sx={{ borderRadius: 2 }} expanded={expand} onChange={handleExpandChange}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1-content" id="panel1-header">
          <Typography component="span">{t("ui.misc.privacyNoticeConfirmIntroductory")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Outlet />
          <FormGroup sx={{ background: theme.palette.background.paper, padding: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1">{t("ui.misc.privacyNoticeConfirmIntroductorySub")}</Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={privacyNoticeConfirm}
                  onChange={handleCheckboxChange}
                  slotProps={{
                    input: { "aria-label": t("ui.misc.privacyNoticeConfirm") },
                  }}
                />
              }
              label={t("ui.misc.privacyNoticeConfirm")}
            />
          </FormGroup>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {privacyNoticeConfirmError && (
          <Typography color="error" sx={{ display: "flex", alignItems: "center" }}>
            <ErrorIcon sx={{ mr: 1 }} /> {t('ui.misc.privacyNoticeConfirmError')}
          </Typography>
        )}
      </Box>
    </>
  );
});