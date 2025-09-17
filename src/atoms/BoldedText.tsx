import { memo } from "react";

interface BoldedTextProps {
  text: string;
}

export const BoldedText: React.FC<BoldedTextProps> = memo(({ text }) => {
  return <strong>{text}</strong>;
});
