import { createBrowserRouter, useParams } from "react-router-dom";
import Home from "./pages/Home/Home"
import Login from "./pages/Login/Login"
import NotFound from "./pages/Not_Found/NotFound"
import TypingGame from "./TypingGame"
import SignUp from "./pages/SignUp/Signup";
import { Navigate } from "react-router-dom";
import PrivateRoute from "./utils/PrivateRoute";
import PublicRoute from "./utils/PublicRoute";
import RootLayout from "./RootLayout";

function TypingGameKeyed() {
  const { roomId } = useParams();
  return <TypingGame key={roomId} />;
}
import Stats from "./pages/Stats/Stats";
import Leaderboard from "./pages/Leaderboard/Leaderboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true, // this matches "/" exactly
        element: <Navigate to="/Home" replace />,
      },
      {
        path: "/SignUp",
        element: (<PublicRoute><SignUp /></PublicRoute>),
      },
      {
        path: "/Login",
        element: (<PublicRoute><Login /></PublicRoute>),
      },

      { path: "/Home", element: <Home /> },
      { path: "/Stats", element: <Stats /> },
      { path: "/Leaderboard", element: <Leaderboard /> },
      { path: "/Play/:roomId", element: <TypingGameKeyed /> },
      {
        path: "*",
        element: (<PrivateRoute><NotFound /></PrivateRoute>),
      },
    ]
  },
])
export default router
