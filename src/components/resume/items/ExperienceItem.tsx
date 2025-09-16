import { memo } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import type { Experience } from "@/types/Resume.types";

interface ExperienceItemProps {
  item: Experience;
}

export const ExperienceItem: React.FC<ExperienceItemProps> = memo(({ item }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Typography variant="h6" component="h4">
          {item.role}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {item.duration}
        </Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Typography variant="subtitle1" color="primary">
          {item.company}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          {item.location}
        </Typography>
      </Stack>
      <Box component="ul" sx={{ pl: 2, mt: 1 }}>
        {item.tasks.map((task, index) => (
          <Typography component="li" variant="body2" key={index} sx={{ pl: 1 }}>
            {task}
          </Typography>
        ))}
      </Box>
    </Box>
  );
});
