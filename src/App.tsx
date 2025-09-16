import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { HomePage } from "@/pages/HomePage";
import darkTheme from "@/theme";

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <HomePage />
    </ThemeProvider>
  );
}
