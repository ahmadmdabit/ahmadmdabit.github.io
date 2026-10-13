import { memo, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { keyframes } from "@emotion/react";
import { styled } from "@mui/material/styles";

const MINIMUM_DISPLAY_MS = 1500;
const FADE_OUT_DURATION = 500;
const FADE_OUT_DELAY = 300;

const animLoader = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
`;

const LoaderOverlay = styled(Box, {
  shouldForwardProp: (prop) => prop !== "done",
})<{ done: boolean }>(({ theme, done }) => ({
  position: "fixed",
  inset: 0,
  zIndex: 9999,
  backgroundColor: theme.palette.background.default,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: `opacity ${FADE_OUT_DURATION}ms ease ${FADE_OUT_DELAY}ms, visibility ${FADE_OUT_DURATION}ms ease ${FADE_OUT_DELAY}ms`,
  ...(done && {
    opacity: 0,
    visibility: "hidden",
  }),
}));

const LoaderRing = styled("span")(({ theme }) => ({
  "--size": "1px",
  width: "calc(48 * var(--size))",
  height: "calc(48 * var(--size))",
  display: "inline-block",
  position: "relative",
  "&::before, &::after": {
    content: '""',
    boxSizing: "border-box",
    width: "calc(48 * var(--size))",
    height: "calc(48 * var(--size))",
    borderRadius: "50%",
    border: "calc(2 * var(--size)) solid",
    borderColor: theme.palette.success.main,
    position: "absolute",
    left: 0,
    top: 0,
    animation: `${animLoader} 2s linear infinite`,
  },
  "&::after": {
    animationDelay: "1s",
  },
}));

const SplashScreen: React.FC = memo(() => {
  const [done, setDone] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const minimumTimer = setTimeout(() => {
      setDone(true);
    }, MINIMUM_DISPLAY_MS);

    return () => clearTimeout(minimumTimer);
  }, []);

  useEffect(() => {
    if (done) {
      const removeTimer = setTimeout(() => {
        setRemoved(true);
      }, FADE_OUT_DURATION + FADE_OUT_DELAY);

      return () => clearTimeout(removeTimer);
    }
  }, [done]);

  if (removed) {
    return null;
  }

  return (
    <LoaderOverlay done={done} aria-hidden={done}>
      <LoaderRing />
    </LoaderOverlay>
  );
});

export default SplashScreen;
