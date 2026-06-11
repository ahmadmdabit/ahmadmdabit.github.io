import { memo } from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

export const CloseButton: React.FC<{ onClick: () => void }> = memo(({ onClick }) => (
  <IconButton
    onClick={(event) => {
      // Blur the button before closing to avoid "aria-hidden on focused element" warning
      // See: https://w3c.github.io/aria/#aria-hidden
      const button = event.currentTarget;
      button.blur();
      onClick();
    }}
  >
    <CloseIcon
      fontSize="small"
      sx={{ color: "common.white" }}
    />
  </IconButton>
));
