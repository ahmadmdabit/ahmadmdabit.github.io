import React, { memo, useCallback } from "react";
import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import ChatAssistantIcon from "@/atoms/ChatAssistantIcon";
import PersonIcon from "@mui/icons-material/Person";
import WorkIcon from "@mui/icons-material/Work";
import CodeIcon from "@mui/icons-material/Code";
import StarIcon from "@mui/icons-material/Star";
import SchoolIcon from "@mui/icons-material/School";
import MailIcon from "@mui/icons-material/Mail";
import CardMembershipIcon from "@mui/icons-material/CardMembership";
import TranslateIcon from "@mui/icons-material/Translate";
import { type Pages } from "@/types/Pages.types";
import { ActivityButton } from "@/atoms/ActivityButton";
import { PersonPhoto } from "@/atoms/PersonPhoto";
import { LanguageSelector } from "@/molecules/LanguageSelector";
import { getPageData } from "@/data/pagesData";

const icons: Record<keyof Pages, React.ElementType> = {
  about: PersonIcon,
  experience: WorkIcon,
  projects: CodeIcon,
  skills: StarIcon,
  education: SchoolIcon,
  certifications: CardMembershipIcon,
  languages: TranslateIcon,
  contact: MailIcon,
};

const StyledPersonPhotoBox = styled(Box)(({ theme }) => ({
  margin: "1rem",
  marginLeft: 0,
  [theme.breakpoints.down("sm")]: {
    marginRight: "0.5rem",
  },
}));

const StyledChatIconButton = styled(IconButton)(() => ({
  gap: 0.5,
  px: 1,
  borderRadius: 6,
  transition: "transform 0.9s ease-in-out",
  "&.toggle": {
    marginTop: "-2rem",
  },
}));

export interface ActivityBarProps {
  isChatOpen: boolean;
  language: string;
  onToggleChat: () => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = memo(({ isChatOpen, language, onToggleChat }) => {
  const { t } = useTranslation();

  const handleToggleChat = useCallback(() => {
    onToggleChat();
  }, [onToggleChat]);

  return (
    <Stack direction="row" alignItems="center" sx={{ px: 0, gap: 0.5, flexFlow: "wrap" }}>
      <StyledPersonPhotoBox>
        <PersonPhoto />
      </StyledPersonPhotoBox>

      {Object.keys(icons).map((key) => {
        const currentIconKey = key as keyof typeof icons;
        const currentIcon = icons[currentIconKey];
        const toPath = key === "about" ? "/" : `/${key}`;
        return (
          <Tooltip key={key} title={getPageData(currentIconKey, t)}>
            <NavLink to={toPath} style={{ textDecoration: "none" }}>
              {({ isActive }) => <ActivityButton selected={isActive}>{React.createElement(currentIcon)}</ActivityButton>}
            </NavLink>
          </Tooltip>
        );
      })}

      <LanguageSelector language={language} />

      <Tooltip title={t("ui.chat.aiAssistant")}>
        <StyledChatIconButton className={isChatOpen ? "toggle" : ""} onClick={handleToggleChat}>
          <ChatAssistantIcon fontSize="small" color="primary" />
          <Typography variant="body1" color="primary" fontSize={"1.2rem"} marginRight={0.5}>
            AI
          </Typography>
        </StyledChatIconButton>
      </Tooltip>
    </Stack>
  );
});
