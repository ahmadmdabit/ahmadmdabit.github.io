import { memo } from "react";
import { keyframes, styled } from "@mui/material/styles";

const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.5}`;
const Dot = styled("div")(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: "50%",
  backgroundColor: theme.palette.success.main,
  animation: `${pulse} 2s infinite`,
}));

export const StatusIndicator: React.FC = memo(() => <Dot />);
