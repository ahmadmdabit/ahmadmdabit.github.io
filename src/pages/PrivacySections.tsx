import React, { memo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";

const ContentRenderer: React.FC<{ content: string }> = memo(({ content }) => {
  const lines = content.split("\n");

  return (
    <>
      {lines.map((line, lineIndex) => {
        const parts = line.split(/(\[.*?\]\(.*?\))/g);

        return (
          <React.Fragment key={lineIndex}>
            {parts.map((part, i) => {
              const match = part.match(/^\[(.*?)\]\((.*?)\)$/);
              if (match) {
                const [, text, url] = match;
                return (
                  <Link
                    key={i}
                    href={url}
                    target="_blank"
                    underline="none"
                    rel="noopener noreferrer"
                  >
                    {text}
                  </Link>
                );
              } else {
                const boldParts = part.split(/\*\*/);
                return boldParts.map((boldPart, j) =>
                  j % 2 === 1 ? (
                    <Box
                      component="strong"
                      key={j}
                      sx={{ color: "success.main", fontWeight: "bold" }}
                    >
                      {boldPart}
                    </Box>
                  ) : (
                    <React.Fragment key={j}>{boldPart}</React.Fragment>
                  ),
                );
              }
            })}
            {lineIndex < lines.length - 1 && <br />}
          </React.Fragment>
        );
      })}
    </>
  );
});

export const PrivacySections: React.FC = memo(() => {
  const { t } = useTranslation();
  const sections = t("privacy.sections", { returnObjects: true });

  return (
    <>
      <Typography
        variant="h5"
        pt={1}
        pb={2}
      >
        {t("privacy.title")}
      </Typography>
      <Chip
        title={t("privacy.updateDateIso8601")}
        label={`${t("privacy.updateDate")}: ${t("privacy.updateDateLongForm")}`}
        sx={{ mb: 2 }}
      />
      {sections.map((section, k1) => (
        <Box key={k1}>
          <Typography variant="h6">{section.title}</Typography>
          <Typography
            variant="body1"
            pt={1}
            pb={2}
          >
            <ContentRenderer content={section.content} />
          </Typography>
        </Box>
      ))}
    </>
  );
});
