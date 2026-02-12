import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home/Home"
import Login from "./pages/Login/Login"
import NotFound from "./pages/Not_Found/NotFound"
import SharedRoom from "./pages/SharedSpace/SharedRoom"
import TypingGame from "./TypingGame"
import Navigation from "./pages/Navigation/Navigation"
import SignUp from "./pages/SignUp/Signup.js";
import { Outlet } from "react-router-dom";
import PrivateRoute from "./utils/PrivateRoute.jsx";
import PublicRoute from "./utils/PublicRoute.jsx";
import { Toaster } from "react-hot-toast";

// Root layout component
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "/SignUp",
        element: (<PublicRoute><SignUp /></PublicRoute>),
      },
      {
        path: "/Login",
        element: (<PublicRoute><Login /></PublicRoute>),
      },
      {
        path: "/Home",
        element: (<PrivateRoute><Home /></PrivateRoute>),
      },
      {
        path: "/Play",
        element: (<PrivateRoute><TypingGame /></PrivateRoute>),
      },
      {
        path: "/Play/:roomId",
        element: (<PrivateRoute><TypingGame /></PrivateRoute>),
      },
      {
        path: "/Shared",
        element: (<PrivateRoute><SharedRoom /></PrivateRoute>),
      },
      {
        path: "/Shared/:roomId",
        element: (<PrivateRoute><SharedRoom /></PrivateRoute>),
      },
      {
        path: "*",
        element: (<PrivateRoute><NotFound /></PrivateRoute>),
      },
    ]
  },
])
export default router