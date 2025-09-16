import { memo } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { StatusIndicator } from "@/atoms/StatusIndicator";

export const StatusBar: React.FC<{ page: string; name: string; title: string }> = memo(({ page, name, title }) => {
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
        fontSize: '1rem',
        fontWeight: 600,
        gap: 2,
        borderRadius: "0.6rem 0.6rem 0 0",
        borderStyle: "solid",
        borderWidth: "0.13rem 0.13rem 0 0.13rem",
        borderColor: "success.main",
      }}
    >
      <StatusIndicator />
      <Typography variant="caption" fontSize={'1rem'}> {name} – {title}</Typography>
      <Typography variant="caption" fontSize={'1rem'} sx={{ ml: "auto" }}>
        {page}
      </Typography>
    </Stack>
  );
});
