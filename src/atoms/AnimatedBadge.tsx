import { memo } from "react";
import Avatar, { type AvatarProps } from "@mui/material/Avatar";
import { keyframes } from "@emotion/react";
import { styled } from "@mui/material/styles";
import mcIcon from "@/assets/MC-Badge.png"; // Import for bundling (Vite handles hashing)

const draw = keyframes`
  100% {
    transform: rotate(360deg);
  }
`;

const AnimatedBadge = styled(Avatar)<AvatarProps>(({ theme }) => ({
  borderStyle: "solid",
  borderWidth: "0",
  borderRadius: ".6rem",
  "&::before": {
    zIndex: 0,
    position: "absolute",
    content: '""',
    backgroundImage: `conic-gradient(transparent 352deg, ${theme.palette.success.main} 360deg)`,
    width: "10%",
    height: "330%",
    left: "44%",
    top: "-106%",
    right: "0",
    bottom: "0",
    transformOrigin: "center center",
    animation: `${draw} 6000ms linear infinite`,
    borderRadius: ".6rem",
  },
  "&>img": {
    zIndex: 1,
  },
}));

interface AnimatedBadgeProps extends AvatarProps {
  alt: string;
}

export const AnimatedBadgeComponent: React.FC<AnimatedBadgeProps> = memo(({ alt, ...props }) => (
  <AnimatedBadge
    src={mcIcon}
    alt={alt}
    variant="rounded"
    sx={{
      width: "auto",
      height: 123,
    }}
    {...props}
  />
));