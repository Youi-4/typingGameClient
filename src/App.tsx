import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import router from "./Router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./context/AuthProvider";
import { UserProfileProvider } from "./context/UserProfileProvider";
import { SharedSpaceProvider } from "./pages/SharedSpace/SharedSpaceProvider";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProfileProvider>
          <SharedSpaceProvider>
            <RouterProvider router={router} />
            <Toaster
              position="bottom-left"
              toastOptions={{
                style: { padding: "16px" },
              }}
            />
            <ReactQueryDevtools initialIsOpen={false} />
          </SharedSpaceProvider>
        </UserProfileProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
