import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { CacheProvider, ThemeProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import CssBaseline from "@mui/material/CssBaseline";
import ErrorBoundary from "@/components/ErrorBoundary";
import "@/i18n/index.ts";
import "@fontsource/cascadia-code/200.css";
import "@fontsource/cascadia-code/300.css";
import "@fontsource/cascadia-code/500.css";
import "@fontsource/cascadia-code/700.css";
import "@/index.css";
import darkTheme from "@/theme";
import router from "@/router";
// import App from "@/App";

const cache = createCache({ key: "css", prepend: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CacheProvider value={cache}>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <ErrorBoundary>
          {/* <App /> */}
          <RouterProvider router={router} />
        </ErrorBoundary>
      </ThemeProvider>
    </CacheProvider>
  </StrictMode>
);
