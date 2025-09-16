import { memo } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import type { Reference } from "@/types/Resume.types";

interface ReferenceSectionProps {
  reference: Reference;
}

export const ReferenceSection: React.FC<ReferenceSectionProps> = memo(({ reference }) => {
  return (
    <Box>
      <Typography variant="h4" component="h2" gutterBottom>
        Reference
      </Typography>
      <Typography variant="h6">{reference.name}</Typography>
      <Typography variant="subtitle1">{reference.title}</Typography>
      <Typography variant="body1">{reference.contact}</Typography>
    </Box>
  );
});
