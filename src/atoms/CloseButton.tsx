import { memo } from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

export const CloseButton: React.FC<{ onClick: () => void }> = memo(({ onClick }) => (
  <IconButton onClick={onClick}>
    <CloseIcon fontSize="small" sx={{ color: "common.white" }} />
  </IconButton>
));
