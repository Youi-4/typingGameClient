import AppRouter from "./Router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./context/AuthProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import { UserProfileProvider } from "./context/UserProfileProvider";
import { SharedSpaceProvider } from "./context/SharedSpaceProvider";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <UserProfileProvider>
            <SharedSpaceProvider>
              <AppRouter />
              <ReactQueryDevtools initialIsOpen={false} />
            </SharedSpaceProvider>
          </UserProfileProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
