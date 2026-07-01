import { memo } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import type { Experience } from "@/types/Resume.types";

interface ExperienceItemProps {
  item: Experience;
}

export const ExperienceItem: React.FC<ExperienceItemProps> = memo(({ item }) => {
  return (
    <Card
      sx={{
        mb: 3,
        border: (theme) => `1px solid ${theme.palette.primary.main}30`,
        bgcolor: "background.paper",
        transition: "box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: (theme) => `0 0 24px ${theme.palette.primary.main}25`,
        },
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
        >
          <Typography
            variant="h6"
            component="h4"
          >
            {item.role}
          </Typography>
          <Typography
            variant="subtitle2"
            color="text.secondary"
          >
            {item.duration}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
        >
          <Typography
            variant="subtitle1"
            color="primary"
          >
            {item.company}
          </Typography>
          <Typography
            variant="subtitle2"
            color="text.secondary"
          >
            {item.location}
          </Typography>
        </Stack>
        <Box
          component="ul"
          sx={{ pl: 2, mt: 1 }}
        >
          {item.tasks.map((task, index) => (
            <Typography
              component="li"
              variant="body2"
              key={index}
              sx={{ pl: 1 }}
            >
              {task}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
});
