import { memo } from "react";
import { styled } from "@mui/material/styles";
import IconButton, { type IconButtonProps } from "@mui/material/IconButton";

const StyledButton = styled(IconButton)<{ selected: boolean }>(({ theme, selected }) => ({
  width: 36,
  height: 36,
  borderRadius: 6,
  color: theme.palette.grey[400],
  border: "0.18rem solid",
  borderColor: "transparent",
  "&:hover": { backgroundColor: theme.palette.grey[800], color: theme.palette.grey[200] },
  ...(selected && {
    backgroundColor: theme.palette.grey[700],
    color: theme.palette.success.main,
    borderColor: theme.palette.success.main,
  }),
  position: "relative",
}));

export interface ActivityButtonProps extends IconButtonProps {
  selected?: boolean;
}

export const ActivityButton: React.FC<ActivityButtonProps> = memo(({ selected, ...rest }) => <StyledButton selected={selected || false} {...rest} />);
