import { createBrowserRouter } from "react-router";
import App from "./App";
import { HomePage } from "./pages/HomePage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { ErrorPage } from "./pages/ErrorPage";

// TypeScript: Router types are inferred
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      // {
      //   index: true, // Maps to "/"
      //   element: <HomePage />,
      // },
      {
        path: "",
        element: <HomePage />,
        errorElement: <ErrorPage />,
        children: [
          {
            path: "",
            element: <PrivacyPage />,
          },
        ],
      },
    ],
  },
]);

export default router;
