import AppRouter from "./Router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./context/AuthProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import { UserProfileProvider } from "./context/UserProfileProvider";
import { SharedSpaceProvider } from "./context/SharedSpaceProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <UserProfileProvider>
              <SharedSpaceProvider>
                <ErrorBoundary>
                  <AppRouter />
                </ErrorBoundary>
                <ReactQueryDevtools initialIsOpen={false} />
              </SharedSpaceProvider>
            </UserProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
