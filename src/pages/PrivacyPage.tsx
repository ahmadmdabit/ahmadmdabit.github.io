import React, { memo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import Chip from "@mui/material/Chip";
import { BoldedText } from "@/atoms/BoldedText";
import Link from "@mui/material/Link";

interface ContentRendererProps {
  content: string;
  replacements: Record<string, string>;
}

const replacePlaceholders = (text: string, replacements: Record<string, string>) => {
  const placeholders = Object.keys(replacements);
  if (placeholders.length === 0) return text;
  const regex = new RegExp(`(${placeholders.map((ph) => ph.replace(/[[\]]/g, "\\$&")).join("|")})`, "g");
  return text.replace(regex, (match) => replacements[match] ?? match);
};

// Helper to parse and render content string
const ContentRenderer: React.FC<ContentRendererProps> = memo(({ content, replacements }) => {
  // Replace placeholders before rendering
  const replacedContent = replacePlaceholders(content, replacements);

  // Split by lines after replacement
  const lines = replacedContent.split("\n");

  return (
    <>
      {lines.map((line, lineIndex) => {
        // Split by markdown links [text](url)
        const parts = line.split(/(\[.*?\]\(.*?\))/g);

        return (
          <React.Fragment key={lineIndex}>
            {parts.map((part, i) => {
              // Detect link markup [text](url)
              const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
              if (match) {
                const [, text, url] = match;
                return (
                  <Link key={i} href={url} target="_blank" underline="none" rel="noopener noreferrer">
                    {text}
                  </Link>
                );
              } else {
                // Handle bold markup inside plain text parts
                const boldParts = part.split(/\*\*/);
                return boldParts.map((boldPart, j) => (j % 2 === 1 ? <BoldedText key={j} text={boldPart} /> : <React.Fragment key={j}>{boldPart}</React.Fragment>));
              }
            })}
            {lineIndex < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </>
  );
});

export const PrivacyPage: React.FC = memo(() => {
  const { t } = useTranslation();
  const sections = t("privacy.sections", { returnObjects: true });
  const address = t("resume.contactInfo.address").split(" ");
  const replacements = {
    "[Your Name / Company Name]": t("resume.contactInfo.name"),
    "[Adınız / Şirket Adınız]": t("resume.contactInfo.name"),
    "[Your Country]": address[address.length - 1],
    "[Ülkeniz]": address[address.length - 1],
    "[Your Contact Email]": t("resume.contactInfo.email"),
    "[İletişim E-postanız]": t("resume.contactInfo.email"),
    "[Your Address]": t("resume.contactInfo.address"),
    "[Adresiniz]": t("resume.contactInfo.address"),
  };

  return (
    <>
      <Typography variant="h5" pt={1} pb={2}>
        {t("privacy.title")}
      </Typography>
      <Chip label={`${t("privacy.updateDate")}: 17-09-2025`} sx={{ mb: 2 }} />
      {sections.map((section, k1) => (
        <Box key={k1}>
          <Typography variant="h6">{section.title}</Typography>
          <Typography variant="body1" pt={1} pb={2}>
            {/* 
              {section.content.split("\n").map((line, k2) => (
                <React.Fragment key={k2}>
                  {line}
                  <br />
                </React.Fragment>
              ))} 
            */}
            {<ContentRenderer content={section.content} replacements={replacements} />}
          </Typography>
        </Box>
      ))}
    </>
  );
});
