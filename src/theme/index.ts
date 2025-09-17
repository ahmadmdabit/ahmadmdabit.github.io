import { createTheme } from "@mui/material/styles";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#00EE00" },
    secondary: { main: "#008100" },
    success: { main: "#00EE00" },
    error: { main: "#ad3737" },
    background: { default: "#000000", paper: "#0D1711" },
    grey: {
      50: "#F0F7F2",
      100: "#F0F7F2",
      200: "#C9D5CC",
      300: "#8B9A8F",
      400: "#6E7D73",
      500: "#48574F",
      600: "#304139",
      700: "#212D24",
      800: "#162018",
      900: "#0D1711",
    },
  },
  typography: { 
    fontFamily: `'Cascadia Code', Consolas, monospace`, 
    fontSize: 15,
    fontWeightLight: 200,
    fontWeightRegular: 300,
    fontWeightMedium: 500,
    fontWeightBold: 600,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { height: "100vh", display: "flex", flexDirection: "column" },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused fieldset": {
              borderColor: theme.palette.primary.main,
            },
          },
          "& label.Mui-focused": {
            color: theme.palette.primary.main,
          },
          "& .MuiOutlinedInput-input:-webkit-autofill": {
            WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset`,
            WebkitTextFillColor: theme.palette.common.white,
          },
        }),
      },
    },
  },
});

export default darkTheme;