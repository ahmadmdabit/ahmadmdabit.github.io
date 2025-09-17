import { memo, useCallback } from "react";

// List of keywords to make bold
const KEYWORDS = ["C#", ".NET", "ERP", "microservices", "mikroservisler", "TypeScript", "React.js", "Vue.js", "Dart/Flutter", "Microsoft Certified: Azure Data Engineer Associate - 2023", "MicMicrosoft Sertifikası: Azure Data Engineer Associate - 2023", "clean, maintainable software", "Temiz, sürdürülebilir yazılım", "scalable systems", "ölçeklenebilir sistemler"];

// Create a regex pattern from the keywords
const regex = new RegExp(`(${KEYWORDS.join("|")})`, "gi");

interface BoldedKeywordProps {
  text: string;
}

export const BoldedKeyword: React.FC<BoldedKeywordProps> = memo(({ text }) => {
  const parts = text.split(regex);

  const processedText = useCallback(() => {
    return parts.map((part, index) => {
      return KEYWORDS.some((keyword) => new RegExp(`^${keyword}$`, "i").test(part)) ? <strong key={index}>{part}</strong> : part;
    });
  }, [parts]);

  return <span>{processedText()}</span>;
});
