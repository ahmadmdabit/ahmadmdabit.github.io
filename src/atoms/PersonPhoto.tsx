import { memo } from "react";
import Avatar from "@mui/material/Avatar";
import { keyframes } from "@emotion/react";
import { styled } from "@mui/material/styles";

const draw = keyframes`
  100% {
    transform: rotate(360deg);
  }
`;

const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  width: 93,
  height: 93,
  padding: "0.1rem",
  borderStyle: "solid",
  borderWidth: "0.17rem",
  borderColor: theme.palette.success.main,
  "&::before": {
    zIndex: -1,
    position: "absolute",
    content: '""',
    backgroundImage: `conic-gradient(transparent 300deg, ${theme.palette.success.main} 360deg)`,
    width: "100%",
    height: "100%",
    left: "0",
    top: "0",
    right: "0",
    bottom: "0",
    transformOrigin: "center center",
    animation: `${draw} 4000ms linear infinite`,
  },
  "&::after": {
    zIndex: -1,
    position: "absolute",
    content: '""',
    background: theme.palette.background.default,
    width: "cal(98% - 0.4rem)",
    height: "cal(98% - 0.4rem)",
    left: "0.4rem",
    top: "0.4rem",
    right: "0.4rem",
    bottom: "0.4rem",
    transformOrigin: "center center",
    animation: `${draw} 4000ms linear infinite`,
  },
}));

export const PersonPhoto: React.FC<{ src?: string }> = memo(({ src }) => {
  return <AnimatedAvatar src={src || "/PersonalPhoto.png"} />;
});
