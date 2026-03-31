import Navigation from "./pages/Navigation/Navigation";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

const RootLayout = () => (
  <>
    <Navigation />
    <Outlet />
    <Toaster
      position="bottom-left"
      toastOptions={{
        style: { padding: "16px" },
      }}
    />
  </>
);

export default RootLayout;
