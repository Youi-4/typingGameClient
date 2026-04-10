import Navigation from "./pages/Navigation/Navigation";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useTheme } from "./context/useTheme";

const RootLayout = () => {
  const { theme } = useTheme();
  return (
    <>
      <Navigation />
      <Outlet />
      <Toaster
        position="bottom-left"
        toastOptions={{
          style: {
            padding: "16px",
            background: theme === "dark" ? "#25262b" : "#ffffff",
            color: theme === "dark" ? "#e9ecef" : "#0b1b2b",
            border: `1px solid ${theme === "dark" ? "#373a40" : "#d1d9e0"}`,
          },
        }}
      />
    </>
  );
};

export default RootLayout;
