import { memo } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { StatusIndicator } from "@/atoms/StatusIndicator";

export const StatusBar: React.FC<{ page: string; name: string; title: string }> = memo(({ page, name, title }) => {
  console.log(page);
  const theme = useTheme();
  const isMobileTablet = useMediaQuery(theme.breakpoints.down("md"));
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        mt: 0.2,
        mx: 0.2,
        px: 2,
        py: 3,
        height: 24,
        backgroundColor: "grey.700",
        color: "success.main",
        fontSize: "1rem",
        fontWeight: 600,
        gap: 2,
        borderRadius: "0.6rem 0.6rem 0 0",
        borderStyle: "solid",
        borderWidth: "0.13rem 0.13rem 0 0.13rem",
        borderColor: "success.main",
      }}
    >
      {!isMobileTablet && <StatusIndicator />}
      <Typography variant="caption" fontSize={"1rem"}>
        {" "}
        {name} – {title}
      </Typography>
      {!isMobileTablet && (
        <Typography variant="caption" fontSize={"1rem"} sx={{ ml: "auto" }}>
          {page}
        </Typography>
      )}
    </Stack>
  );
});
