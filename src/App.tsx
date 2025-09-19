import { Outlet, useNavigation } from "react-router";
// import type { LoaderFunctionArgs } from 'react-router' // Optional for future data
// import { HomePage } from "@/pages/HomePage";

export default function App() {
  const navigation = useNavigation(); // For loading states in SPA

  return (
    <>
      {navigation.state === "loading" && <p>Loading...</p>}
      <Outlet />
      {/* <HomePage /> */}
    </>
  );
}
