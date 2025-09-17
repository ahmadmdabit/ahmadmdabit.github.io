import React, { memo, useCallback } from "react";

interface ReplacePlaceholdersProps {
  text: string;
  replacements: Record<string, string>;
}

export const ReplacePlaceholders: React.FC<ReplacePlaceholdersProps> = memo(({ text, replacements }) => {
  // Create a regex pattern to match all placeholders from replacements keys
  const placeholders = Object.keys(replacements);
  const regex = new RegExp(`(${placeholders.map(ph => ph.replace(/[[\]]/g, '\\$&')).join("|")})`, "g");

  // Split text by placeholders
  const parts = text.split(regex);

  const processedText = useCallback(() => {
    return parts.map((part, index) =>
      replacements[part] === undefined ? (
        part
      ) : (
        <React.Fragment key={index}>{replacements[part]}</React.Fragment>
      )
    );
  }, [parts, replacements]);

  return <span>{processedText()}</span>;
});
