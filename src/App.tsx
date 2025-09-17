import { Outlet, /*Link,*/ useNavigation } from "react-router";
// import type { LoaderFunctionArgs } from 'react-router' // Optional for future data
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
// import { HomePage } from "@/pages/HomePage";
import darkTheme from "@/theme";

export default function App() {
  const navigation = useNavigation(); // For loading states in SPA

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {navigation.state === "loading" && <p>Loading...</p>}
      <Outlet />
      {/* <HomePage /> */}
    </ThemeProvider>
  );
}
