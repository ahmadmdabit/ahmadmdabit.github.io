import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { ActivityButton } from "@/atoms/ActivityButton";
import Avatar from "@mui/material/Avatar";

export interface LanguageSelectorProps {
  language: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language }) => {
  const { i18n } = useTranslation();
  
  const changeLanguage = useCallback((lng: "en" | "tr") => {
    i18n.changeLanguage(lng);
  }, [i18n]);

  const handleEnClick = useCallback(() => changeLanguage("en"), [changeLanguage]);
  const handleTrClick = useCallback(() => changeLanguage("tr"), [changeLanguage]);

  const isTR = language.startsWith("tr");

  return (
    <Stack direction="row" spacing={0.5} sx={{ ml: "auto", border: 1, borderColor: "transparent", p: 0.5, borderRadius: 2, width: "2.88rem", minWidth: "2.88rem", overflowX: "hidden" }}>
      <Tooltip title="Turkish">
        <ActivityButton onClick={handleEnClick} selected={isTR} sx={{ ml: isTR ? 0 : "-2.524rem !important", transition: "margin 0.2s ease-in-out" }}>
          <Avatar
            variant="rounded"
            src={`/TR.png?v=${import.meta.env.VITE_PUBLIC_ASSETS_HASH}`}
            sx={{
              width: 32,
              height: 32,
            }}
          />
        </ActivityButton>
      </Tooltip>
      <Tooltip title="English">
        <ActivityButton onClick={handleTrClick} selected={!isTR}>
          <Avatar
            variant="rounded"
            src={`/EN.png?v=${import.meta.env.VITE_PUBLIC_ASSETS_HASH}`}
            sx={{
              width: 32,
              height: 32,
            }}
          />
        </ActivityButton>
      </Tooltip>
    </Stack>
  );
};
