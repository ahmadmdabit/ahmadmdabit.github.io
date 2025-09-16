import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import "@/i18n/index.ts";
import "@fontsource/cascadia-code/200.css";
import "@fontsource/cascadia-code/300.css";
import "@fontsource/cascadia-code/500.css";
import "@fontsource/cascadia-code/700.css";
import "@/index.css";
import App from "@/App.tsx";

const cache = createCache({ key: "css", prepend: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CacheProvider value={cache}>
      <App />
    </CacheProvider>
  </StrictMode>
);
