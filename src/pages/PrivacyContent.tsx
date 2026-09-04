import { memo } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { PrivacySections } from "@/pages/PrivacySections";

export const PrivacyContent: React.FC = memo(() => {
  return (
    <Container
      maxWidth={false}
      sx={{ flex: 1, display: "flex", flexDirection: "column", px: 0, mt: 3 }}
    >
      <Box sx={{ position: "relative" }}>
        <Paper
          sx={{
            flex: 1,
            backgroundColor: "black",
            color: "grey.200",
            borderRadius: "0.6rem",
            borderStyle: "solid",
            borderWidth: "0.13rem",
            borderColor: "success.main",
            maxHeight: "calc(100vh - 67px)",
            overflowY: "auto",
            fontFamily: "SF Mono, Consolas, monospace",
            fontSize: 14,
            mb: 0.2,
            mx: 0.2,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ p: 2, flex: 1 }}>
            <PrivacySections />
          </Box>
        </Paper>
      </Box>
    </Container>
  );
});
