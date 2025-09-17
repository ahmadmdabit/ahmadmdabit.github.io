import { memo } from "react";
import { Link, useRouteError } from "react-router";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: "none",
  "&:visited": {
    color: theme.palette.secondary.main,
  },
}));

export const ErrorPage: React.FC = memo(() => {
  const { t } = useTranslation();
  const error = useRouteError();

  return (
    <Container maxWidth={false} sx={{ flex: 1, display: "flex", flexDirection: "column", mt: 3 }}>
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <Paper
          sx={{
            flex: 1,
            backgroundColor: "black",
            color: "grey.200",
            borderRadius: "0.6rem",
            borderStyle: "solid",
            borderWidth: "0.13rem",
            borderColor: "success.main",
            overflowY: "auto",
            fontFamily: "SF Mono, Consolas, monospace",
            fontSize: 14,

            minHeight: "90vh",
            height: "90vh",
            maxHeight: "90vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ p: 2, flex: 1, textAlign: "center" }}>
            <Typography variant="h1" color="error">
              {t("ui.misc.error")}
            </Typography>
            <Box bgcolor={"error"} padding={2} borderRadius={6}>
              <Typography variant="body1">{t("ui.misc.errorMessage")}</Typography>
              <br />
              <Typography variant="body2">{(error as Error).message || "Unknown error"}</Typography>
            </Box>
            <Box bgcolor={"background.paper"} display={"inline-block"} padding={1} borderRadius={6}>
              <StyledLink to="/">{t("ui.misc.returnToHomePage")}</StyledLink>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Typography variant="caption" color="grey.400" align="center" paddingTop={1}>
        All Rights Reserved &copy; 2025
      </Typography>
    </Container>
  );
});
